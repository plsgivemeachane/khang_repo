const express = require("express");
const router = express.Router();
const controller = require("../../controller/CategoryController");
router.get("/",controller.index);
router.get("/tao-moi",controller.create);



module.exports = router;Ứ