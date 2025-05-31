// routes/api/chat.js
const express = require('express');
const router = express.Router();
const controller = require('../../controller/NotificationController');

router.post('/create-message', controller.createNotificationMessage);
module.exports = router;
