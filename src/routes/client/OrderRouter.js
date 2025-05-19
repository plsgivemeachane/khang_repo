const express = require('express');
const router = express.Router();
const controller = require('../../controller/OrderController');
const {clientLayout} = require('../../components/ui/ShareLayout');
const { decodedToken } = require('../../service/jwt');
const { checkPayment } = require('../../middleware/checkAuth');

router.get('/xem/:id', decodedToken, controller.index);
router.post('/mua', decodedToken,checkPayment, controller.order);
router.get("/lich-su-mua", decodedToken, controller.lichsumua);
// router.post("/mua", controller.test)

module.exports = router;
