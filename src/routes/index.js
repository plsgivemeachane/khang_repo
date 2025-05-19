const homeRouter = require('./client/HomeRouter'); // Import homeRouter
const authRouter = require('./client/AuthRouter');
const paymentRouter = require('./client/PaymentRouter');
const accGameClientRouter = require('./client/AccGameClientRouter');
const toolAdminRouter = require('./admin/ToolAdminRouter'); // Import toolRouter
const CategoryAdminRouter = require('./admin/CategoryRouter');
const orderRouter = require('./client/OrderRouter');
const toolRouter = require('./client/ToolRouter');
const accgameAdminRouter = require('./admin/AccGameRouter');
const { decodedToken } = require('../service/jwt');
const { authLayout, clientLayout, adminLayout } = require('../components/ui/ShareLayout');


module.exports = (app) => {
  app.use('/', homeRouter);
  // app.use('/auth', authRouter);
  app.use('/tai-khoan', authRouter);
  app.use('/acc-game', decodedToken,accGameClientRouter);
  app.use('/admin/danh-muc', decodedToken, CategoryAdminRouter);
  app.use('/dich-vu/hack-game', decodedToken, toolRouter);
  app.use('/admin/tool-game',decodedToken,adminLayout, toolAdminRouter)
  app.use('/admin/acc-game',decodedToken,adminLayout, accgameAdminRouter)
  app.use("/don-hang", orderRouter);
  app.use('/thanh-toan', decodedToken,clientLayout, paymentRouter);
  
};
