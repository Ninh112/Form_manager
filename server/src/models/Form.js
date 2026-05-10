const { DataTypes } = require("sequelize");

function FormModel(sequelize) {
  return sequelize.define(
    "Form",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM("draft", "active"),
        allowNull: false,
        defaultValue: "draft",
      },
    },
    { tableName: "forms", underscored: true }
  );
}

module.exports = FormModel;
