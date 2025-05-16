const express = require("express");
const router = express.Router();
const controller = require("../../controller/CategoryController");
router.get("/",controller.index);
router.get("/tao-danh-muc",controller.create);
router.post("/tao-danh-muc",controller.createCategory);

router.get("/sua-danh-muc/:id",controller.update);
router.post("/sua-danh-muc/:id",controller.updateCategory);


module.exports = router;