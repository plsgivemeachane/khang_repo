const express = require("express");
const router = express.Router();
const controller = require("../../controller/AuthController");
const { RegisterValidation } = require("../../middleware/validate");


router.post("/dang-ky",RegisterValidation, controller.registerAuth);
router.post("/dang-nhap",controller.loginAuth);
router.get("/dang-xuat",controller.logoutAuth);
module.exports = router;