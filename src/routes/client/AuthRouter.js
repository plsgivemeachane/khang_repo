const express = require("express");
const router = express.Router();
const controller = require("../../controller/AuthController");


router.post("/dang-ky",controller.registerAuth);
router.post("/dang-nhap",controller.loginAuth);

module.exports = router;