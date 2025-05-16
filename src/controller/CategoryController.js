const db = require("../models");
const createTree = require('../helper/createTree');
const { createSlug } = require("../helper/create-slug");
const index = async(req,res)=>{
  const categories = await db.Category.findAll();
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

  const categoriesWithParent = categories.map(category => ({
    id: category.id,
    name: category.name,
    parent_id: category.parent_id || null,
    
    parent_name: category.parent_id ? categoryMap.get(category.parent_id) || "Không có" : "Không có"
  }));
  res.render("admin/category/index",{categories:categoriesWithParent})
}
const create=async(req,res)=>{
    const categories=await db.Category.findAll();
    const newCategories = createTree.tree(categories);
    console.log(" create ~ newCategories:", newCategories)

    res.render('admin/category/create',{categories:newCategories})
}
const createCategory=async(req,res)=>{
    const {name,parent_id,description}=req.body
    const slug=createSlug(name)
    await db.Category.create({name,slug,parent_id,description})
    res.redirect('/admin/danh-muc/tao-danh-muc')
}
const update=async(req,res)=>{
    const id = req.params.id;
    const categories=await db.Category.findAll();
    const newCategories = createTree.tree(categories);
    const data = await db.Category.findOne({where:{id:id}});
    if (!data) {
        req.flash('error', 'Danh mục không tồn tại');
        res.redirect('/admin/category');
      }
      console.log(" update ~ data:", data)
      function selectTree(items, level = 1, parent_id = null) {
        let html = "";
        items.forEach(item => {
            let prefix = "--".repeat(level);
            html += `<option value="${item.id}" ${item.id == parent_id ? "selected" : ""}>${prefix}${item.name}</option>`;
            if (item.children && item.children.length > 0) {
                html += selectTree(item.children, level + 1, parent_id);
            }
        });
        return html;
      }
      res.render('admin/category/update', {
        data,
        categories: newCategories,
        categoryOptions: selectTree(categories, 1, data.parent_id) 
      });
}
const updateCategory=async(req,res)=>{
  const id = req.params.id;
  const {name,parent_id}=req.body
  console.log(" updateCategory ~ req.body:", req.body)
try {
  const slug=createSlug(name)
  await db.Category.update({name,slug,parent_id},{where:{id:id}})
  res.redirect('/admin/danh-muc/tao-danh-muc')
} catch (error) {
  console.log(" updateCategory ~ error:", error);
  res.redirect("/admin/danh-muc/tao-danh-muc");
}
}
module.exports={create,createCategory,update,index,updateCategory}