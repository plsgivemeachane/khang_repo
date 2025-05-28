const express = require('express');

const homeRouter = require('./client/HomeRouter');
const authRouter = require('./client/AuthRouter');
const paymentRouter = require('./client/PaymentRouter');
const accGameClientRouter = require('./client/AccGameClientRouter');
const toolAdminRouter = require('./admin/ToolAdminRouter');
const CategoryAdminRouter = require('./admin/CategoryRouter');
const orderRouter = require('./client/OrderRouter');
const toolRouter = require('./client/ToolRouter');
const accgameAdminRouter = require('./admin/AccGameRouter');
const UserAdminRouter = require('./admin/UserRouter')
const ChatApiRouter = require('./api/ChatRouter');
const RoomRouter = require('./client/RoomRouter');
const DashboardRouter = require('./admin/DashboardRouter');
const { decodedToken } = require('../service/jwt');
const { authLayout, clientLayout, adminLayout } = require('../components/ui/ShareLayout');
const CheckProtectRoutes = require('../middleware/protect-routes');

module.exports = (app) => {
  // Route không cần middleware
  app.use('/', homeRouter); 

  app.use('/tai-khoan', authRouter);
  app.use('/api/chat', ChatApiRouter)

  // Group middleware: decodedToken + clientLayout
  const clientGroup = express.Router();
  clientGroup.use(decodedToken, clientLayout,CheckProtectRoutes);
  clientGroup.use('/phong-chat', RoomRouter);

  clientGroup.use('/acc-game', accGameClientRouter);
  clientGroup.use('/thanh-toan', paymentRouter);
  clientGroup.use("/don-hang", orderRouter);
  clientGroup.use('/dich-vu/hack-game', toolRouter);
  app.use('/', clientGroup);

  // Group middleware: decodedToken + adminLayout
  const adminGroup = express.Router();
  adminGroup.use(decodedToken, adminLayout,CheckProtectRoutes);
  adminGroup.use('/admin/tool-game', toolAdminRouter);
  adminGroup.use('/admin/acc-game', accgameAdminRouter);
  adminGroup.use('/admin/danh-muc', CategoryAdminRouter);
  adminGroup.use('/admin/nguoi-dung', UserAdminRouter);
  adminGroup.use('/admin/quan-ly', DashboardRouter);
  app.use('/', adminGroup);
};
