const express = require("express");
const cors = require("cors");
const formsRouter = require("./routes/forms");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const submissionsRouter = require("./routes/submissions");
const { requireAuth } = require("./middlewares/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api", requireAuth);
app.use("/api/forms", formsRouter);
app.use("/api/users", usersRouter);
app.use("/api/submissions", submissionsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Lỗi máy chủ nội bộ" });
});

module.exports = app;
