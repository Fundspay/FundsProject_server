const express = require("express");
const router = express.Router();
const engagementController = require("../controllers/engagement.controller");
const upload = require("../middleware/upload.middleware");

// Timeline
router.get("/timeline/:companyId", engagementController.getTimeline);

// Engagement Score
router.get("/score/:companyId", engagementController.getEngagementScore);
router.post("/score/recalculate", engagementController.recalculateEngagementScore);

// Pending Tasks
router.get("/tasks/:companyId", engagementController.getTasks);
router.post("/tasks/add", engagementController.addTask);
router.put("/tasks/complete/:id", engagementController.completeTask);
router.post("/tasks/complete-all", engagementController.completeAllTasks);
router.delete("/tasks/delete/:id", engagementController.deleteTask);
router.post("/tasks/clear-all", engagementController.clearAllTasks);

// Collaboration Notes
router.get("/notes/:companyId", engagementController.getNotes);
router.post("/notes/upsert", engagementController.upsertNotes);

// Interaction Attachments
router.get("/attachments/:companyId", engagementController.getAttachments);
router.post("/attachments/upload", upload.single("file"), engagementController.uploadAttachment);
router.delete("/attachments/delete/:id", engagementController.deleteAttachment);
router.post("/attachments/clear-all", engagementController.clearAllAttachments);

module.exports = router;