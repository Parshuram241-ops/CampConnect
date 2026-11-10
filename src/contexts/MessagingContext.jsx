import { createContext, useContext, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  listConversations,
  getConversation as fetchConversation,
  createConversation,
  sendMessage as apiSendMessage,
  deleteConversation as apiDeleteConversation,
} from "../services/messagingApi";

const MessagingContext = createContext();

// Lightweight initial state; the provider fills it from the API.
const EMPTY_STATE = {
  conversations: [],
  activeConversation: null,
  loading: false,
  error: null,
};

export function MessagingProvider({ children }) {
  const [state, setState] = useState(EMPTY_STATE);

  // ---------- Data fetching ----------

  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }
    try {
      const { data } = await listConversations();
      setState((prev) => ({
        ...prev,
        conversations: data || [],
        loading: false,
      }));
      return data || [];
    } catch (error) {
      if (!silent) {
        console.error("Error loading conversations:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error?.response?.data?.message || "Failed to load messages",
        }));
      }
      return null;
    }
  }, []);

  const loadConversation = useCallback(
    async (conversationId, silent = false) => {
      if (!conversationId) return null;
      try {
        const { data } = await fetchConversation(conversationId);
        if (!data) return null;
        setState((prev) => ({
          ...prev,
          activeConversation: data,
          conversations: prev.conversations.map((c) =>
            c.id === conversationId ? { ...c, ...data, unread: 0 } : c
          ),
        }));
        return data;
      } catch (error) {
        if (!silent) {
          console.error("Error loading conversation:", error);
          toast.error(
            error?.response?.data?.message || "Could not load conversation"
          );
        }
        return null;
      }
    },
    []
  );

  // Sync activeConversation back into the list when the list view changes.
  const setActiveConversation = useCallback(
    (convOrId) => {
      if (!convOrId) {
        setState((prev) => ({ ...prev, activeConversation: null }));
        return;
      }
      if (typeof convOrId === "object") {
        setState((prev) => ({ ...prev, activeConversation: convOrId }));
      } else {
        setState((prev) => ({
          ...prev,
          activeConversation:
            prev.conversations.find((c) => c.id === convOrId) || null,
        }));
      }
    },
    []
  );

  // ---------- Actions ----------

  const sendMessage = async (conversationId, messageText) => {
    if (!messageText?.trim()) return null;

    try {
      const { data } = await apiSendMessage(conversationId, messageText);
      if (!data) return null;

      setState((prev) => {
        const updatedConversations = prev.conversations.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: [...(c.messages || []), data],
              lastMessageText: data.text,
              lastMessageAt: data.timestamp,
            };
          }
          return c;
        });

        const active =
          prev.activeConversation?.id === conversationId
            ? {
                ...prev.activeConversation,
                messages: [...(prev.activeConversation.messages || []), data],
                lastMessageText: data.text,
                lastMessageAt: data.timestamp,
              }
            : prev.activeConversation;

        return {
          ...prev,
          conversations: updatedConversations,
          activeConversation: active,
        };
      });

      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error?.response?.data?.message || "Could not send message");
      return null;
    }
  };

  const startNewConversation = async (product) => {
    const productId = product?._id || product?.id;
    const seller = product?.seller || product?.sellerInfo;
    const recipientId =
      seller?._id ||
      seller?.id ||
      (typeof seller === "string" && seller.length === 24 ? seller : null);

    try {
      const { data } = await createConversation(productId, recipientId);
      if (!data) return null;

      // Automatically load the full conversation so messages array is populated
      const fullConv = await loadConversation(data.id, true);

      setState((prev) => {
        const exists = prev.conversations.find((c) => c.id === data.id);
        const updatedConversations = exists
          ? prev.conversations.map((c) => (c.id === data.id ? (fullConv || data) : c))
          : [fullConv || data, ...prev.conversations];

        return {
          ...prev,
          conversations: updatedConversations,
          activeConversation: fullConv || data,
        };
      });

      const contactName =
        data.contact?.name || data.seller?.name || "Seller";
      toast.success(`Chat opened with ${contactName}`);
      return data.id;
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error(
        error?.response?.data?.message || "Could not start conversation"
      );
      return null;
    }
  };

  const markAsRead = useCallback((conversationId) => {
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      ),
      activeConversation:
        prev.activeConversation?.id === conversationId
          ? { ...prev.activeConversation, unread: 0 }
          : prev.activeConversation,
    }));
  }, []);

  const deleteConversation = async (conversationId) => {
    try {
      await apiDeleteConversation(conversationId);

      setState((prev) => {
        const next = prev.conversations.filter((c) => c.id !== conversationId);
        return {
          ...prev,
          conversations: next,
          activeConversation:
            prev.activeConversation?.id === conversationId
              ? null
              : prev.activeConversation,
        };
      });

      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error(
        error?.response?.data?.message || "Could not delete conversation"
      );
    }
  };

  // Expose the readable pieces the UI expects.
  const unreadCount =
    state.conversations?.reduce((sum, conv) => sum + (conv.unread || 0), 0) ||
    0;

  const getConversation = useCallback(
    (conversationId) =>
      state.conversations?.find((c) => c.id === conversationId) || null,
    [state.conversations]
  );

  return (
    <MessagingContext.Provider
      value={{
        // Raw state
        conversations: state.conversations || [],
        activeConversation: state.activeConversation || null,
        loading: state.loading,
        error: state.error,

        // Setters / actions
        setActiveConversation,
        sendMessage,
        startNewConversation,
        markAsRead,
        deleteConversation,
        loadConversations,
        loadConversation,

        // Derived
        unreadCount,
        getConversation,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
}

export default MessagingContext;
