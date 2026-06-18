import { useEffect, useMemo, useState } from "react";
import { useToast } from "../components/ToastContext.jsx";
import api from "../api/client";
import { StatCard, StatusPill, SurfaceCard } from "../components/ui.jsx";

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e0e0e0",
  borderRadius: 10,
  fontSize: 14,
  color: "#1e293b",
  backgroundColor: "#f8fafc",
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 12,
  color: "#6b6b6b",
  fontWeight: 400,
  letterSpacing: "0",
};

const EMPTY_FORM = {
  name: "",
  key: "",
  category: "HR",
  description: "",
  file: null,
};

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function TemplateSkeleton() {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      {Array.from({ length: 4 }, (_, index) => (
        <SurfaceCard key={index} style={{ minHeight: index === 0 ? 180 : 120, padding: 20 }}>
          <div style={{ display: "grid", gap: 10 }}>
            {Array.from({ length: 4 }, (_, item) => (
              <div
                key={item}
                style={{
                  height: item === 2 && index === 0 ? 42 : 14,
                  borderRadius: 12,
                  backgroundColor: item % 2 === 0 ? "#e2e8f0" : "#f1f5f9",
                }}
              />
            ))}
          </div>
        </SurfaceCard>
      ))}
    </div>
  );
}

function BuiltInTemplateCard({ template }) {
  return (
    <SurfaceCard style={{ padding: "16px 18px", display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{template.label}</p>
        <StatusPill label="Built-in" tone="success" />
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{template.key}</p>
    </SurfaceCard>
  );
}

function UploadedTemplateCard({ template, downloading, deleting, onDownload, onEdit, onDelete }) {
  return (
    <SurfaceCard style={{ padding: 18, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 4px 0", fontSize: 17, fontWeight: 800, color: "#1e293b" }}>{template.name}</p>
          <p style={{ margin: "0 0 4px 0", fontSize: 12, color: "#64748b" }}>{template.key}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{template.fileName}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {template.category ? <StatusPill label={template.category} tone="info" /> : null}
          <StatusPill label="Uploaded file" tone="warning" />
        </div>
      </div>

      {template.description ? (
        <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>{template.description}</p>
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>No description added yet.</p>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
          Added {new Date(template.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={() => onDownload(template)} style={buttonStyle("secondary")} disabled={downloading}>
            {downloading ? "Downloading..." : "Download"}
          </button>
          <button type="button" onClick={() => onEdit(template)} style={buttonStyle("secondary")}>
            Edit info
          </button>
          <button type="button" onClick={() => onDelete(template)} style={buttonStyle("danger")} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </SurfaceCard>
  );
}

function buttonStyle(tone = "primary") {
  const styles = {
    primary: {
      border: "none",
      backgroundColor: "#1d6fc4",
      color: "#fff",
    },
    secondary: {
      border: "1px solid #dbe4f0",
      backgroundColor: "#fff",
      color: "#334155",
    },
    danger: {
      border: "1px solid #fecaca",
      backgroundColor: "#fff5f5",
      color: "#b91c1c",
    },
  };

  return {
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
    ...styles[tone],
  };
}

async function fileToBase64(file) {
  const arrayBuffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary);
}

export default function DocumentTemplates() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadedTemplates, setUploadedTemplates] = useState([]);
  const [builtInTemplates, setBuiltInTemplates] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/document-templates");
      setUploadedTemplates(res.data.data.uploadedTemplates ?? []);
      setBuiltInTemplates(res.data.data.builtInTemplates ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to load document templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => ({
    uploadedTemplates: uploadedTemplates.length,
    builtInTemplates: builtInTemplates.length,
    totalTemplates: uploadedTemplates.length + builtInTemplates.length,
  }), [uploadedTemplates.length, builtInTemplates.length]);

  const setField = (field) => (event) => {
    const value = field === "file" ? event.target.files?.[0] || null : event.target.value;
    setForm((current) => {
      if (field === "name" && !editingTemplateId && current.key === slugify(current.name)) {
        return { ...current, name: value, key: slugify(value) };
      }

      return { ...current, [field]: value };
    });
  };

  const resetForm = () => {
    setEditingTemplateId(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (template) => {
    setEditingTemplateId(template.id);
    setForm({
      name: template.name,
      key: template.key,
      category: template.category || "HR",
      description: template.description || "",
      file: null,
    });
  };

  const saveTemplate = async () => {
    setSaving(true);
    setError("");

    try {
      if (editingTemplateId) {
        const res = await api.put(`/document-templates/${editingTemplateId}`, {
          name: form.name,
          key: form.key,
          category: form.category,
          description: form.description,
        });
        const nextTemplate = res.data.data.template;
        setUploadedTemplates((current) => current.map((item) => (item.id === nextTemplate.id ? nextTemplate : item)));
        toast.success(`${nextTemplate.name} was updated.`, { title: "Template updated" });
        resetForm();
      } else {
        if (!form.file) {
          throw new Error("Please choose a DOCX file to upload.");
        }

        const contentBase64 = await fileToBase64(form.file);
        const res = await api.post("/document-templates", {
          name: form.name,
          key: form.key,
          category: form.category,
          description: form.description,
          fileName: form.file.name,
          mimeType: form.file.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          contentBase64,
        });
        const nextTemplate = res.data.data.template;
        setUploadedTemplates((current) => [nextTemplate, ...current]);
        toast.success(`${nextTemplate.name} was uploaded.`, { title: "Template uploaded" });
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = async (template) => {
    setDownloadingId(template.id);
    try {
      const res = await api.get(`/document-templates/${template.id}/download`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: template.mimeType }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = template.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to download template.", { title: "Download failed" });
    } finally {
      setDownloadingId(null);
    }
  };

  const deleteTemplate = async (template) => {
    const confirmed = window.confirm(`Delete template "${template.name}"?`);
    if (!confirmed) return;

    setDeletingId(template.id);
    try {
      await api.delete(`/document-templates/${template.id}`);
      setUploadedTemplates((current) => current.filter((item) => item.id !== template.id));
      if (editingTemplateId === template.id) {
        resetForm();
      }
      toast.success("Template deleted.", { title: "Template removed" });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to delete template.", { title: "Delete failed" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
          border: "1px solid #dbeafe",
          borderRadius: 20,
          padding: "24px 26px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 30, color: "#1e293b" }}>Document Templates</h1>
          <p style={{ margin: "0 0 14px 0", color: "#64748b", fontSize: 14, maxWidth: 780 }}>
            Manage template files cleanly through the app instead of editing HTML in the browser. Upload DOCX templates, keep metadata in the database, and download or remove them from one admin workspace.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatusPill label="Upload-based workflow" tone="success" />
            <StatusPill label="Built-in DOCX preserved" tone="info" />
            <StatusPill label="Browser editor removed" tone="warning" />
          </div>
        </div>

        <button type="button" onClick={resetForm} style={buttonStyle("primary")}>
          {editingTemplateId ? "Create New Upload" : "New Template Upload"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <StatCard label="Uploaded Templates" value={summary.uploadedTemplates} sub="Managed through this admin page" accentColor="#1d4ed8" />
        <StatCard label="Built-In DOCX" value={summary.builtInTemplates} sub="Existing employee generation templates" accentColor="#0f766e" />
        <StatCard label="Total Library" value={summary.totalTemplates} sub="All templates currently available" accentColor="#f59e0b" />
      </div>

      {error ? (
        <div style={{ padding: "12px 14px", borderRadius: 12, backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <TemplateSkeleton />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 420px) minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
          <SurfaceCard style={{ padding: 20, display: "grid", gap: 16, position: "sticky", top: 88 }}>
            <div>
              <p style={{ margin: "0 0 4px 0", fontSize: 20, fontWeight: 800, color: "#1e293b" }}>
                {editingTemplateId ? "Edit template info" : "Upload new template"}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                Upload DOCX files and keep a clean metadata record for each template. You can rename keys and descriptions later without reuploading the file.
              </p>
            </div>

            <div>
              <label style={labelStyle}>Template Name</label>
              <input style={fieldStyle} value={form.name} onChange={setField("name")} placeholder="Employment Contract - Senior" />
            </div>

            <div>
              <label style={labelStyle}>Template Key</label>
              <input style={fieldStyle} value={form.key} onChange={setField("key")} placeholder="employment-contract-senior" />
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <input style={fieldStyle} value={form.category} onChange={setField("category")} placeholder="Contracts" />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...fieldStyle, minHeight: 100, resize: "vertical" }}
                value={form.description}
                onChange={setField("description")}
                placeholder="Short note about when this template should be used."
              />
            </div>

            {!editingTemplateId ? (
              <div>
                <label style={labelStyle}>DOCX File</label>
                <input type="file" accept=".docx" onChange={setField("file")} style={fieldStyle} />
                <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "#94a3b8" }}>
                  Upload a `.docx` file that will act as the template source.
                </p>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "space-between" }}>
              <button type="button" onClick={resetForm} style={buttonStyle("secondary")}>
                {editingTemplateId ? "Cancel edit" : "Clear form"}
              </button>
              <button type="button" onClick={saveTemplate} style={buttonStyle("primary")} disabled={saving}>
                {saving ? "Saving..." : editingTemplateId ? "Save metadata" : "Upload template"}
              </button>
            </div>
          </SurfaceCard>

          <div style={{ display: "grid", gap: 18 }}>
            <SurfaceCard style={{ padding: 20, display: "grid", gap: 14 }}>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: 20, fontWeight: 800, color: "#1e293b" }}>Uploaded Template Library</p>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                  These are the custom template files uploaded by admins. This is the clean path we can later connect to generation.
                </p>
              </div>

              {uploadedTemplates.length === 0 ? (
                <div style={{ padding: "18px 16px", borderRadius: 12, backgroundColor: "#f8fafc", border: "1px dashed #cbd5e1" }}>
                  <p style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 800, color: "#334155" }}>No uploaded templates yet</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                    Upload your first DOCX template from the panel on the left. After that, admins will be able to manage the files here.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {uploadedTemplates.map((template) => (
                    <UploadedTemplateCard
                      key={template.id}
                      template={template}
                      downloading={downloadingId === template.id}
                      deleting={deletingId === template.id}
                      onDownload={downloadTemplate}
                      onEdit={startEdit}
                      onDelete={deleteTemplate}
                    />
                  ))}
                </div>
              )}
            </SurfaceCard>

            <SurfaceCard style={{ padding: 20, display: "grid", gap: 12 }}>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: 20, fontWeight: 800, color: "#1e293b" }}>Built-In DOCX Templates</p>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                  These still power the current employee drawer generation flow while we build out custom-template support.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {builtInTemplates.map((template) => (
                  <BuiltInTemplateCard key={template.key} template={template} />
                ))}
              </div>
            </SurfaceCard>
          </div>
        </div>
      )}
    </div>
  );
}
