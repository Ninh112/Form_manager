const { User } = require("../models");

async function requireAuth(req, res, next) {
  try {
    const userId = Number(req.header("x-user-id"));
    if (!userId) return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    const user = await User.findByPk(userId);
    if (!user) return res.status(401).json({ message: "Tài khoản không tồn tại" });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
