import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

const formTrangThai = {
  draft: "Nháp",
  active: "Đang hoạt động",
};

function taoFormMoi() {
  return { title: "", description: "", order: 0, status: "draft" };
}

function taoFieldMoi() {
  return { label: "", type: "text", required: "false", order: 0, options: "" };
}

function App() {
  const [nguoiDung, setNguoiDung] = useState(() => {
    const raw = localStorage.getItem("nguoi_dung");
    return raw ? JSON.parse(raw) : null;
  });
  const [dangNhap, setDangNhap] = useState({ username: "", password: "" });
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [thongBao, setThongBao] = useState("");
  const [loi, setLoi] = useState("");

  const [formDraft, setFormDraft] = useState(taoFormMoi());
  const [fieldDraft, setFieldDraft] = useState(taoFieldMoi());
  const [taiKhoanMoi, setTaiKhoanMoi] = useState({ fullName: "", username: "", password: "" });
  const [danhSachNhanVien, setDanhSachNhanVien] = useState([]);
  const [submissionsAdmin, setSubmissionsAdmin] = useState([]);

  const [traLoi, setTraLoi] = useState({});
  const [submissionsNhanVien, setSubmissionsNhanVien] = useState([]);

  const selectedForm = useMemo(
    () => forms.find((form) => form.id === Number(selectedFormId)) || null,
    [forms, selectedFormId]
  );

  function authHeaders() {
    if (!nguoiDung) return {};
    return { "x-user-id": String(nguoiDung.id) };
  }

  async function goiApi(method, url, payload, params) {
    return api.request({
      method,
      url,
      data: payload,
      params,
      headers: authHeaders(),
    });
  }

  async function taiDanhSachForm() {
    const { data } = await goiApi("get", "/forms");
    setForms(data);
    if (!data.find((item) => item.id === Number(selectedFormId))) {
      setSelectedFormId(data[0]?.id ?? null);
    }
  }

  async function taiDanhSachNhanVien() {
    if (nguoiDung?.role !== "admin") return;
    const { data } = await goiApi("get", "/users");
    setDanhSachNhanVien(data);
  }

  async function taiSubmissionsAdmin() {
    if (nguoiDung?.role !== "admin") return;
    const { data } = await goiApi("get", "/submissions", null, {
      formId: selectedFormId || undefined,
    });
    setSubmissionsAdmin(data);
  }

  async function taiSubmissionsNhanVien() {
    if (nguoiDung?.role !== "employee" || !selectedFormId) return;
    const { data } = await goiApi("get", `/forms/${selectedFormId}/submissions`);
    setSubmissionsNhanVien(data);
  }

  async function xuLyDangNhap(e) {
    e.preventDefault();
    setLoi("");
    try {
      const { data } = await api.post("/auth/login", dangNhap);
      localStorage.setItem("nguoi_dung", JSON.stringify(data));
      setNguoiDung(data);
      setThongBao(`Xin chào, ${data.fullName}`);
    } catch (error) {
      setLoi(error.response?.data?.message || "Đăng nhập thất bại");
    }
  }

  function dangXuat() {
    localStorage.removeItem("nguoi_dung");
    setNguoiDung(null);
    setForms([]);
    setSelectedFormId(null);
    setThongBao("");
    setLoi("");
  }

  async function taoForm() {
    await goiApi("post", "/forms", { ...formDraft, order: Number(formDraft.order) });
    setThongBao("Tạo biểu mẫu thành công");
    setFormDraft(taoFormMoi());
    await taiDanhSachForm();
  }

  async function xoaForm(id) {
    if (!window.confirm("Bạn có chắc muốn xóa biểu mẫu này?")) return;
    await goiApi("delete", `/forms/${id}`);
    setThongBao("Đã xóa biểu mẫu");
    await taiDanhSachForm();
    setTraLoi({});
    setSubmissionsNhanVien([]);
    setSubmissionsAdmin([]);
  }

  async function themField() {
    if (!selectedFormId) return;
    await goiApi("post", `/forms/${selectedFormId}/fields`, {
      label: fieldDraft.label,
      type: fieldDraft.type,
      required: fieldDraft.required === "true",
      order: Number(fieldDraft.order),
      options:
        fieldDraft.type === "select"
          ? fieldDraft.options
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
    });
    setThongBao("Đã thêm trường dữ liệu");
    setFieldDraft(taoFieldMoi());
    await taiDanhSachForm();
  }

  async function xoaField(fieldId) {
    await goiApi("delete", `/forms/${selectedFormId}/fields/${fieldId}`);
    setThongBao("Đã xóa trường dữ liệu");
    await taiDanhSachForm();
  }

  async function taoTaiKhoanNhanVien() {
    await goiApi("post", "/users", taiKhoanMoi);
    setThongBao("Đã tạo tài khoản nhân viên");
    setTaiKhoanMoi({ fullName: "", username: "", password: "" });
    await taiDanhSachNhanVien();
  }

  async function xoaTaiKhoanNhanVien(id) {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản nhân viên này?")) return;
    await goiApi("delete", `/users/${id}`);
    setThongBao("Đã xóa tài khoản nhân viên");
    await taiDanhSachNhanVien();
  }

  async function nopBieuMau() {
    if (!selectedFormId) return;
    await goiApi("post", `/forms/${selectedFormId}/submissions`, { answers: traLoi });
    setThongBao("Nộp biểu mẫu thành công");
    setTraLoi({});
    await taiSubmissionsNhanVien();
  }

  useEffect(() => {
    if (!nguoiDung) return;
    taiDanhSachForm().catch(() => setLoi("Không tải được danh sách biểu mẫu"));
  }, [nguoiDung]);

  useEffect(() => {
    if (!nguoiDung) return;
    if (nguoiDung.role === "admin") {
      taiDanhSachNhanVien().catch(() => setLoi("Không tải được danh sách nhân viên"));
      taiSubmissionsAdmin().catch(() => setLoi("Không tải được danh sách đơn nộp"));
    } else {
      taiSubmissionsNhanVien().catch(() => setLoi("Không tải được lịch sử nộp"));
    }
  }, [nguoiDung, selectedFormId]);

  if (!nguoiDung) {
    return (
      <div className="container login-wrapper">
        <form className="card login-card" onSubmit={xuLyDangNhap}>
          <h1>Hệ thống biểu mẫu động</h1>
          <p>Đăng nhập để vào đúng trang theo vai trò tài khoản.</p>
          <input
            placeholder="Tên đăng nhập"
            value={dangNhap.username}
            onChange={(e) => setDangNhap((prev) => ({ ...prev, username: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={dangNhap.password}
            onChange={(e) => setDangNhap((prev) => ({ ...prev, password: e.target.value }))}
          />
          <button type="submit" className="btn btn-primary">
            Đăng nhập
          </button>
          {loi && <p className="error">{loi}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="top-bar">
        <div>
          <h1>{nguoiDung.role === "admin" ? "Trang quản trị" : "Trang nhân viên"}</h1>
          <p>
            Đăng nhập: <b>{nguoiDung.fullName}</b> ({nguoiDung.username})
          </p>
        </div>
        <button className="btn" onClick={dangXuat}>
          Đăng xuất
        </button>
      </header>

      {thongBao && <p className="message">{thongBao}</p>}
      {loi && <p className="error">{loi}</p>}

      <div className="layout">
        <aside className="left">
          <h3>Danh sách biểu mẫu</h3>
          <ul>
            {forms.map((form) => (
              <li key={form.id}>
                <button
                  className={Number(selectedFormId) === form.id ? "btn active" : "btn"}
                  onClick={() => setSelectedFormId(form.id)}
                >
                  #{form.id} - {form.title}
                  <span className="status-chip">{formTrangThai[form.status] || form.status}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="right">
          <section className="card">
            <h3>Biểu mẫu đang chọn</h3>
            {selectedForm ? (
              <div className="selected-form">
                <b>
                  #{selectedForm.id} - {selectedForm.title}
                </b>
                <p>{selectedForm.description || "Chưa có mô tả"}</p>
                <button className="btn btn-danger" onClick={() => xoaForm(selectedForm.id)}>
                  Xóa biểu mẫu
                </button>
              </div>
            ) : (
              <p>Chưa có biểu mẫu để hiển thị.</p>
            )}
          </section>

          {nguoiDung.role === "admin" ? (
            <>
              <section className="card">
                <h3>Tạo biểu mẫu</h3>
                <div className="form-grid">
                  <input
                    placeholder="Tiêu đề"
                    value={formDraft.title}
                    onChange={(e) => setFormDraft((prev) => ({ ...prev, title: e.target.value }))}
                  />
                  <textarea
                    placeholder="Mô tả"
                    value={formDraft.description}
                    onChange={(e) =>
                      setFormDraft((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                  <input
                    type="number"
                    placeholder="Thứ tự hiển thị"
                    value={formDraft.order}
                    onChange={(e) => setFormDraft((prev) => ({ ...prev, order: e.target.value }))}
                  />
                  <select
                    value={formDraft.status}
                    onChange={(e) => setFormDraft((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="draft">Nháp</option>
                    <option value="active">Đang hoạt động</option>
                  </select>
                  <button className="btn btn-primary" onClick={taoForm}>
                    Tạo biểu mẫu
                  </button>
                </div>
              </section>

              <section className="card">
                <h3>Thêm trường dữ liệu</h3>
                {!selectedForm ? (
                  <p>Vui lòng chọn biểu mẫu trước khi thêm trường dữ liệu.</p>
                ) : (
                  <div className="form-grid">
                    <input
                      placeholder="Nhãn trường dữ liệu"
                      value={fieldDraft.label}
                      onChange={(e) => setFieldDraft((prev) => ({ ...prev, label: e.target.value }))}
                    />
                    <select
                      value={fieldDraft.type}
                      onChange={(e) => setFieldDraft((prev) => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="text">Văn bản</option>
                      <option value="number">Số</option>
                      <option value="date">Ngày</option>
                      <option value="color">Màu sắc</option>
                      <option value="select">Danh sách lựa chọn</option>
                    </select>
                    <select
                      value={fieldDraft.required}
                      onChange={(e) =>
                        setFieldDraft((prev) => ({ ...prev, required: e.target.value }))
                      }
                    >
                      <option value="false">Không bắt buộc</option>
                      <option value="true">Bắt buộc</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Thứ tự hiển thị"
                      value={fieldDraft.order}
                      onChange={(e) => setFieldDraft((prev) => ({ ...prev, order: e.target.value }))}
                    />
                    {fieldDraft.type === "select" && (
                      <input
                        placeholder="Nhập lựa chọn, cách nhau dấu phẩy"
                        value={fieldDraft.options}
                        onChange={(e) =>
                          setFieldDraft((prev) => ({ ...prev, options: e.target.value }))
                        }
                      />
                    )}
                    <button className="btn btn-primary" onClick={themField}>
                      Thêm trường dữ liệu
                    </button>
                  </div>
                )}
              </section>

              <section className="card">
                <h3>Danh sách trường dữ liệu</h3>
                {selectedForm?.fields?.length ? (
                  <ul className="list">
                    {selectedForm.fields.map((field) => (
                      <li key={field.id} className="list-item">
                        <div>
                          <b>{field.label}</b> - {field.type} - Thứ tự: {field.order}
                        </div>
                        <button className="btn btn-danger" onClick={() => xoaField(field.id)}>
                          Xóa
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Biểu mẫu này chưa có trường dữ liệu.</p>
                )}
              </section>

              <section className="card">
                <h3>Quản lý tài khoản nhân viên</h3>
                <div className="form-grid">
                  <input
                    placeholder="Họ và tên"
                    value={taiKhoanMoi.fullName}
                    onChange={(e) =>
                      setTaiKhoanMoi((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                  />
                  <input
                    placeholder="Tên đăng nhập"
                    value={taiKhoanMoi.username}
                    onChange={(e) =>
                      setTaiKhoanMoi((prev) => ({ ...prev, username: e.target.value }))
                    }
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={taiKhoanMoi.password}
                    onChange={(e) =>
                      setTaiKhoanMoi((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                  <button className="btn btn-primary" onClick={taoTaiKhoanNhanVien}>
                    Tạo tài khoản nhân viên
                  </button>
                </div>
                <ul className="list">
                  {danhSachNhanVien.map((user) => (
                    <li key={user.id} className="list-item">
                      <div>
                        <b>{user.fullName}</b> ({user.username})
                      </div>
                      <button className="btn btn-danger" onClick={() => xoaTaiKhoanNhanVien(user.id)}>
                        Xóa
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="card">
                <h3>Danh sách đơn nộp của nhân viên</h3>
                <ul className="list">
                  {submissionsAdmin.map((submission) => (
                    <li key={submission.id} className="list-block">
                      <b>
                        #{submission.id} - {submission.user?.fullName} -{" "}
                        {new Date(submission.createdAt).toLocaleString("vi-VN")}
                      </b>
                      <p>Biểu mẫu: {submission.form?.title}</p>
                      {submission.answers.map((answer) => (
                        <p key={`${submission.id}-${answer.fieldId}`}>
                          {answer.fieldLabel}: {answer.value}
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <>
              <section className="card">
                <h3>Điền biểu mẫu</h3>
                {!selectedForm ? (
                  <p>Vui lòng chọn biểu mẫu để điền.</p>
                ) : (
                  <>
                    {[...(selectedForm.fields || [])]
                      .sort((a, b) => a.order - b.order)
                      .map((field) => (
                        <div key={field.id} className="field-row">
                          <label>{field.label}</label>
                          {field.type === "select" ? (
                            <select
                              value={traLoi[field.id] || ""}
                              onChange={(e) =>
                                setTraLoi((prev) => ({ ...prev, [field.id]: e.target.value }))
                              }
                            >
                              <option value="">-- Chọn giá trị --</option>
                              {(field.options || []).map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={
                                field.type === "number"
                                  ? "number"
                                  : field.type === "date"
                                    ? "date"
                                    : field.type === "color"
                                      ? "color"
                                      : "text"
                              }
                              value={traLoi[field.id] || ""}
                              onChange={(e) =>
                                setTraLoi((prev) => ({ ...prev, [field.id]: e.target.value }))
                              }
                            />
                          )}
                        </div>
                      ))}
                    <button className="btn btn-primary" onClick={nopBieuMau}>
                      Nộp biểu mẫu
                    </button>
                  </>
                )}
              </section>

              <section className="card">
                <h3>Đơn nộp của tôi</h3>
                <ul className="list">
                  {submissionsNhanVien.map((submission) => (
                    <li key={submission.id} className="list-block">
                      <b>
                        #{submission.id} -{" "}
                        {new Date(submission.createdAt).toLocaleString("vi-VN")}
                      </b>
                      {submission.answers.map((answer) => (
                        <p key={`${submission.id}-${answer.fieldId}`}>
                          {answer.fieldLabel}: {answer.value}
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
