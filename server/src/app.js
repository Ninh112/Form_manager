const express = require("express");
const cors = require("cors");
const formsRouter = require("./routes/forms");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/forms", formsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

module.exports = app;
