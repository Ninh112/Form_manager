const express = require("express");
const formsController = require("../controllers/formsController");
const submissionsController = require("../controllers/submissionsController");
const { requireRole } = require("../middlewares/auth");

const router = express.Router();

router.get("/", formsController.listForms);
router.post("/", requireRole("admin"), formsController.createForm);
router.get("/:id", formsController.getFormById);
router.put("/:id", requireRole("admin"), formsController.updateForm);
router.delete("/:id", formsController.deleteForm);

router.post("/:id/fields", requireRole("admin"), formsController.addField);
router.put("/:id/fields/reorder", requireRole("admin"), formsController.reorderFields);
router.put("/:id/fields/:fieldId", requireRole("admin"), formsController.updateField);
router.delete("/:id/fields/:fieldId", requireRole("admin"), formsController.deleteField);

router.post("/:id/submissions", submissionsController.createSubmission);
router.get("/:id/submissions", submissionsController.listSubmissions);

module.exports = router;
