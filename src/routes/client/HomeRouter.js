const express = require('express');
const router = express.Router();
const controller = require('../../controller/HomeController');
const {clientLayout} = require('../../components/ui/ShareLayout');
const { decodedToken } = require('../../service/jwt');

router.get('/', decodedToken, clientLayout, controller.index);
router.get('/xem-tat-ca', decodedToken, clientLayout, controller.viewAll);
router.get('/dang-ky-ban-acc', decodedToken, clientLayout, controller.registerSeller);
router.post('/dang-ky-ban-acc', decodedToken, controller.requestSeller);
router.get("/not-permission",controller.notPermission)

module.exports = router;
