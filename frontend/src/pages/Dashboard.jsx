import { useEffect, useState } from "react";
import api from "../api/client";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/auth/me");
        if (!cancelled) setMe(res.data.user);
      } catch (err) {
        if (!cancelled) setError("Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <p style={{ opacity: 0.8 }}>
        Logged in as <strong>{me?.email}</strong> ({me?.role})
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Status</div>
          <div style={{ fontSize: 18 }}>Authenticated ✅</div>
        </div>
      </div>
    </div>
  );
}