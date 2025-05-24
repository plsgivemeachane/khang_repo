const db = require('../models');

// socketHandler.js
module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Nghe yêu cầu xin làm người bán
    socket.on('requestSeller', (data) => {
      console.log('📩 Người dùng gửi yêu cầu trở thành seller:', data);

      // Gửi đến tất cả admin đang online
      io.emit('notifyAdmin', {
        message: `User ID ${data.userId} đã gửi yêu cầu seller.`,
        userId: data.userId,
      });
    });

    socket.on('join-room', ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`✅ User ${userId} joined room ${roomId}`);

      // Phản hồi lại client
      socket.emit('joined-success', { roomId, userId });
    });

    socket.on('send-message', async ({ roomId, userId, message, replyId }) => {
      const user = await db.User.findByPk(userId);
      const reply = replyId
        ? await db.Chat.findByPk(replyId, {
            include: [
              { model: db.User, as: 'users', attributes: ['username'] },
            ],
          })
        : null;

      io.to(roomId).emit('receive-message', {
        senderId: userId,
        senderName: user.username,
        message,
        time: Date.now(),
        reply: reply
          ? {
              content: reply.content,
              senderName: reply.users?.username || 'Ẩn danh',
            }
          : null,
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};
