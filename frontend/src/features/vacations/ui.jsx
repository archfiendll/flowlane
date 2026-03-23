import { StatusPill } from "../../components/ui.jsx";
import { calculateVacationDays, formatVacationDate, getVacationStatusMeta } from "./workflow.js";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid #cbd5e1",
  borderRadius: 10,
  fontSize: 14,
  backgroundColor: "#f8fafc",
  color: "#1e293b",
  outline: "none",
  boxSizing: "border-box",
};

export function VacationInput({ style, ...props }) {
  return <input style={{ ...inputStyle, ...style }} {...props} />;
}

export function VacationSelect({ style, ...props }) {
  return <select style={{ ...inputStyle, ...style }} {...props} />;
}

export function StatusBadge({ status }) {
  const meta = getVacationStatusMeta(status);
  return <StatusPill label={meta.label} tone={meta.tone} />;
}

export function TypeBadge({ type }) {
  const labels = {
    ANNUAL: "Annual",
    MEDICAL: "Medical",
    PARENTAL: "Parental",
    UNPAID: "Unpaid",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
      }}
    >
      {labels[type] || type}
    </span>
  );
}

export function VacationTableSkeleton({ canReview }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: canReview ? "1.35fr 130px 170px 120px 170px" : "130px 170px 120px 160px",
            gap: 12,
            padding: "18px 20px",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
          }}
        >
          {Array.from({ length: canReview ? 5 : 4 }, (_, item) => (
            <div
              key={item}
              style={{
                height: 14,
                borderRadius: 999,
                backgroundColor: item === 0 ? "#e2e8f0" : "#f1f5f9",
                width: `${62 + item * 5}%`,
                alignSelf: "center",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function VacationDuration({ startDate, endDate }) {
  return (
    <div style={{ ...inputStyle, display: "flex", alignItems: "center", color: "#64748b" }}>
      {startDate && endDate ? `${calculateVacationDays(startDate, endDate)} day(s)` : "Choose dates"}
    </div>
  );
}

export { calculateVacationDays, formatVacationDate, inputStyle };

