const express = require("express");
const router = express.Router();
const controller = require("../../controller/AccGameController");
const uploadCloud = require('../../middleware/cloudinary.middleware');
const multer = require('multer');
const fileUpload = multer();
router.get("/xem-chi-tiet/:id",controller.detail);
router.get("/quan-ly",controller.listAccClient);
router.get("/dang-acc",controller.createClient);
router.post("/create", fileUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'list_image', maxCount: 10 },
  ]),

  uploadCloud.cloud,controller.createAcc);
  router.get("/cap-nhat/:id",controller.updateAccGameClient)
  router.patch(
    '/cap-nhat/:id',
    fileUpload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'list_image', maxCount: 10 },
    ]),
    uploadCloud.cloud,
    controller.updateAccGame
  );



module.exports = router;