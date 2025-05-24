const db = require("../models");

const createChat = async (req, res) => {
  try {
    const { roomId, userId, message, replyId } = req.body;

    // Tìm Room theo mã phòng slug (roomId)
    const room = await db.Room.findOne({ where: { roomId } });
    if (!room) {
      return res.status(404).json({ success: false, message: "Phòng không tồn tại" });
    }

    // Tạo tin nhắn, có thể có hoặc không có replyId
    await db.Chat.create({
      groupId: room.id,
      userSenderId: userId,
      content: message,
      replyId: replyId || null,
    });

    return res.status(200).json({ success: true, message: "Thành công" });
  } catch (err) {
    console.error("createChat ~ err:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
const getChats = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await db.Room.findOne({ where: { roomId } });
    if (!room) return res.status(404).json({ success: false, message: "Phòng không tồn tại" });

    const chats = await db.Chat.findAll({
      where: { groupId: room.id },
      include: [
        { model: db.User, as: 'users', attributes: ['id', 'username'] },
        {
          model: db.Chat,
          as: 'replyMessage',
          include: [{ model: db.User, as: 'users', attributes: ['username'] }],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json(chats);
  } catch (error) {
    console.error("getChats ~ error:", error);
    res.status(500).json({ success: false });
  }
};

module.exports = { createChat, getChats };
