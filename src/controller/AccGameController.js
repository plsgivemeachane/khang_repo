const db = require('../models');
const createTree = require('../helper/createTree');
const cloudinary = require('../config/cloudinary');
const { statusgame } = require('../utils/constant');
const limtItem = 10;
const currentPage = 1;
const { createSlug } = require('../helper/create-slug');
const index = async (req, res) => {
  try {
    // 1. Lấy tham số page từ query, mặc định là 1
    const limitItem = 10;
    const currentPage = Number(req.query.page) || 1;
    const offset = (currentPage - 1) * limitItem;

    // 2. Lấy tổng số acc game để tính số trang
    const totalAccGame = await db.AccGame.count();

    // 3. Lấy danh sách acc game theo trang
    const accGames = await db.AccGame.findAll({
      limit: limitItem,
      offset: offset,
    });

    // 4. Lấy danh sách user và category liên quan
    const userIds = [...new Set(accGames.map((item) => item.created_by))];
    const categoryIds = [...new Set(accGames.map((item) => item.category_id))];

    const users = await db.User.findAll({ where: { id: userIds } });
    const categories = await db.Category.findAll({
      where: { id: categoryIds },
    });

    // 5. Tạo bản đồ ánh xạ user và category
    const userMap = {};
    users.forEach((user) => (userMap[user.id] = user.username));

    const categoryMap = {};
    categories.forEach((cat) => (categoryMap[cat.id] = cat.name));

    // 6. Tạo danh sách render
    const newData = accGames.map((acc) => ({
      id: acc.id,
      name: acc.name,
      image: acc.image,
      price: acc.price,
      status: acc.status,
      author: userMap[acc.created_by] || 'Không rõ',
      category_name: categoryMap[acc.category_id] || 'Không rõ',
    }));

    const totalPage = Math.ceil(totalAccGame / limitItem);

    // 7. Render ra view
    res.render('admin/accgame/index', {
      data: newData,
      currentPage,
      totalPage,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách acc game:', error);
    res.status(500).send('Lỗi server');
  }
};

const create = async (req, res) => {
  const categories = await db.Category.findAll();
  const newCategories = createTree.tree(categories);
  res.render('admin/accgame/create', { categories: newCategories });
};
const createClient = async (req, res) => {
  const categories = await db.Category.findAll();
  const newCategories = createTree.tree(categories);
  res.render('service/accgame/create', {
    categories: newCategories,
    title: 'Đăng acc game',
  });
};

const updateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res
        .status(400)
        .json({ success: false, message: 'Thiếu id hoặc trạng thái' });
    }

    const accgame = await db.AccGame.findOne({ where: { id } });
    if (!accgame) {
      return res
        .status(404)
        .json({ success: false, message: 'Acc game không tồn tại' });
    }

    accgame.status = status;
    await accgame.save();

    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error('updateStatus ~ error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Lỗi cập nhật trạng thái' });
  }
};

