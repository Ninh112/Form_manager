const sequelize = require("../config/database");
const FormFactory = require("./Form");
const FieldFactory = require("./Field");
const SubmissionFactory = require("./Submission");
const SubmissionAnswerFactory = require("./SubmissionAnswer");
const UserFactory = require("./User");

const Form = FormFactory(sequelize);
const Field = FieldFactory(sequelize);
const Submission = SubmissionFactory(sequelize);
const SubmissionAnswer = SubmissionAnswerFactory(sequelize);
const User = UserFactory(sequelize);

Form.hasMany(Field, { foreignKey: "formId", as: "fields", onDelete: "CASCADE" });
Field.belongsTo(Form, { foreignKey: "formId", as: "form" });

Form.hasMany(Submission, { foreignKey: "formId", as: "submissions", onDelete: "CASCADE" });
Submission.belongsTo(Form, { foreignKey: "formId", as: "form" });
User.hasMany(Submission, { foreignKey: "userId", as: "submissions", onDelete: "CASCADE" });
Submission.belongsTo(User, { foreignKey: "userId", as: "user" });

Submission.hasMany(SubmissionAnswer, {
  foreignKey: "submissionId",
  as: "answers",
  onDelete: "CASCADE",
});
SubmissionAnswer.belongsTo(Submission, { foreignKey: "submissionId", as: "submission" });

Field.hasMany(SubmissionAnswer, { foreignKey: "fieldId", as: "submittedValues" });
SubmissionAnswer.belongsTo(Field, { foreignKey: "fieldId", as: "field" });

module.exports = { sequelize, Form, Field, Submission, SubmissionAnswer, User };
