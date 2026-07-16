const express = require("express");
const router = express.Router();


// Example Route Imports
// const exampleRouter = require("./example.route");
const companyRouter = require("./company.route");
const industryProfileRouter = require("./industryprofile.route");

// Health Check Route
router.get("/health", (req, res) => {
  res.status(200).send("Healthy Server!");
});


// Add your route imports and `router.use()` registrations below
// router.use("/example", exampleRouter);
router.use("/company", companyRouter);
router.use("/industry-profile", industryProfileRouter);



module.exports = router;
