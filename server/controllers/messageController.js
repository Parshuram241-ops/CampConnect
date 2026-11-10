const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * Get or create a conversation for the current user.
 * Each pair of users has EXACTLY ONE conversation (like WhatsApp).
 * If initiated from a product, the conversation records the product context.
 */
const getOrCreateConversation = async (req, res, next) => {
  try {
    let { product, recipientId } = req.body;
    const senderId = req.user._id.toString();

    const validProductObjectId =
      product && mongoose.Types.ObjectId.isValid(product) ? product : null;

    // If recipientId is not directly passed, attempt to extract it from the product
    if (!recipientId && validProductObjectId) {
      const foundProduct = await Product.findById(validProductObjectId).lean();
      if (foundProduct && foundProduct.seller) {
        recipientId = foundProduct.seller.toString();
      }
    }

    // If recipientId is not a valid ObjectId (e.g. from mock data), try to find a user or match by other users
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      const fallbackUser = await User.findOne({ _id: { $ne: senderId } }).lean();
      if (fallbackUser) {
        recipientId = fallbackUser._id.toString();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Recipient ID is required',
        });
      }
    }

    const recipientIdStr = recipientId.toString();

    // Prevent a user from messaging themselves
    if (senderId === recipientIdStr) {
      return res.status(400).json({
        success: false,
        message: 'You cannot message yourself about your own listing',
      });
    }

    // Find the unique 1-to-1 conversation between these two users (like WhatsApp)
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientIdStr], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientIdStr],
        product: validProductObjectId,
        lastMessageAt: new Date(),
      });
    } else if (
      validProductObjectId &&
      conversation.product?.toString() !== validProductObjectId.toString()
    ) {
      // Update the active product context for this conversation
      conversation.product = validProductObjectId;
      conversation.lastMessageAt = new Date();
      await conversation.save();
    }

    // Populate conversation details
    const populated = await Conversation.findById(conversation._id)
      .populate('product', 'title price images seller condition location type')
      .populate('participants', 'name email avatar rating department year')
      .lean();

    res.status(200).json({
      success: true,
      data: serializeConversation(senderId, populated),
    });
  } catch (error) {
    console.error('Get or create conversation error:', error);
    next(error);
  }
};

/**
 * Fetch a single conversation with its messages.
 */
const getConversation = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const conversationId = req.params.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    })
      .populate('product', 'title price images seller condition location type')
      .populate('participants', 'name email avatar rating department year')
      .lean();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Fetch messages in chronological order
    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .lean();

    // Mark incoming messages as read for this user
    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    // Clear unread indicator for this user
    await Conversation.findByIdAndUpdate(conversation._id, {
      $pull: { unreadBy: req.user._id },
    });

    const otherUser = conversation.participants.find(
      (p) => p._id.toString() !== userId
    );

    res.status(200).json({
      success: true,
      data: {
        id: conversation._id,
        contact: {
          id: otherUser?._id,
          name: otherUser?.name || 'User',
          email: otherUser?.email,
          avatar:
            otherUser?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=059669&color=fff`,
          department: otherUser?.department,
          year: otherUser?.year,
        },
        seller: {
          id: otherUser?._id,
          name: otherUser?.name || 'User',
          email: otherUser?.email,
          avatar:
            otherUser?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=059669&color=fff`,
        },
        product: conversation.product
          ? {
              id: conversation.product._id,
              title: conversation.product.title,
              price: conversation.product.price,
              image: conversation.product.images?.[0] || null,
              location: conversation.product.location,
              condition: conversation.product.condition,
            }
          : null,
        productId: conversation.product?._id,
        productTitle: conversation.product?.title || '',
        productImage: conversation.product?.images?.[0] || null,
        lastMessageText: conversation.lastMessageText || '',
        lastMessageAt: conversation.lastMessageAt || conversation.updatedAt,
        unread: 0,
        messages: messages.map((m) => ({
          id: m._id,
          sender: m.sender?._id || m.sender,
          senderName: m.sender?.name || 'User',
          senderAvatar: m.sender?.avatar || '',
          text: m.text,
          timestamp: m.createdAt,
          isRead: m.isRead,
          isMine: (m.sender?._id || m.sender).toString() === userId,
        })),
      },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    next(error);
  }
};

/**
 * List conversations for the current user.
 * Each contact appears EXACTLY ONCE in the sidebar (like WhatsApp).
 */
