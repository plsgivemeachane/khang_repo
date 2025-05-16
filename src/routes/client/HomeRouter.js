const express = require('express');
const router = express.Router();
const controller = require('../../controller/HomeController');
const clientLayout = require('../../components/ui/ShareLayout');
const { decodedToken } = require('../../service/jwt');

router.get('/', decodedToken, clientLayout, controller.index);

module.exports = router;
