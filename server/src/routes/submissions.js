const express = require("express");
const { requireRole } = require("../middlewares/auth");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.get("/", requireRole("admin"), adminController.listAllSubmissions);

module.exports = router;
