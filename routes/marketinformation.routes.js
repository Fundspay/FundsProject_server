const express = require("express");
const router = express.Router();
const miController = require("../controllers/marketinformation.controller");


router.get("/company/:companyId", miController.fetchByCompany);
router.post("/add", miController.add);
router.get("/list", miController.fetchAll);
router.get("/list/:id", miController.fetchSingle);

router.put("/update/:id", miController.updateRecord);
router.delete("/delete/:id", miController.deleteRecord);

router.post("/competitor/add", miController.addCompetitor);
router.put("/competitor/update/:id", miController.updateCompetitor);
router.delete("/competitor/delete/:id", miController.deleteCompetitor);

router.post("/player/add", miController.addPlayer);
router.put("/player/update/:id", miController.updatePlayer);
router.delete("/player/delete/:id", miController.deletePlayer);

router.post("/reference/add", miController.addReference);
router.put("/reference/update/:id", miController.updateReference);
router.delete("/reference/delete/:id", miController.deleteReference);

module.exports = router;