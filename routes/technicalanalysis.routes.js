const express = require("express");
const router = express.Router();
const taController = require("../controllers/technicalanalysis.controller");
const upload = require("../middleware/upload.middleware");

router.post("/add", taController.add);
router.get("/list", taController.fetchAll);
router.get("/list/:id", taController.fetchSingle);
router.get("/company/:companyId", taController.fetchByCompany);
router.put("/update/:id", taController.updateRecord);
router.delete("/delete/:id", taController.deleteRecord);

router.post("/problem/add", taController.addProblem);
router.put("/problem/update/:id", taController.updateProblem);
router.delete("/problem/delete/:id", taController.deleteProblem);

router.post("/funcreq/add", taController.addFuncReq);
router.put("/funcreq/update/:id", taController.updateFuncReq);
router.delete("/funcreq/delete/:id", taController.deleteFuncReq);

router.post("/nonfuncreq/add", taController.addNonFuncReq);
router.put("/nonfuncreq/update/:id", taController.updateNonFuncReq);
router.delete("/nonfuncreq/delete/:id", taController.deleteNonFuncReq);

router.post("/report/add", taController.addReport);
router.put("/report/update/:id", taController.updateReport);
router.delete("/report/delete/:id", taController.deleteReport);

router.post("/attachment/upload", upload.single("file"), taController.uploadAttachment);
router.delete("/attachment/delete/:id", taController.deleteAttachment);

module.exports = router;