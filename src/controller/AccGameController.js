const db = require("../models");
const createTree = require('../helper/createTree');

const create = async (req, res) => {
    const categories=await db.Category.findAll();
    const newCategories = createTree.tree(categories);
    res.render("admin/product/create",{categories:newCategories});
};
const createAcc = async (req, res) => {
    try {
        let {name,price,image,list_image,status,method_login,description,category_id,social_media}= req.body
        // console.log(" createAcc ~ socal_media:", socal_media)
        console.log(" createAcc ~ req.body:", req.body)
        const userId = req.user.id
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
            created_by:userId
        })
       res.send("ok")

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    create,
    createAcc
};