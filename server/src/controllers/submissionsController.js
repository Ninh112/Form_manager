const { Form, Field, Submission, SubmissionAnswer, User, sequelize } = require("../models");
const { validateAnswerValue } = require("../utils/validators");

async function createSubmission(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const form = await Form.findByPk(req.params.id, {
      include: [{ model: Field, as: "fields" }],
      transaction,
      lock: true,
    });
    if (!form || form.status !== "active") {
      await transaction.rollback();
      return res.status(404).json({ message: "Không tìm thấy biểu mẫu đang hoạt động" });
    }

    const answers = req.body.answers || {};
    const validationErrors = [];
    for (const field of form.fields) {
      const value = answers[String(field.id)];
      const err = validateAnswerValue(field, value);
      if (err) validationErrors.push(err);
    }
    if (validationErrors.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: validationErrors });
    }

    const submission = await Submission.create(
      { formId: form.id, userId: req.user.id },
      { transaction }
    );
    for (const field of form.fields) {
      const value = answers[String(field.id)];
      if (value !== undefined && value !== null && value !== "") {
        await SubmissionAnswer.create(
          { submissionId: submission.id, fieldId: field.id, value: String(value) },
          { transaction }
        );
      }
    }
    await transaction.commit();
    res.status(201).json({ id: submission.id, message: "Nộp biểu mẫu thành công" });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

async function listSubmissions(req, res, next) {
  try {
    const where = { formId: req.params.id };
    if (req.user.role === "employee") where.userId = req.user.id;

    const submissions = await Submission.findAll({
      where,
      include: [
        { model: SubmissionAnswer, as: "answers", include: [{ model: Field, as: "field" }] },
        { model: User, as: "user", attributes: ["id", "username", "fullName"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    const normalized = submissions.map((submission) => ({
      id: submission.id,
      createdAt: submission.createdAt,
      user: submission.user,
      answers: submission.answers.map((a) => ({
        fieldId: a.fieldId,
        fieldLabel: a.field?.label,
        value: a.value,
      })),
    }));
    res.json(normalized);
  } catch (error) {
    next(error);
  }
}

module.exports = { createSubmission, listSubmissions };
