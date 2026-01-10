import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/auth";
import axios from "axios";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const severityColors = {
  Low: "success",
  Medium: "warning",
  High: "danger",
  Critical: "dark",
};

const statusColors = {
  New: "primary",
  "In Progress": "warning",
  Resolved: "success",
  Rejected: "danger",
  Closed: "secondary",
};

export default function ReportView() {
  const { id } = useParams();
  const [auth] = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOfficial = auth.user?.role?.includes("Official");
  const isAdmin = auth.user?.role?.includes("Admin");

  const fetchReport = useCallback(async () => {
    try {
      const { data } = await axios.get(`/report/${id}`);
      setReport(data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleUpvote = async () => {
    try {
      const { data } = await axios.post(`/report/${id}/upvote`);
      setReport(data);
      toast.success("Upvote updated");
    } catch (err) {
      console.log(err);
      toast.error("Please login to upvote");
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateMessage.trim()) return;

    try {
      setSubmitting(true);
      const { data } = await axios.post(`/report/${id}/update`, {
        message: updateMessage,
      });
      setReport(data);
      setUpdateMessage("");
      toast.success("Update added");
      setSubmitting(false);
    } catch (err) {
      console.log(err);
      toast.error("Failed to add update");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Report not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-primary text-white p-4">
        <div className="container">
          <h1>{report.title}</h1>
          <div className="d-flex gap-2 mt-3">
            <span className={`badge bg-${statusColors[report.status]}`}>
              {report.status}
            </span>
            <span className={`badge bg-${severityColors[report.severity]}`}>
              {report.severity}
            </span>
            <span className="badge bg-secondary">{report.category}</span>
            <span className="badge bg-info">{report.type}</span>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-body">
                <h5>Description</h5>
                <p>{report.description}</p>

                <hr />

                <h5>Location</h5>
                <p>
                  📍 {report.location.address}
                  {report.location.city && `, ${report.location.city}`}
                </p>

                <hr />

                <div className="d-flex justify-content-between">
                  <div>
                    <small className="text-muted">
                      Reported{" "}
                      {formatDistanceToNow(new Date(report.createdAt), {
                        addSuffix: true,
                      })}
                    </small>
                  </div>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleUpvote}
                    >
                      👍 Upvote ({report.upvotes?.length || 0})
                    </button>
                    <span className="ms-3 text-muted">
                      👁️ {report.views} views
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Updates Section */}
            <div className="card">
              <div className="card-body">
                <h5>Updates & Progress</h5>

                {report.updates && report.updates.length > 0 ? (
                  <div className="mt-3">
                    {report.updates.map((update, index) => (
                      <div key={index} className="border-start border-3 border-primary ps-3 mb-3">
                        <p className="mb-1">{update.message}</p>
                        <small className="text-muted">
                          By {update.updatedBy?.name || "Official"} •{" "}
                          {formatDistanceToNow(new Date(update.timestamp), {
                            addSuffix: true,
                          })}
                        </small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mt-3">No updates yet</p>
                )}

                {/* Add Update Form (Officials only) */}
                {(isOfficial || isAdmin) && (
                  <form onSubmit={handleAddUpdate} className="mt-4">
                    <div className="mb-3">
                      <label className="form-label">Add Update</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Provide an update on this report..."
                        value={updateMessage}
                        onChange={(e) => setUpdateMessage(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? "Posting..." : "Post Update"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card mb-3">
              <div className="card-body">
                <h6>Reported By</h6>
                <p className="mb-1">
                  <strong>{report.reportedBy?.name}</strong>
                </p>
                <p className="text-muted small">{report.reportedBy?.email}</p>
                {report.reportedBy?.phone && (
                  <p className="text-muted small">📞 {report.reportedBy.phone}</p>
                )}
              </div>
            </div>

            {report.assignedTo && (
              <div className="card mb-3">
                <div className="card-body">
                  <h6>Assigned To</h6>
                  <p className="mb-1">
                    <strong>{report.assignedTo?.name}</strong>
                  </p>
                  <p className="text-muted small">
                    {report.assignedTo?.department} Department
                  </p>
                </div>
              </div>
            )}

            {report.resolvedAt && (
              <div className="card mb-3 border-success">
                <div className="card-body">
                  <h6 className="text-success">✅ Resolved</h6>
                  <p className="text-muted small">
                    {formatDistanceToNow(new Date(report.resolvedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
