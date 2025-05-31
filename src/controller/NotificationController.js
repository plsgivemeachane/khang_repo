const db = require('../models');

const createNotificationMessage = async (req, res) => {
  try {
    const { userId, chatId, roomId, senderName, content } = req.body;

    if (!userId || !chatId || !roomId || !senderName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    await db.Notification.create({
      userId,
      type: 'message',
      title: `Tin nhắn mới từ ${senderName}`,
      content: content || '',
      data: { chatId, roomId, senderName },
    });

    return res.status(200).json({ success: true, message: 'Notification created' });
  } catch (error) {
    console.error('❌ Error createNotificationMessage:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createNotificationMessage,
};
