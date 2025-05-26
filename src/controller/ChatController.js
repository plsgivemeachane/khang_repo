const db = require('../models');

// controllers/ChatController.js
const createChat = async (req, res) => {
  try {
    const { roomId, userId, message, replyId } = req.body;
    const room = await db.Room.findOne({ where: { roomId } });
    if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại' });

    const imageUrl = req.file ? `/uploads/chat/${req.file.filename}` : null;

    await db.Chat.create({
      groupId: room.id,
      userSenderId: userId,
      content: message || null,
      replyId: replyId || null,
      imageUrl,
    });

    res.status(200).json({ success: true, message: 'Thành công' });
  } catch (err) {
    console.error("createChat ~ err:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// controllers/chatController.js
const getChats = async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const room = await db.Room.findOne({ where: { roomId } });
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: 'Phòng không tồn tại' });

    const chats = await db.Chat.findAll({
      where: { groupId: room.id },
      include: [
        { model: db.User, as: 'users', attributes: ['id', 'username'] },
        {
          model: db.Chat,
          as: 'replyMessage',
          include: [{ model: db.User, as: 'users', attributes: ['username'] }],
        },
        {
          model: db.ChatRead,
          as: 'chatReads',
          include: [
            {
              model: db.User,
              as: 'user', // 👈 alias cho ChatRead.belongsTo(User, { as: 'user' })
              attributes: ['username'],
            },
          ],
        },
      ],

      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json(chats);
  } catch (error) {
    console.error('getChats ~ error:', error);
    res.status(500).json({ success: false });
  }
};
const markAsRead = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
    }

    const existing = await db.ChatRead.findOne({
      where: { chatId, userId },
    });

    if (!existing) {
      await db.ChatRead.create({
        chatId,
        userId,
        seenAt: new Date(),
      });
    }

    // Lấy lại danh sách người đã xem sau khi cập nhật
    const reads = await db.ChatRead.findAll({
      where: { chatId },
      include: [{ model: db.User, as: 'user', attributes: ['username'] }],
    });

    const seenUsers = reads.map(r => r.user?.username).filter(Boolean);

    // Gửi realtime cập nhật đến các client (nếu socket đã setup như io.emit)
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('message-seen-update', { chatId, seenUsers });
    }

    res.json({ success: true, seenUsers });
  } catch (err) {
    console.error('markAsRead ~ error:', err);
    res.status(500).json({ success: false });
  }
};

module.exports = { createChat, getChats , markAsRead};
