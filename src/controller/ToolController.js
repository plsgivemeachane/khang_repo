const db = require('../models');
const createTree = require('../helper/createTree');

const create = async (req, res) => {
  const categories = await db.Category.findAll();
  const newCategories = createTree.tree(categories);
  res.render('admin/tool/create', { categories: newCategories });
};
const createTool = async (req, res) => {
  console.log(req.body);
  try {
    const data = req.body;
    await db.Tool.create(data);
    res.send('ok');
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  create,
  createTool,
};
