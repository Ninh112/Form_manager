const express = require("express");
const formsController = require("../controllers/formsController");
const submissionsController = require("../controllers/submissionsController");

const router = express.Router();

router.get("/", formsController.listForms);
router.post("/", formsController.createForm);
router.get("/:id", formsController.getFormById);
router.put("/:id", formsController.updateForm);
router.delete("/:id", formsController.deleteForm);

router.post("/:id/fields", formsController.addField);
router.put("/:id/fields/:fieldId", formsController.updateField);
router.delete("/:id/fields/:fieldId", formsController.deleteField);
router.put("/:id/fields/reorder", formsController.reorderFields);

router.post("/:id/submissions", submissionsController.createSubmission);
router.get("/:id/submissions", submissionsController.listSubmissions);

module.exports = router;
