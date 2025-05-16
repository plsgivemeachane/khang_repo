const db = require('../../models');

const clientLayout = async (req, res, next) => {
  const userId = req?.user?.id;

  // ✅ Nếu không có userId (chưa đăng nhập), bỏ qua truy vấn
  if (!userId) {
    res.locals.layout = 'layout/client.ejs';
    res.locals.user = null;
    return next();
  }

  try {
    const userInfo = await db.User.findOne({ where: { id: userId } });
    res.locals.user = userInfo || null;
  } catch (error) {
    console.error('Lỗi truy vấn userInfo:', error);
    res.locals.user = null;
  }

  res.locals.layout = 'layout/client.ejs';
  next();
};

module.exports = clientLayout;
