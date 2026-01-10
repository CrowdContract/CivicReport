# User Roles & Permissions Guide

## 🔐 **Test Accounts & What Each Can Do**

### 👤 **CITIZEN** - `john@example.com / citizen123`
**Role**: Basic user who reports civic issues

#### **What Citizens Can Do:**
- ✅ **Report Issues**: Create new civic reports (potholes, streetlights, etc.)
- ✅ **View Own Reports**: See all reports they've submitted
- ✅ **Track Progress**: Monitor status of their reports (New → In Progress → Resolved)
- ✅ **Add Comments**: Comment on their own reports
- ✅ **Upvote Reports**: Support other citizens' reports
- ✅ **Search Reports**: Find reports by location, category, severity
- ✅ **View Public Reports**: See all community reports (read-only)

#### **Dashboard View:**
```
📊 Statistics: Personal stats (reports submitted, resolved, etc.)
📝 My Reports: List of all reports they've created
🔍 Recent Activity: Latest updates on their reports
➕ Create Report: Quick access to report new issues
```

#### **Permissions:**
- ❌ Cannot assign reports to officials
- ❌ Cannot change report status (except their own)
- ❌ Cannot access admin features
- ❌ Cannot see "Assigned Reports" tab

---

### 🏛️ **OFFICIAL** - `also/ official123`
**Role**: Government official who manages and resolves reports

#### **What Officials Can Do:**
- ✅ **Everything Citizens Can Do** (Officials are also citizens)
- ✅ **View Assigned Reports**: See reports assigned specifically to them
- ✅ **Update Report Status**: Change status (New → In Progress → Resolved)
- ✅ **Add Official Updates**: Provide progress updates to citizens
- ✅ **Manage Department Reports**: Handle reports in their department area
- ✅ **Priority Management**: Work on high-priority/critical reports first

#### **Dashboard View:**
```
📊 Statistics: System-wide stats + personal workload
📝 My Reports: Reports they've personally submitted
📋 Assigned Reports: Reports assigned to them by admin
🔍 Recent Activity: Updates on assigned reports
➕ Create Report: Can also report issues as a citizen
```

#### **Additional Features:**
- 📋 **"Assigned" Tab**: Special dashboard section showing their workload
- 🔄 **Status Updates**: Can update any assigned report's status
- 💬 **Official Comments**: Their updates are marked as "official"
- 📈 **Department View**: See reports relevant to their department

#### **Permissions:**
- ❌ Cannot assign reports to other officials (only Admin can)
- ❌ Cannot delete other users' reports
- ✅ Can update status of assigned reports
- ✅ Can add official updates and comments

---

### 👑 **ADMIN** - `admin@civic.gov / admin123`
**Role**: System administrator with full control

#### **What Admins Can Do:**
- ✅ **Everything Officials Can Do**
- ✅ **Assign Reports**: Assign any report to any official
- ✅ **Manage All Reports**: Edit, delete, or modify any report
- ✅ **User Management**: View all users and their roles
- ✅ **System Statistics**: Access to comprehensive analytics
- ✅ **Override Permissions**: Can modify any report regardless of ownership
- ✅ **Department Management**: Assign reports based on department expertise

#### **Dashboard View:**
```
📊 Statistics: Complete system analytics and metrics
📝 My Reports: Reports they've personally submitted
📋 Assigned Reports: Reports assigned to them
🌐 All Reports: System-wide view of all reports
👥 User Management: Manage citizens and officials
⚙️ System Settings: Configure app settings
```

#### **Special Admin Features:**
- 🎯 **Report Assignment**: Can assign any report to any official
- 🗑️ **Delete Any Report**: Full deletion permissions
- 📊 **Advanced Analytics**: System-wide statistics and trends
- 👥 **User Role Management**: Can modify user permissions
- 🔧 **System Configuration**: Access to app settings

#### **Full Permissions:**
- ✅ Can assign reports to officials
- ✅ Can delete any report
- ✅ Can modify any report
- ✅ Can change any user's role
- ✅ Can access all system features

---

## 🔄 **Workflow Example:**

### **Typical Report Lifecycle:**

1. **Citizen** (`john@example.com`) **reports pothole**:
   - Creates report: "Large pothole on Main Street"
   - Status: "New"
   - Visible to all users

2. **Admin** (`admin@civic.gov`) **assigns report**:
   - Reviews new reports
   - Assigns to Roads Official (`mike@civic.gov`)
   - Status changes to: "In Progress"

3. **Official** (`mike@civic.gov`) **works on report**:
   - Sees report in "Assigned Reports" tab
   - Adds update: "Inspection scheduled for tomorrow"
   - Later updates: "Repair crew dispatched"
   - Finally changes status to: "Resolved"

4. **Citizen** **gets notified**:
   - Sees status updates in their dashboard
   - Can view progress and official comments
   - Can upvote or thank the official

---

## 🎯 **Dashboard Differences by Role:**

### **Citizen Dashboard:**
```
Tabs: [Overview] [My Reports (3)]
- Personal statistics only
- Focus on their submitted reports
- Can create new reports
```

### **Official Dashboard:**
```
Tabs: [Overview] [My Reports (2)] [Assigned (5)]
- System statistics + personal workload
- Their reports + assigned reports
- Can manage assigned reports
```

### **Admin Dashboard:**
```
Tabs: [Overview] [My Reports (1)] [Assigned (8)]
- Complete system analytics
- All reports management
- User and system administration
```

---

## 🔍 **Testing Each Role:**

### **Test as Citizen:**
1. Login: `john@example.com / citizen123`
2. Create a new report
3. View "My Reports" tab
4. Try to assign report (should not see option)

### **Test as Official:**
1. Login: `mike@civic.gov / official123`
2. Check "Assigned Reports" tab
3. Update status of assigned report
4. Add official comment

### **Test as Admin:**
1. Login: `admin@civic.gov / admin123`
2. View all system statistics
3. Assign unassigned reports to officials
4. Manage any report in the system

---

## 📊 **Permission Matrix:**

| Action | Citizen | Official | Admin |
|--------|---------|----------|-------|
| Create Report | ✅ | ✅ | ✅ |
| View Own Reports | ✅ | ✅ | ✅ |
| View All Reports | ✅ (read-only) | ✅ (read-only) | ✅ (full access) |
| Update Own Report | ✅ | ✅ | ✅ |
| Update Assigned Report | ❌ | ✅ | ✅ |
| Update Any Report | ❌ | ❌ | ✅ |
| Assign Reports | ❌ | ❌ | ✅ |
| Delete Own Report | ✅ | ✅ | ✅ |
| Delete Any Report | ❌ | ❌ | ✅ |
| View Statistics | Personal | Personal + Assigned | System-wide |
| Manage Users | ❌ | ❌ | ✅ |

The role system ensures proper separation of concerns while maintaining transparency and accountability in the civic reporting process!