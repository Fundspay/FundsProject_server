const express = require("express");
const router = express.Router();
const boController = require("../controllers/businessopportunity.controller");

router.post("/add", boController.add);
router.get("/list", boController.fetchAll);
router.get("/list/:id", boController.fetchSingle);
router.get("/company/:companyId", boController.fetchByCompany);
router.put("/update/:id", boController.updateRecord);
router.delete("/delete/:id", boController.deleteRecord);

router.post("/painpoint/add", boController.addPainPoint);
router.put("/painpoint/update/:id", boController.updatePainPoint);
router.delete("/painpoint/delete/:id", boController.deletePainPoint);

module.exports = router;