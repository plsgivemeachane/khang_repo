const express = require("express");
const router = express.Router();
const controller = require("../../controller/AuthController");


router.get("/dang-ky",controller.register);
router.get("/dang-nhap",controller.login);
router.post("/dang-ky",controller.registerAuth);
router.post("/dang-nhap",controller.loginAuth);

module.exports = router;