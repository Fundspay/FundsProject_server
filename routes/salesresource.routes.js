const express = require("express");
const router = express.Router();
const srController = require("../controllers/salesresource.controller");
const upload = require("../middleware/upload.middleware");

router.get("/company/:companyId", srController.getByCompany);
router.post("/url/add", srController.addUrl);
router.post("/file/upload", upload.single("file"), srController.uploadFile);
router.delete("/delete/:id", srController.deleteItem);

module.exports = router;