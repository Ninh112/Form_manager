const { Submission, SubmissionAnswer, Field, Form, User } = require("../models");

async function listAllSubmissions(req, res, next) {
  try {
    const where = {};
    if (req.query.formId) where.formId = req.query.formId;
    if (req.query.userId) where.userId = req.query.userId;

    const submissions = await Submission.findAll({
      where,
      include: [
        { model: SubmissionAnswer, as: "answers", include: [{ model: Field, as: "field" }] },
        { model: Form, as: "form", attributes: ["id", "title"] },
        { model: User, as: "user", attributes: ["id", "username", "fullName"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(
      submissions.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        form: item.form,
        user: item.user,
        answers: item.answers.map((answer) => ({
          fieldId: answer.fieldId,
          fieldLabel: answer.field?.label,
          value: answer.value,
        })),
      }))
    );
  } catch (error) {
    next(error);
  }
}

module.exports = { listAllSubmissions };
