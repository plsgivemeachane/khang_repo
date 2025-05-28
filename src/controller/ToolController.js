const db = require('../models');
const createTree = require('../helper/createTree');
const { createSlug } = require('../helper/create-slug');
const cloudinary = require('../config/cloudinary');
const { paginate } = require('../helper/pagination');

const index = async (req, res) => {
  const tool = await db.Tool.findAll();
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
    slug: createSlug(item.name),
    category_name: name,
  }));
  console.log(' newData ~ newData:', newData);

  res.render('service/tool/list-tool', {
    toolgame: newData,
    title: 'Xem tool game',
  });
};
const detail = async (req, res) => {
  const id = req.params.id;

  const tool = await db.Tool.findOne({ where: { id } });
  if (!tool) return res.status(404).send('Tool not found');

  const category = await db.Category.findOne({
    where: { id: tool.category_id },
  });
  let countKey = 0;
  let keyList = tool.key_value?.split(',') || [];

  keyList = keyList.map((item) => {
    // if key not - true - <id>
    if (!/-true-\d+$/.test(item)) {
      countKey++;
    }
  });

  const nameCategory = category ? category.name : 'Không rõ';

  const newData = {
    id: tool.id,
    name: tool.name,
    image: tool.image,
    price: tool.price,
    list_image: JSON.parse(tool.list_image || '[]'),
    description: tool.description,
    slug: tool.slug,
    category_name: nameCategory,
    quantity: countKey,
  };
  console.log(' detail ~ newData:', newData);

  res.render('service/tool/detail', {
    tool: newData,
    title: 'Chi tiết ' + tool.name,
  });
};

const create = async (req, res) => {
  const categories = await db.Category.findAll();
  const newCategories = createTree.tree(categories);
  res.render('admin/tool/create', { categories: newCategories });
};
const createTool = async (req, res) => {
  try {
    const data = req.body;
    const slug = createSlug(data.name);
    await db.Tool.create({ ...data, slug });
    req.flash('success', 'Tạo tool game thành công');
    res.redirect('/admin/tool-game');
  } catch (error) {
    req.flash('error', 'Có lỗi xảy ra');
    res.redirect('/admin/tool-game');
    console.log(error);
  }
};
const listTool = async (req, res) => {
  try {
    const currentPage = Number(req.query.page) || 1;

    const { items: toolGames, pagination } = await paginate({
      model: db.Tool,
      page: currentPage,
      limit: 10,
    });

    const categoryIds = [...new Set(toolGames.map((item) => item.category_id))];
    const categories = await db.Category.findAll({
      where: { id: categoryIds },
    });

    const categoryMap = {};
    categories.forEach((cat) => (categoryMap[cat.id] = cat.name));
    const newData = toolGames.map((item) => {
      const keyList = item.key_value?.split(',') || [];
      const countKey = keyList.reduce((acc, key) => {
        if (!/-true-\d+$/.test(key)) {
          acc++;
        }
        return acc;
      }, 0);

      return {
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        category_name: categoryMap[item.category_id] || 'Không rõ',
        quantity: countKey,
      };
    });

    res.render('admin/tool/index', {
      tool: newData,
      title: 'Quản lý tool game',
      currentPage: pagination.currentPage,
      totalPage: pagination.totalPages,
    });
  } catch (error) {
    console.log(error);
  }
  // res.render('admin/tool/index', { tool: newData, title: 'Quản lý tool game' });
};
const update = async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Tìm tool theo ID
    const tool = await db.Tool.findOne({ where: { id } });
    if (!tool) return res.status(404).send('Tool not found');

    // 2. Lấy danh sách category dạng cây
    const categories = await db.Category.findAll();
    const newCategories = createTree.tree(categories);

    // 3. Hàm để dựng HTML <option>
    function selectTree(items, level = 1, parent_id = null) {
      let html = '';
      items.forEach((item) => {
        const prefix = '--'.repeat(level);
        html += `<option value="${item.id}" ${
          item.id == parent_id ? 'selected' : ''
        }>${prefix}${item.name}</option>`;
        if (item.children && item.children.length > 0) {
          html += selectTree(item.children, level + 1, parent_id);
        }
      });
      return html;
    }

    // 4. Chuẩn hóa dữ liệu để render
    const newData = {
      id: tool.id,
      name: tool.name,
      price: tool.price,
      image: tool.image,
      list_image: JSON.parse(tool.list_image || '[]'),
      status: tool.status,
      category_id: tool.category_id,
      key_value: tool.key_value,
      description: tool.description,
    };

    // 5. Gửi ra view cập nhật tool
    res.render('admin/tool/update', {
      toolgame: newData,
      categories: newCategories,
      categoryOptions: selectTree(newCategories, 1, tool.category_id),
      title: 'Cập nhật tool game',
    });
  } catch (error) {
    console.error('update tool ~ error:', error);
    res.status(500).send('Lỗi server khi cập nhật tool');
  }
};

