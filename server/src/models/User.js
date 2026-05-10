const { DataTypes } = require("sequelize");

function UserModel(sequelize) {
  return sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      username: { type: DataTypes.STRING(60), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: "password_hash" },
      fullName: { type: DataTypes.STRING(120), allowNull: false, field: "full_name" },
      role: {
        type: DataTypes.ENUM("admin", "employee"),
        allowNull: false,
        defaultValue: "employee",
      },
    },
    { tableName: "users", underscored: true }
  );
}

module.exports = UserModel;
