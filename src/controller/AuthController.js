
const db = require('../models/index');
const { accessToken } = require('../service/jwt');
const bcrypt = require('bcryptjs');

const register = (req, res) => {
  res.render('auth/register');
};

const login = (req, res) => {
  res.render('auth/login');
};
const registerAuth = async (req, res) => {
  const {username, email, password, phoneNumber} = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  try {
    await db.User.create({
      username,
      email,
      password: hashPassword,
      phoneNumber
    });
    res.redirect('/auth/login');
  } catch (error) {
    console.log(" registerAuth ~ error:", error)
    res.render('auth/register');
  }
};
const loginAuth = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.User.findOne({
      where: {
        email,
      },
    })
    if(!user){
      res.send('User not found');
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if(!checkPassword){
      res.render('auth/login');
    }
    const access_token = accessToken({ id: user.id});
    // console.log('loginPost ~ access_token:', access_token);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      maxAge:60*1000*30, //
    });
    res.redirect('/');
  } catch (error) {
    res.send('Error');
  }
};
module.exports = {
  register,
  login,
  registerAuth,
  loginAuth,
};
