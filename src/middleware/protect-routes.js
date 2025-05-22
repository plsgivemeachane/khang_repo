const db = require("../models");

// Danh sách quyền
const ProtectRoutes = [
  {
    role: "Admin",
    url: "/**", // được phép mọi thứ
  },
  {
    role: "Seller",
    deny: ["/admin/**"], // không được truy cập path bắt đầu bằng /admin
  },
  {
    role: "User",
    deny: ["/admin/**", "/acc-game/quan-ly", "/acc-game/dang-acc"],
  },
];

const micromatch = require("micromatch"); // npm install micromatch

const CheckProtectRoutes = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const checkUser = await db.User.findOne({ where: { id: userId } });
    if (!checkUser) return res.status(404).json({ message: "User not found" });

    const role = await db.Role.findOne({ where: { id: checkUser.roleId } });
    if (!role) return res.status(403).json({ message: "Invalid role" });

    const roleName = role.name;
    const matchedRule = ProtectRoutes.find((r) => r.role === roleName);

    const currentPath = req.path;

    // Admin có quyền truy cập mọi nơi
    if (roleName === "Admin") {
      return next();
    }

    // Nếu có danh sách deny thì kiểm tra
    if (matchedRule?.deny && micromatch.isMatch(currentPath, matchedRule.deny)) {
      req.flash("error", "You do not have permission");
      return res.redirect("/not-permission");
    }

    // Mặc định cho phép
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
module.exports = CheckProtectRoutes;