const express = require('express');
const router = express.Router();
const controller = require('../../controller/OrderController');
const {clientLayout} = require('../../components/ui/ShareLayout');
const { decodedToken } = require('../../service/jwt');
const { checkPayment } = require('../../middleware/checkAuth');

router.get('/', decodedToken, controller.index);
router.post('/order', decodedToken,checkPayment, controller.order);

module.exports = router;
