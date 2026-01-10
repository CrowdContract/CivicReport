import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { MapPin, Clock, AlertTriangle, CheckCircle, Filter, Search } from "lucide-react";
import { STATUS_COLORS, SEVERITY_COLORS } from "../config";

const statusIcon = (status) => {
  if (status === "Resolved") return <CheckCircle size={14} />;
  if (status === "In Progress") return <Clock size={14} />;
  return <AlertTriangle size={14} />;
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get("/reports");
      setReports(data?.reports || data || []);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter((r) => {
    const matchSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ["All", "New", "In Progress", "Resolved", "Rejected"];

  return (
    <div className="page-container" style={{ paddingTop: "100px", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "2rem" }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            Community Reports
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Browse all civic issues reported in your area
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: "1", minWidth: "220px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem 0.6rem 2.25rem",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          {/* Status filter pills */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  background: statusFilter === s ? "var(--gradient-primary)" : "var(--bg-card)",
                  color: statusFilter === s ? "#fff" : "var(--text-secondary)",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Report Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            Loading reports...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            No reports found.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {filtered.map((report, i) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={`/report/${report._id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="glass-card"
                    style={{
                      padding: "1.25rem",
                      borderRadius: "16px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-card)",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s",
                    }}
                  >
                    {/* Category + Severity */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "0.25rem 0.6rem",
                          borderRadius: "6px",
                          background: "var(--bg-tertiary)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {report.category}
                      </span>
                      {report.severity && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            padding: "0.25rem 0.6rem",
                            borderRadius: "6px",
                            background: SEVERITY_COLORS[report.severity] + "22",
                            color: SEVERITY_COLORS[report.severity],
                          }}
                        >
                          {report.severity}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "0.5rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {report.title}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        marginBottom: "1rem",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {report.description}
                    </p>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {/* Location */}
                      {report.location?.address && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          <MapPin size={12} />
                          {report.location.address.substring(0, 30)}
                          {report.location.address.length > 30 ? "..." : ""}
                        </span>
                      )}

                      {/* Status badge */}
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "20px",
                          background: (STATUS_COLORS[report.status] || "#6B7280") + "22",
                          color: STATUS_COLORS[report.status] || "#6B7280",
                        }}
                      >
                        {statusIcon(report.status)}
                        {report.status}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
