const express = require("express");
const router = express.Router();


// Example Route Imports
// const exampleRouter = require("./example.route");
const companyRouter = require("./company.route");
const industryProfileRouter = require("./industryprofile.route");
const marketInformationRouter = require("./marketinformation.routes");
const businessOpportunityRouter = require("./businessopportunity.routes");
const dashboardRouter = require("./dashboard.routes");
const businessProcessRouter = require("./businessprocess.routes");
const technicalAnalysisRouter = require("./technicalanalysis.routes");
const technicalArchitectureRoutes = require("./technicalarchitecture.routes");
const analysisDashboardRoutes = require("./analysisdashboard.routes");
const salesResourceRoutes = require("./salesresource.routes");
const communicationRoutes = require("./communication.routes");
const demoDocumentRoutes = require("./demodocument.routes");
const preparationDashboardRoutes = require("./preparationdashboard.routes");
const mapDashboardRoutes = require("./mapdashboard.routes");
const companyIntelligenceRoutes = require("./companyintelligence.routes");
const stakeholderRoutes = require("./stakeholder.routes");
const companyResearchRoutes = require("./companyresearch.routes");
const aMasterRoutes = require("./a-master.routes");
const communicationLogRoutes = require("./communicationlog.routes");
const meetingRoutes = require("./meeting.routes");







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
router.use("/dashboard", dashboardRouter);
router.use("/business-process", businessProcessRouter);
router.use("/technical-analysis", technicalAnalysisRouter);
router.use("/technical-architecture", technicalArchitectureRoutes);
router.use("/analysis-dashboard", analysisDashboardRoutes);
router.use("/sales-resource", salesResourceRoutes);
router.use("/communication", communicationRoutes);
router.use("/demo-document", demoDocumentRoutes);
router.use("/preparation-dashboard", preparationDashboardRoutes);
router.use("/map-dashboard", mapDashboardRoutes);
router.use("/company-intelligence", companyIntelligenceRoutes);
router.use("/stakeholders", stakeholderRoutes);
router.use("/company-research", companyResearchRoutes);
router.use("/a-master", aMasterRoutes);
router.use("/communication-log", communicationLogRoutes);
router.use("/meeting", meetingRoutes);






module.exports = router;
