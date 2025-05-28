// socket/socketHandler.js
const db = require('../models');

const onlineUsers = {}; // socket.id -> { userId, roomId }

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);
    socket.on('join-room', async ({ roomId, userId }) => {
      if (!roomId || !userId) {
        console.warn(`⚠️ join-room received invalid data: roomId=${roomId}, userId=${userId}`);
        return;
      }
    
      socket.join(roomId);
      onlineUsers[socket.id] = { userId, roomId };
    
      try {
        const room = await db.Room.findOne({ where: { roomId } });
        if (!room) return;
    
        const chats = await db.Chat.findAll({
          where: { groupId: room.id },
          include: [{
            model: db.ChatRead,
            as: 'chatReads',
            where: { userId },
            required: false,
          }],
        });
    
        const unreadChats = chats.filter(chat => !chat.chatReads || chat.chatReads.length === 0);
        const readRecords = unreadChats.map(chat => ({
          chatId: chat.id,
          userId,
          seenAt: new Date(),
        }));
    
        if (readRecords.length > 0) {
          await db.ChatRead.bulkCreate(readRecords, {
            ignoreDuplicates: true,
          });
        }
      } catch (err) {
        console.error('❌ Error auto-marking as read on join:', err);
      }
    });
    

    socket.on('send-message', async ({ roomId, userId }) => {
      if(!roomId || !userId) return;
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
              include: [{ model: db.User, as: 'users', attributes: ['username'] }],
            },
            {
              model: db.ChatRead,
              as: 'chatReads',
              include: [{ model: db.User, as: 'user', attributes: ['username'] }],
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
            chatReads: seenUsernames.map((username) => ({ user: { username } })),
          },
        });
      } catch (err) {
        console.error('❌ Error in send-message:', err);
      }
    });

    socket.on('disconnect', () => {
      delete onlineUsers[socket.id];
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};
