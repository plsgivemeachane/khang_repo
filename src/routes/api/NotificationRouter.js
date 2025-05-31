// routes/api/chat.js
const express = require('express');
const router = express.Router();
const controller = require('../../controller/NotificationController');

router.post('/create-message', controller.createNotificationMessage);
router.get('/get-notifications', controller.getNotifications);
router.post('/mark-read/:id', controller.markNotificationRead);
module.exports = router;
