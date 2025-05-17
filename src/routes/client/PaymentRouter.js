const express = require("express");
const router = express.Router();
const controller = require("../../controller/PaymentController");
const clientLayout = require("../../components/ui/ShareLayout");
const {checkAuth} = require("../../middleware/checkAuth");

router.get("/nap-tien",checkAuth, controller.naptien);
router.post("/nap-tien",controller.payment);
router.get("/nap-tien/thanh-cong",controller.paymentSuccess);

module.exports = router;