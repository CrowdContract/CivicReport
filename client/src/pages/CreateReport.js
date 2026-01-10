import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  REPORT_CATEGORIES,
  SEVERITY_LEVELS,
  REPORT_TYPES,
  GOOGLE_PLACES_KEY,
} from "../config";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const hasValidGoogleKey =
  GOOGLE_PLACES_KEY && GOOGLE_PLACES_KEY !== "your-google-places-api-key";

export default function CreateReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState({
    title: "",
    description: "",
    category: "Pothole",
    type: "Infrastructure",
    severity: "Medium",
    location: {
      address: "",
      city: "",
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!report.title || !report.description || !report.location.address) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/report", report);
      
      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Report submitted successfully!");
        navigate("/dashboard");
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="display-4 bg-primary text-light p-5">Submit a Report</h1>

      <div className="container mt-4">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <form onSubmit={handleSubmit}>
              {/* Report Type */}
              <div className="mb-3">
                <label className="form-label">Report Type *</label>
                <select
                  className="form-select"
                  value={report.type}
                  onChange={(e) =>
                    setReport({ ...report, type: e.target.value })
                  }
                  required
                >
                  {REPORT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={report.category}
                  onChange={(e) =>
                    setReport({ ...report, category: e.target.value })
                  }
                  required
                >
                  {REPORT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="mb-3">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Brief description of the issue"
                  value={report.title}
                  onChange={(e) =>
                    setReport({ ...report, title: e.target.value })
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Provide detailed information about the issue"
                  value={report.description}
                  onChange={(e) =>
                    setReport({ ...report, description: e.target.value })
                  }
                  required
                />
              </div>

              {/* Location */}
              <div className="mb-3">
                <label className="form-label">Location *</label>
                {hasValidGoogleKey ? (
                  <GooglePlacesAutocomplete
                    apiKey={GOOGLE_PLACES_KEY}
                    selectProps={{
                      placeholder: "Search for address...",
                      onChange: ({ value }) => {
                        setReport({
                          ...report,
                          location: {
                            ...report.location,
                            address: value.description,
                          },
                        });
                      },
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter full address"
                    value={report.location.address}
                    onChange={(e) =>
                      setReport({
                        ...report,
                        location: {
                          ...report.location,
                          address: e.target.value,
                        },
                      })
                    }
                    required
                  />
                )}
              </div>

              {/* City */}
              <div className="mb-3">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="City name"
                  value={report.location.city}
                  onChange={(e) =>
                    setReport({
                      ...report,
                      location: { ...report.location, city: e.target.value },
                    })
                  }
                />
              </div>

              {/* Severity */}
              <div className="mb-3">
                <label className="form-label">Severity Level *</label>
                <select
                  className="form-select"
                  value={report.severity}
                  onChange={(e) =>
                    setReport({ ...report, severity: e.target.value })
                  }
                  required
                >
                  {SEVERITY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <small className="text-muted">
                  Low: Minor inconvenience | Medium: Needs attention | High:
                  Urgent | Critical: Emergency
                </small>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
