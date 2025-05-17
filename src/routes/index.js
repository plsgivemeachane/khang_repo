const homeRouter = require('./client/HomeRouter'); // Import homeRouter
const authRouter = require('./client/AuthRouter');
const paymentRouter = require('./client/PaymentRouter');
const accGameClientRouter = require('./client/AccGameClientRouter');
const toolAdminRouter = require('./admin/ToolAdminRouter'); // Import toolRouter
const CategoryAdminRouter = require('./admin/CategoryRouter');
const { decodedToken } = require('../service/jwt');
const { authLayout } = require('../components/ui/ShareLayout');


module.exports = (app) => {
  app.use('/', homeRouter);
  // app.use('/auth', authRouter);
  app.use('/tai-khoan',authLayout, authRouter);
  app.use('/acc-game', decodedToken,accGameClientRouter);
  app.use('/admin/danh-muc', decodedToken, CategoryAdminRouter);
  app.use('/admin/tool-game',toolAdminRouter)
  app.use('/payment', decodedToken, paymentRouter);
  
};
