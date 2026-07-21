const express = require("express");
const router = express.Router();
const opportunityController = require("../controllers/opportunity.controller");
const upload = require("../middleware/upload.middleware");

router.get("/new-code", opportunityController.getNewCode);
router.post("/add", opportunityController.add);
router.get("/list", opportunityController.fetchAll);
router.get("/list/:id", opportunityController.fetchSingle);
router.get("/company/:companyId", opportunityController.fetchByCompany);
router.put("/update/:id", opportunityController.updateRecord);
router.put("/won/:id", opportunityController.markAsWon);
router.put("/lost/:id", opportunityController.markAsLost);
router.delete("/delete/:id", opportunityController.deleteRecord);
router.post("/duplicate/:id", opportunityController.duplicateRecord);
router.post("/attachment/upload/:id", upload.single("file"), opportunityController.uploadAttachment);

module.exports = router;