import { useRef } from "react";
import { ActionChip, Badge, DetailRow, EmployeeAvatar, InviteBadge, SectionSkeleton, formatDate } from "./utils.jsx";

function getDocumentTone(document) {
  if (document.source === "UPLOADED") return "neutral";
  return "primary";
}

export function EmployeeDetailsDrawer({
  employee,
  loading,
  documentTemplates = [],
  documents = [],
  loadingDocuments = false,
  managingDocumentId = "",
  uploadingDocument = false,
  generatingTemplateKey = "",
  onGenerateDocument,
  onDownloadDocument,
  onRenameDocument,
  onDeleteDocument,
  onUploadDocument,
  onClose,
  onEdit,
  onArchive,
  onRestore,
  archiving,
  restoring,
  canManage,
}) {
  const uploadInputRef = useRef(null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15,23,42,0.28)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 90,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          backgroundColor: "#fff",
          height: "100vh",
          boxShadow: "-18px 0 40px rgba(15,23,42,0.14)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "22px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <EmployeeAvatar firstName={employee?.firstName} lastName={employee?.lastName} />
            <div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: 20, fontWeight: 800, color: "#1e293b" }}>
                {loading ? "Loading employee..." : `${employee?.firstName || ""} ${employee?.lastName || ""}`}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                {loading ? "Fetching details" : employee?.jobTitle || "Employee details"}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8" }}>
            ✕
          </button>
        </div>

        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          {loading || !employee ? (
            <>
              <SectionSkeleton title="Personal" />
              <SectionSkeleton title="Employment" />
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge value={employee.status?.toLowerCase()} />
                {employee.deletedAt ? <InviteBadge invitation={{ status: "EXPIRED" }} /> : null}
                {employee.user ? <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>Linked account</span> : null}
              </div>

              <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <DetailRow label="Personal Email" value={employee.personalEmail} />
                <DetailRow label="Phone" value={employee.phone} />
                <DetailRow label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
                <DetailRow label="Nationality" value={employee.nationality} />
                <DetailRow label="Address" value={employee.address} />
                <DetailRow label="City" value={employee.city} />
              </section>

              <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <DetailRow label="Contract Number" value={employee.contractNumber} />
                <DetailRow label="Contract Type" value={employee.contractType === "FIXED_TERM" ? "Fixed term" : "Permanent"} />
                <DetailRow label="Start Date" value={formatDate(employee.startDate)} />
                <DetailRow label="Contract Date" value={formatDate(employee.contractDate)} />
                <DetailRow label="Working Hours" value={employee.workingHours === "PARTIAL" ? `Part time (${employee.partialHours || "—"}h)` : "Full time"} />
                <DetailRow label="Salary" value={employee.grossSalary ? `${employee.grossSalary} ${employee.currency}` : "—"} />
                <DetailRow label="Department" value={employee.department?.name} />
                <DetailRow label="Vacation Days / Year" value={employee.vacationDaysPerYear} />
              </section>

              {canManage ? (
                <section
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 800, color: "#1e293b" }}>
                      Generate documents
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                      Fill the existing HR templates with this employee&apos;s data and download the DOCX file.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      ref={uploadInputRef}
                      type="file"
                      style={{ display: "none" }}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onUploadDocument(file);
                        event.target.value = "";
                      }}
                    />
                    <ActionChip
                      onClick={() => uploadInputRef.current?.click()}
                      disabled={uploadingDocument}
                    >
                      {uploadingDocument ? "Uploading..." : "Upload document"}
                    </ActionChip>
                    {documentTemplates.map((template) => (
                      <ActionChip
                        key={template.key}
                        tone="primary"
                        onClick={() => onGenerateDocument(template)}
                        disabled={generatingTemplateKey === template.key}
                      >
                        {generatingTemplateKey === template.key ? "Generating..." : template.label}
                      </ActionChip>
                    ))}
                  </div>
                </section>
              ) : null}

              <section
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 800, color: "#1e293b" }}>
                    Stored documents
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                    Download previously generated files for this employee.
                  </p>
                </div>

                {loadingDocuments ? (
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Loading documents...</p>
                ) : documents.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>No stored documents yet.</p>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "12px 14px",
                          borderRadius: 12,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div>
                          <p style={{ margin: "0 0 4px 0", fontSize: 13, fontWeight: 700, color: "#334155" }}>
                            {document.title}
                          </p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                            <ActionChip tone={getDocumentTone(document)} disabled>
                              {document.source === "UPLOADED" ? "Uploaded" : "Generated"}
                            </ActionChip>
                            {document.category ? (
                              <ActionChip disabled>{document.category}</ActionChip>
                            ) : null}
                          </div>
                          <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                            {new Date(document.createdAt).toLocaleString("en-GB")} · {document.fileName}
                          </p>
                          {document.notes ? (
                            <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#64748b" }}>
                              {document.notes}
                            </p>
                          ) : null}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <ActionChip tone="primary" onClick={() => onDownloadDocument(document)}>
                            Download
                          </ActionChip>
                          {canManage ? (
                            <>
                              <ActionChip
                                onClick={() => onRenameDocument(document)}
                                disabled={managingDocumentId === `rename-${document.id}`}
                              >
                                {managingDocumentId === `rename-${document.id}` ? "Saving..." : "Rename"}
                              </ActionChip>
                              <ActionChip
                                tone="danger"
                                onClick={() => onDeleteDocument(document)}
                                disabled={managingDocumentId === `delete-${document.id}`}
                              >
                                {managingDocumentId === `delete-${document.id}` ? "Deleting..." : "Delete"}
                              </ActionChip>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <div
          style={{
            padding: 20,
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <ActionChip onClick={onClose}>Close</ActionChip>
          {canManage && employee ? (
            <div style={{ display: "flex", gap: 8 }}>
              <ActionChip onClick={onEdit} disabled={Boolean(employee.deletedAt)}>Edit</ActionChip>
              {employee.deletedAt ? (
                <ActionChip tone="primary" onClick={onRestore} disabled={restoring}>
                  {restoring ? "Restoring..." : "Restore"}
                </ActionChip>
              ) : (
                <ActionChip tone="danger" onClick={onArchive} disabled={archiving}>
                  {archiving ? "Archiving..." : "Archive"}
                </ActionChip>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
