const PayOS = require("@payos/node");
const db = require("../models");
const payos = new PayOS('ef8f9217-1bed-46d1-bb02-07071cd5d960','248308c5-c0ba-4206-8d0d-32a5bf335b7e','460c50dceb5cacddf1cf9165ec354b9a221dbbb14cdd1123c85b93523cf5a094');
const domain = "http://localhost:4000";
const naptien = (req, res) => {
    res.render("payment/naptien");
};
const paymentSuccess = async (req, res) => {
    res.render("payment/success");
};
const payment =async (req, res) => {
    const { payment_value } = req.body;
    console.log(" payment ~ payment_value:", payment_value)
    const userId = req.user.id
    const order ={
        amount: Number(payment_value),
        description: "userId" + userId + "nap tien"+Math.floor(Math.random() * 1000),
        orderCode:Math.floor(Math.random() * 100),
        returnUrl: domain+"/nap-tien/thanh-cong",
        cancelUrl: domain
    }
    const paymentLink = await payos.createPaymentLink(order);
    console.log(" payment ~ paymentLink:", paymentLink)
    res.redirect(303, paymentLink.checkoutUrl);

    if(paymentLink.status === "PENDING") {
        await db.Payment.create({
            userId: userId,
            payment_content: "nap tien",
            status: true,
            payment_value: Number(payment_value),
        });
        // update asset user from userId
        const assetCurrentUser = await db.User.findOne({where:{id:userId}});
        const newAsset = Number(assetCurrentUser.asset) + Number(payment_value);
        await db.User.update({ asset: newAsset }, { where: { id: userId } });
        
    }

    
    
};
module.exports = { naptien, payment, paymentSuccess };