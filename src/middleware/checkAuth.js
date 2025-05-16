const checkAuth = (req, res, next) => {
  if (req.user) {
    return next();
  } else {
    res.redirect('/tai-khoan/dang-nhap');
  }
};

module.exports = checkAuth;
