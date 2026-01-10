import mongoose from "mongoose";
import User from "./models/user.js";
import Report from "./models/report.js";
import { DATABASE } from "./config.js";

// Connect to MongoDB
mongoose.set("strictQuery", false);
mongoose
  .connect(DATABASE)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("DB Error => ", err));

const debugData = async () => {
  try {
    console.log("=== DEBUGGING DATABASE DATA ===\n");

    // Get all users
    const users = await User.find({});
    console.log("📋 USERS:");
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user._id} - Role: ${user.role.join(', ')}`);
    });

    // Get all reports
    const reports = await Report.find({})
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email");
    
    console.log(`\n📊 REPORTS (Total: ${reports.length}):`);
    reports.forEach(report => {
      console.log(`- "${report.title}"`);
      console.log(`  Status: ${report.status}`);
      console.log(`  Reported by: ${report.reportedBy?.name} (${report.reportedBy?.email})`);
      console.log(`  Assigned to: ${report.assignedTo?.name || 'Unassigned'} (${report.assignedTo?.email || 'N/A'})`);
      console.log(`  ID: ${report._id}\n`);
    });

    // Check specific user data
    const mike = await User.findOne({ email: "mike@civic.gov" });
    const john = await User.findOne({ email: "john@example.com" });
    const admin = await User.findOne({ email: "admin@civic.gov" });

    if (mike) {
      const mikeReports = await Report.find({ reportedBy: mike._id });
      const mikeAssigned = await Report.find({ assignedTo: mike._id });
      console.log(`🏛️ MIKE'S DATA:`);
      console.log(`- Reports created by Mike: ${mikeReports.length}`);
      console.log(`- Reports assigned to Mike: ${mikeAssigned.length}`);
      mikeAssigned.forEach(report => {
        console.log(`  * ${report.title} (${report.status})`);
      });
    }

    if (john) {
      const johnReports = await Report.find({ reportedBy: john._id });
      console.log(`\n👤 JOHN'S DATA:`);
      console.log(`- Reports created by John: ${johnReports.length}`);
      johnReports.forEach(report => {
        console.log(`  * ${report.title} (${report.status})`);
      });
    }

    if (admin) {
      const adminReports = await Report.find({ reportedBy: admin._id });
      const adminAssigned = await Report.find({ assignedTo: admin._id });
      console.log(`\n👑 ADMIN'S DATA:`);
      console.log(`- Reports created by Admin: ${adminReports.length}`);
      console.log(`- Reports assigned to Admin: ${adminAssigned.length}`);
    }

    console.log("\n=== DEBUG COMPLETE ===");
    process.exit(0);
  } catch (error) {
    console.error("Error debugging data:", error);
    process.exit(1);
  }
};

debugData();