const { configDotenv } = require('dotenv');
const jwt = require('jsonwebtoken');
configDotenv();
// create access token
const accessToken = (payload) => {
  const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXP,
  });

  return access_token;
};
const decodedToken = (req, res, next) => {
    const access_token = req.cookies.access_token;
    console.log('decodedToken ~ access_token:', access_token);
  
    if (!access_token) {
      console.log('Không có token');
      req.user = null;
      return next(); // ✅ Gọi `next()` và dừng lại
    }
  
    // Kiểm tra access token
    jwt.verify(access_token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          // console.log('Token hết hạn');
          req.user = null;
          res.clearCookie('access_token');
        } else {
          console.log('Token không hợp lệ');
          req.user = null;
        }
        return next(); // ✅ Dừng lại nếu token không hợp lệ
      }
  
      // Nếu token hợp lệ
      // console.log('jwt.verify ~ decoded:', decoded);
      req.user = decoded;
      next(); // ✅ Chỉ gọi `next()` một lần
    });
  };
  
module.exports = {
  accessToken,
  decodedToken
};