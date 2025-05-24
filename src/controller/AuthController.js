
const db = require('../models/index');
const { accessToken } = require('../service/jwt');
const bcrypt = require('bcryptjs');
const expCookie = 1000*60*60*24*30;// 30 days


const registerAuth = async (req, res) => {
  const {username, email, password, phoneNumber} = req.body;
  const getUserRole = await db.Role.findOne({where:{name:'user'}});
  const userRoleId = getUserRole.id
  const hashPassword = await bcrypt.hash(password, 10);
  try {
    await db.User.create({
      username,
      email,
      password: hashPassword,
      phoneNumber,
      roleId: userRoleId
    });
    res.json({ message: 'Register successfully' });

  } catch (error) {
    console.log(" registerAuth ~ error:", error)
    res.status(500).json({ message: 'Error' });
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
      maxAge: expCookie, //
    });
    res.status(200).json({ message: 'Login successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
};
const listUser = async (req, res) => {
  try {
    const listUser = await db.Auth.findAll();
    const roleId = listUser.map((item) => item.roleId);
    const role = await db.Role.findAll({ where: { id: roleId } });
    const role_name = role.map((item) => item.name);
    const name = role_name.join(', ');
    const newData = listUser.map((item) => ({
      id: item.id,
      username: item.username,
      email: item.email,
      phoneNumber: item.phoneNumber,
      role_name: name
    }))
    res.render('admin/auth/list', { listUser, role_name });
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
}
module.exports = {
  registerAuth,
  loginAuth,
  listUser
};
