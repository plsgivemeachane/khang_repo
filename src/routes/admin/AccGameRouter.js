const express = require("express");
const router = express.Router();
const controller = require("../../controller/AccGameController");
router.get("/",controller.index);
router.get("/cap-nhat/:id",controller.updateAccGameByAdmin)


module.exports = router;