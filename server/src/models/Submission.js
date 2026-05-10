const { DataTypes } = require("sequelize");

function SubmissionModel(sequelize) {
  return sequelize.define(
    "Submission",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      formId: { type: DataTypes.INTEGER, allowNull: false, field: "form_id" },
      userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
    },
    { tableName: "submissions", underscored: true }
  );
}

module.exports = SubmissionModel;
