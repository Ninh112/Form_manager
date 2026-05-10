const { User } = require("../models");
const { hashPassword } = require("../utils/password");

async function listEmployees(req, res, next) {
  try {
    const users = await User.findAll({
      where: { role: "employee" },
      attributes: ["id", "username", "fullName", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function createEmployee(req, res, next) {
  try {
    const { username, password, fullName } = req.body;
    if (!username || !password || !fullName) {
      return res.status(400).json({ message: "Thiếu thông tin tài khoản nhân viên" });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    }

    const user = await User.create({
      email: `${username}@local.com`,
      username,
      fullName,
      role: "employee",
      passwordHash: hashPassword(password),
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteEmployee(req, res, next) {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id, role: "employee" } });
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listEmployees, createEmployee, deleteEmployee };
