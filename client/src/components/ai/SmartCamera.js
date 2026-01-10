import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  RotateCcw, 
  Check, 
  X, 
  Zap, 
  MapPin, 
  AlertTriangle,
  Loader,
  Upload,
  Eye
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SmartCamera = ({ onAnalysisComplete, onImageCapture }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [location, setLocation] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location error:', error);
        }
      );
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsOpen(true);
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Unable to access camera. Please check permissions.');
      toast.error('Camera access denied');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsOpen(false);
    setCapturedImage(null);
    setAnalysis(null);
  }, [stream]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      setCapturedImage({
        blob,
        url: canvas.toDataURL('image/jpeg', 0.8)
      });
      
      if (onImageCapture) {
        onImageCapture(blob);
      }
    }, 'image/jpeg', 0.8);
  }, [onImageCapture]);

  const analyzeImage = useCallback(async (imageBlob) => {
    if (!imageBlob) return;

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', imageBlob);

      const response = await axios.post('/api/ai/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const analysisResult = response.data.analysis;
        setAnalysis(analysisResult);
        
        if (onAnalysisComplete) {
          onAnalysisComplete({
            analysis: analysisResult,
            suggestions: response.data.suggestions,
            location,
            image: capturedImage
          });
        }

        // Show analysis result
        toast.success(`AI detected: ${analysisResult.defectType} (${analysisResult.severity})`);
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('AI analysis failed: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [capturedImage, location, onAnalysisComplete]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage({
        blob: file,
        url: e.target.result
      });
      setIsOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setAnalysis(null);
  }, []);

  const confirmPhoto = useCallback(() => {
    if (capturedImage) {
      analyzeImage(capturedImage.blob);
    }
  }, [capturedImage, analyzeImage]);

  return (
    <>
      {/* Camera Trigger Buttons */}
      <div className="flex gap-4 mb-6">
        <motion.button
          onClick={startCamera}
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Camera className="w-5 h-5" />
          <span>Smart Camera</span>
          <Zap className="w-4 h-4" />
        </motion.button>

        <motion.button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Upload className="w-5 h-5" />
          <span>Upload Photo</span>
        </motion.button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      AI Road Detection
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Capture road issues for instant AI analysis
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={stopCamera}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              {/* Camera Error */}
              {cameraError && (
                <motion.div
                  className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-2xl p-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-700 dark:text-red-300">{cameraError}</p>
                  </div>
                </motion.div>
              )}

              {/* Camera View or Captured Image */}
              <div className="relative mb-6">
                {!capturedImage ? (
                  <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Location Indicator */}
                    {location && (
                      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                      </div>
                    )}

                    {/* Capture Button */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                      <motion.button
                        onClick={captureImage}
                        className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={capturedImage.url}
                      alt="Captured"
                      className="w-full rounded-2xl"
                    />
                    
                    {/* Analysis Overlay */}
                    {analysis && (
                      <motion.div
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 m-4 max-w-md">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-xl ${
                              analysis.severity === 'Critical' ? 'bg-red-100 dark:bg-red-900/30' :
                              analysis.severity === 'High' ? 'bg-orange-100 dark:bg-orange-900/30' :
                              analysis.severity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                              'bg-emerald-100 dark:bg-emerald-900/30'
                            }`}>
                              <Eye className={`w-6 h-6 ${
                                analysis.severity === 'Critical' ? 'text-red-600 dark:text-red-400' :
                                analysis.severity === 'High' ? 'text-orange-600 dark:text-orange-400' :
                                analysis.severity === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-emerald-600 dark:text-emerald-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                AI Analysis Complete
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Confidence: {Math.round(analysis.confidence * 100)}%
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Detected Issue:</span>
                              <p className="font-bold text-gray-900 dark:text-white">{analysis.defectType}</p>
                            </div>
                            
                            <div>
                              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Severity:</span>
                              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                                analysis.severity === 'Critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                analysis.severity === 'High' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                analysis.severity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              }`}>
                                {analysis.severity}
                              </span>
                            </div>
                            
                            <div>
                              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Safety Risk:</span>
                              <p className="text-gray-900 dark:text-white">{analysis.safetyRisk}/10</p>
                            </div>
                            
                            <div>
                              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Description:</span>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">{analysis.description}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {capturedImage && (
                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={retakePhoto}
                    className="flex items-center gap-3 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Retake</span>
                  </motion.button>

                  <motion.button
                    onClick={confirmPhoto}
                    disabled={isAnalyzing}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Analyze with AI</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartCamera;