const PayOS = require('@payos/node');
const db = require('../models');
require('dotenv').config();
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);
const domain = 'http://localhost:4000';
const naptien = (req, res) => {
  res.render('payment/naptien', { title: 'Nạp tiển' });
};
const ruttien = (req, res) => {
  res.render('payment/ruttien', { title: 'Rút tiển' });
};
const ruttienven = async (req, res) => {
  const { payment_value } = req.body;
  const userId = req.user.id;
  const userInfo = await db.User.findOne({ where: { id: userId } });
  const userAsset = userInfo.asset;
  if (userAsset >= Number(payment_value)) {
    await db.Payment.create({
      userId: userId,
      payment_content: userId + 'rut tien',
      status: true,
      payment_value: Number(payment_value),
    });
    // update asset user from userId
    const assetCurrentUser = await db.User.findOne({ where: { id: userId } });
    const newAsset = Number(assetCurrentUser.asset) - Number(payment_value);

    await db.User.update({ asset: newAsset }, { where: { id: userId } });
    res.redirect('/thanh-toan/rut-tien/thanh-cong');
  } else {
    res.redirect('/thanh-toan/rut-tien/that-bai');
  }
};
const paymentSuccess = async (req, res) => {
  //  http://localhost:4000/thanh-toan/nap-tien/thanh-cong?code=00&id=7b5a11788fc044ceaa06144583d74285&cancel=false&status=PAID&orderCode=1749135823262
  //  get status
  const params = req.query;
  const status = params.status;
  const paymentId = params.id;
  const getPaymentById = await payos.getPaymentLinkInformation(paymentId);
  const amountPaid = getPaymentById.amountPaid;
  const userId = req.user.id;
  const checkPayment = await db.Payment.findOne({ where: { paymentId: paymentId } });
  if(!checkPayment){
    
  
  if (status === 'PAID') {
    await db.Payment.create({
      userId: userId,
      payment_content: 'nap tien',
      status: true,
      payment_value: Number(amountPaid),
      paymentId: paymentId,
    });
    // update asset user from userId
    const assetCurrentUser = await db.User.findOne({ where: { id: userId } });
    const newAsset = Number(assetCurrentUser.asset) + Number(amountPaid);
    await db.User.update({ asset: newAsset }, { where: { id: userId } });
  }

  res.render('payment/success', { title: 'Thanh toán thành công đơn hàng' });
  }else{
    res.redirect('/');
  }
};
const payment = async (req, res) => {
  const { payment_value } = req.body;
  const date = new Date();
  console.log(' payment ~ date:', date);
  const getDateToilisecond = date.getTime();
  const userId = req.user.id;
  const order = {
    amount: Number(payment_value),
    description: 'userId' + userId + 'nap tien',
    orderCode: getDateToilisecond,
    returnUrl:
      domain + '/thanh-toan/nap-tien/thanh-cong',
    cancelUrl: domain,
  };
  const paymentLink = await payos.createPaymentLink(order);
  // const test = await payos.getPaymentLinkInformation("2637540a78ff4dd5b46895c39c73f183")
  // res.send(test);
  res.redirect(303, paymentLink.checkoutUrl);
};
const lichsunap = async (req, res) => {
  const userId = req.user.id;
  const payments = await db.Payment.findAll({ where: { userId: userId } });
  res.render('payment/lichsunap', {
    payments: payments,
    title: 'Lịch sử nạp tiền',
  });
};
module.exports = {
  naptien,
  payment,
  paymentSuccess,
  ruttien,
  ruttienven,
  lichsunap,
};
