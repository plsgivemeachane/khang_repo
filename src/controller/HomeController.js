const createTree = require('../helper/createTree');
const db = require('../models');
const { Op } = require('sequelize');



const index = async (req, res) => {
  const accgame = await db.AccGame.findAll({
    where: { status: 'Duyệt' },
    limit: 5,
  });

  const tool = await db.Tool.findAll({ limit: 5 });
  const categoryId = await tool.map((item) => item.category_id);
  const categories = await db.Category.findAll({
    where: {
      id: categoryId,
    },
  });
  const getNameCategory = categories.map((item) => item.name);
  const name = getNameCategory.join(', ');
  
  const newData = tool.map((item) => ({
    id: item.id,
    name: item.name,
    image: item.image,
    price: item.price,
    slug: item.slug,
    category_name: name,
  }));
  const newDataAcc = accgame.map((item) => ({
    id: item.id,
    name: item.name,
    image: item.image,
    price: item.price,
    slug: item.slug,
    category_name: name,
  }));
  res.render('index', { accgame: newDataAcc, toolgame: newData, title: 'Trang chủ' });
};
const notPermission = (req, res) => {
  res.render('not-permission');
};

const viewAll = async (req, res) => {
  const optionPage = req.query.option;
  const min = parseInt(req.query.min || 0, 10);
  const max = parseInt(req.query.max || 5000000, 10);
  const categoryId = req.query.category_id;
  const sort = req.query.sort; // ví dụ: price-asc, price-desc, newest

  const categoriesData = await db.Category.findAll();
  const newCategories = createTree.tree(categoriesData);

  // Bộ lọc điều kiện where
  const whereFilter = {
    status: 'Duyệt',
    price: { [Op.between]: [min, max] },
  };
  if (categoryId) whereFilter.category_id = categoryId;

  // Xử lý sắp xếp
  let order = [['createdAt', 'DESC']]; // mặc định
  if (sort === 'price-asc') order = [['price', 'ASC']];
  if (sort === 'price-desc') order = [['price', 'DESC']];
  if (sort === 'newest') order = [['createdAt', 'DESC']];

  let data = [];

  if (optionPage === 'acc-game') {
    const accgame = await db.AccGame.findAll({
      where: whereFilter,
      limit: 25,
      order,
      include: [
        {
          model: db.Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    });

    data = accgame.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      slug: item.slug,
      category_name: item.category?.name || '',
    }));
  } else if (optionPage === 'tool-game') {
    const tool = await db.Tool.findAll({
      where: whereFilter,
      limit: 25,
      order,
      include: [
        {
          model: db.Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    });

    data = tool.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      slug: item.slug,
      category_name: item.category?.name || '',
    }));
  }

  res.render('service/view-all', {
    title: 'Xem tất cả',
    data,
    optionPage,
    categoriesData: newCategories,
  });
};
const registerSeller = async (req, res) => {
  res.render('service/accgame/register-seller', { title: 'Đăng ký bán acc' });
};
const requestSeller = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: 'Thiếu thông tin userId' });
    }

    // TODO: Ghi log hoặc lưu vào bảng Request nếu cần
    // await db.SellerRequest.create({ userId, status: 'pending' });

    return res.status(200).json({ message: 'Yêu cầu đã được gửi thành công!' });
  } catch (error) {
    console.error('Lỗi khi gửi yêu cầu seller:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại sau.' });
  }
};

module.exports = {
  index,
  notPermission,
  viewAll,
  registerSeller,
  requestSeller
};
