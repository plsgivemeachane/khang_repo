const express = require("express");
const router = express.Router();
const controller = require("../../controller/AccGameController");

router.get("/",controller.register);
router.get("/dang-nhap",controller.login);


module.exports = router;