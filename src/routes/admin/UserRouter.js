const express = require('express');
const router = express.Router();
const controller = require('../../controller/UserController');
const uploadCloud = require('../../middleware/cloudinary.middleware');
const multer = require('multer');
const fileUpload = multer();
router.get('/', controller.listUser);
router.get('/cap-nhat/:id', controller.viewUpdate);
router.patch(
  '/cap-nhat/:id',
  fileUpload.fields([
    { name: 'avatar', maxCount: 1 },
    
  ]),
  uploadCloud.cloud,
  controller.updateUser
);
router.delete('/xoa/:id', controller.deleteUser);
// router.get("/cap-nhat-quyen/:id",controller.updateQuyen);

module.exports = router;
