const homeRouter = require('./client/HomeRouter'); // Import homeRouter
const authRouter = require('./client/AuthRouter');
const paymentRouter = require('./client/PaymentRouter');
const { decodedToken } = require('../service/jwt');

module.exports = (app) => {
  app.use('/', homeRouter);
  app.use('/auth', authRouter);
  app.use('/payment', decodedToken, paymentRouter);
  
};
