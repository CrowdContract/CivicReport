import { useEffect, useState } from "react";
import axios from "axios";
import ReportCard from "../components/cards/ReportCard";
import { Link } from "react-router-dom";

export default function Home() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get("/reports");
      setReports(data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("/reports/statistics");
      setStats(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white p-5">
        <div className="container">
          <h1 className="display-4">Civic Report System</h1>
          <p className="lead">
            Report infrastructure issues and traffic violations in your community
          </p>
          <Link to="/report/create" className="btn btn-light btn-lg mt-3">
            📝 Submit a Report
          </Link>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="container mt-5">
        <div className="row text-center">
          <div className="col-md-3">
            <div className="card p-3">
              <h3 className="text-primary">{stats.totalReports || 0}</h3>
              <p className="text-muted">Total Reports</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3">
              <h3 className="text-info">{stats.newReports || 0}</h3>
              <p className="text-muted">New Reports</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3">
              <h3 className="text-warning">{stats.inProgress || 0}</h3>
              <p className="text-muted">In Progress</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3">
              <h3 className="text-success">{stats.resolved || 0}</h3>
              <p className="text-muted">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="container mt-5">
        <h2 className="mb-4">Recent Reports</h2>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {reports?.length > 0 ? (
              reports.map((report) => (
                <ReportCard report={report} key={report._id} />
              ))
            ) : (
              <div className="col-12 text-center">
                <p className="text-muted">No reports found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="container mt-5 mb-5">
        <h2 className="mb-4">Report Categories</h2>
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card p-4 text-center hoverable">
              <h3>🕳️</h3>
              <h5>Potholes & Roads</h5>
              <p className="text-muted">Report road damage and potholes</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card p-4 text-center hoverable">
              <h3>💡</h3>
              <h5>Streetlights</h5>
              <p className="text-muted">Report non-functional streetlights</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card p-4 text-center hoverable">
              <h3>💧</h3>
              <h5>Water & Drainage</h5>
              <p className="text-muted">Report water supply and drainage issues</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card p-4 text-center hoverable">
              <h3>🚦</h3>
              <h5>Traffic Signals</h5>
              <p className="text-muted">Report malfunctioning traffic signals</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card p-4 text-center hoverable">
              <h3>🗑️</h3>
              <h5>Garbage Collection</h5>
              <p className="text-muted">Report garbage collection issues</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card p-4 text-center hoverable">
              <h3>🚗</h3>
              <h5>Traffic Violations</h5>
              <p className="text-muted">Report traffic violations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
