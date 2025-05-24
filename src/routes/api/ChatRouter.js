const express = require("express");
const router = express.Router();
const chatController=require("../../controller/ChatController")

router.post("/send-chat", chatController.createChat);
router.get('/list/:roomId', chatController.getChats);

module.exports = router;
