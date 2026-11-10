const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All messaging routes require authentication.
router.use(protect);

/**
 * GET  /api/conversations
 * List the current user's conversations (lightweight list).
 */
router.get('/conversations', messageController.listConversations);

/**
 * GET  /api/conversations/:id
 * Fetch one conversation with its messages (also marks read).
 */
router.get('/conversations/:id', messageController.getConversation);

/**
 * POST /api/conversations
 * Get-or-create a conversation for a product (used by "Contact seller").
 */
router.post('/conversations', messageController.getOrCreateConversation);

/**
 * POST /api/messages (for sending a message)
 * Send a message. Accepts either an existing conversation id, or a
 * product + seller so the conversation can be created on the fly.
 *
 * Body:
 *   { conversation: "<id>", text: "..." }
 *   { product: "<id>", recipientId: "<sellerId>", text: "..." }
 */
router.post('/', messageController.sendMessage);

/**
 * DELETE /api/conversations/:id
 * Remove the conversation from the current user's inbox.
 */
router.delete('/conversations/:id', messageController.deleteConversation);

module.exports = router;
