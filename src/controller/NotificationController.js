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

const getNotifications = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;

    const notifications = await db.Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 30,
    });

    res.json({ success: true, notifications });
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await db.Notification.findOne({ where: { id, userId } });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }

    await notification.update({ isRead: true });
    res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
  } catch (err) {
    console.error('❌ Error marking notification as read:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  createNotificationMessage,
  getNotifications,
  markNotificationRead,
};
