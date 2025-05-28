const db = require('../../models');
const { MenuDashboard } = require('../../utils/constant');

const clientLayout = async (req, res, next) => {
  const userId = req?.user?.id;

  // ✅ Nếu không có userId (chưa đăng nhập), bỏ qua truy vấn

  if (!userId) {
    res.locals.layout = 'layout/client/client.ejs';
    res.locals.user = null;
    return next();
  }

  try {
    let userInfo = await db.User.findOne({ where: { id: userId } });
    
    res.locals.user = userInfo || null;
  } catch (error) {
    console.error('Lỗi truy vấn userInfo:', error);
    res.locals.user = null;
  }

  res.locals.layout = 'layout/client/client.ejs';
  next();
};

const adminLayout = async (req, res, next) => {
  const userId = req?.user?.id;

  if (!userId) {
    return res.redirect('/tai-khoan/dang-nhap');
  }
  const user = await db.User.findOne({ where: { id: userId } });
  const roleId = user.roleId;
  const role = await db.Role.findOne({ where: { id: roleId } });
  const role_name = role.name;
  if (role_name !== 'Admin') {
    return res.redirect('/');
  }
  res.locals.MenuDashboard = MenuDashboard;
  res.locals.user = user;
  const activePath = req.originalUrl
  res.locals.activePath = activePath
  res.locals.layout = 'layout/admin/admin.ejs';
  next();
};
module.exports = {
  clientLayout,
  adminLayout,
};
