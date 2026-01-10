import { Badge } from "antd";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const severityColors = {
  Low: "green",
  Medium: "orange",
  High: "red",
  Critical: "purple",
};

const statusColors = {
  New: "blue",
  "In Progress": "orange",
  Resolved: "green",
  Rejected: "red",
  Closed: "gray",
};

export default function ReportCard({ report }) {
  return (
    <div className="col-lg-4 p-4 gx-4 gy-4">
      <Link to={`/report/${report._id}`}>
        <Badge.Ribbon
          text={report?.severity}
          color={severityColors[report?.severity] || "blue"}
        >
          <div className="card hoverable shadow">
            {report?.photos?.[0]?.Location ? (
              <img
                src={report.photos[0].Location}
                alt={report?.title}
                style={{ height: "200px", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  height: "200px",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "48px" }}>
                  {report?.type === "Traffic Violation" ? "🚦" : "🏗️"}
                </span>
              </div>
            )}

            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span
                  className="badge"
                  style={{
                    backgroundColor: statusColors[report?.status] || "#666",
                  }}
                >
                  {report?.status}
                </span>
                <small className="text-muted">
                  {report?.createdAt &&
                    formatDistanceToNow(new Date(report.createdAt), {
                      addSuffix: true,
                    })}
                </small>
              </div>

              <h5 className="card-title">{report?.title}</h5>
              <p className="card-text text-muted small">
                <span className="badge bg-secondary me-2">
                  {report?.category}
                </span>
                {report?.type}
              </p>
              <p className="card-text small">
                📍 {report?.location?.address}
              </p>

              <div className="d-flex justify-content-between align-items-center mt-2">
                <small className="text-muted">
                  👁️ {report?.views || 0} views
                </small>
                <small className="text-muted">
                  👍 {report?.upvotes?.length || 0} upvotes
                </small>
              </div>
            </div>
          </div>
        </Badge.Ribbon>
      </Link>
    </div>
  );
}
