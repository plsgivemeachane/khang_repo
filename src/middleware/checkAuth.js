const db = require("../models");

const checkAuth = (req, res, next) => {
  if (req.user) {
    return next();
  } else {
    res.redirect('/tai-khoan/dang-nhap');
  }
};
const checkPayment = async (req, res, next) => {
  const userId = req.user.id;
  let { orderId, quantity } = req.body;

  orderId = Number(orderId);
  quantity = Number(quantity);

  const checkToolOrderId = await db.Tool.findOne({ where: { id: orderId } });
  const price = checkToolOrderId.price;

  // Bước 1: Lấy key_value ban đầu và chuyển thành mảng
  let keyList = checkToolOrderId.key_value?.split(',') || [];

  // Bước 2: Lọc ra các key chưa dùng (không có "-true")
  const availableKeys = keyList.filter(k => !k.endsWith('-true'));

  // Nếu không đủ số lượng key thì báo lỗi
  if (availableKeys.length < quantity) {
    return res.send("Không đủ key để xử lý đơn hàng.");
  }

  // Bước 3: Lấy quantity key đầu tiên
  const selectedKeys = availableKeys.slice(0, quantity);

  // Bước 4: Cập nhật lại keyList: đánh dấu các key đã dùng
  const updatedKeyList = keyList.map(k => {
    return selectedKeys.includes(k) ? `${k}-true` : k;
  });

  // Bước 5: Trừ tiền user nếu đủ
  const checkAssetUser = await db.User.findOne({ where: { id: userId } });
  const assetUser = checkAssetUser.asset;

  if (assetUser >= price * quantity) {
    await db.User.update(
      { asset: assetUser - price * quantity },
      { where: { id: userId } }
    );

    // Bước 6: Update lại key_value
    await db.Tool.update(
      { key_value: updatedKeyList.join(',') },
      { where: { id: orderId } }
    );

    // Bước 7: lưu selectedKeys cho controller phía sau dùng
    req.selectedKeys = selectedKeys;

    return next();
  } else {
    return res.redirect('/nap-tien');
  }


 
  
  // const checkAssetUser = await db.User.findOne({where:{id:userId}})
  // const assetUser = checkAssetUser.asset
  // if(assetUser >= price*quantity) {
  //   await db.User.update({ asset: assetUser - price*quantity }, { where: { id: userId } });
  //   return next();
  // }else{
  //   res.redirect('/nap-tien')
  // }
}
module.exports = {
  checkAuth,
  checkPayment};