const listConversations = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { search } = req.query;

    const conversations = await Conversation.find({ participants: userId })
      .populate('product', 'title price images seller')
      .populate('participants', 'name email avatar rating department year')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    // Deduplicate by contact ID so each person appears ONCE in the sidebar
    const seenContacts = new Set();
    const uniqueConversations = [];

    for (const c of conversations) {
      const other = c.participants.find((p) => p._id.toString() !== userId);
      if (!other) continue;

      const contactId = other._id.toString();
      if (!seenContacts.has(contactId)) {
        seenContacts.add(contactId);
        uniqueConversations.push(serializeConversation(userId, c));
      }
    }

    let data = uniqueConversations;

    if (search) {
      const term = search.toLowerCase();
      data = data.filter((c) => {
        const haystack = [
          c.contact?.name || '',
          c.productTitle || '',
          c.lastMessageText || '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('List conversations error:', error);
    next(error);
  }
};

/**
 * Send a message in a conversation.
 */
const sendMessage = async (req, res, next) => {
  try {
    const { conversation: conversationId, recipientId, product, text } = req.body;
    const senderId = req.user._id.toString();

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
    }

    let targetConvId = conversationId;

    // If no conversation ID was provided, create or locate the conversation first
    if (!targetConvId) {
      if (!recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Either conversation ID or recipientId is required',
        });
      }

      let conv = await Conversation.findOne({
        participants: { $all: [senderId, recipientId], $size: 2 },
      });

      if (!conv) {
        conv = await Conversation.create({
          participants: [senderId, recipientId],
          product: product || null,
          lastMessageAt: new Date(),
        });
      } else if (product && conv.product?.toString() !== product.toString()) {
        conv.product = product;
        await conv.save();
      }

      targetConvId = conv._id;
    }

    // Verify conversation exists and user is a participant
    const existing = await Conversation.findOne({
      _id: targetConvId,
      participants: senderId,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const otherParticipant = existing.participants.find(
      (p) => p.toString() !== senderId
    );

    // Create the message
    const message = await Message.create({
      conversation: targetConvId,
      sender: senderId,
      text: text.trim(),
    });

    // Update conversation last message summary and notify recipient
    await Conversation.findByIdAndUpdate(targetConvId, {
      $set: {
        lastMessageText: text.trim(),
        lastMessageAt: new Date(),
      },
      $addToSet: {
        unreadBy: otherParticipant,
      },
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .lean();

    res.status(201).json({
      success: true,
      data: {
        id: populated._id,
        conversation: populated.conversation,
        sender: populated.sender?._id || senderId,
        senderName: populated.sender?.name || req.user.name,
        senderAvatar: populated.sender?.avatar || '',
        text: populated.text,
        timestamp: populated.createdAt,
        isRead: false,
        isMine: true,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    next(error);
  }
};

/**
 * Delete a conversation.
 */
const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: req.params.id,
        participants: userId,
      },
      {
        $pull: { participants: userId },
      },
      { new: true }
    ).lean();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // If all participants have deleted it, permanently remove messages & conversation
    if (!conversation.participants || conversation.participants.length === 0) {
      await Message.deleteMany({ conversation: conversation._id });
      await Conversation.deleteOne({ _id: conversation._id });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    next(error);
  }
};

/** Helper: serialize conversation for the sidebar/list view */
function serializeConversation(userId, conversation) {
  const other = (conversation.participants || []).find(
    (p) => p._id.toString() !== userId
  );

  const otherName = other?.name || 'User';
  const otherAvatar =
    other?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName)}&background=059669&color=fff`;

  return {
    id: conversation._id,
    contact: {
      id: other?._id,
      name: otherName,
      email: other?.email,
      avatar: otherAvatar,
      rating: other?.rating,
      department: other?.department,
      year: other?.year,
    },
    // Backwards compatibility for existing UI components
    seller: {
      id: other?._id,
      name: otherName,
      email: other?.email,
      avatar: otherAvatar,
      rating: other?.rating,
    },
    product: conversation.product
      ? {
          id: conversation.product._id,
          title: conversation.product.title,
          price: conversation.product.price,
          image: conversation.product.images?.[0] || null,
        }
      : null,
    productId: conversation.product?._id,
    productTitle: conversation.product?.title || '',
    productImage: conversation.product?.images?.[0] || null,
    lastMessageText: conversation.lastMessageText || '',
    lastMessageAt: conversation.lastMessageAt
      ? new Date(conversation.lastMessageAt).toISOString()
      : conversation.updatedAt
      ? new Date(conversation.updatedAt).toISOString()
      : new Date().toISOString(),
    unread: (conversation.unreadBy || []).some(
      (u) => (u._id || u).toString() === userId
    )
      ? 1
      : 0,
    messages: [],
  };
}

module.exports = {
  getOrCreateConversation,
  getConversation,
  listConversations,
  sendMessage,
  deleteConversation,
};
