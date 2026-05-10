function isHexColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function isISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function validateFieldDefinition(field) {
  const validTypes = ["text", "number", "date", "color", "select"];
  if (!field.label || typeof field.label !== "string") return "Nhãn trường dữ liệu là bắt buộc";
  if (!validTypes.includes(field.type)) return "Loại trường dữ liệu không hợp lệ";
  if (field.type === "select") {
    if (!Array.isArray(field.options) || field.options.length === 0) {
      return "Trường kiểu lựa chọn cần có danh sách lựa chọn";
    }
  }
  return null;
}

function validateAnswerValue(field, value) {
  if ((value === null || value === undefined || value === "") && field.required) {
    return `${field.label} là bắt buộc`;
  }
  if (value === null || value === undefined || value === "") return null;

  switch (field.type) {
    case "text":
      if (String(value).length > 200) return `${field.label} tối đa 200 ký tự`;
      return null;
    case "number":
      if (Number.isNaN(Number(value))) return `${field.label} phải là số`;
      return null;
    case "date":
      if (!isISODate(String(value))) return `${field.label} phải theo định dạng YYYY-MM-DD`;
      if (new Date(value) > new Date()) return `${field.label} không được lớn hơn ngày hiện tại`;
      return null;
    case "color":
      if (!isHexColor(String(value))) return `${field.label} phải là mã màu HEX`;
      return null;
    case "select":
      if (!Array.isArray(field.options) || !field.options.includes(String(value))) {
        return `${field.label} phải nằm trong danh sách lựa chọn`;
      }
      return null;
    default:
      return "Loại trường dữ liệu chưa được hỗ trợ";
  }
}

module.exports = { validateFieldDefinition, validateAnswerValue };
