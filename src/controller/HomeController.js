const db = require("../models");
const index =async (req, res) => {
    const accgame = await db.AccGame.findAll({});
    console.log(" index ~ accgame:", accgame)
    res.render("index",{accgame,title:"Trang chủ"});
}
const test = (req, res) => {
    res.render("test");
}
module.exports = {
    index,
    test
}