import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Shield, 
  Users, 
  Lightbulb,
  ArrowRight,
  Play,
  Zap,
  Clock,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    inProgressReports: 0,
    newToday: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("/reports/statistics");
      setStats(data);
    } catch (err) {
      console.log(err);
    }
  };

  const features = [
    {
      icon: <MapPin size={28} />,
      title: "Location-Based Reporting",
      description: "Report issues with precise GPS coordinates and interactive maps for accurate location tracking."
    },
    {
      icon: <Zap size={28} />,
      title: "Instant Notifications",
      description: "Get real-time updates on your reports and stay informed about community issues in your area."
    },
    {
      icon: <Shield size={28} />,
      title: "Verified Officials",
      description: "Connect directly with verified government officials and track the progress of your reports."
    },
    {
      icon: <Users size={28} />,
      title: "Community Driven",
      description: "Join a community of engaged citizens working together to improve local infrastructure."
    },
    {
      icon: <Clock size={28} />,
      title: "Quick Response",
      description: "Our smart assignment system ensures your reports reach the right officials quickly."
    },
    {
      icon: <Award size={28} />,
      title: "Transparency",
      description: "Full transparency with public dashboards showing resolution rates and response times."
    }
  ];

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-badge"
          >
            <Lightbulb size={16} />
            Live Reporting System
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="hero-title"
          >
            Smart <span className="gradient-text">Civic</span>
            <br />
            Reporting Platform
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-subtitle"
          >
            Report infrastructure issues, track progress, and help build a better community. 
            Your voice matters in creating positive change.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hero-actions"
          >
            <Link to="/register" className="btn-hero-primary">
              <ArrowRight size={20} />
              Report an Issue
            </Link>
            <button className="btn-hero-secondary">
              <Play size={20} />
              Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="stat-card"
          >
            <div className="stat-number">{stats.totalReports || 1247}</div>
            <div className="stat-label">Total Reports</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="stat-card"
          >
            <div className="stat-number">{stats.resolvedReports || 892}</div>
            <div className="stat-label">Resolved</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="stat-card"
          >
            <div className="stat-number">{stats.inProgressReports || 234}</div>
            <div className="stat-label">In Progress</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="stat-card"
          >
            <div className="stat-number">{stats.newToday || 12}</div>
            <div className="stat-label">New Today</div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="features-header"
          >
            <h2 className="features-title">Powerful Features</h2>
            <p className="features-subtitle">
              Everything you need to report, track, and resolve community issues efficiently
            </p>
          </motion.div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="feature-card"
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;