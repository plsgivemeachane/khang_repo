const db = require("../models");
const index =async (req, res) => {
    const id = req.params.id
    const tool = await db.Tool.findOne({where:{id:id}})
  
    
    res.render("service/tool/order",{tool,title:"Mua tool game"});
}
const order = async(req, res) => {
    const userOrder = req.user.id
    const {orderId,quantity} = req.body;
    await db.Order.create({userOrder,orderId,quantity});
    res.status(200).send("Thanh cong");
    
}
const test = (req, res) => {
    console.log(" test ~ req.body:", req.body);
}
const lichsumua = async (req, res) => {
    const userOrder = req.user.id;
  
    // 1. Lấy tất cả đơn hàng của user
    const orders = await db.Order.findAll({ where: { userOrder } });
  
    // 2. Lấy toàn bộ ID tool đã đặt
    const orderIds = orders.map(order => order.orderId);
  
    // 3. Lấy thông tin tool theo ID
    const tools = await db.Tool.findAll({ where: { id: orderIds } });
  
    // 4. Tạo map nhanh từ toolId => toolData
    const toolMap = {};
    tools.forEach(tool => {
      toolMap[tool.id] = tool;
    });
  
    // 5. Tạo danh sách kết quả cuối
    const result = [];
  
    for (const order of orders) {
      const tool = toolMap[order.orderId];
      if (!tool) continue;
  
      // Parse key_value để lấy các key của user hiện tại
      const keyList = tool.key_value?.split(',') || [];
      const matchedKeys = keyList
        .filter(k => new RegExp(`-true-${userOrder}$`).test(k))
        .map(k => k.split('-')[0]); // chỉ lấy tên key
  
      result.push({
        toolName: tool.name,
        price: tool.price,
        keys: matchedKeys.slice(0, order.quantity), // lấy đúng số lượng đã đặt
        quantity: order.quantity,
        orderedAt: order.createdAt.toISOString().replace("T", " ").slice(0, 19)
      });
    }
  
    res.render("service/tool/lichsumua", { tools: result, title: "Lịch sử mua tool" });
  };
  
  
module.exports = {
    index,
    order,
    test,
    lichsumua
}