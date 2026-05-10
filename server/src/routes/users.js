const express = require("express");
const usersController = require("../controllers/usersController");
const { requireRole } = require("../middlewares/auth");

const router = express.Router();

router.get("/", requireRole("admin"), usersController.listEmployees);
router.post("/", requireRole("admin"), usersController.createEmployee);
router.delete("/:id", requireRole("admin"), usersController.deleteEmployee);

module.exports = router;
