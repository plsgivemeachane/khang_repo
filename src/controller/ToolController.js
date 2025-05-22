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

 const newData = tool.map((item) => ({
  id: item.id,
   name: item.name,
   image: item.image,
   price: item.price,
   slug:createSlug(item.name),
   category_name: name,
 }))
 console.log(" newData ~ newData:", newData)
 
 
  res.render("service/tool/list-tool",{toolgame:newData,title:"Xem tool game"});
}
const detail = async (req, res) => {
  const id = req.params.id;

  const tool = await db.Tool.findOne({ where: { id } });
  if (!tool) return res.status(404).send("Tool not found");

  const category = await db.Category.findOne({
    where: { id: tool.category_id },
  });
  let countKey = 0;
  let keyList = tool.key_value?.split(',') || [];

  keyList = keyList.map((item) =>{
    // if key not - true - <id>
    if(!/-true-\d+$/.test(item)){
      countKey++;
    }
  });
  
  const nameCategory = category ? category.name : "Không rõ";
  

  const newData = {
    id: tool.id,
    name: tool.name,
    image: tool.image,
    price: tool.price,
    list_image: JSON.parse(tool.list_image || "[]"),
    description: tool.description,
    slug: tool.slug,
    category_name: nameCategory,
    quantity: countKey
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
