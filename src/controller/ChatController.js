const db = require('../models');

const createChat = async (req, res) => {
  try {
    const { roomId, userId, message, replyId } = req.body;
    const room = await db.Room.findOne({ where: { roomId } });
    if (!room) return res.status(404).json({ success: false });

    const imageUrl = req.file ? `/uploads/chat/${req.file.filename}` : null;

    const chat = await db.Chat.create({
      groupId: room.id,
      userSenderId: userId,
      content: message || null,
      replyId: replyId || null,
      imageUrl,
    });

    res.status(200).json({ success: true, chatId: chat.id });
  } catch (err) {
    console.error('createChat error:', err);
    res.status(500).json({ success: false });
  }
};

const getChats = async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const room = await db.Room.findOne({ where: { roomId } });
    if (!room) return res.status(404).json({ success: false });

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
          include: [{ model: db.User, as: 'user', attributes: ['username'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json(chats);
  } catch (err) {
    console.error('getChats ~ error:', err);
    res.status(500).json({ success: false });
  }
};

const markAsRead = async (req, res) => {
  try {
    let { chatId, userId } = req.body;
    userId = parseInt(userId);
    chatId = parseInt(chatId);

    const exists = await db.ChatRead.findOne({ where: { chatId, userId } });
    if (!exists) {
      await db.ChatRead.create({ chatId, userId, seenAt: new Date() });

      const chat = await db.Chat.findByPk(chatId, {
        include: [
          {
            model: db.ChatRead,
            as: 'chatReads',
            include: [{ model: db.User, as: 'user', attributes: ['username'] }],
          },
        ],
      });

      const seenUsers = chat.chatReads.map((r) => r.user?.username).filter(Boolean);
      req.io.to(String(chat.groupId)).emit('message-seen-update', { chatId, seenUsers });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('markAsRead ~ error:', err);
    res.status(500).json({ success: false });
  }
};

const deleteChat = async (req, res) => {
  try {
    const chatId = parseInt(req.params.chatId);

    const chat = await db.Chat.findByPk(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Tin nhắn không tồn tại' });

    // Nếu có ảnh thì xóa file khỏi ổ đĩa
    if (chat.imageUrl) {
      const imagePath = path.join(__dirname, '../public', chat.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('❌ Không thể xóa ảnh:', err.message);
        else console.log(`🧹 Đã xóa ảnh: ${chat.imageUrl}`);
      });
    }

    // Xóa các bản ghi đọc liên quan (nếu có)
    await db.ChatRead.destroy({ where: { chatId } });

    // Xóa tin nhắn
    await chat.destroy();

    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) {
    console.error('❌ deleteChat error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};


module.exports = { createChat, getChats, markAsRead, deleteChat };
