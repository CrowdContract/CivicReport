import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './auth';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(null);
  const [auth] = useAuth();

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

      // Watch position changes
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location watch error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (auth.user && auth.token) {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000';
      const newSocket = io(socketUrl, {
        auth: {
          token: auth.token
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        
        // Send user info and location
        newSocket.emit('user_connected', {
          userId: auth.user._id,
          location: location,
          userInfo: {
            name: auth.user.name,
            email: auth.user.email,
            role: auth.user.role
          }
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Handle proximity alerts
      newSocket.on('proximity_alert', (alertData) => {
        console.log('Proximity alert received:', alertData);
        
        const alertMessage = `🚨 ${alertData.title} - ${alertData.distance?.toFixed(1)}km away`;
        
        // Show toast notification
        toast.error(alertMessage, {
          duration: 8000,
          icon: '🚨',
          style: {
            background: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #FECACA'
          }
        });

        // Add to alerts list
        setAlerts(prev => [alertData, ...prev.slice(0, 9)]); // Keep last 10 alerts

        // Request notification permission and show browser notification
        if (Notification.permission === 'granted') {
          new Notification(`Civic Alert: ${alertData.title}`, {
            body: `${alertData.description} - ${alertData.distance?.toFixed(1)}km from your location`,
            icon: '/logo192.png',
            tag: alertData.id
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(`Civic Alert: ${alertData.title}`, {
                body: `${alertData.description} - ${alertData.distance?.toFixed(1)}km from your location`,
                icon: '/logo192.png',
                tag: alertData.id
              });
            }
          });
        }
      });

      // Handle critical alerts
      newSocket.on('critical_alert', (alertData) => {
        console.log('Critical alert received:', alertData);
        
        const alertMessage = `🚨 CRITICAL: ${alertData.title}`;
        
        // Show persistent toast
        toast.error(alertMessage, {
          duration: 15000,
          icon: '🚨',
          style: {
            background: '#7F1D1D',
            color: '#FFFFFF',
            border: '2px solid #DC2626'
          }
        });

        // Add to alerts list
        setAlerts(prev => [alertData, ...prev.slice(0, 9)]);

        // Force browser notification
        if (Notification.permission === 'granted') {
          new Notification(`🚨 CRITICAL ALERT: ${alertData.title}`, {
            body: alertData.description,
            icon: '/logo192.png',
            tag: alertData.id,
            requireInteraction: true
          });
        }
      });

      // Handle report status updates
      newSocket.on('report_status_update', (updateData) => {
        console.log('Report status update:', updateData);
        
        toast.success(`Report status updated to: ${updateData.status}`, {
          icon: '📋'
        });
      });

      // Handle emergency acknowledgment
      newSocket.on('emergency_acknowledged', (data) => {
        console.log('Emergency acknowledged:', data);
        
        toast.success('Emergency report received! Alerts sent to nearby users.', {
          icon: '🚨',
          duration: 6000
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [auth.user, auth.token, location]);

  // Update location when it changes
  useEffect(() => {
    if (socket && location && isConnected) {
      socket.emit('location_update', {
        userId: auth.user?._id,
        location: location
      });
    }
  }, [socket, location, isConnected, auth.user]);

  // Send emergency report
  const sendEmergencyReport = (reportData) => {
    if (socket && isConnected) {
      socket.emit('emergency_report', {
        ...reportData,
        location: location,
        timestamp: new Date()
      });
    }
  };

  // Clear alerts
  const clearAlerts = () => {
    setAlerts([]);
  };

  // Remove specific alert
  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const value = {
    socket,
    isConnected,
    alerts,
    location,
    sendEmergencyReport,
    clearAlerts,
    removeAlert
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};