const listAccClient = async (req, res) => {
  const userId = req.user.id;
  try {
    const accgame = await db.AccGame.findAll({ where: { created_by: userId } });

    const categoryId = await accgame.map((item) => item.category_id);

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
      status: item.status,
    }));
    res.render('service/accgame/index', {
      data: newData,
      title: 'Xem acc game',
    });
  } catch (error) {
    console.log(error);
  }
};
const createAcc = async (req, res) => {
  try {
    let {
      name,
      price,
      image,
      list_image,
      status_acc,
      method_login,
      description,
      category_id,
      social_media,
    } = req.body;
    // console.log(" createAcc ~ socal_media:", socal_media)

    const userId = req.user.id;
    await db.AccGame.create({
      name,
      price,
      image: image || null,
      list_image: list_image || null,
      status_acc,
      status: statusgame.pending,
      slug: createSlug(name),
      method_login,
      category_id,
      social_media,
      description,
      created_by: userId,
    });
    req.flash(
      'success',
      'Tạo acc game thành công,bạn vui lòng chờ admin duyệt'
    );
    res.redirect('/acc-game/quan-ly');
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
      res.render('service/accgame/update', { accgame: accgame });
    }
  } catch (error) {
    console.log(error);
  }
};
const updateAccGame = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  let data = req.body;
  try {
    let accgame = await db.AccGame.findOne({ where: { id: id } });
    if (!accgame) {
      req.flash('error', 'Không tìm thấy acc game');
      return res.redirect('/acc-game/quan-ly');
    }
    const checkIdUser = accgame.created_by;
    if (checkIdUser == userId) {
      if (req.files['image']) {
        const regex = /(?<=\/)[\w-]+(?=\.\w+$)/;
        const currentImageName = accgame.image?.match(regex)?.[0];
        if (currentImageName) {
          await cloudinary.uploader.destroy(currentImageName, {
            invalidate: true,
          });
        }
        accgame.image = req.files['image'][0].path;
      }

      // ✅ Xử lý ảnh list_image mới
      if (req.files['list_image']) {
        const uploadedListImages = data.list_image.map((image) => image);

        accgame.list_image.push(...uploadedListImages);
      }

      await accgame.save();
      res.redirect('/service/accgame');
    } else {
      req.flash('error', 'Không tìm thấy tài khoản game này do bạn đăng');
      return res.redirect('/acc-game/quan-ly');
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
    const categories = await db.Category.findAll();
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
      if (!accgame) {
        req.flash('error', 'Acc game không tồn tại');
        return res.redirect('/admin/acc-game');
      }
      const newData = {
        id: accgame.id,
        name: accgame.name,
        price: accgame.price,
        image: accgame.image,
        list_image: JSON.parse(accgame.list_image),
        status: accgame.status,
        method_login: accgame.method_login,
        category_id: accgame.category_id,
        social_media: accgame.social_media,
        description: accgame.description,
      };
      res.render('admin/accgame/update', {
        accgame: newData,
        categories: newCategories,
        categoryOptions: selectTree(categories, 1, accgame.category_id),
      });
      // res.render('admin/accgame/update', {
      //   accgame: accgame,
      //   categories: newCategories,
      //   categoryOptions: selectTree(categories, 1, accgame.category_id),
      // });
    }
  } catch (error) {
    console.log(error);
  }
};
const updateByAdmin = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  let data = req.body;
  console.log(' updateByAdmin ~ data:', data);

  try {
    const checkUser = await db.User.findOne({ where: { id: userId } });
    const role = await db.Role.findOne({ where: { id: checkUser.roleId } });

    if (role.name !== 'Admin') {
      return res.status(403).send('Bạn không có quyền');
    }

    let accgame = await db.AccGame.findOne({ where: { id } });
    if (!accgame) return res.status(404).send('Không tìm thấy acc game');
    accgame.list_image = JSON.parse(accgame.list_image) || [];

    // ✅ Xử lý ảnh đại diện
    if (req.files['image']) {
      const regex = /(?<=\/)[\w-]+(?=\.\w+$)/;
      const currentImageName = accgame.image?.match(regex)?.[0];
      if (currentImageName) {
        await cloudinary.uploader.destroy(currentImageName, {
          invalidate: true,
        });
      }
      accgame.image = req.files['image'][0].path;
    }

    // ✅ Xử lý ảnh list_image mới
    if (req.files['list_image']) {
      const uploadedListImages = data.list_image.map((image) => image);

      accgame.list_image.push(...uploadedListImages);
    }
    accgame.name = data.name;
    accgame.description = data.description;
    accgame.slug = createSlug(data.name);
    accgame.price = data.price;
    accgame.status = data.status;
    accgame.status_acc = data.status_acc;
    accgame.method_login = data.method_login;
    accgame.social_media = data.social_media;
    accgame.category_id = data.category_id;

    await accgame.save();
    req.flash('success', 'Cập nhật acc game thành công');
    res.redirect('/admin/acc-game');
  } catch (error) {
    console.log('updateByAdmin ~ error:', error);
    res.status(500).send('Lỗi cập nhật acc game');
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

    const isMainImage = accgame.image === url;

    let listImageArray = accgame.list_image;
    if (typeof listImageArray === 'string') {
      try {
        listImageArray = JSON.parse(listImageArray);
      } catch (e) {
        listImageArray = [];
      }
    }

    const isInListImage = listImageArray.includes(url);

    if (!isMainImage && !isInListImage) {
      return res
        .status(400)
        .json({ message: 'Hình ảnh không tồn tại trong sản phẩm' });
    }

    const imageName = url.match(regex)[0];
    console.log('Đang xóa trên Cloudinary:', imageName);
    await cloudinary.uploader.destroy(imageName, { invalidate: true });

    if (isMainImage) accgame.image = '';
    if (isInListImage)
      accgame.list_image = listImageArray.filter((item) => item !== url);

    await accgame.save();

    res.status(200).json({ message: 'Xóa hình ảnh thành công' });
  } catch (error) {
    console.log('deleteImage ~ error:', error);
    res.status(500).json({ message: 'Xóa hình ảnh thất bại' });
  }
};
const deleteByAdmin = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  try {
    const checkUser = await db.User.findOne({ where: { id: userId } });
    const role = await db.Role.findOne({ where: { id: checkUser.roleId } });
    if (role.name !== 'Admin') {
      return res.status(403).send('You do not have permission');
    }
    let accgame = await db.AccGame.findOne({ where: { id: id } });
    if (!accgame) return res.status(404).send('Không tìm thấy acc game');
    if (accgame.image) {
      const regex = /(?<=\/)[\w-]+(?=\.\w+$)/;
      const imageName = accgame.image.match(regex)[0];
      console.log('Đang xóa trên Cloudinary:', imageName);
      await cloudinary.uploader.destroy(imageName, { invalidate: true });
    }
    accgame.list_image = JSON.parse(accgame.list_image) || [];
    if (accgame.list_image.length > 0) {
      for (let i = 0; i < accgame.list_image.length; i++) {
        const regex = /(?<=\/)[\w-]+(?=\.\w+$)/;
        const imageName = accgame.list_image[i].match(regex)[0];
        console.log('Đang xóa trên Cloudinary:', imageName);
        await cloudinary.uploader.destroy(imageName, { invalidate: true });
      }
    }
    await accgame.destroy();
    req.flash('success', 'Xóa acc game thành cong');
    res.redirect('/admin/acc-game');
  } catch (error) {
    console.log('deleteByAdmin ~ error:', error);
    res.status(500).send('Lỗi xóa acc game');
  }
};
const detail = async (req, res) => {
  try {
    const id = req.params.id;
    const accgame = await db.AccGame.findOne({ where: { id: id } });
    if (!accgame) return res.status(404).send('Không tìm thấy acc game');
    if (accgame.status === 'Duyệt') {
      const category = await db.Category.findOne({
        where: { id: accgame.category_id },
      });

      const nameCategory = category ? category.name : 'Không rõ';

      const newData = {
        id: accgame.id,
        name: accgame.name,
        image: accgame.image,
        price: accgame.price,
        list_image: JSON.parse(accgame.list_image || '[]'),
        description: accgame.description,
        slug: accgame.slug,
        category_name: nameCategory,
      };
      res.render('service/accgame/detail', {
        accgame: newData,
        title: `Chi tiết acc game ${newData.name} `,
      });
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log('detail ~ error:', error);
    res.status(500).send('Lỗi xóa acc game');
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
  listAccClient,
  deleteByAdmin,
  createClient,
  updateStatus,
  detail,
};
