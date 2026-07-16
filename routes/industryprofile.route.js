const express = require("express");
const router = express.Router();
const ipController = require("../controllers/industryprofile.controller");

router.post("/add", ipController.add);
router.get("/list", ipController.fetchAll);
router.get("/list/:id", ipController.fetchSingle);
router.get("/company/:companyId", ipController.fetchByCompany);
router.put("/update/:id", ipController.updateRecord);
router.delete("/delete/:id", ipController.deleteRecord);

module.exports = router;