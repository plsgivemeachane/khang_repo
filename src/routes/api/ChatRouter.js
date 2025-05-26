// routes/api/chat.js
const multer = require('multer');
const path = require('path');
const chatController = require('../../controller/ChatController');
const express = require('express');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/chat/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

router.post('/send-chat', upload.single('image'), chatController.createChat);
router.get('/list/:roomId', chatController.getChats);
// router.post('/mark-read', chatController.markAsRead);

module.exports = router;
