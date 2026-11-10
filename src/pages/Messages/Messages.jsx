import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Send,
  Trash2,
  ArrowLeft,
  Search,
  CheckCheck,
  Smile,
  ExternalLink,
  ShieldCheck,
  User,
  ShoppingBag,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { useMessaging } from "../../contexts/MessagingContext";

function formatChatTime(value) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatListTimestamp(value) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (isYesterday) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatDateSeparator(value) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "TODAY";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "YESTERDAY";

  return date
    .toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

const QUICK_SUGGESTIONS = [
  "Hi! Is this still available?",
  "What is your final price?",
  "Can we meet at the campus library?",
  "I'm interested in buying this!",
];

const EMOJI_LIST = ["👍", "👋", "🤝", "😊", "🙏", "❤️", "🔥", "📚", "✅", "🎉"];

function Messages() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    conversations,
    activeConversation,
    sendMessage,
    markAsRead,
    deleteConversation,
    loadConversations,
    loadConversation,
    setActiveConversation,
    loading,
  } = useMessaging();

  const targetConvId = location.state?.conversationId || null;
  const [selectedConvId, setSelectedConvId] = useState(targetConvId);
  const [prevTargetId, setPrevTargetId] = useState(targetConvId);

  if (targetConvId !== prevTargetId) {
    setPrevTargetId(targetConvId);
    if (targetConvId) {
      setSelectedConvId(targetConvId);
    }
  }

  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const isPollingRef = useRef(false);

  // Check login status
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("campconnectUser") || "null");
    } catch {
      return null;
    }
  }, []);

  // 1. Initial Load: fetch the user's inbox. The selected-chat effect below
  // loads the full conversation, including when navigation supplied its ID.
  useEffect(() => {
    if (!currentUser) return;

    loadConversations();
  }, [currentUser, loadConversations]);

  // Keep active conversation in sync if state changed externally
  useEffect(() => {
    if (selectedConvId && (!activeConversation || activeConversation.id !== selectedConvId)) {
      loadConversation(selectedConvId, true);
    }
  }, [selectedConvId, activeConversation, loadConversation]);

  // 2. Real-time Polling: Poll active chat every 3.5s and inbox list every 7s
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      try {
        if (selectedConvId) {
          await loadConversation(selectedConvId, true);
        }
        await loadConversations(true);
      } catch (err) {
        console.error("Polling error:", err);
      } finally {
        isPollingRef.current = false;
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [currentUser, selectedConvId, loadConversation, loadConversations]);

  // 3. Auto-scroll to bottom of chat when messages update
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [activeConversation?.messages?.length, selectedConvId, scrollToBottom]);

  // Filter conversations in sidebar
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const term = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const contactName = c.contact?.name || c.seller?.name || "";
      const prodTitle = c.productTitle || "";
      const lastMsg = c.lastMessageText || "";
      return (
        contactName.toLowerCase().includes(term) ||
        prodTitle.toLowerCase().includes(term) ||
        lastMsg.toLowerCase().includes(term)
      );
    });
  }, [conversations, searchQuery]);

  // Handle selecting a conversation
  const handleSelectConversation = async (convId) => {
    setSelectedConvId(convId);
    setActiveConversation(convId);
    await loadConversation(convId);
    markAsRead(convId);
  };

  // Handle sending a message
  const handleSendMessage = async (textToSend) => {
    const content = (textToSend || messageInput).trim();
    if (!content || !selectedConvId || isSending) return;

    setIsSending(true);
    setMessageInput("");
    setShowEmojiPicker(false);

    try {
      await sendMessage(selectedConvId, content);
      // Immediately reload full conversation for updated timestamps/statuses
      await loadConversation(selectedConvId, true);
      scrollToBottom(true);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddEmoji = (emoji) => {
    setMessageInput((prev) => prev + emoji);
  };

  // Handle conversation deletion
  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await deleteConversation(convId);
      if (selectedConvId === convId) {
        setSelectedConvId(null);
        setActiveConversation(null);
      }
    }
  };

  // Group messages chronologically with WhatsApp date separators
  const currentChatMessages = useMemo(() => {
    const msgs = activeConversation?.messages || [];
    const grouped = [];
    let lastDateStr = null;

    msgs.forEach((m) => {
      const msgDate = new Date(m.timestamp || Date.now()).toDateString();
      if (msgDate !== lastDateStr) {
        grouped.push({
          isSeparator: true,
          dateKey: msgDate,
          rawDate: m.timestamp,
        });
        lastDateStr = msgDate;
      }
      grouped.push({
        isSeparator: false,
        ...m,
      });
    });

    return grouped;
  }, [activeConversation?.messages]);

  // Active contact details
  const activeContact =
    activeConversation?.contact || activeConversation?.seller;

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 dark:bg-slate-800 p-6">
          <div className="max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Sign In to Message
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              You must be logged in to view your messages and chat with campus buyers and sellers.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700"
            >
              Go to Login
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="h-[calc(100vh-73px)] bg-slate-100 dark:bg-slate-700">
        <div className="mx-auto flex h-full max-w-7xl overflow-hidden border-x border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md">
          {/* ========================================================= */}
          {/* LEFT SIDEBAR: WhatsApp Contacts List (Single entry/contact) */}
          {/* ========================================================= */}
          <div
            className={`${
              selectedConvId ? "hidden md:flex" : "flex"
            } w-full flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 md:w-96 lg:w-[400px] shrink-0`}
          >
            {/* WhatsApp Sidebar Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <img
                  src={
                    currentUser.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      currentUser.name || "User"
                    )}&background=059669&color=fff`
                  }
                  alt={currentUser.name}
                  className="h-10 w-10 rounded-full border border-slate-300 object-cover shadow-sm"
                />
                <div>
                  <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Chats
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  {conversations.length} {conversations.length === 1 ? "chat" : "chats"}
                </span>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 p-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search or start new chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-4 text-xs sm:text-sm placeholder-slate-400 transition focus:border-emerald-500 focus:bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-400"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Threads */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loading && conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
                  <p className="text-xs text-slate-500">Loading your chats...</p>
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => {
                  const contact = conv.contact || conv.seller;
                  const isSelected = selectedConvId === conv.id;
                  const avatarUrl =
                    contact?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      contact?.name || "Student"
                    )}&background=059669&color=fff`;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`group relative flex cursor-pointer items-start gap-3 p-3.5 transition-colors ${
                        isSelected
                          ? "bg-emerald-50/70 border-l-4 border-emerald-600"
                          : "hover:bg-slate-50 dark:bg-slate-800"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={avatarUrl}
                          alt={contact?.name || "User"}
                          className="h-12 w-12 rounded-full border border-slate-200 dark:border-slate-700 object-cover shadow-sm"
                        />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-1">
                          <h3
                            className={`truncate text-sm font-semibold ${
                              isSelected ? "text-emerald-950 font-bold" : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {contact?.name || "Campus Peer"}
                          </h3>
                          <span
                            className={`shrink-0 text-[11px] ${
                              conv.unread > 0
                                ? "font-bold text-emerald-600"
                                : "text-slate-400"
                            }`}
                          >
                            {formatListTimestamp(
                              conv.lastMessageAt || conv.timestamp
                            )}
                          </span>
                        </div>

                        {/* Product reference tag */}
                        {conv.productTitle && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                            <ShoppingBag className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {conv.productTitle}
                            </span>
                          </div>
                        )}

                        {/* Last message preview */}
                        <div className="mt-1 flex items-center justify-between">
                          <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                            {conv.lastMessageText ? (
                              <>
                                <CheckCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {conv.lastMessageText}
                                </span>
                              </>
                            ) : (
                              <span className="italic text-slate-400">
                                Click to start conversation
                              </span>
                            )}
                          </p>

                          {/* Unread badge & Delete button on hover */}
                          <div className="flex items-center gap-2 shrink-0">
                            {conv.unread > 0 && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-bold text-white shadow-sm">
                                {conv.unread}
                              </span>
                            )}
                            <button
                              onClick={(e) => handleDeleteConversation(e, conv.id)}
                              title="Delete chat"
                              className="hidden rounded p-1 text-slate-300 hover:bg-slate-200 hover:text-red-600 group-hover:block transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No conversations yet
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-[220px]">
                    Browse items in the marketplace and click "Message" on any product to chat with the seller!
                  </p>
                  <Link
                    to="/marketplace"
                    className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-emerald-700"
                  >
                    Explore Marketplace
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT CHAT WINDOW: WhatsApp Web Look & Feel */}
          {/* ========================================================= */}
          {selectedConvId && activeConversation ? (
            <div className="flex flex-1 flex-col bg-white dark:bg-slate-800">
              {/* WhatsApp Chat Top Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 shadow-xs">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => {
                      setSelectedConvId(null);
                      setActiveConversation(null);
                    }}
                    className="rounded-full p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 md:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  {/* Contact Avatar */}
                  <div className="relative">
                    <img
                      src={
                        activeContact?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          activeContact?.name || "Student"
                        )}&background=059669&color=fff`
                      }
                      alt={activeContact?.name || "User"}
                      className="h-10 w-10 rounded-full border border-slate-300 object-cover shadow-xs"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></span>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {activeContact?.name || "CampConnect User"}
                    </h2>
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <span>Online</span>
                      {activeContact?.department && (
                        <span className="text-slate-500 font-normal">
                          • {activeContact.department}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => {
                      if (activeContact?.email) {
                        window.location.href = `mailto:${activeContact.email}`;
                      } else {
                        alert("Contact email not available");
                      }
                    }}
                    title="Send Email"
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-200 transition"
                  >
                    <User className="h-4 w-4" />
                  </button>

                  <button
                    onClick={(e) => handleDeleteConversation(e, activeConversation.id)}
                    title="Delete Conversation"
                    className="rounded-full p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Product Context Banner (WhatsApp Business Marketplace Style) */}
              {(activeConversation.productTitle || activeConversation.product) && (
                <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/80 px-4 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {activeConversation.productImage ? (
                      <img
                        src={activeConversation.productImage}
                        alt={activeConversation.productTitle}
                        className="h-10 w-10 rounded-lg object-cover border border-emerald-200 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Product
                        </span>
                        <span className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {activeConversation.productTitle || activeConversation.product?.title}
                        </span>
                      </div>
                      {activeConversation.product?.price && (
                        <p className="text-xs font-bold text-emerald-700">
                          ₹{activeConversation.product.price}
                          {activeConversation.product.condition && (
                            <span className="ml-2 font-normal text-slate-500 text-[11px]">
                              ({activeConversation.product.condition})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/marketplace?search=${encodeURIComponent(
                      activeConversation.productTitle || ""
                    )}`}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-emerald-300 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-xs hover:bg-emerald-50 transition"
                  >
                    <span>View</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* WhatsApp Messages Scroll Container with Pattern Background */}
              <div
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3"
                style={{
                  backgroundColor: "#efeae2",
                  backgroundImage:
                    "radial-gradient(#dfd7cc 0.8px, transparent 0.8px), radial-gradient(#dfd7cc 0.8px, #efeae2 0.8px)",
                  backgroundSize: "24px 24px",
                  backgroundPosition: "0 0, 12px 12px",
                }}
              >
                {/* Security Encryption Pill */}
                <div className="mx-auto flex max-w-sm items-center justify-center gap-1.5 rounded-lg bg-amber-50/90 px-3 py-1.5 text-center text-[11px] text-amber-800 shadow-xs border border-amber-200/60">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  <span>
                    Messages are 1-on-1 between CampConnect verified students.
                  </span>
                </div>

                {/* Messages & Date Separators */}
                {currentChatMessages.length > 0 ? (
                  currentChatMessages.map((item, index) => {
                    if (item.isSeparator) {
                      return (
                        <div
                          key={`sep-${item.dateKey}-${index}`}
                          className="my-3 flex justify-center"
                        >
                          <span className="rounded-md bg-white dark:bg-slate-800/85 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-400 shadow-xs border border-slate-200 dark:border-slate-700">
                            {formatDateSeparator(item.rawDate)}
                          </span>
                        </div>
                      );
                    }

                    const isMine =
                      item.isMine ||
                      (item.sender &&
                        currentUser._id &&
                        item.sender.toString() === currentUser._id.toString());

                    return (
                      <div
                        key={item.id || item._id || index}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`relative max-w-[85%] sm:max-w-md rounded-2xl px-3.5 py-2 shadow-xs transition-shadow ${
                            isMine
                              ? "bg-[#d9fdd3] text-slate-900 dark:text-slate-100 rounded-tr-xs border border-emerald-200/50"
                              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700/70"
                          }`}
                        >
                          {/* Other user's name tag for incoming message */}
                          {!isMine && (
                            <p className="mb-0.5 text-[11px] font-bold text-emerald-700">
                              {item.senderName || activeContact?.name || "Student"}
                            </p>
                          )}

                          {/* Message Content */}
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {item.text}
                          </p>

                          {/* Timestamp and Read Status */}
                          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                            <span>{formatChatTime(item.timestamp)}</span>
                            {isMine && (
                              <CheckCheck
                                className={`h-3.5 w-3.5 ${
                                  item.isRead ? "text-sky-500" : "text-slate-400"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-800/80 shadow-xs">
                      <MessageCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No messages yet with {activeContact?.name || "this user"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 max-w-xs">
                      Say hello or ask questions regarding the listing using the input bar below!
                    </p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 scrollbar-none">
                <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                  Quick:
                </span>
                {QUICK_SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(suggestion)}
                    className="shrink-0 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Emoji quick bar (if opened) */}
              {showEmojiPicker && (
                <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddEmoji(emoji)}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* WhatsApp Message Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3"
              >
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`rounded-full p-2 text-slate-500 transition hover:bg-slate-200 ${
                    showEmojiPicker ? "text-emerald-600 bg-emerald-50" : ""
                  }`}
                  title="Emoji"
                >
                  <Smile className="h-5 w-5" />
                </button>

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 rounded-full border border-slate-300 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs sm:text-sm shadow-inner transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim() || isSending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
            </div>
          ) : (
            /* WhatsApp Web Default Empty Screen */
            <div className="hidden flex-1 flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 p-8 md:flex">
              <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                <MessageCircle className="h-14 w-14" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                CampConnect Web
              </h2>
              <p className="mt-2 max-w-md text-center text-sm text-slate-600 dark:text-slate-400">
                Send and receive messages with college students in real-time. Select a conversation from the sidebar or click "Message" on any product card in the marketplace.
              </p>
              <div className="mt-6 flex items-center gap-2 rounded-full bg-slate-200/70 px-4 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified student-to-student conversations</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Messages;
