const db = require('../models');
const createTree = require('../helper/createTree');
const { createSlug } = require('../helper/create-slug');
const index=async(req,res)=>{
  const tool = await db.Tool.findAll()
 const categoryId = await tool.map((item) => item.category_id);
 const categories = await db.Category.findAll({
   where: {
     id: categoryId,
   },
 });
 const getNameCategory = categories.map((item) => item.name);
 const name = getNameCategory.join(', ');
 console.log(" index ~ name:", name)
 console.log(" index ~ name:", name)
 const newData = tool.map((item) => ({
   name: item.name,
   image: item.image,
   price: item.price,
   slug:createSlug(item.name),
   category_name: name,
 }))
 console.log(" newData ~ newData:", newData)
 
 
  res.render("service/tool/hackgame",{tool:newData,title:"Xem tool game"});
}
const detail = async (req, res) => {
  const slug = req.params.slug;

  const tool = await db.Tool.findOne({ where: { slug } });
  if (!tool) return res.status(404).send("Tool not found");

  const category = await db.Category.findOne({
    where: { id: tool.category_id },
  });

  const nameCategory = category ? category.name : "Không rõ";
  console.log(" detail ~ nameCategory:", nameCategory)

  const newData = {
    id: tool.id,
    name: tool.name,
    image: tool.image,
    price: tool.price,
    list_image: JSON.parse(tool.list_image || "[]"),
    description: tool.description,
    slug: tool.slug,
    category_name: nameCategory,
  };
  console.log(" detail ~ newData:", newData)


  res.render("service/tool/detail", {
    tool: newData,
    title: "Chi tiết " + tool.name,
  });
};

const create = async (req, res) => {
  const categories = await db.Category.findAll();
  const newCategories = createTree.tree(categories);
  res.render('admin/tool/create', { categories: newCategories });
};
const createTool = async (req, res) => {
  console.log(req.body);
  try {
    const data = req.body;
    const slug = createSlug(data.name);
    await db.Tool.create({ ...data, slug });
    res.send('ok');
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  create,
  createTool,
  index,
  detail
};
