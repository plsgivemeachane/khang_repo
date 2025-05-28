const createTree = require('../helper/createTree');
const db = require('../models');
const { Op } = require('sequelize');

const index = async (req, res) => {
  try {
    // Lấy 5 tài khoản game đã duyệt
    const accGames = await db.AccGame.findAll({
      where: { status: 'Duyệt' },
      limit: 5,
    });

    // Lấy 5 tool kèm theo category (KHÔNG dùng alias)
    const tools = await db.Tool.findAll({
      limit: 5,
      include: [
        {
          model: db.Category, // KHÔNG dùng 'as'
        },
      ],
    });

    // Format lại dữ liệu tools
    const newToolData = tools
      .filter((item) => {
        // Tách key thành mảng
        const keyList = item.key_value?.split(',') || [];

        // Lọc ra các key chưa dùng (không chứa -true-<số>)
        const availableKeys = keyList.filter((key) => !/-true-\d+$/.test(key));

        return availableKeys.length > 0; // Chỉ hiển thị tool còn key dùng được
      })
      .map((item) => {
        const keyList = item.key_value?.split(',') || [];
        const availableKeys = keyList.filter((key) => !/-true-\d+$/.test(key));
        return {
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          slug: item.slug,
          category_name: item.Category?.name || 'Không rõ',
        };
      });

    // Tương tự cho accgame (không có category trong accgame nên dùng 'Không rõ')
    const newAccData = accGames.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      slug: item.slug,
      category_name: 'Không rõ',
    }));

    // Trả dữ liệu về view
    res.render('index', {
      accgame: newAccData,
      toolgame: newToolData,
      title: 'Trang chủ',
    });
  } catch (error) {
    console.log('index ~ error:', error);
    res.render('error', { message: 'Lỗi khi tải trang chủ' });
  }
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
    return res
      .status(500)
      .json({ message: 'Đã xảy ra lỗi, vui lòng thử lại sau.' });
  }
};

const listRoom = async (req, res) => {
  const userId = req.user.id;

  try {
    // Lấy tất cả các phòng
    const allRooms = await db.Room.findAll();

    // Lọc những phòng mà userId có trong member
    const joinedRooms = allRooms.filter((room) => {
      const members = Array.isArray(room.member)
        ? room.member
        : JSON.parse(room.member || '[]');
      return members.includes(userId);
    });

    res.render('layout/client/roomchat', {
      title: 'Room chat',
      rooms: joinedRooms,
      userId: req.user.id, // đừng quên dòng này
    });
  } catch (error) {
    console.error('listRoom error:', error);
    res.status(500).send('Server error');
  }
};
const search = async (req, res) => {
  const keyword = req.query.q?.trim();

  if (!keyword) {
    return res.render('search', { resultsTool: [], resultsAcc: [], keyword: '' });
  }

  try {
    // Tìm kiếm Tool Game
    const resultsTool = await db.Tool.findAll({
      where: {
        name: { [Op.like]: `%${keyword}%` },
      },
    });

    // Tìm kiếm Acc Game
    const resultsAcc = await db.AccGame.findAll({
      where: {
        name: { [Op.like]: `%${keyword}%` },
        status: 'Duyệt',
      },
    });

    res.render('more/search', { resultsTool, resultsAcc, keyword, title: `Tìm kiếm ${keyword}` });
  } catch (error) {
    console.log('Search error:', error);
    res.render('search', { resultsTool: [], resultsAcc: [], keyword, error: 'Lỗi tìm kiếm' });
  }
};

module.exports = {
  index,
  notPermission,
  viewAll,
  registerSeller,
  requestSeller,
  listRoom,
  search
};
