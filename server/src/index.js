require("dotenv").config();
const { DataTypes } = require("sequelize");
const app = require("./app");
const { sequelize, User } = require("./models");
const { hashPassword } = require("./utils/password");

const PORT = Number(process.env.PORT || 4000);

async function bootstrap() {
  await sequelize.authenticate();
  await sequelize.sync();
  const queryInterface = sequelize.getQueryInterface();

  const usersSchema = await queryInterface.describeTable("users");
  if (!usersSchema.username) {
    await queryInterface.addColumn("users", "username", {
      type: DataTypes.STRING(60),
      allowNull: true,
    });
  }
  if (!usersSchema.email) {
    await queryInterface.addColumn("users", "email", {
      type: DataTypes.STRING(120),
      allowNull: true,
    });
  }
  if (!usersSchema.password_hash) {
    await queryInterface.addColumn("users", "password_hash", {
      type: DataTypes.STRING(255),
      allowNull: true,
    });
  }
  if (!usersSchema.full_name) {
    await queryInterface.addColumn("users", "full_name", {
      type: DataTypes.STRING(120),
      allowNull: true,
    });
  }
  if (!usersSchema.role) {
    await queryInterface.addColumn("users", "role", {
      type: DataTypes.ENUM("admin", "employee"),
      allowNull: false,
      defaultValue: "employee",
    });
  }

  await sequelize.query(
    "UPDATE users SET username = CONCAT('user_', id) WHERE username IS NULL OR username = ''"
  );
  await sequelize.query(
    "UPDATE users SET full_name = 'Nhân viên' WHERE full_name IS NULL OR full_name = ''"
  );
  await sequelize.query(
    "UPDATE users SET email = CONCAT(username, '@local.com') WHERE email IS NULL OR email = ''"
  );
  await sequelize.query(
    "UPDATE users SET password_hash = :fallbackHash WHERE password_hash IS NULL OR password_hash = ''",
    { replacements: { fallbackHash: hashPassword("123456") } }
  );

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminFullName = process.env.ADMIN_FULL_NAME || "Quản trị viên";

  let existingAdmin = await User.findOne({ where: { role: "admin" }, order: [["id", "ASC"]] });
  if (!existingAdmin) {
    await User.create({
      email: `${adminUsername}@local.com`,
      username: adminUsername,
      fullName: adminFullName,
      role: "admin",
      passwordHash: hashPassword(adminPassword),
    });
  } else {
    const sameUsername = await User.findOne({ where: { username: adminUsername } });
    if (!sameUsername || sameUsername.id === existingAdmin.id) {
      existingAdmin.username = adminUsername;
    }
    existingAdmin.fullName = adminFullName;
    existingAdmin.passwordHash = hashPassword(adminPassword);
    if (!existingAdmin.email) existingAdmin.email = `${adminUsername}@local.com`;
    await existingAdmin.save();
  }

  const admin = await User.findOne({ where: { role: "admin" }, order: [["id", "ASC"]] });
  const submissionsSchema = await queryInterface.describeTable("submissions");
  if (!submissionsSchema.user_id) {
    await queryInterface.addColumn("submissions", "user_id", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await sequelize.query("UPDATE submissions SET user_id = :adminId WHERE user_id IS NULL", {
      replacements: { adminId: admin.id },
    });
    await queryInterface.changeColumn("submissions", "user_id", {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Cannot start server:", error.message);
  process.exit(1);
});
