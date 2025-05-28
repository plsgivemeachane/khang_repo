// routes/api/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../../controller/ChatController');
const multer = require('multer');
const path = require('path');

// Đảm bảo thư mục tồn tại
const uploadDir = path.join(__dirname, '../../public/uploads/chat');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // ✅ sử dụng đường dẫn vật lý tuyệt đối
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });
// Các route chat
router.post('/send-chat', upload.single('image'), chatController.createChat);
router.get('/list/:roomId', chatController.getChats);
router.post('/mark-read', chatController.markAsRead); // 👈 Bỏ comment nếu bạn dùng markRead
router.delete('/delete/:chatId', chatController.deleteChat)
module.exports = router;
