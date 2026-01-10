import { Server } from 'socket.io';
import * as geolib from 'geolib';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> { socketId, location, lastSeen }
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user authentication and location
      socket.on('user_connected', (data) => {
        const { userId, location, userInfo } = data;
        
        this.connectedUsers.set(userId, {
          socketId: socket.id,
          location: location,
          userInfo: userInfo,
          lastSeen: new Date()
        });

        socket.userId = userId;
        console.log(`User ${userId} connected with location:`, location);
      });

      // Handle location updates
      socket.on('location_update', (data) => {
        const { userId, location } = data;
        
        if (this.connectedUsers.has(userId)) {
          const user = this.connectedUsers.get(userId);
          user.location = location;
          user.lastSeen = new Date();
          this.connectedUsers.set(userId, user);
        }
      });

      // Handle emergency report
      socket.on('emergency_report', (reportData) => {
        this.handleEmergencyReport(reportData, socket);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`User ${socket.userId} disconnected`);
        }
      });
    });

    return this.io;
  }

  // Send alert to users within radius of incident
  async sendProximityAlert(incident, radiusKm = 5) {
    if (!incident.location || !incident.location.coordinates) {
      console.log('No location data for incident');
      return;
    }

    const incidentLocation = {
      latitude: incident.location.coordinates[1],
      longitude: incident.location.coordinates[0]
    };

    const nearbyUsers = [];

    // Find users within radius
    for (const [userId, userData] of this.connectedUsers.entries()) {
      if (!userData.location) continue;

      const userLocation = {
        latitude: userData.location.latitude,
        longitude: userData.location.longitude
      };

      const distance = geolib.getDistance(incidentLocation, userLocation);
      const distanceKm = distance / 1000;

      if (distanceKm <= radiusKm) {
        nearbyUsers.push({
          userId,
          socketId: userData.socketId,
          distance: distanceKm,
          userInfo: userData.userInfo
        });
      }
    }

    // Send alerts to nearby users
    const alertData = {
      id: incident._id,
      type: 'proximity_alert',
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      category: incident.category,
      location: {
        address: incident.location.address,
        coordinates: incident.location.coordinates
      },
      distance: null, // Will be set per user
      timestamp: new Date(),
      isEmergency: incident.isEmergency || false
    };

    nearbyUsers.forEach(user => {
      alertData.distance = user.distance;
      this.io.to(user.socketId).emit('proximity_alert', alertData);
    });

    console.log(`Sent proximity alert to ${nearbyUsers.length} users within ${radiusKm}km`);
    return nearbyUsers.length;
  }

  // Handle emergency reports
  async handleEmergencyReport(reportData, socket) {
    console.log('Emergency report received:', reportData);

    // Immediately alert all nearby users
    await this.sendProximityAlert(reportData, 10); // 10km radius for emergencies

    // Send to emergency services (if configured)
    this.notifyEmergencyServices(reportData);

    // Acknowledge receipt
    socket.emit('emergency_acknowledged', {
      reportId: reportData._id,
      message: 'Emergency report received and alerts sent to nearby users'
    });
  }

  // Send critical incident alerts
  async sendCriticalAlert(incident) {
    const alertData = {
      id: incident._id,
      type: 'critical_alert',
      title: `🚨 CRITICAL: ${incident.title}`,
      description: incident.description,
      severity: 'Critical',
      category: incident.category,
      location: incident.location,
      timestamp: new Date(),
      isEmergency: true
    };

    // Send to all connected users
    this.io.emit('critical_alert', alertData);
    
    // Also send proximity alert
    await this.sendProximityAlert(incident, 15); // 15km radius for critical alerts

    console.log('Critical alert sent to all users');
  }

  // Send report status updates
  async sendStatusUpdate(reportId, status, userId) {
    const updateData = {
      reportId,
      status,
      timestamp: new Date(),
      type: 'status_update'
    };

    // Send to report creator
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit('report_status_update', updateData);
    }

    // Send to nearby users if resolved
    if (status === 'Resolved') {
      // This would require fetching the report from database
      // For now, just log
      console.log(`Report ${reportId} resolved - should notify nearby users`);
    }
  }

  // Notify emergency services (placeholder)
  async notifyEmergencyServices(incident) {
    // This would integrate with emergency services APIs
    console.log('🚨 EMERGENCY SERVICES NOTIFIED:', {
      type: incident.defectType || incident.category,
      location: incident.location?.address,
      severity: incident.severity,
      description: incident.description
    });

    // Could integrate with:
    // - Local emergency services APIs
    // - SMS/Email alerts to authorities
    // - Integration with 911 systems
    // - Municipal emergency management systems
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get users in area
  getUsersInArea(location, radiusKm = 5) {
    const usersInArea = [];
    
    for (const [userId, userData] of this.connectedUsers.entries()) {
      if (!userData.location) continue;

      const distance = geolib.getDistance(location, userData.location);
      const distanceKm = distance / 1000;

      if (distanceKm <= radiusKm) {
        usersInArea.push({
          userId,
          distance: distanceKm,
          userInfo: userData.userInfo
        });
      }
    }

    return usersInArea;
  }
}

export default new SocketService();