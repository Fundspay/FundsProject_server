const express = require("express");
const router = express.Router();
const proposalController = require("../controllers/proposal.controller");
const upload = require("../middleware/upload.middleware");

router.get("/new-number", proposalController.getNewNumber);
router.get("/opportunity/:opportunityId", proposalController.getByOpportunity);
router.get("/company/:companyId", proposalController.fetchByCompany);
router.post("/save", proposalController.saveProposal);
router.put("/won/:id", proposalController.markAsWon);
router.put("/lost/:id", proposalController.markAsLost);
router.post("/handover/:id", proposalController.handoverToBuild);
router.delete("/delete/:id", proposalController.deleteProposal);

// Attachments — category is one of: proposal, quotation, contract, nda, po
router.post("/attachment/upload/:id/:category", upload.single("file"), proposalController.uploadAttachment);
router.post("/attachment/remove/:id/:category", proposalController.removeAttachment);

module.exports = router;