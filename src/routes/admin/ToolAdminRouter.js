const express = require('express');
const router = express.Router();
const controller = require('../../controller/ToolController');
const uploadCloud = require('../../middleware/cloudinary.middleware');
const multer = require('multer');
const fileUpload = multer();

router.get('/', controller.listTool);
router.get('/tao-moi', controller.create);
router.post(
  '/create',
  fileUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'list_image', maxCount: 10 },
  ]),

  uploadCloud.cloud,
  controller.createTool
);
router.get("/cap-nhat/:id",controller.update)
router.patch(
  '/cap-nhat/:id',
  fileUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'list_image', maxCount: 10 },
  ]),
  uploadCloud.cloud,
  controller.updateTool
);
router.post('/xoa-anh/:id', controller.deleteImage);
router.delete('/xoa/:id', controller.deleteTool);

module.exports = router;
