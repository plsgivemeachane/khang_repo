const db = require("../models");
const index =async (req, res) => {
    res.render("order/order");
}
const order = async(req, res) => {
    const userOrder = req.user.id
    const {orderId,quantity} = req.body;
    await db.Order.create({userOrder,orderId,quantity});
res.send("oke")
    
}
module.exports = {
    index,
    order
}