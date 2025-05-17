const express = require('express');
const router = express.Router();
const controller = require('../../controller/ToolController');
const uploadCloud = require('../../middleware/cloudinary.middleware');
const multer = require('multer');
const fileUpload = multer();

router.get('/', controller.create);
router.post(
  '/create',
  fileUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'list_image', maxCount: 10 },
  ]),

  uploadCloud.cloud,
  controller.createTool
);

module.exports = router;
