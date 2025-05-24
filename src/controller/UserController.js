const db = require('../models/index');

const listUser = async (req, res) => {
  try {
    const listUser = await db.User.findAll();

    // Lấy các roleId duy nhất
    const roleIds = [...new Set(listUser.map(user => user.roleId))];

    // Lấy toàn bộ role có liên quan
    const roles = await db.Role.findAll({
      where: { id: roleIds }
    });

    // Tạo roleMap để ánh xạ roleId -> role.name
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.id] = role.name;
    });

    // Gộp dữ liệu user với role_name
    const newData = listUser.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role_name: roleMap[user.roleId] || 'Không rõ',
      status: user.status,
    }));

    res.render('admin/user/list', { listUser: newData });

  } catch (error) {
    console.log("listUser ~ error:", error);
    res.status(500).json({ message: 'Error' });
  }
};

module.exports = {
  listUser,
};
