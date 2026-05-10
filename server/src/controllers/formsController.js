const { Op } = require("sequelize");
const { Form, Field } = require("../models");
const { validateFieldDefinition } = require("../utils/validators");

async function listForms(req, res, next) {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    const forms = await Form.findAll({
      where,
      include: [{ model: Field, as: "fields" }],
      order: [
        ["order", "ASC"],
        [{ model: Field, as: "fields" }, "order", "ASC"],
      ],
    });
    res.json(forms);
  } catch (error) {
    next(error);
  }
}

async function getFormById(req, res, next) {
  try {
    const form = await Form.findByPk(req.params.id, {
      include: [{ model: Field, as: "fields" }],
      order: [[{ model: Field, as: "fields" }, "order", "ASC"]],
    });
    if (!form) return res.status(404).json({ message: "Không tìm thấy biểu mẫu" });
    res.json(form);
  } catch (error) {
    next(error);
  }
}

async function createForm(req, res, next) {
  try {
    const { title, description, order = 0, status = "draft" } = req.body;
    if (!title) return res.status(400).json({ message: "Tiêu đề là bắt buộc" });
    const form = await Form.create({ title, description, order, status });
    res.status(201).json(form);
  } catch (error) {
    next(error);
  }
}

async function updateForm(req, res, next) {
  try {
    const form = await Form.findByPk(req.params.id);
    if (!form) return res.status(404).json({ message: "Không tìm thấy biểu mẫu" });
    const allowed = ["title", "description", "order", "status"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) form[key] = req.body[key];
    }
    await form.save();
    res.json(form);
  } catch (error) {
    next(error);
  }
}

async function deleteForm(req, res, next) {
  try {
    const deleted = await Form.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy biểu mẫu" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function addField(req, res, next) {
  try {
    const form = await Form.findByPk(req.params.id);
    if (!form) return res.status(404).json({ message: "Không tìm thấy biểu mẫu" });

    const errorMessage = validateFieldDefinition(req.body);
    if (errorMessage) return res.status(400).json({ message: errorMessage });

    const field = await Field.create({
      formId: form.id,
      label: req.body.label,
      type: req.body.type,
      required: Boolean(req.body.required),
      order: req.body.order || 0,
      options: req.body.type === "select" ? req.body.options : null,
    });
    res.status(201).json(field);
  } catch (error) {
    next(error);
  }
}

async function updateField(req, res, next) {
  try {
    const field = await Field.findOne({
      where: { id: req.params.fieldId, formId: req.params.id },
    });
    if (!field) return res.status(404).json({ message: "Không tìm thấy trường dữ liệu" });

    const updated = {
      label: req.body.label ?? field.label,
      type: req.body.type ?? field.type,
      required: req.body.required ?? field.required,
      order: req.body.order ?? field.order,
      options: req.body.options ?? field.options,
    };
    const errorMessage = validateFieldDefinition(updated);
    if (errorMessage) return res.status(400).json({ message: errorMessage });

    Object.assign(field, updated);
    if (field.type !== "select") field.options = null;
    await field.save();
    res.json(field);
  } catch (error) {
    next(error);
  }
}

async function deleteField(req, res, next) {
  try {
    const deleted = await Field.destroy({
      where: { id: req.params.fieldId, formId: req.params.id },
    });
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy trường dữ liệu" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function reorderFields(req, res, next) {
  try {
    const { fieldOrders } = req.body;
    if (!Array.isArray(fieldOrders)) {
      return res.status(400).json({ message: "fieldOrders phải là mảng" });
    }
    for (const item of fieldOrders) {
      await Field.update(
        { order: item.order },
        { where: { id: item.id, formId: req.params.id } }
      );
    }
    const fields = await Field.findAll({
      where: { formId: req.params.id, id: { [Op.in]: fieldOrders.map((f) => f.id) } },
      order: [["order", "ASC"]],
    });
    res.json(fields);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listForms,
  getFormById,
  createForm,
  updateForm,
  deleteForm,
  addField,
  updateField,
  deleteField,
  reorderFields,
};
