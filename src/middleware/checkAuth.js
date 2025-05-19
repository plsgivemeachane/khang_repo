const db = require('../models');

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

  if (!orderId || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
  }

  const tool = await db.Tool.findOne({ where: { id: orderId } });
  if (!tool) {
    return res.status(404).json({ message: 'Tool không tồn tại' });
  }

  const price = Number(tool.price);
  let keyList = tool.key_value?.split(',') || [];

  // Lọc ra key chưa dùng (không có dạng "-true-<id>")
  const availableKeys = keyList.filter(k => !/-true-\d+$/.test(k));

  if (availableKeys.length < quantity) {
    console.warn(`Không đủ key. Yêu cầu: ${quantity}, còn: ${availableKeys.length}`);
    return res.status(400).json({ message: 'Không đủ key để xử lý đơn hàng' });
  }

  const selectedKeys = availableKeys.slice(0, quantity);

  // Tạo key mới có định dạng: key-true-userId
  const updatedKeyList = keyList.map(originalKey => {
    if (selectedKeys.includes(originalKey)) {
      return `${originalKey}-true-${userId}`;
    }
    return originalKey;
  });

  const user = await db.User.findOne({ where: { id: userId } });
  if (!user) {
    return res.status(403).json({ message: 'Không tìm thấy người dùng' });
  }

  const assetUser = Number(user.asset);
  const totalPrice = price * quantity;

  if (assetUser < totalPrice) {
    return res.status(400).json({ message: 'K đủ tiền' });
  }

  // Trừ tiền
  await db.User.update(
    { asset: assetUser - totalPrice },
    { where: { id: userId } }
  );

  // Update lại key_value
  await db.Tool.update(
    { key_value: updatedKeyList.join(',') },
    { where: { id: orderId } }
  );

  req.selectedKeys = selectedKeys;

  return next();
};

module.exports = {
  checkAuth,
  checkPayment,
};
