const { User } = require("../models");
const { hashPassword } = require("../utils/password");

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu" });
    }

    const user = await User.findOne({ where: { username } });
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { login };
