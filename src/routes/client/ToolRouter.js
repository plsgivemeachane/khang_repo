const express = require('express');
const router = express.Router();
const controller = require('../../controller/ToolController');
const {clientLayout} = require('../../components/ui/ShareLayout');
const { decodedToken } = require('../../service/jwt');
const { checkPayment } = require('../../middleware/checkAuth');

router.get('/', clientLayout, controller.index);
router.get('/:slug', clientLayout, controller.detail);



module.exports = router;
