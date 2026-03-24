import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useToast } from "../components/ToastContext.jsx";
import api from "../api/client";
import { EmployeeDetailsDrawer } from "../features/employees/EmployeeDetailsDrawer.jsx";
import { EmployeeModal } from "../features/employees/EmployeeModal.jsx";
import { ActionChip, Badge, EmployeeAvatar, EmployeeTableSkeleton, InviteBadge, Field, formatInviteMeta, inputStyle, useDebouncedValue } from "../features/employees/utils.jsx";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Employees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get("departmentId") || "");
  const [archivedFilter, setArchivedFilter] = useState("active");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loadingSelectedEmployee, setLoadingSelectedEmployee] = useState(false);
  const [sendingInviteFor, setSendingInviteFor] = useState(null);
  const [deactivatingEmployeeId, setDeactivatingEmployeeId] = useState(null);
  const [restoringEmployeeId, setRestoringEmployeeId] = useState(null);
  const [documentTemplates, setDocumentTemplates] = useState([]);
  const [loadingDocumentTemplates, setLoadingDocumentTemplates] = useState(false);
  const [generatingTemplateKey, setGeneratingTemplateKey] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [managingDocumentId, setManagingDocumentId] = useState("");

  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === "admin";
  const viewingArchived = archivedFilter === "archived";
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 350);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/employees", {
        params: {
          q: debouncedSearchQuery || undefined,
          status: statusFilter || undefined,
          departmentId: departmentFilter || undefined,
          archived: archivedFilter,
          sortBy,
          sortOrder,
          page,
        },
      });
      setRows(res.data.data.data ?? []);
      setMeta(res.data.data.meta ?? { page: 1, pages: 1, total: 0, limit: 20 });
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, [archivedFilter, debouncedSearchQuery, departmentFilter, page, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    let cancelled = false;

    async function loadDepartments() {
      try {
        const res = await api.get("/departments");
        if (!cancelled) setDepartments(res.data.data.departments ?? []);
      } catch {
        if (!cancelled) setDepartments([]);
      }
    }

    loadDepartments();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [archivedFilter, debouncedSearchQuery, departmentFilter, sortBy, sortOrder, statusFilter]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    let cancelled = false;

    async function loadSelectedEmployee() {
      if (!selectedEmployeeId) {
        setSelectedEmployee(null);
        return;
      }

      setLoadingSelectedEmployee(true);
      try {
        const res = await api.get(`/employees/${selectedEmployeeId}`);
        if (!cancelled) {
          setSelectedEmployee(res.data.data.employee);
        }
      } catch {
        if (!cancelled) {
          setSelectedEmployee(null);
          toast.error("Failed to load employee details.", { title: "Details unavailable" });
        }
      } finally {
        if (!cancelled) setLoadingSelectedEmployee(false);
      }
    }

    loadSelectedEmployee();
    return () => {
      cancelled = true;
    };
  }, [selectedEmployeeId, toast]);

  const openCreateModal = () => {
    setEditingEmployeeId(null);
    setShowModal(true);
  };

  const openEditModal = (employeeId) => {
    setEditingEmployeeId(employeeId);
    setShowModal(true);
  };

  const openDetailsDrawer = (employeeId) => {
    setSelectedEmployeeId(employeeId);
  };

  const handleSaved = async (action) => {
    await load();
    if (selectedEmployeeId) {
      const res = await api.get(`/employees/${selectedEmployeeId}`);
      setSelectedEmployee(res.data.data.employee);
    }
    toast.success(`Employee ${action === "updated" ? "updated" : "created"} successfully.`, {
      title: action === "updated" ? "Employee updated" : "Employee created",
    });
  };

  const handleDeactivate = async (employee) => {
    const confirmed = window.confirm(`Archive ${employee.firstName} ${employee.lastName}?`);
    if (!confirmed) return;

    setDeactivatingEmployeeId(employee.id);
    try {
      await api.delete(`/employees/${employee.id}`);
      await load();
      if (selectedEmployeeId === employee.id) {
        const res = await api.get(`/employees/${employee.id}`);
        setSelectedEmployee(res.data.data.employee);
      }
      toast.success(`${employee.firstName} ${employee.lastName} was archived.`, { title: "Employee archived" });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to deactivate employee.", { title: "Archive failed" });
    } finally {
      setDeactivatingEmployeeId(null);
    }
  };

  const handleRestore = async (employee) => {
    setRestoringEmployeeId(employee.id);
    try {
      await api.post(`/employees/${employee.id}/restore`);
      await load();
      if (selectedEmployeeId === employee.id) {
        const res = await api.get(`/employees/${employee.id}`);
        setSelectedEmployee(res.data.data.employee);
      }
      toast.success(`${employee.firstName} ${employee.lastName} was restored.`, { title: "Employee restored" });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to restore employee.", { title: "Restore failed" });
    } finally {
      setRestoringEmployeeId(null);
    }
  };

  const handleInvite = async (employee) => {
    setSendingInviteFor(employee.id);
    try {
      const res = await api.post("/invitations", {
        email: employee.personalEmail,
        role: "employee",
      });
      const invitation = res.data.data.invitation;
      setRows((current) =>
        current.map((row) =>
          row.id === employee.id
            ? {
                ...row,
                invitation: {
                  status: "PENDING",
                  email: invitation.email,
                  createdAt: new Date().toISOString(),
                },
              }
            : row
        )
      );
      toast.success(`Invite sent to ${employee.personalEmail}.`, { title: "Invitation sent" });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to send invite.", { title: "Invite failed" });
    } finally {
      setSendingInviteFor(null);
    }
  };

  useEffect(() => {
    if (!isAdmin) return undefined;

    let cancelled = false;

    async function loadDocumentTemplates() {
      setLoadingDocumentTemplates(true);
      try {
        const res = await api.get("/employees/documents/templates");
        if (!cancelled) {
          setDocumentTemplates(res.data.data.templates ?? []);
        }
      } catch {
        if (!cancelled) {
          setDocumentTemplates([]);
        }
      } finally {
        if (!cancelled) setLoadingDocumentTemplates(false);
      }
    }

    loadDocumentTemplates();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      if (!selectedEmployeeId) {
        setDocuments([]);
        return;
      }

      setLoadingDocuments(true);
      try {
        const res = await api.get(`/employees/${selectedEmployeeId}/documents`);
        if (!cancelled) {
          setDocuments(res.data.data.documents ?? []);
        }
      } catch {
        if (!cancelled) {
          setDocuments([]);
        }
      } finally {
        if (!cancelled) setLoadingDocuments(false);
      }
    }

    loadDocuments();
    return () => {
      cancelled = true;
    };
  }, [selectedEmployeeId]);

  const handleGenerateDocument = async (template) => {
    if (!selectedEmployeeId) return;

    setGeneratingTemplateKey(template.key);

    try {
      const res = await api.get(`/employees/${selectedEmployeeId}/documents/${template.key}`, {
        responseType: "blob",
      });

      const contentDisposition = res.headers["content-disposition"] || "";
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] || `${template.key}.docx`;

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`Generated ${template.label}.`, { title: "Document ready" });
      if (selectedEmployeeId) {
        const docsRes = await api.get(`/employees/${selectedEmployeeId}/documents`);
        setDocuments(docsRes.data.data.documents ?? []);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to generate document.", {
        title: "Document generation failed",
      });
    } finally {
      setGeneratingTemplateKey("");
    }
  };

  const handleDownloadDocument = async (document) => {
    if (!selectedEmployeeId) return;

    try {
      const res = await api.get(`/employees/${selectedEmployeeId}/documents/download/${document.id}`, {
        responseType: "blob",
      });

      const contentDisposition = res.headers["content-disposition"] || "";
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] || document.fileName || "employee-document.docx";

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to download document.", {
        title: "Download failed",
      });
    }
  };

  const handleRenameDocument = async (document) => {
    if (!selectedEmployeeId) return;

    const nextTitle = window.prompt("Rename document", document.title);
    if (!nextTitle || nextTitle.trim() === document.title) return;

    setManagingDocumentId(`rename-${document.id}`);
    try {
      const res = await api.patch(`/employees/${selectedEmployeeId}/documents/${document.id}`, {
        title: nextTitle.trim(),
      });

      const updatedDocument = res.data.data.document;
      setDocuments((current) =>
        current.map((item) => (item.id === document.id ? updatedDocument : item))
      );
      toast.success("Document title updated.", { title: "Document updated" });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to rename document.", {
        title: "Rename failed",
      });
    } finally {
      setManagingDocumentId("");
    }
  };

  const handleDeleteDocument = async (document) => {
    if (!selectedEmployeeId) return;

    const confirmed = window.confirm(`Delete "${document.title}"?`);
    if (!confirmed) return;

    setManagingDocumentId(`delete-${document.id}`);
    try {
      await api.delete(`/employees/${selectedEmployeeId}/documents/${document.id}`);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      toast.success("Document deleted.", { title: "Document removed" });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to delete document.", {
        title: "Delete failed",
      });
    } finally {
      setManagingDocumentId("");
    }
  };

  const cols = ["72px", "1.4fr", "1fr", "140px", "140px", "320px"];
  const emptyTitle = viewingArchived
    ? "No archived employees yet"
    : debouncedSearchQuery || statusFilter
      ? "No employees match these filters"
      : "No employees yet";
  const emptyCopy = viewingArchived
    ? "Archived employees will appear here, and you’ll be able to restore them when needed."
    : debouncedSearchQuery || statusFilter
      ? "Try clearing filters or adjusting the search to find the employee you're looking for."
      : "Add your first employee to start building the company directory.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Heading */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "22px 24px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
      }}>
        <div>
          <p style={{
            margin: "0 0 8px 0",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            color: "#94a3b8",
          }}>
            Workforce Directory
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", margin: "0 0 6px 0" }}>
            Employees
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              borderRadius: 999,
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 12,
              fontWeight: 700,
            }}>
              {loading ? "Loading..." : `${meta.total} employee${meta.total !== 1 ? "s" : ""}`}
            </span>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              Click a row to view details before editing.
            </span>
            {departmentFilter ? (
              <span style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 700 }}>
                Filtered by department
              </span>
            ) : null}
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            style={{
              padding: "12px 18px",
              background: "linear-gradient(135deg, #2b79cb 0%, #1d6fc4 100%)",
              border: "none",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 10px 22px rgba(29,111,196,0.22)",
            }}
            onMouseEnter={e => e.target.style.backgroundColor = "#1559a0"}
            onMouseLeave={e => e.target.style.backgroundColor = "#1d6fc4"}
          >
            + Add Employee
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
          { value: "all", label: "All" },
        ].map((option) => {
          const active = archivedFilter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setArchivedFilter(option.value)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: `1px solid ${active ? "#93c5fd" : "#e2e8f0"}`,
                backgroundColor: active ? "#eff6ff" : "#fff",
                color: active ? "#1d4ed8" : "#64748b",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto",
        gap: 12,
        alignItems: "end",
        padding: "16px",
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
      }}>
        <Field label="Search">
          <input
            style={inputStyle}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, title, or email"
          />
        </Field>
        <Field label="Status">
          <select style={inputStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </Field>
        <Field label="Department">
          <select
            style={inputStyle}
            value={departmentFilter}
            onChange={(e) => {
              const value = e.target.value;
              setDepartmentFilter(value);
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (value) next.set("departmentId", value);
                else next.delete("departmentId");
                return next;
              });
            }}
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
        </Field>
        <Field label="View">
          <select style={inputStyle} value={archivedFilter} onChange={(e) => setArchivedFilter(e.target.value)}>
            <option value="active">Active only</option>
            <option value="archived">Archived only</option>
            <option value="all">All employees</option>
          </select>
        </Field>
        <Field label="Sort">
          <select
            style={inputStyle}
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [nextSortBy, nextSortOrder] = e.target.value.split(":");
              setSortBy(nextSortBy);
              setSortOrder(nextSortOrder);
            }}
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="name:asc">Name A-Z</option>
            <option value="name:desc">Name Z-A</option>
            <option value="startDate:desc">Latest start date</option>
            <option value="startDate:asc">Earliest start date</option>
          </select>
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ActionChip
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
              setDepartmentFilter("");
              setArchivedFilter("active");
              setSortBy("createdAt");
              setSortOrder("desc");
              setPage(1);
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                next.delete("departmentId");
                return next;
              });
            }}
          >
            Reset filters
          </ActionChip>
        </div>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: "#fff", border: "1px solid #e2e8f0",
        borderRadius: 18, overflow: "hidden",
        boxShadow: "0 16px 36px rgba(15,23,42,0.05)",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: cols.join(" "),
          padding: "14px 24px", backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}>
          {["ID", "Name", "Job Title", "Status", "Department", ""].map(h => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 700, color: "#94a3b8",
              letterSpacing: "1.5px", textTransform: "uppercase",
            }}>{h}</span>
          ))}
        </div>

        {loading && <EmployeeTableSkeleton rows={3} cols={cols} />}

        {!loading && rows.length === 0 && (
          <div style={{ padding: "56px 20px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{viewingArchived ? "🗂️" : "👤"}</div>
            <p style={{ fontSize: 16, margin: "0 0 8px 0", color: "#334155", fontWeight: 700 }}>{emptyTitle}</p>
            <p style={{ fontSize: 13, margin: "0 0 18px 0" }}>{emptyCopy}</p>
            {(searchQuery || statusFilter || departmentFilter || archivedFilter !== "active") && (
              <ActionChip
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                  setDepartmentFilter("");
                  setArchivedFilter("active");
                  setSortBy("createdAt");
                  setSortOrder("desc");
                  setPage(1);
                  setSearchParams((current) => {
                    const next = new URLSearchParams(current);
                    next.delete("departmentId");
                    return next;
                  });
                }}
              >
                Clear filters
              </ActionChip>
            )}
            {!viewingArchived && !searchQuery && !statusFilter && isAdmin && (
              <div style={{ marginTop: 12 }}>
                <ActionChip tone="primary" onClick={openCreateModal}>
                  Add first employee
                </ActionChip>
              </div>
            )}
          </div>
        )}

        {!loading && rows.map((u, i) => (
          <div
            key={u.id}
            onClick={() => openDetailsDrawer(u.id)}
            onMouseEnter={() => setHoveredRow(u.id)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              display: "grid", gridTemplateColumns: cols.join(" "),
              padding: "18px 24px", alignItems: "center",
              borderBottom: i < rows.length - 1 ? "1px solid #f1f5f9" : "none",
              backgroundColor: hoveredRow === u.id ? "#f8fafc" : "#fff",
              transition: "background-color 0.12s ease, transform 0.12s ease",
              cursor: "pointer",
              transform: hoveredRow === u.id ? "translateY(-1px)" : "none",
            }}
          >
            <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>#{u.id}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <EmployeeAvatar firstName={u.firstName} lastName={u.lastName} />
              <div style={{ minWidth: 0 }}>
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#334155",
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {u.firstName} {u.lastName}
                </p>
                <p style={{
                  margin: "3px 0 0 0",
                  fontSize: 12,
                  color: u.deletedAt ? "#c2410c" : "#94a3b8",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {u.deletedAt ? "Archived employee record" : (u.personalEmail || "No personal email")}
                </p>
              </div>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#334155", fontWeight: 600 }}>{u.jobTitle}</p>
              <p style={{ margin: "3px 0 0 0", fontSize: 12, color: "#94a3b8" }}>
                {u.contractType === "FIXED_TERM" ? "Fixed term" : "Permanent"}
              </p>
            </div>
            <span><Badge value={u.status?.toLowerCase()} /></span>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{u.department?.name ?? "Unassigned"}</span>
            <span>
              {isAdmin && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <ActionChip
                      onClick={(e) => { e.stopPropagation(); openEditModal(u.id); }}
                      disabled={Boolean(u.deletedAt)}
                    >
                      Edit
                    </ActionChip>
                    {u.deletedAt ? (
                      <ActionChip
                        onClick={(e) => { e.stopPropagation(); handleRestore(u); }}
                        disabled={restoringEmployeeId === u.id}
                        tone="primary"
                      >
                        {restoringEmployeeId === u.id ? "Restoring..." : "Restore"}
                      </ActionChip>
                    ) : (
                      <ActionChip
                        onClick={(e) => { e.stopPropagation(); handleDeactivate(u); }}
                        disabled={deactivatingEmployeeId === u.id}
                        tone="danger"
                        style={{ backgroundColor: deactivatingEmployeeId === u.id ? "#fee2e2" : undefined }}
                      >
                        {deactivatingEmployeeId === u.id ? "Archiving..." : "Archive"}
                      </ActionChip>
                    )}
                    {u.user ? (
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Joined</span>
                    ) : !u.deletedAt ? (
                      <>
                        <InviteBadge invitation={u.invitation} />
                        <ActionChip
                          title={!u.personalEmail ? "Add personal email first" : "Send invite"}
                          disabled={!u.personalEmail || sendingInviteFor === u.id}
                          onClick={(e) => { e.stopPropagation(); handleInvite(u); }}
                          tone="primary"
                          style={{
                            backgroundColor: u.personalEmail ? undefined : "#f1f5f9",
                            color: u.personalEmail ? undefined : "#94a3b8",
                            border: u.personalEmail ? undefined : "1px solid #e2e8f0",
                          }}
                        >
                          {sendingInviteFor === u.id
                            ? "Sending..."
                            : u.invitation?.status === "PENDING"
                              ? "Resend"
                              : "Invite"}
                        </ActionChip>
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Archived</span>
                    )}
                  </div>
                  {u.user && (
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", textAlign: "right" }}>
                      Account already linked
                    </p>
                  )}
                </div>
              )}
              {!u.user && u.invitation && (
                <p style={{ margin: "6px 0 0 0", fontSize: 11, color: "#94a3b8", textAlign: "right" }}>
                  {formatInviteMeta(u.invitation)}
                </p>
              )}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}>
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
          Page {meta.page} of {meta.pages || 1}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <ActionChip onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading}>
            Previous
          </ActionChip>
          <ActionChip onClick={() => setPage((current) => Math.min(meta.pages || 1, current + 1))} disabled={page >= (meta.pages || 1) || loading}>
            Next
          </ActionChip>
        </div>
      </div>

      {error && !loading && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 16px",
          borderRadius: 12,
          backgroundColor: "#fff7ed",
          border: "1px solid #fdba74",
          color: "#9a3412",
        }}>
          <div>
            <p style={{ margin: "0 0 4px 0", fontSize: 13, fontWeight: 700 }}>Something went wrong while loading employees.</p>
            <p style={{ margin: 0, fontSize: 12 }}>{error}</p>
          </div>
          <ActionChip tone="primary" onClick={load}>
            Retry
          </ActionChip>
        </div>
      )}

      {showModal && (
        <EmployeeModal
          mode={editingEmployeeId ? "edit" : "create"}
          employeeId={editingEmployeeId}
          departments={departments}
          onClose={() => {
            setShowModal(false);
            setEditingEmployeeId(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {selectedEmployeeId && (
        <EmployeeDetailsDrawer
          employee={selectedEmployee}
          loading={loadingSelectedEmployee}
          documentTemplates={loadingDocumentTemplates ? [] : documentTemplates}
          documents={documents}
          loadingDocuments={loadingDocuments}
          managingDocumentId={managingDocumentId}
          generatingTemplateKey={generatingTemplateKey}
          onGenerateDocument={handleGenerateDocument}
          onDownloadDocument={handleDownloadDocument}
          onRenameDocument={handleRenameDocument}
          onDeleteDocument={handleDeleteDocument}
          onClose={() => {
            setSelectedEmployeeId(null);
            setSelectedEmployee(null);
            setDocuments([]);
          }}
          onEdit={() => selectedEmployeeId && openEditModal(selectedEmployeeId)}
          onArchive={() => selectedEmployee && handleDeactivate(selectedEmployee)}
          onRestore={() => selectedEmployee && handleRestore(selectedEmployee)}
          archiving={deactivatingEmployeeId === selectedEmployeeId}
          restoring={restoringEmployeeId === selectedEmployeeId}
          canManage={isAdmin}
        />
      )}
    </div>
  );
}
