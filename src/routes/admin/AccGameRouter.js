const express = require("express");
const router = express.Router();
const controller = require("../../controller/AccGameController");
const uploadCloud = require('../../middleware/cloudinary.middleware');
const multer = require('multer');
const fileUpload = multer();
router.get("/",controller.index);
router.get("/cap-nhat/:id",controller.updateAccGameByAdmin)
router.patch(
    '/cap-nhat/:id',
    fileUpload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'list_image', maxCount: 10 },
    ]),
    uploadCloud.cloud,
    controller.updateByAdmin
  );

router.post('/xoa-anh/:id', controller.deleteImage);
router.delete('/xoa/:id', controller.deleteByAdmin);
router.post("/status", controller.updateStatus);



module.exports = router;