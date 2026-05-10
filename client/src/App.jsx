import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

function emptyFormDraft() {
  return { title: "", description: "", order: 0, status: "draft" };
}

function emptyFieldDraft() {
  return { label: "", type: "text", required: false, order: 0, options: "" };
}

function App() {
  const [view, setView] = useState("admin");
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [formDraft, setFormDraft] = useState(emptyFormDraft());
  const [fieldDraft, setFieldDraft] = useState(emptyFieldDraft());
  const [answers, setAnswers] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState("");

  const selectedForm = useMemo(
    () => forms.find((form) => form.id === Number(selectedFormId)) || null,
    [forms, selectedFormId]
  );
  async function loadForms(status) {
    const { data } = await api.get("/forms", { params: status ? { status } : {} });
    setForms(data);
    if (!selectedFormId && data.length) setSelectedFormId(data[0].id);
  }

  useEffect(() => {
    loadForms();
  }, []);

  async function createForm() {
    await api.post("/forms", { ...formDraft, order: Number(formDraft.order) });
    setFormDraft(emptyFormDraft());
    setMessage("Tao form thanh cong");
    await loadForms();
  }

  async function addField() {
    if (!selectedFormId) return;
    await api.post(`/forms/${selectedFormId}/fields`, {
      ...fieldDraft,
      order: Number(fieldDraft.order),
      options:
        fieldDraft.type === "select"
          ? fieldDraft.options.split(",").map((item) => item.trim()).filter(Boolean)
          : undefined,
    });
    setFieldDraft(emptyFieldDraft());
    setMessage("Them field thanh cong");
    await loadForms();
  }

  async function deleteField(fieldId) {
    await api.delete(`/forms/${selectedFormId}/fields/${fieldId}`);
    await loadForms();
  }

  async function submitAnswers() {
    if (!selectedFormId) return;
    await api.post(`/forms/${selectedFormId}/submissions`, { answers });
    setAnswers({});
    setMessage("Gui form thanh cong");
  }

  async function loadSubmissions() {
    if (!selectedFormId) return;
    const { data } = await api.get(`/forms/${selectedFormId}/submissions`);
    setSubmissions(data);
  }

  return (
    <div className="container">
      <h1>Dynamic Form Builder</h1>
      <div className="tabs">
        <button onClick={() => setView("admin")} className={view === "admin" ? "active" : ""}>
          Admin
        </button>

        <button onClick={() => setView("employee")} className={view === "employee" ? "active" : ""}>
          Nhan vien
        </button>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="layout">
        <aside className="left">
          <h3>Danh sach forms</h3>
          <button onClick={() => loadForms()}>Refresh</button>
          <ul>

          {forms.map((form) => (
              <li key={form.id}>
                <button
                  className={Number(selectedFormId) === form.id ? "active" : ""}
                  onClick={() => setSelectedFormId(form.id)}
                >
                  {form.title} ({form.status})
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="right">
          {view === "admin" ? (
            <>
            <section className="card">
              <h3>Tao form</h3>
              <input
                placeholder="Title"
                value={formDraft.title}
                onChange={(e) => setFormDraft((p) => ({ ...p, title: e.target.value }))}
              />
              <textarea
                placeholder="Description"
                value={formDraft.description}
                onChange={(e) => setFormDraft((p) => ({ ...p, description: e.target.value }))}
              />
              <input
                  type="number"
                  placeholder="Order"
                  value={formDraft.order}
                  onChange={(e) => setFormDraft((p) => ({ ...p, order: e.target.value }))}
              />
              <select
                value={formDraft.status}
                onChange={(e) => setFormDraft((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
              </select>
              <button onClick={createForm}>Tao form</button>
            </section>


            <section className="card">
                <h3>Them field cho form dang chon</h3>
                {!selectedForm ? (
                  <p>Chua chon form</p>
                ) : (
                  <>
                    <p>Form: {selectedForm.title}</p>
                    <input
                      placeholder="Label"
                      value={fieldDraft.label}
                      onChange={(e) => setFieldDraft((p) => ({ ...p, label: e.target.value }))}
                    />
                    <select
                      value={fieldDraft.type}
                      onChange={(e) => setFieldDraft((p) => ({ ...p, type: e.target.value }))}
                    >
                      <option value="text">text</option>
                      <option value="number">number</option>
                      <option value="date">date</option>
                      <option value="color">color</option>
                      <option value="select">select</option>
                    </select>
                    <label>
                      <input
                        type="checkbox"
                        checked={fieldDraft.required}
                        onChange={(e) => setFieldDraft((p) => ({ ...p, required: e.target.checked }))}
                      />
                      Required
                    </label>
                    <input
                      type="number"
                      placeholder="Order"
                      value={fieldDraft.order}
                      onChange={(e) => setFieldDraft((p) => ({ ...p, order: e.target.value }))}
                    />
                    {fieldDraft.type === "select" && (
                      <input
                        placeholder="Options: red,green,blue"
                        value={fieldDraft.options}
                        onChange={(e) => setFieldDraft((p) => ({ ...p, options: e.target.value }))}
                      />
                    )}
                    <button onClick={addField}>Them field</button>
                  </>
                )}
              </section>

              <section className="card">
                <h3>Fields hien tai</h3>
                {selectedForm?.fields?.length ? (
                  <ul>
                    {selectedForm.fields.map((field) => (
                      <li key={field.id}>
                        {field.label} - {field.type} - order:{field.order}
                        <button onClick={() => deleteField(field.id)}>Xoa</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Form nay chua co field</p>
                )}
              </section>
            </>
          ) : (  
            <section className="card">
              <h3>Nhap form</h3>
              {!selectedForm ? (
                <p>Khong co form</p>
              ) : (
                <>
                  <p>
                    <b>{selectedForm.title}</b> - {selectedForm.description}
                  </p>
                  {[...(selectedForm.fields || [])]
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div key={field.id} className="field-row">
                        <label>{field.label}</label>
                        {field.type === "select" ? (
                          <select
                            value={answers[field.id] || ""}
                            onChange={(e) =>
                              setAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))
                            }
                          >
                            <option value="">--chon--</option>
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
                            value={answers[field.id] || ""}
                            onChange={(e) =>
                              setAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))
                            }
                          />
                        )}
                      </div>
                    ))}
                  <button onClick={submitAnswers}>Gui</button>
                  <button onClick={loadSubmissions}>Xem submissions</button>

                  <h4>Submission history</h4>
                  <ul>
                    {submissions.map((submission) => (
                      <li key={submission.id}>
                        #{submission.id} - {new Date(submission.createdAt).toLocaleString()}
                        <ul>
                          {submission.answers.map((answer) => (
                            <li key={`${submission.id}-${answer.fieldId}`}>
                              {answer.fieldLabel}: {answer.value}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
