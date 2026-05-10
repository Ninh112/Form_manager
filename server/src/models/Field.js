const { DataTypes } = require("sequelize");

function FieldModel(sequelize) {
  return sequelize.define(
    "Field",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      formId: { type: DataTypes.INTEGER, allowNull: false, field: "form_id" },
      label: { type: DataTypes.STRING(150), allowNull: false },
      type: {
        type: DataTypes.ENUM("text", "number", "date", "color", "select"),
        allowNull: false,
      },
      required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      options: { type: DataTypes.JSON, allowNull: true },
    },
    { tableName: "fields", underscored: true }
  );
}

module.exports = FieldModel;
