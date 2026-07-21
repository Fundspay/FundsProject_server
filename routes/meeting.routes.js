const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meeting.controller");
const upload = require("../middleware/upload.middleware");

router.post("/add", meetingController.add);
router.get("/list", meetingController.fetchAll);
router.get("/list/:id", meetingController.fetchSingle);
router.get("/company/:companyId", meetingController.fetchByCompany);
router.put("/update/:id", meetingController.updateRecord);
router.delete("/delete/:id", meetingController.deleteRecord);
router.post("/duplicate/:id", meetingController.duplicateRecord);
router.post("/document/upload/:id", upload.single("file"), meetingController.uploadDocument);

module.exports = router;