const updateTool = async (req, res) => {
  try {
    const id = req.params.id;
    let data = req.body;

    let tool = await db.Tool.findOne({ where: { id } });
    tool.list_image = JSON.parse(tool.list_image) || [];

    // ✅ Xử lý ảnh đại diện
    if (req.files['image']) {
      const regex = /(?<=\/)[\w-]+(?=\.\w+$)/;
      const currentImageName = tool.image?.match(regex)?.[0];
      if (currentImageName) {
        await cloudinary.uploader.destroy(currentImageName, {
          invalidate: true,
        });
      }
      tool.image = req.files['image'][0].path;
    }

    // ✅ Xử lý ảnh list_image mới
    if (req.files['list_image']) {
      const uploadedListImages = data.list_image.map((image) => image);

      tool.list_image.push(...uploadedListImages);
    }

    tool = await tool.update(data);
    req.flash('success', 'Cập nhật tool game thành công');
    res.redirect('/admin/tool-game');
  } catch (error) {
    console.log('updateTool ~ error:', error);
  }
};
const deleteImage = async (req, res) => {
  try {
    const { image: url } = req.body;
    const regex = /(?<=\/)[\w-]+(?=\.\w+$)/;
    const id = req.params.id;
    const tool = await db.Tool.findOne({ where: { id: id } });

    if (!tool)
      return res.status(404).json({ message: 'Acc game không tồn tại' });

    const isMainImage = tool.image === url;

    let listImageArray = tool.list_image;
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

    if (isMainImage) tool.image = '';
    if (isInListImage)
      tool.list_image = listImageArray.filter((item) => item !== url);

    await tool.save();

    res.status(200).json({ message: 'Xóa hình ảnh thành công' });
  } catch (error) {
    console.log('deleteImage ~ error:', error);
    res.status(500).json({ message: 'Xóa hình ảnh thất bại' });
  }
};
const deleteTool = async (req, res) => {
  try {
    const id = req.params.id;
    const tool = await db.Tool.findOne({ where: { id: id } });
    if (!tool) return res.status(404).send('Tool not found');
    if (tool.image) {
      const regex = /(?<=\/)[\w-]+(?=\.\w+$)/;
      const imageName = tool.image.match(regex)[0];
      console.log('Đang xóa trên Cloudinary:', imageName);
      await cloudinary.uploader.destroy(imageName, { invalidate: true });
    }
    tool.list_image = JSON.parse(tool.list_image) || [];
    if (tool.list_image.length > 0) {
      for (let i = 0; i < tool.list_image.length; i++) {
        const regex = /(?<=\/)[\w-]+(?=\.\w+$)/;
        const imageName = tool.list_image[i].match(regex)[0];
        console.log('Đang xóa trên Cloudinary:', imageName);
        await cloudinary.uploader.destroy(imageName, { invalidate: true });
      }
    }
    await tool.destroy();
    req.flash('success', 'Xóa tool game thành công');
    res.redirect('/admin/tool-game');
  } catch (error) {
    console.log('deleteTool ~ error:', error);
  }
};
module.exports = {
  create,
  createTool,
  index,
  detail,
  listTool,
  updateTool,
  update,
  deleteImage,
  deleteTool,
};
