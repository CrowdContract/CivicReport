import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { useSocket } from '../context/socket';
import SmartCamera from '../components/ai/SmartCamera';
import SmartMap from '../components/maps/SmartMap';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  MapPin,
  Camera,
  Zap,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Loader,
  Navigation,
  Smartphone
} from 'lucide-react';

const AIReportCreate = () => {
  const [auth] = useAuth();
  const { location, sendEmergencyReport } = useSocket();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'Medium',
    location: null
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Capture, 2: Details, 3: Location, 4: Review

  // Auto-fill location from GPS
  useEffect(() => {
    if (location && !formData.location) {
      setFormData(prev => ({
        ...prev,
        location: {
          coordinates: [location.longitude, location.latitude],
          address: 'GPS Location'
        }
      }));
    }
  }, [location, formData.location]);

  const handleAIAnalysisComplete = (analysisData) => {
    console.log('AI Analysis Complete:', analysisData);
    
    setAiAnalysis(analysisData.analysis);
    setCapturedImages([analysisData.image]);
    
    // Auto-fill form with AI suggestions
    setFormData(prev => ({
      ...prev,
      title: analysisData.suggestions.title,
      category: analysisData.suggestions.category,
      severity: analysisData.suggestions.severity,
      description: analysisData.analysis.description
    }));

    // Move to next step
    setStep(2);

    // If it's an emergency, show warning
    if (analysisData.suggestions.isEmergency) {
      toast.error('🚨 Emergency situation detected! This will be auto-escalated.', {
        duration: 8000
      });
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    setFormData(prev => ({
      ...prev,
      location: {
        coordinates: [selectedLocation.lng, selectedLocation.lat],
        address: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      
      // Add form fields
      submitFormData.append('title', formData.title);
      submitFormData.append('description', formData.description);
      submitFormData.append('category', formData.category);
      submitFormData.append('severity', formData.severity);
      submitFormData.append('location', JSON.stringify(formData.location));

      // Add images
      capturedImages.forEach((image, index) => {
        if (image.blob) {
          submitFormData.append('images', image.blob, `image_${index}.jpg`);
        }
      });

      const response = await axios.post('/api/ai/report/create', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const report = response.data.report;
        
        toast.success('Report created successfully!');

        // If it's an emergency, send real-time alert
        if (aiAnalysis?.isEmergency || formData.severity === 'Critical') {
          sendEmergencyReport({
            ...report,
            aiAnalysis
          });
        }

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        throw new Error(response.data.error || 'Failed to create report');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Error creating report: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Road Maintenance',
    'Public Safety',
    'Emergency',
    'Traffic Management',
    'Public Utilities',
    'Infrastructure',
    'Pedestrian Safety',
    'Environmental'
  ];

  const severityLevels = [
    { value: 'Low', color: 'emerald', description: 'Minor issue, no immediate danger' },
    { value: 'Medium', color: 'yellow', description: 'Moderate issue, some inconvenience' },
    { value: 'High', color: 'orange', description: 'Serious issue, potential safety risk' },
    { value: 'Critical', color: 'red', description: 'Urgent issue, immediate attention required' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              AI-Powered Report
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Capture road issues with smart AI analysis and real-time alerts
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="flex items-center justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            {[
              { num: 1, label: 'Capture', icon: Camera },
              { num: 2, label: 'Details', icon: Eye },
              { num: 3, label: 'Location', icon: MapPin },
              { num: 4, label: 'Review', icon: CheckCircle }
            ].map((stepItem, index) => (
              <div key={stepItem.num} className="flex items-center gap-4">
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
                  step >= stepItem.num 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  <stepItem.icon className="w-4 h-4" />
                  <span className="font-semibold">{stepItem.label}</span>
                </div>
                {index < 3 && (
                  <div className={`w-8 h-0.5 ${
                    step > stepItem.num ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step 1: Capture */}
        {step === 1 && (
          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl dark:shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Capture Road Issue
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Use your camera or upload a photo for instant AI analysis
              </p>
            </div>

            <SmartCamera
              onAnalysisComplete={handleAIAnalysisComplete}
              onImageCapture={(image) => setCapturedImages([{ blob: image, url: URL.createObjectURL(image) }])}
            />

            {!aiAnalysis && (
              <div className="mt-8 text-center">
                <motion.button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Skip AI Analysis
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl dark:shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Report Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {aiAnalysis ? 'Review and edit AI-generated details' : 'Provide details about the issue'}
              </p>
            </div>

            {/* AI Analysis Summary */}
            {aiAnalysis && (
              <motion.div
                className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-6 mb-8 border border-indigo-200 dark:border-indigo-700"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      AI Analysis Results
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{aiAnalysis.defectType}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Severity:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{aiAnalysis.severity}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Safety Risk:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{aiAnalysis.safetyRisk}/10</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Confidence:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{Math.round(aiAnalysis.confidence * 100)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <form className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Report Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brief description of the issue"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Severity Level
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {severityLevels.map(level => (
                    <motion.button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.severity === level.value
                          ? `border-${level.color}-500 bg-${level.color}-50 dark:bg-${level.color}-900/30`
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-4 h-4 rounded-full bg-${level.color}-500 mx-auto mb-2`} />
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{level.value}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{level.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Detailed description of the issue"
                />
              </div>

              {/* Navigation */}
              <div className="flex gap-4 pt-6">
                <motion.button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next: Location
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl dark:shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Select Location
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {location ? 'GPS location detected. Click on map to adjust if needed.' : 'Click on the map to select the issue location'}
              </p>
            </div>

            {/* Current Location Info */}
            {formData.location && (
              <motion.div
                className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-4 mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-200">Location Selected</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      {formData.location.address}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Map */}
            <div className="mb-6">
              <SmartMap
                onLocationSelect={handleLocationSelect}
                selectedLocation={formData.location ? {
                  lat: formData.location.coordinates[1],
                  lng: formData.location.coordinates[0]
                } : null}
                showSatellite={true}
              />
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <motion.button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => setStep(4)}
                disabled={!formData.location}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: formData.location ? 1.02 : 1 }}
                whileTap={{ scale: formData.location ? 0.98 : 1 }}
              >
                Review & Submit
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl dark:shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Review Report
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please review your report before submitting
              </p>
            </div>

            {/* Report Summary */}
            <div className="space-y-6 mb-8">
              {/* Images */}
              {capturedImages.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Captured Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {capturedImages.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`Captured ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Report Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Title:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.category}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Severity:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                        formData.severity === 'Critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        formData.severity === 'High' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                        formData.severity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {formData.severity}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Description:</span>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{formData.description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Location & AI Analysis</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.location?.address}</p>
                    </div>
                    
                    {aiAnalysis && (
                      <>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">AI Detected:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{aiAnalysis.defectType}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Safety Risk:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{aiAnalysis.safetyRisk}/10</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">AI Confidence:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{Math.round(aiAnalysis.confidence * 100)}%</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Warning */}
            {(aiAnalysis?.isEmergency || formData.severity === 'Critical') && (
              <motion.div
                className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-2xl p-6 mb-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-bold text-red-800 dark:text-red-200">Emergency Alert</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm">
                      This report will be automatically escalated and nearby users will be alerted immediately.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit */}
            <form onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <motion.button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIReportCreate;