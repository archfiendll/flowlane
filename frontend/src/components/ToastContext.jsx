import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "min(360px, calc(100vw - 32px))",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => {
        const tone =
          toast.type === "error"
            ? {
                backgroundColor: "#fff1f2",
                borderColor: "#fecdd3",
                titleColor: "#9f1239",
                textColor: "#881337",
              }
            : toast.type === "warning"
              ? {
                  backgroundColor: "#fffbeb",
                  borderColor: "#fde68a",
                  titleColor: "#92400e",
                  textColor: "#78350f",
                }
              : {
                  backgroundColor: "#eff6ff",
                  borderColor: "#bfdbfe",
                  titleColor: "#1d4ed8",
                  textColor: "#1e3a8a",
                };

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: "auto",
              backgroundColor: tone.backgroundColor,
              border: `1px solid ${tone.borderColor}`,
              borderRadius: 14,
              padding: "12px 14px",
              boxShadow: "0 20px 40px rgba(15,23,42,0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: 13, fontWeight: 800, color: tone.titleColor }}>
                  {toast.title}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: tone.textColor }}>
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: tone.titleColor,
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((type, message, options = {}) => {
    const id = idRef.current + 1;
    idRef.current = id;

    const toast = {
      id,
      type,
      title:
        options.title
        || (type === "error" ? "Something went wrong" : type === "warning" ? "Heads up" : "Success"),
      message,
    };

    setToasts((current) => [...current, toast]);

    const duration = options.duration ?? 3200;
    window.setTimeout(() => dismissToast(id), duration);
  }, [dismissToast]);

  const value = useMemo(() => ({
    showToast: pushToast,
    success: (message, options) => pushToast("success", message, options),
    error: (message, options) => pushToast("error", message, options),
    warning: (message, options) => pushToast("warning", message, options),
  }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
