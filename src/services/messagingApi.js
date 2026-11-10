import api from './api';

/**
 * List the current user's conversations (lightweight list).
 */
export const listConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

/**
 * Fetch one conversation with its messages.
 * Also marks the conversation as read (backend side effect).
 */
export const getConversation = async (conversationId) => {
  const response = await api.get(`/messages/conversations/${conversationId}`);
  return response.data;
};

/**
 * Get-or-create a conversation for a product + seller.
 * Used by "Contact seller" flows.
 */
export const createConversation = async (productId, recipientId) => {
  const response = await api.post('/messages/conversations', {
    product: productId,
    recipientId,
  });
  return response.data;
};

/**
 * Send a message in a conversation.
 */
export const sendMessage = async (conversationId, text) => {
  const response = await api.post('/messages/', {
    conversation: conversationId,
    text,
  });
  return response.data;
};

/**
 * Remove a conversation from the current user's inbox.
 */
export const deleteConversation = async (conversationId) => {
  const response = await api.delete(`/messages/conversations/${conversationId}`);
  return response.data;
};

export default {
  listConversations,
  getConversation,
  createConversation,
  sendMessage,
  deleteConversation,
};
