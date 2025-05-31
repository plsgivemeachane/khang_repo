const db = require("../models");
const createRoom = async (req, res) => {
  console.log(" createRoom ~ req.body:", req.body)
  let memberId=[]
  const userId = req.user.id;
  const roleAdmin = await db.Role.findOne({where:{name:"Admin"}});
  const arrUserIdRoleAdmin = await db.User.findOne({where:{roleId:roleAdmin.id}});
  memberId.push(arrUserIdRoleAdmin.id);

  const {name,password} = req.body;
  const roomId = Math.floor(Math.random() * 10000000); 
  
  const priceRoom = 10000;
  try {
    await db.Room.create({name,password,createdBy:userId,roomId,isGroup:true,member:[userId]});
    await db.Room.update({member:([userId,...memberId])},{where:{roomId:roomId}});
    const currentAsset = await db.User.findOne({where:{id:userId}});
    const newAsset = currentAsset.asset - priceRoom;
    await db.User.update({asset:newAsset},{where:{id:userId}});
    
    res.status(200).send("Thanh cong");
  } catch (error) {
    console.log(error);
  }
}
const joinRoom = async (req, res) => {
 
  const {password,roomId} = req.body;
  try {
    const room = await db.Room.findOne({where:{roomId:roomId}});
    if(room){
      if(room.password == password){
        let members = room.member;
        members = JSON.parse(members) || [];
        members.push(req.user.id);
        await db.Room.update({member:members},{where:{roomId:roomId}});
        res.status(200).send("Thanh cong");
      }
    }
  } catch (error) {
    console.log(error);
  }
}
const renderChatPage = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const room = await db.Room.findOne({ where: { roomId } });
    if (!room) return res.status(404).send("Phòng không tồn tại");
    const checkUserInRoom = room.member.includes(userId);
    if (!checkUserInRoom) return res.status(403).send("User not in room");

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
    

    res.render("more/chat", {
      roomId: room.roomId,
      userId: req.user.id,
      userName: req.user.username,
      title: "Chat",
      chats, // truyền xuống view
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Lỗi server");
  }
};
const index = async (req, res) => {
  const userId = req.user.id;
  const rooms = await db.Room.findAll({ where: { isGroup: true } });



  // Lọc những room mà user là thành viên
  const joinedRooms = rooms.filter(room => {
    try {
      const members = JSON.parse(room.member || "[]");
      return members.includes(userId);
    } catch (err) {
      return false;
    }
  });


  res.render("more/room", {
    title: "Danh sách phòng chat",
    rooms: joinedRooms
  });
};


module.exports = {createRoom,joinRoom,renderChatPage,index};