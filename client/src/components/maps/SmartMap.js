import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { MapPin, Satellite, Navigation, AlertTriangle, Eye } from 'lucide-react';
import { useSocket } from '../../context/socket';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '16px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060 // New York City default
};

const SmartMap = ({ reports = [], onLocationSelect, selectedLocation, showSatellite = true }) => {
  const [map, setMap] = useState(null);
  const [mapType, setMapType] = useState(showSatellite ? 'satellite' : 'roadmap');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const { location, alerts } = useSocket();

  // Update user location
  useEffect(() => {
    if (location) {
      setUserLocation({
        lat: location.latitude,
        lng: location.longitude
      });
    }
  }, [location]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((event) => {
    const clickedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    if (onLocationSelect) {
      onLocationSelect(clickedLocation);
    }
  }, [onLocationSelect]);

  const centerOnUser = useCallback(() => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(16);
    }
  }, [map, userLocation]);

  const toggleMapType = useCallback(() => {
    setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap');
  }, []);

  const getMarkerIcon = (report) => {
    const severity = report.severity || report.aiAnalysis?.severity || 'Medium';
    const isEmergency = report.isEmergency || report.aiAnalysis?.isEmergency;
    
    if (isEmergency) {
      return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#DC2626" stroke="#FFFFFF" stroke-width="2"/>
            <path d="M16 8L18.5 13H24L19.5 16.5L21.5 22L16 18.5L10.5 22L12.5 16.5L8 13H13.5L16 8Z" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32)
      };
    }
    
    const colors = {
      'Critical': '#DC2626',
      'High': '#EA580C',
      'Medium': '#D97706',
      'Low': '#059669'
    };
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="11" fill="${colors[severity] || colors.Medium}" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(24, 24)
    };
  };

  const getAlertMarkerIcon = (alert) => {
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="14" r="13" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
          <path d="M14 6L16 11H21L17 14L18.5 19L14 16L9.5 19L11 14L7 11H12L14 6Z" fill="white"/>
          <animate attributeName="r" values="13;15;13" dur="2s" repeatCount="indefinite"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(28, 28)
    };
  };

  if (!process.env.REACT_APP_GOOGLE_MAPS_KEY || process.env.REACT_APP_GOOGLE_MAPS_KEY === 'your-google-maps-api-key-here') {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Google Maps Integration
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Add your Google Maps API key to enable interactive maps with satellite view and real-time incident tracking.
        </p>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Setup Required:</strong> Add REACT_APP_GOOGLE_MAPS_KEY to your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <motion.button
          onClick={toggleMapType}
          className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={mapType === 'satellite' ? 'Switch to Road View' : 'Switch to Satellite View'}
        >
          <Satellite className={`w-5 h-5 ${mapType === 'satellite' ? 'text-indigo-600' : 'text-gray-600 dark:text-gray-400'}`} />
        </motion.button>

        {userLocation && (
          <motion.button
            onClick={centerOnUser}
            className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Center on My Location"
          >
            <Navigation className="w-5 h-5 text-indigo-600" />
          </motion.button>
        )}
      </div>

      {/* Map */}
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || selectedLocation || defaultCenter}
          zoom={userLocation ? 14 : 10}
          mapTypeId={mapType}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            styles: mapType === 'roadmap' ? [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ] : [],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          }}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="#FFFFFF" stroke-width="3"/>
                    <circle cx="10" cy="10" r="3" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(20, 20)
              }}
              title="Your Location"
            />
          )}

          {/* Selected Location Marker */}
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 2C10.48 2 6 6.48 6 12C6 20 16 30 16 30S26 20 26 12C26 6.48 21.52 2 16 2Z" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
                    <circle cx="16" cy="12" r="4" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(32, 32)
              }}
              title="Selected Location"
            />
          )}

          {/* Report Markers */}
          {reports.map((report) => (
            report.location?.coordinates && (
              <Marker
                key={report._id}
                position={{
                  lat: report.location.coordinates[1],
                  lng: report.location.coordinates[0]
                }}
                icon={getMarkerIcon(report)}
                onClick={() => setSelectedMarker(report)}
                title={report.title}
              />
            )
          ))}

          {/* Alert Markers */}
          {alerts.map((alert) => (
            alert.location?.coordinates && (
              <Marker
                key={alert.id}
                position={{
                  lat: alert.location.coordinates[1],
                  lng: alert.location.coordinates[0]
                }}
                icon={getAlertMarkerIcon(alert)}
                onClick={() => setSelectedMarker(alert)}
                title={`ALERT: ${alert.title}`}
              />
            )
          ))}

          {/* Info Window */}
          {selectedMarker && (
            <InfoWindow
              position={{
                lat: selectedMarker.location?.coordinates?.[1] || selectedMarker.lat,
                lng: selectedMarker.location?.coordinates?.[0] || selectedMarker.lng
              }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-3 max-w-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    selectedMarker.isEmergency || selectedMarker.type === 'critical_alert' 
                      ? 'bg-red-100 text-red-600' 
                      : selectedMarker.severity === 'High' 
                      ? 'bg-orange-100 text-orange-600'
                      : selectedMarker.severity === 'Medium'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {selectedMarker.type === 'proximity_alert' || selectedMarker.type === 'critical_alert' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">
                      {selectedMarker.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      {selectedMarker.description}
                    </p>
                    
                    {selectedMarker.aiAnalysis && (
                      <div className="bg-blue-50 rounded-lg p-2 mb-2">
                        <p className="text-xs text-blue-800 font-semibold">
                          AI Detected: {selectedMarker.aiAnalysis.defectType}
                        </p>
                        <p className="text-xs text-blue-600">
                          Safety Risk: {selectedMarker.aiAnalysis.safetyRisk}/10
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full font-semibold ${
                        selectedMarker.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                        selectedMarker.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                        selectedMarker.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedMarker.severity || 'Medium'}
                      </span>
                      
                      {selectedMarker.distance && (
                        <span className="text-gray-500">
                          {selectedMarker.distance.toFixed(1)}km away
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Map Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Critical Issues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Reports</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartMap;