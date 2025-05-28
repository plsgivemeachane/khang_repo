const db = require('../models/index');

const listUser = async (req, res) => {
  try {
    const listUser = await db.User.findAll();

    // Lấy các roleId duy nhất
    const roleIds = [...new Set(listUser.map((user) => user.roleId))];

    // Lấy toàn bộ role có liên quan
    const roles = await db.Role.findAll({
      where: { id: roleIds },
    });

    // Tạo roleMap để ánh xạ roleId -> role.name
    const roleMap = {};
    roles.forEach((role) => {
      roleMap[role.id] = role.name;
    });

    // Gộp dữ liệu user với role_name
    const newData = listUser.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role_name: roleMap[user.roleId] || 'Không rõ',
      status: user.status,
    }));

    res.render('admin/user/list', { listUser: newData });
  } catch (error) {
    console.log('listUser ~ error:', error);
    res.status(500).json({ message: 'Error' });
  }
};
const viewUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.User.findOne({ where: { id } });
    const roles = await db.Role.findAll();
    if (!user) {
      req.flash('error', 'Không tìm thấy user');
      return res.redirect('/admin/nguoi-dung');
    }
    res.render('admin/user/update', { user, roles });
  } catch (error) {
    console.log('viewUpdate ~ error:', error);
    res.status(500).json({ message: 'Error' });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phoneNumber, status, roleId, bio, avatar } = req.body;

    await db.User.update(
      { username, email, phoneNumber, status, roleId, bio, avatar },
      { where: { id } }
    );

    req.flash('success', 'Cap nhat thanh cong');
    return res.redirect('/admin/nguoi-dung');
  } catch (error) {
    console.log('updateUser ~ error:', error);
    res.status(500).json({ message: 'Error' });
  }
};
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.User.findOne({ where: { id } });
    if (!user) {
      req.flash('error', 'Không tìm thấy user');
      return res.redirect('/admin/nguoi-dung');
    }
    
    await user.destroy();
    req.flash('success', 'Xóa người dùng thành công');
    return res.redirect('/admin/nguoi-dung');
  } catch (error) {
    console.log('deleteUser ~ error:', error);
    req.flash('error', 'Có lỗi xảy ra');
    return res.redirect('/admin/nguoi-dung');
  }
}
module.exports = {
  listUser,
  updateUser,
  viewUpdate,
  deleteUser
};
