const db = require('../models');

const RegisterValidation = async (req, res, next) => {
  const { username, email, password, phoneNumber } = req.body;
  try {
    if (!username || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: 'Không được bỏ trống thông tin' });
    }
    const checkAuth = await db.User.findOne({ where: { email } });
    if (checkAuth) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khật ít nhất 6 ký tự' });
    }
    // const regexPhoneNumberVN = (phone) => {
    //   const regexPhoneNumber = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    //   return regexPhoneNumber.match(phone);
    // };
    // if (!regexPhoneNumberVN(phoneNumber)) {
    //   return res.status(400).json({ message: 'Số điện thoại không chính xác' });
    // }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error' });
  }
};

module.exports = { RegisterValidation };
