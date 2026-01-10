import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  REPORT_CATEGORIES,
  REPORT_TYPES,
  GOOGLE_PLACES_KEY,
} from "../config";
import {
  MapPin,
  AlertTriangle,
  Camera,
  Sparkles,
  Send,
  ArrowLeft
} from "lucide-react";

const hasValidGoogleKey =
  GOOGLE_PLACES_KEY && GOOGLE_PLACES_KEY !== "your-google-places-api-key";

const ModernCreateReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep] = useState(1); // Fixed step for now
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
    photos: []
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const SeveritySlider = () => {
    const severityOptions = [
      { value: "Low", color: "green", icon: "🟢" },
      { value: "Medium", color: "yellow", icon: "🟡" },
      { value: "High", color: "orange", icon: "🟠" },
      { value: "Critical", color: "red", icon: "🔴" }
    ];

    return (
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-900">
          Severity Level *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {severityOptions.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setReport({ ...report, severity: option.value })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                report.severity === option.value
                  ? `border-${option.color}-500 bg-${option.color}-50`
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <div className="text-sm font-medium text-gray-900">{option.value}</div>
            </motion.button>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Low: Minor inconvenience • Medium: Needs attention • High: Urgent • Critical: Emergency
        </p>
      </div>
    );
  };

  const CategorySelector = () => {
    const categoryIcons = {
      "Pothole": "🕳️",
      "Streetlight": "💡",
      "Water Supply": "💧",
      "Drainage": "🚰",
      "Road Damage": "🛣️",
      "Traffic Signal": "🚦",
      "Garbage": "🗑️",
      "Other Infrastructure": "🏗️"
    };

    return (
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-900">
          Category *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REPORT_CATEGORIES.map((category) => (
            <motion.button
              key={category}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setReport({ ...report, category })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                report.category === category
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">{categoryIcons[category] || "📋"}</div>
              <div className="text-sm font-medium text-gray-900">{category}</div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  const PhotoUpload = () => (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-900">
        Photos (Optional)
      </label>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
      >
        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Drag & drop photos here, or click to select</p>
        <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            // Handle file upload
            console.log(e.target.files);
          }}
        />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-lg bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            
            <div>
              <h1 className="text-3xl font-bold font-display text-gray-900">
                Report an Issue
              </h1>
              <p className="text-gray-600">
                Help improve your community by reporting infrastructure problems
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="modern-card p-8">
              {/* AI Suggestion Box */}
              <motion.div
                variants={itemVariants}
                className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200"
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-purple-900">AI Assistant</h3>
                    <p className="text-sm text-purple-700">
                      I can help categorize your report and suggest the right severity level based on your description.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Report Type */}
              <motion.div variants={itemVariants} className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Report Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {REPORT_TYPES.map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setReport({ ...report, type })}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        report.type === type
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-lg font-medium text-gray-900">{type}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {type === "Infrastructure" ? "Roads, utilities, public facilities" : "Traffic violations, parking issues"}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Category */}
              <motion.div variants={itemVariants} className="mb-8">
                <CategorySelector />
              </motion.div>

              {/* Title */}
              <motion.div variants={itemVariants} className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Title *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief, descriptive title (e.g., 'Large pothole on Main Street')"
                  value={report.title}
                  onChange={(e) => setReport({ ...report, title: e.target.value })}
                  required
                />
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants} className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Description *
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Provide detailed information about the issue. Include when you first noticed it, how it affects the community, and any safety concerns..."
                  value={report.description}
                  onChange={(e) => setReport({ ...report, description: e.target.value })}
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Be specific and include relevant details
                  </p>
                  <span className="text-sm text-gray-400">
                    {report.description.length}/500
                  </span>
                </div>
              </motion.div>

              {/* Location */}
              <motion.div variants={itemVariants} className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Location *
                </label>
                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      className="form-input pl-12"
                      placeholder="Enter the full address or nearest landmark"
                      value={report.location.address}
                      onChange={(e) =>
                        setReport({
                          ...report,
                          location: { ...report.location, address: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  
                  <input
                    type="text"
                    className="form-input"
                    placeholder="City (optional)"
                    value={report.location.city}
                    onChange={(e) =>
                      setReport({
                        ...report,
                        location: { ...report.location, city: e.target.value },
                      })
                    }
                  />
                </div>
                
                {!hasValidGoogleKey && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Google Places API not configured - using manual address entry
                  </p>
                )}
              </motion.div>

              {/* Severity */}
              <motion.div variants={itemVariants} className="mb-8">
                <SeveritySlider />
              </motion.div>

              {/* Photo Upload */}
              <motion.div variants={itemVariants} className="mb-8">
                <PhotoUpload />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between pt-6 border-t border-gray-200"
              >
                <div className="text-sm text-gray-500">
                  All fields marked with * are required
                </div>
                
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary flex items-center space-x-2 px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernCreateReport;