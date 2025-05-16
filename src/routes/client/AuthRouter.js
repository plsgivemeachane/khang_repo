const express = require("express");
const router = express.Router();
const controller = require("../../controller/AuthController");
const clientLayout = require("../../components/ui/ShareLayout");

router.get("/register",controller.register);
router.get("/login",controller.login);
router.post("/register",controller.registerAuth);
router.post("/login",controller.loginAuth);

module.exports = router;