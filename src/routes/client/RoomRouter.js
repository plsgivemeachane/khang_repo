const express = require('express');
const router = express.Router();
const controller = require('../../controller/RoomController');

const { decodedToken } = require('../../service/jwt');

router.get('/', decodedToken, controller.index);
router.post('/tao-phong', decodedToken, controller.createRoom);
router.post('/vao-phong', decodedToken, controller.joinRoom);
router.get('/chat/:roomId', decodedToken, controller.renderChatPage);
// router.post("/mua", controller.test)

module.exports = router;
