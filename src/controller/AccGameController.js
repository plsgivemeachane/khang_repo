const db = require('../models');
const createTree = require('../helper/createTree');
const cloudinary = require('../config/cloudinary');

const create = async (req, res) => {
  const categories = await db.Category.findAll();
  const newCategories = createTree.tree(categories);
  res.render('admin/accgame/create', { categories: newCategories });
};
const index = async (req, res) => {
  const accgame = await db.AccGame.findAll();

  const categoryId = await accgame.map((item) => item.category_id);
  const userId = await accgame.map((item) => item.created_by);

  const user = await db.User.findAll({
    where: {
      id: userId,
    },
  });

  const getNameUser = user.map((item) => item.username);

  const nameUser = getNameUser.join(', ');
  const categories = await db.Category.findAll({
    where: {
      id: categoryId,
    },
  });
  const getNameCategory = categories.map((item) => item.name);
  const name = getNameCategory.join(', ');
  const newData = accgame.map((item) => ({
    id: item.id,
    name: item.name,
    image: item.image,
    price: item.price,
    author: nameUser,
    category_name: name,
  }));

  res.render('admin/accgame/index', { data: newData });
};
const createAcc = async (req, res) => {
  try {
    let {
      name,
      price,
      image,
      list_image,
      status,
      method_login,
      description,
      category_id,
      social_media,
    } = req.body;
    // console.log(" createAcc ~ socal_media:", socal_media)
    console.log(' createAcc ~ req.body:', req.body);
    const userId = req.user.id;
    await db.AccGame.create({
      name,
      price,
      image,
      list_image,
      status,
      method_login,
      category_id,
      social_media,
      description,
      created_by: userId,
    });
    res.send('ok');
  } catch (error) {
    console.log(error);
  }
};
const updateAccGameClient = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  try {
    const accgame = await db.AccGame.findOne({ where: { id: id } });
    const checkIdUser = accgame.created_by;
    if (checkIdUser == userId) {
      res.render('client/accgame/update', { accgame: accgame });
    }
  } catch (error) {
    console.log(error);
  }
};
const updateAccGame = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  try {
    const accgame = await db.AccGame.findOne({ where: { id: id } });
    const checkIdUser = accgame.created_by;
    if (checkIdUser == userId) {
      res.render('admin/accgame/update', { accgame: accgame });
    }
  } catch (error) {
    console.log(error);
  }
};
const updateAccGameByAdmin = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  try {
    const checkUser = await db.User.findOne({ where: { id: userId } });
    const roleId = checkUser.roleId;
    const role = await db.Role.findOne({ where: { id: roleId } });
    const role_name = role.name;
    const categories = await db.Category.findAll()
    const newCategories = createTree.tree(categories);
    function selectTree(items, level = 1, parent_id = null) {
      let html = '';
      items.forEach((item) => {
        let prefix = '--'.repeat(level);
        html += `<option value="${item.id}" ${
          item.id == parent_id ? 'selected' : ''
        }>${prefix}${item.name}</option>`;
        if (item.children && item.children.length > 0) {
          html += selectTree(item.children, level + 1, parent_id);
        }
      });
      return html;
    }
    if (role_name == 'Admin') {
      const accgame = await db.AccGame.findOne({ where: { id: id } });
      console.log(accgame.category_id);
      res.render('admin/accgame/update', {
        accgame: accgame,
        categories: newCategories,
        categoryOptions: selectTree(categories, 1, accgame.category_id),
      });
    }
  } catch (error) {
    console.log(error);
  }
};
const updateByAdmin = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const data = req.body;

  try {
    const checkUser = await db.User.findOne({ where: { id: userId } });
    const roleId = checkUser.roleId;
    const role = await db.Role.findOne({ where: { id: roleId } });
    const role_name = role.name;
    if (role_name == 'Admin') {
      await db.AccGame.update(data, { where: { id: id } });
      res.redirect('/admin/acc-game');
    }
  } catch (error) {
    console.log(error);
  }
};
const deleteImage = async (req, res) => {
  try {
    const { image: url } = req.body;
    const regex = /(?<=\/)[\w-]+(?=\.\w+$)/;
    const id = req.params.id;
    const accgame = await db.AccGame.findOne({ where: { id: id } });

    if (!accgame)
      return res.status(404).json({ message: 'Acc game không tồn tại' });

    // Kiểm tra hình ảnh có tồn tại trong product
    const isMainImage = accgame.image === url;
    const isInListImage = accgame.list_image.includes(url);

    if (!isMainImage && !isInListImage) {
      return res
        .status(400)
        .json({ message: 'Hình ảnh không tồn tại trong sản phẩm' });
    }

    const imageName = url.match(regex)[0];
    console.log('Đang xóa trên Cloudinary:', imageName);
    await cloudinary.uploader.destroy(imageName, { invalidate: true });

    // Xóa trong database
    if (isMainImage) accgame.image = '';
    if (isInListImage)
      accgame.list_image = accgame.list_image.filter((item) => item !== url);

    await accgame.save();

    res.status(200).json({ message: 'Xóa hình ảnh thành công' });
  } catch (error) {
    console.log('deleteImage ~ error:', error);
    res.status(500).json({ message: 'Xóa hình ảnh thất bại' });
  }
};
module.exports = {
  create,
  createAcc,
  updateAccGameClient,
  updateAccGame,
  updateAccGameByAdmin,
  updateByAdmin,
  index,
  deleteImage,
};
