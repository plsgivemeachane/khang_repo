const express = require("express");
const router = express.Router();
const controller = require("../../controller/UserController");
router.get("/",controller.listUser);
// router.get("/cap-nhat-quyen/:id",controller.updateQuyen);


module.exports = router;