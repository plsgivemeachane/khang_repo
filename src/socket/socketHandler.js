const db = require('../models');

// Dùng để theo dõi user nào đang ở phòng nào
const onlineUsers = {}; // socket.id -> { userId, roomId }

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    socket.on('join-room', async ({ roomId, userId }) => {
      socket.join(roomId);
      onlineUsers[socket.id] = { userId, roomId };

      console.log(`✅ User ${userId} joined room ${roomId}`);
      socket.emit('joined-success', { roomId, userId });

      // ✅ Đánh dấu tất cả tin nhắn hiện có là đã xem
      try {
        const room = await db.Room.findOne({ where: { roomId } });
        if (!room) return;

        // Tìm tất cả tin nhắn chưa được user này đọc
        const chats = await db.Chat.findAll({
          where: { groupId: room.id },
          include: [
            {
              model: db.ChatRead,
              as: 'chatReads',
              where: { userId },
              required: false,
            },
          ],
        });

        const unreadChats = chats.filter(
          (chat) => !chat.chatReads || chat.chatReads.length === 0
        );

        // Tạo tất cả bản ghi ChatRead cùng lúc
        const readRecords = unreadChats.map((chat) => ({
          chatId: chat.id,
          userId,
          seenAt: new Date(), // 👈 Cập nhật chính xác thời gian đã xem
        }));

        if (readRecords.length > 0) {
          await db.ChatRead.bulkCreate(readRecords, {
            ignoreDuplicates: true, // tránh tạo trùng
          });
          console.log(
            `✅ Marked ${readRecords.length} chats as read for user ${userId}`
          );
        }
      } catch (err) {
        console.error('❌ Error auto-marking as read on join:', err);
      }
    });

    socket.on('send-message', async ({ roomId, userId, message, replyId }) => {
      try {
        const user = await db.User.findByPk(userId);
        const room = await db.Room.findOne({ where: { roomId } });
        if (!room) return;

        const chat = await db.Chat.create({
          groupId: room.id,
          userSenderId: userId,
          content: message,
          replyId: replyId || null,
        });

        // Emit tin nhắn mới cho tất cả trong phòng
        io.to(roomId).emit('receive-message');

        // Đánh dấu đã xem cho các user khác đang online
        const sockets = await io.in(roomId).fetchSockets();
        const seenUserIds = new Set();

        const newSeenUsers = [];

        for (const s of sockets) {
          const info = onlineUsers[s.id];
          if (info && info.userId !== userId && !seenUserIds.has(info.userId)) {
            seenUserIds.add(info.userId);

            const chatRead = await db.ChatRead.create({
              chatId: chat.id,
              userId: info.userId,
              seenAt: new Date(),
            });

            const seenUser = await db.User.findByPk(info.userId);
            newSeenUsers.push(seenUser.username); // 👈 lấy tên user để hiển thị
          }
        }

        // 🔁 Gửi lại cho client của người gửi biết ai đã seen
        socket.emit('message-seen-update', {
          chatId: chat.id,
          seenUsers: newSeenUsers,
        });
      } catch (err) {
        console.error('❌ Error in send-message:', err);
      }
    });

    socket.on('requestSeller', (data) => {
      console.log('📩 Người dùng gửi yêu cầu trở thành seller:', data);
      io.emit('notifyAdmin', {
        message: `User ID ${data.userId} đã gửi yêu cầu seller.`,
        userId: data.userId,
      });
    });

    socket.on('disconnect', () => {
      delete onlineUsers[socket.id];
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};
