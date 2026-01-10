import mongoose from "mongoose";
import User from "./models/user.js";
import Report from "./models/report.js";
import { hashPassword } from "./helpers/auth.js";
import { DATABASE } from "./config.js";

// Connect to MongoDB
mongoose.set("strictQuery", false);
mongoose
  .connect(DATABASE)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("DB Error => ", err));

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Report.deleteMany({});
    console.log("Cleared existing data");

    // Create users
    const adminPassword = await hashPassword("admin123");
    const citizenPassword = await hashPassword("citizen123");
    const officialPassword = await hashPassword("official123");

    const admin = await User.create({
      username: "admin",
      name: "System Admin",
      email: "admin@civic.gov",
      password: adminPassword,
      role: ["Admin", "Official", "Citizen"],
      phone: "555-0001",
      department: "General",
    });

    const citizen1 = await User.create({
      username: "john_citizen",
      name: "John Citizen",
      email: "john@example.com",
      password: citizenPassword,
      role: ["Citizen"],
      phone: "555-0002",
      address: "123 Main Street, New York, NY",
    });

    const citizen2 = await User.create({
      username: "jane_citizen",
      name: "Jane Citizen",
      email: "jane@example.com",
      password: citizenPassword,
      role: ["Citizen"],
      phone: "555-0003",
      address: "456 Oak Avenue, Los Angeles, CA",
    });

    const official1 = await User.create({
      username: "roads_official",
      name: "Mike Roads",
      email: "mike@civic.gov",
      password: officialPassword,
      role: ["Official", "Citizen"],
      phone: "555-0004",
      department: "Roads",
    });

    const official2 = await User.create({
      username: "traffic_official",
      name: "Sarah Traffic",
      email: "sarah@civic.gov",
      password: officialPassword,
      role: ["Official", "Citizen"],
      phone: "555-0005",
      department: "Traffic",
    });

    console.log("Created users:");
    console.log("- Admin: admin@civic.gov / admin123");
    console.log("- Citizen 1: john@example.com / citizen123");
    console.log("- Citizen 2: jane@example.com / citizen123");
    console.log("- Roads Official: mike@civic.gov / official123");
    console.log("- Traffic Official: sarah@civic.gov / official123");

    // Create sample reports
    const sampleReports = [
      {
        title: "Large Pothole on Main Street",
        description:
          "There is a dangerous pothole near the intersection of Main St and 5th Ave. It's about 2 feet wide and causing damage to vehicles.",
        category: "Pothole",
        type: "Infrastructure",
        severity: "High",
        status: "New",
        location: {
          address: "Main Street & 5th Avenue, New York, NY 10001",
          city: "New York",
          coordinates: [-73.935242, 40.73061],
        },
        reportedBy: citizen1._id,
      },
      {
        title: "Streetlight Not Working",
        description:
          "The streetlight at Oak Avenue has been out for 3 days. This area is very dark at night and poses a safety risk.",
        category: "Streetlight",
        type: "Infrastructure",
        severity: "Medium",
        status: "In Progress",
        location: {
          address: "456 Oak Avenue, Los Angeles, CA 90001",
          city: "Los Angeles",
          coordinates: [-118.2437, 34.0522],
        },
        reportedBy: citizen2._id,
        assignedTo: official1._id,
        updates: [
          {
            message: "Report received. Inspection scheduled for tomorrow.",
            updatedBy: official1._id,
            timestamp: new Date(),
          },
        ],
      },
      {
        title: "Water Leakage on Park Road",
        description:
          "Continuous water leakage from underground pipe. Water is flooding the road.",
        category: "Water Supply",
        type: "Infrastructure",
        severity: "Critical",
        status: "In Progress",
        location: {
          address: "789 Park Road, Austin, TX 78701",
          city: "Austin",
          coordinates: [-97.7431, 30.2672],
        },
        reportedBy: citizen1._id,
        assignedTo: admin._id,
        updates: [
          {
            message: "Emergency crew dispatched to the location.",
            updatedBy: admin._id,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            message: "Repair work in progress. Expected completion in 4 hours.",
            updatedBy: admin._id,
            timestamp: new Date(),
          },
        ],
      },
      {
        title: "Broken Traffic Signal",
        description:
          "Traffic signal at the intersection is not working properly. All lights are blinking red.",
        category: "Traffic Signal",
        type: "Infrastructure",
        severity: "High",
        status: "New",
        location: {
          address: "Broadway & 42nd Street, New York, NY 10036",
          city: "New York",
          coordinates: [-73.9855, 40.7580],
        },
        reportedBy: citizen2._id,
      },
      {
        title: "Illegal Parking Blocking Fire Hydrant",
        description:
          "A vehicle has been parked in front of a fire hydrant for 2 days. License plate: ABC-1234",
        category: "Other Infrastructure",
        type: "Traffic Violation",
        severity: "Medium",
        status: "New",
        location: {
          address: "5th Avenue, New York, NY 10011",
          city: "New York",
          coordinates: [-73.9969, 40.7357],
        },
        reportedBy: citizen1._id,
      },
      {
        title: "Garbage Not Collected for 5 Days",
        description:
          "Garbage bins on our street haven't been emptied for 5 days. Starting to smell and attract pests.",
        category: "Garbage",
        type: "Infrastructure",
        severity: "Medium",
        status: "Resolved",
        location: {
          address: "Elm Street, Los Angeles, CA 90012",
          city: "Los Angeles",
          coordinates: [-118.2426, 34.0536],
        },
        reportedBy: citizen2._id,
        assignedTo: official1._id,
        resolvedAt: new Date(),
        updates: [
          {
            message: "Garbage collection scheduled for today.",
            updatedBy: official1._id,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          {
            message: "Garbage collected. Issue resolved.",
            updatedBy: official1._id,
            timestamp: new Date(),
          },
        ],
      },
    ];

    for (const reportData of sampleReports) {
      await Report.create(reportData);
    }

    console.log(`\nCreated ${sampleReports.length} sample reports`);
    console.log("\nReport Categories:");
    console.log("- Infrastructure: Pothole, Streetlight, Water, Drainage, Roads, Traffic Signals, Garbage");
    console.log("- Traffic Violations: Illegal parking, speeding, etc.");
    console.log("\nSeverity Levels: Low, Medium, High, Critical");
    console.log("Status: New, In Progress, Resolved, Rejected, Closed");
    
    console.log("\n✅ Seed data created successfully!");
    console.log("\nYou can now login with any of the above credentials");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
