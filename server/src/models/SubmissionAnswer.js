const { DataTypes } = require("sequelize");

function SubmissionAnswerModel(sequelize) {
  return sequelize.define(
    "SubmissionAnswer",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      submissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "submission_id",
      },
      fieldId: { type: DataTypes.INTEGER, allowNull: false, field: "field_id" },
      value: { type: DataTypes.TEXT, allowNull: false },
    },
    { tableName: "submission_answers", underscored: true }
  );
}

module.exports = SubmissionAnswerModel;
