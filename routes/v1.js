const express = require("express");
const router = express.Router();


// Example Route Imports
// const exampleRouter = require("./example.route");
const companyRouter = require("./company.route");
const industryProfileRouter = require("./industryprofile.route");
const marketInformationRouter = require("./marketinformation.routes");
const businessOpportunityRouter = require("./businessopportunity.routes");

// Health Check Route
router.get("/health", (req, res) => {
  res.status(200).send("Healthy Server!");
});


// Add your route imports and `router.use()` registrations below
// router.use("/example", exampleRouter);
router.use("/company", companyRouter);
router.use("/industry-profile", industryProfileRouter);
router.use("/market-information", marketInformationRouter);
router.use("/business-opportunity", businessOpportunityRouter);



module.exports = router;
