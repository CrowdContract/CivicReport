import { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import { Link } from "react-router-dom";
import axios from "axios";
import ReportCard from "../components/cards/ReportCard";

export default function Dashboard() {
  const [auth] = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [assignedReports, setAssignedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-reports");

  const isOfficial = auth.user?.role?.includes("Official");
  const isAdmin = auth.user?.role?.includes("Admin");

  useEffect(() => {
    fetchMyReports();
    if (isOfficial || isAdmin) {
      fetchAssignedReports();
    }
  }, []);

  const fetchMyReports = async () => {
    try {
      const { data } = await axios.get("/user-reports/1");
      setMyReports(data.reports);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const fetchAssignedReports = async () => {
    try {
      const { data } = await axios.get("/assigned-reports");
      setAssignedReports(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1 className="display-4 bg-primary text-light p-5">
        Dashboard - Welcome {auth.user?.name || auth.user?.username}!
      </h1>

      <div className="container mt-4">
        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card p-4">
              <h4>Quick Actions</h4>
              <div className="d-flex gap-3 mt-3">
                <Link to="/report/create" className="btn btn-primary">
                  📝 Submit New Report
                </Link>
                {(isOfficial || isAdmin) && (
                  <button
                    className="btn btn-info"
                    onClick={() => setActiveTab("assigned")}
                  >
                    📋 View Assigned Reports ({assignedReports.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <a
              className={`nav-link ${
                activeTab === "my-reports" ? "active" : ""
              }`}
              onClick={() => setActiveTab("my-reports")}
              style={{ cursor: "pointer" }}
            >
              My Reports ({myReports.length})
            </a>
          </li>
          {(isOfficial || isAdmin) && (
            <li className="nav-item">
              <a
                className={`nav-link ${
                  activeTab === "assigned" ? "active" : ""
                }`}
                onClick={() => setActiveTab("assigned")}
                style={{ cursor: "pointer" }}
              >
                Assigned to Me ({assignedReports.length})
              </a>
            </li>
          )}
        </ul>

        {/* Content */}
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "my-reports" && (
              <div className="row">
                {myReports.length > 0 ? (
                  myReports.map((report) => (
                    <ReportCard report={report} key={report._id} />
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <p className="text-muted">
                      You haven't submitted any reports yet.
                    </p>
                    <Link to="/report/create" className="btn btn-primary">
                      Submit Your First Report
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "assigned" && (
              <div className="row">
                {assignedReports.length > 0 ? (
                  assignedReports.map((report) => (
                    <ReportCard report={report} key={report._id} />
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <p className="text-muted">
                      No reports assigned to you yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
