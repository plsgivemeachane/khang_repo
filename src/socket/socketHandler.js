const db = require('../models');

const onlineUsers = {}; // socket.id -> { userId, roomId }

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    socket.on('join-room', async ({ roomId, userId }) => {
      if (!roomId || !userId) return;

      socket.join(roomId);
      onlineUsers[socket.id] = { userId, roomId };

      try {
        const room = await db.Room.findOne({ where: { roomId } });
        if (!room) return;

        // Đánh dấu đã đọc các tin nhắn chưa đọc
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
        const readRecords = unreadChats.map((chat) => ({
          chatId: chat.id,
          userId,
          seenAt: new Date(),
        }));

        if (readRecords.length > 0) {
          await db.ChatRead.bulkCreate(readRecords, { ignoreDuplicates: true });
        }

        // ✅ Cập nhật tất cả notification message của roomId => isRead = true
        await db.Notification.update(
          { isRead: true },
          {
            where: {
              userId,
              type: 'message',
              isRead: false,
              data: {
                roomId: roomId,
              },
            },
          }
        );

        socket.emit('room-unread-count', { roomId, count: 0 });
      } catch (err) {
        console.error('❌ Error in join-room:', err);
      }
    });

    socket.on('join-room-overview', async ({ userId }) => {
      if (!userId) return;
      onlineUsers[socket.id] = { userId };

      try {
        const rooms = await db.Room.findAll();

        for (const room of rooms) {
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

          const unreadCount = chats.filter(
            (chat) => !chat.chatReads || chat.chatReads.length === 0
          ).length;

          socket.emit('room-unread-count', {
            roomId: room.roomId,
            count: unreadCount,
          });
        }
      } catch (err) {
        console.error('❌ Error in join-room-overview:', err);
      }
    });

    socket.on('send-message', async ({ roomId, userId }) => {
      if (!roomId || !userId) return;

      try {
        const room = await db.Room.findOne({ where: { roomId } });
        if (!room) return;

        const latestChat = await db.Chat.findOne({
          where: { groupId: room.id },
          order: [['createdAt', 'DESC']],
          include: [
            { model: db.User, as: 'users', attributes: ['id', 'username'] },
            {
              model: db.Chat,
              as: 'replyMessage',
              required: false,
              where: {
                content: {
                  [db.Sequelize.Op.ne]: null,
                },
              },
              include: [
                {
                  model: db.User,
                  as: 'users',
                  attributes: ['username'],
                },
              ],
            },
            {
              model: db.ChatRead,
              as: 'chatReads',
              include: [
                {
                  model: db.User,
                  as: 'user',
                  attributes: ['username'],
                },
              ],
            },
          ],
        });

        const sockets = await io.in(roomId).fetchSockets();
        const seenUsernames = [];

        for (const s of sockets) {
          const info = onlineUsers[s.id];
          if (info && info.userId !== userId) {
            const exist = await db.ChatRead.findOne({
              where: { chatId: latestChat.id, userId: info.userId },
            });

            if (!exist) {
              await db.ChatRead.create({
                chatId: latestChat.id,
                userId: info.userId,
                seenAt: new Date(),
              });
            }

            const u = await db.User.findByPk(info.userId);
            if (u?.username) seenUsernames.push(u.username);
          }
        }

        io.to(roomId).emit('new-chat', {
          chat: {
            ...latestChat.toJSON(),
            chatReads: seenUsernames.map((username) => ({
              user: { username },
            })),
          },
        });

        // 🔔 Tạo notification nếu user chưa online trong phòng
        const members = JSON.parse(room.member || '[]');

        for (const memberId of members) {
          if (parseInt(memberId) === parseInt(userId)) continue;

          const isInRoom = Object.values(onlineUsers).some(
            (u) => u.userId === memberId && u.roomId === roomId
          );

          if (!isInRoom) {
            await db.Notification.create({
              userId: memberId,
              type: 'message',
              title: 'Tin nhắn mới',
              content: latestChat.content || '[Hình ảnh]',
              data: {
                chatId: latestChat.id,
                roomId: roomId,
                sender: latestChat.users?.username,
              },
              isRead: false,
            });
          }
        }
      } catch (err) {
        console.error('❌ Error in send-message:', err);
      }
    });
    socket.on('typing', async ({ roomId, userId }) => {
      const user = await db.User.findByPk(userId);
      socket.to(roomId).emit('typing', { username: user?.username });
    });

    socket.on('stop-typing', ({ roomId }) => {
      socket.to(roomId).emit('stop-typing');
    });
    socket.on('delete-message', async ({ chatId, roomId }) => {
      const room = await db.Room.findOne({ where: { roomId } });
      if (!room) return;
    
      const chatIdNumber = Number(chatId);
    
      // ✅ 1. Thu hồi tin chính
      await db.Chat.update(
        { content: null, imageUrl: null },
        { where: { id: chatIdNumber } }
      );
    
      // ✅ 2. Gửi về client để xoá tin chính
      io.to(roomId).emit('message-deleted', { chatId: chatIdNumber });
    
      // ✅ 3. Tìm các tin rep tin này
      const replyChats = await db.Chat.findAll({
        where: { replyId: chatIdNumber, groupId: room.id }
      });
    
      // ✅ 4. Set replyId về null (gỡ liên kết)
      await db.Chat.update(
        { replyId: null },
        { where: { replyId: chatIdNumber, groupId: room.id } }
      );
    
      // ✅ 5. Gửi về client để cập nhật UI xóa đoạn reply preview
      for (const reply of replyChats) {
        io.to(roomId).emit('reply-preview-remove', { chatId: reply.id });
      }
    });
    

    socket.on('disconnect', () => {
      delete onlineUsers[socket.id];
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};
