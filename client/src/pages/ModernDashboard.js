import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/auth";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  Filter,
  Search,
  Calendar,
  Eye,
  ArrowUpRight,
  Target,
  Bell,
  MoreHorizontal,
  Activity,
  Star,
  ChevronRight
} from "lucide-react";

const ModernDashboard = () => {
  const [auth] = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [assignedReports, setAssignedReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const isOfficial = auth.user?.role?.includes("Official");
  const isAdmin = auth.user?.role?.includes("Admin");

  const fetchDashboardData = useCallback(async () => {
    try {
      const [myReportsRes, statsRes, assignedRes] = await Promise.all([
        axios.get("/user-reports/1"),
        axios.get("/reports/statistics"),
        (isOfficial || isAdmin) ? axios.get("/assigned-reports") : Promise.resolve({ data: [] })
      ]);

      setMyReports(myReportsRes.data.reports || []);
      setStats(statsRes.data);
      setAssignedReports(assignedRes.data || []);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }, [isOfficial, isAdmin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-gray-600 dark:text-gray-300 text-lg font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }
  const StatCard = ({ icon, title, value, change, trend, color = "indigo", delay = 0 }) => (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      className="group relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: "spring" }}
    >
      <div className={`relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-500 group-hover:shadow-2xl dark:group-hover:shadow-indigo-500/10 group-hover:border-${color}-200 dark:group-hover:border-${color}-500/30`}>
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-${color}-600/10 dark:from-${color}-400/10 dark:to-${color}-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 bg-${color}-400/30 rounded-full`}
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
              }}
              animate={{
                y: [-10, -20, -10],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className={`p-4 rounded-2xl bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg group-hover:shadow-${color}-500/50 transition-all duration-300 group-hover:scale-110`}>
              <div className="text-white">
                {icon}
              </div>
            </div>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <ArrowUpRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {title}
            </p>
            <motion.p 
              className="text-4xl font-bold text-gray-900 dark:text-white"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.3, duration: 0.5, type: "spring" }}
            >
              {value}
            </motion.p>
            {change && (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.5, duration: 0.4 }}
              >
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  trend === 'up' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
                  <span className="text-xs font-bold">{change}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
  const ReportCard = ({ report, showAssignee = false, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="group relative overflow-hidden"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg dark:shadow-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-indigo-500/10 transition-all duration-500 hover:border-indigo-200 dark:hover:border-indigo-500/30">
        {/* Animated border gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
             style={{ padding: '1px' }}>
          <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <motion.div 
                className={`p-3 rounded-xl ${
                  report.severity === 'Critical' ? 'bg-red-100 dark:bg-red-900/30' :
                  report.severity === 'High' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  report.severity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                  'bg-emerald-100 dark:bg-emerald-900/30'
                }`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <AlertTriangle className={`w-5 h-5 ${
                  report.severity === 'Critical' ? 'text-red-600 dark:text-red-400' :
                  report.severity === 'High' ? 'text-orange-600 dark:text-orange-400' :
                  report.severity === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-emerald-600 dark:text-emerald-400'
                }`} />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <motion.h3 
                  className="font-bold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  {report.title}
                </motion.h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">
                  {report.category}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                  {report.description}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <motion.span 
                className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm ${
                  report.status === 'New' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-blue-200/50' :
                  report.status === 'In Progress' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-orange-200/50' :
                  report.status === 'Resolved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-emerald-200/50' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {report.status}
              </motion.span>
              
              <motion.button 
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <MoreHorizontal className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{report.location?.city || 'Unknown'}</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Calendar className="w-4 h-4" />
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              </motion.div>
              {report.views && (
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Eye className="w-4 h-4" />
                  <span>{report.views}</span>
                </motion.div>
              )}
            </div>
            
            {showAssignee && report.assignedTo && (
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs text-white font-bold">
                    {report.assignedTo.name?.charAt(0)}
                  </span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {report.assignedTo.name}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
  const QuickAction = ({ icon, title, description, onClick, color = "indigo", delay = 0 }) => (
    <motion.button
      onClick={onClick}
      className="group relative overflow-hidden w-full text-left"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg dark:shadow-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-indigo-500/10 transition-all duration-500 hover:border-indigo-200 dark:hover:border-indigo-500/30">
        {/* Animated background */}
        <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-${color}-600/10 dark:from-${color}-400/10 dark:to-${color}-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="relative z-10 flex items-center gap-4">
          <motion.div 
            className={`p-4 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg group-hover:shadow-${color}-500/50`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="text-white">
              {icon}
            </div>
          </motion.div>
          
          <div className="flex-1">
            <motion.h3 
              className="font-bold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300"
              whileHover={{ x: 5 }}
            >
              {title}
            </motion.h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {description}
            </p>
          </div>
          
          <motion.div
            className="text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-300"
            whileHover={{ x: 5, scale: 1.1 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );

  const EmptyState = ({ icon, title, description, actionText, actionLink, delay = 0 }) => (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: "spring" }}
    >
      <motion.div 
        className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <div className="text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
      </motion.div>
      
      <motion.h3 
        className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {title}
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
      >
        {description}
      </motion.p>
      
      {actionText && actionLink && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.4 }}
        >
          <Link to={actionLink}>
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {actionText}
            </motion.button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 dark:from-indigo-400/5 dark:to-purple-400/5 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div 
        className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-2">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span className="text-white font-bold text-lg">
                    {auth.user?.name?.charAt(0) || auth.user?.username?.charAt(0) || 'U'}
                  </span>
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {auth.user?.name || auth.user?.username}! 👋
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Here's what's happening with your civic reports today.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.button 
                className="flex items-center gap-3 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium shadow-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter className="w-5 h-5" />
                <span>Filter</span>
              </motion.button>
              
              <Link to="/report/create">
                <motion.button
                  className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-5 h-5" />
                  <span>New Report</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard
            icon={<BarChart3 className="w-7 h-7" />}
            title="Total Reports"
            value={stats.totalReports || 0}
            change="+12%"
            trend="up"
            color="indigo"
            delay={0}
          />
          
          <StatCard
            icon={<Clock className="w-7 h-7" />}
            title="In Progress"
            value={stats.inProgress || 0}
            change="+5%"
            trend="up"
            color="orange"
            delay={0.1}
          />
          
          <StatCard
            icon={<CheckCircle className="w-7 h-7" />}
            title="Resolved"
            value={stats.resolved || 0}
            change="+18%"
            trend="up"
            color="emerald"
            delay={0.2}
          />
          
          <StatCard
            icon={<AlertTriangle className="w-7 h-7" />}
            title="New Reports"
            value={stats.newReports || 0}
            change="-3%"
            trend="down"
            color="red"
            delay={0.3}
          />
        </motion.div>
        {/* Navigation Tabs */}
        <motion.div
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-2 shadow-xl dark:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex gap-2">
            {[
              { id: "overview", label: "Overview", count: null },
              { id: "my-reports", label: "My Reports", count: myReports.length },
              ...(isOfficial || isAdmin ? [{ id: "assigned", label: "Assigned", count: assignedReports.length }] : [])
            ].map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-3 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <motion.span 
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id 
                        ? "bg-white/20 text-white" 
                        : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {tab.count}
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Actions */}
                <div>
                  <motion.h2 
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Quick Actions
                  </motion.h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <QuickAction
                      icon={<Plus className="w-6 h-6" />}
                      title="Report Issue"
                      description="Submit a new civic report"
                      onClick={() => window.location.href = '/report/create'}
                      color="indigo"
                      delay={0.3}
                    />
                    <QuickAction
                      icon={<Search className="w-6 h-6" />}
                      title="Browse Reports"
                      description="View all community reports"
                      onClick={() => window.location.href = '/reports'}
                      color="emerald"
                      delay={0.4}
                    />
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <motion.h2 
                      className="text-2xl font-bold text-gray-900 dark:text-white"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Recent Activity
                    </motion.h2>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Link to="/reports" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold text-sm flex items-center gap-2 group">
                        View all
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-6">
                    {myReports.slice(0, 3).map((report, index) => (
                      <ReportCard key={report._id} report={report} delay={0.7 + index * 0.1} />
                    ))}
                    
                    {myReports.length === 0 && (
                      <EmptyState
                        icon={<AlertTriangle className="w-12 h-12" />}
                        title="No reports yet"
                        description="You haven't submitted any reports yet. Start by reporting your first civic issue to help improve your community."
                        actionText="Create Your First Report"
                        actionLink="/report/create"
                        delay={0.7}
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* Sidebar */}
              <div className="space-y-8">
                {/* Performance Summary */}
                <motion.div 
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl dark:shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Performance</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Response Rate</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">94%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '94%' }}
                          transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Avg. Resolution Time</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">2.3 days</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '76%' }}
                          transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Recent Notifications */}
                <motion.div 
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl dark:shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { icon: Bell, color: "blue", text: "New report assigned", time: "2 hours ago" },
                      { icon: CheckCircle, color: "emerald", text: "Report resolved", time: "1 day ago" },
                      { icon: Star, color: "yellow", text: "Report upvoted", time: "2 days ago" }
                    ].map((notification, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300 cursor-pointer group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className={`p-2 rounded-xl bg-${notification.color}-100 dark:bg-${notification.color}-900/30 group-hover:scale-110 transition-transform duration-300`}>
                          <notification.icon className={`w-4 h-4 text-${notification.color}-600 dark:text-${notification.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {notification.text}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
          {activeTab === "my-reports" && (
            <motion.div
              key="my-reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <motion.h2 
                  className="text-3xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  My Reports
                </motion.h2>
                <motion.div 
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button 
                    className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </motion.button>
                  <motion.button 
                    className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </motion.button>
                </motion.div>
              </div>
              
              <div className="space-y-6">
                {myReports.map((report, index) => (
                  <ReportCard key={report._id} report={report} delay={0.4 + index * 0.1} />
                ))}
                
                {myReports.length === 0 && (
                  <EmptyState
                    icon={<AlertTriangle className="w-16 h-16" />}
                    title="No reports yet"
                    description="You haven't submitted any reports yet. Start by reporting your first civic issue to help improve your community."
                    actionText="Create Your First Report"
                    actionLink="/report/create"
                    delay={0.4}
                  />
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "assigned" && (isOfficial || isAdmin) && (
            <motion.div
              key="assigned"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <motion.h2 
                  className="text-3xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Assigned Reports
                </motion.h2>
                <motion.div 
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button 
                    className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </motion.button>
                  <motion.button 
                    className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </motion.button>
                </motion.div>
              </div>
              
              <div className="space-y-6">
                {assignedReports.map((report, index) => (
                  <ReportCard key={report._id} report={report} showAssignee={false} delay={0.4 + index * 0.1} />
                ))}
                
                {assignedReports.length === 0 && (
                  <EmptyState
                    icon={<Target className="w-16 h-16" />}
                    title="No assigned reports"
                    description="You don't have any reports assigned to you at the moment. Check back later or contact your administrator."
                    delay={0.4}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModernDashboard;