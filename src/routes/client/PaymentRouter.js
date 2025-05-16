const express = require("express");
const router = express.Router();
const controller = require("../../controller/PaymentController");
const clientLayout = require("../../components/ui/ShareLayout");

router.get("/nap-tien",controller.naptien);
router.post("/nap-tien",controller.payment);
router.get("/nap-tien/success",controller.paymentSuccess);

module.exports = router;