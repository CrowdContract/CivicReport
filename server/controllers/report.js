import Report from "../models/report.js";
import User from "../models/user.js";
import slugify from "slugify";

export const createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      severity,
      location,
      photos,
    } = req.body;

    // Validation
    if (!title || !description || !category || !location?.address) {
      return res.json({ error: "All required fields must be provided" });
    }

    // Create report
    const report = await new Report({
      ...req.body,
      reportedBy: req.user._id,
    }).save();

    // Update user role to include Official if creating infrastructure report
    if (type === "Infrastructure") {
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { role: "Official" } },
        { new: true }
      );
    }

    res.json({ report });
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong. Try again." });
  }
};

export const getReports = async (req, res) => {
  try {
    const { status, category, severity, type } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (type) query.type = type;

    const reports = await Report.find(query)
      .populate("reportedBy", "name username email")
      .populate("assignedTo", "name username department")
      .sort({ createdAt: -1 })
      .limit(24);

    res.json(reports);
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong" });
  }
};

export const getReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("reportedBy", "name username email phone")
      .populate("assignedTo", "name username department")
      .populate("updates.updatedBy", "name username");

    res.json(report);
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong" });
  }
};

export const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    // Check if user is authorized (reporter, assigned official, or admin)
    const isAuthorized =
      report.reportedBy.toString() === req.user._id.toString() ||
      report.assignedTo?.toString() === req.user._id.toString() ||
      req.user.role.includes("Admin");

    if (!isAuthorized) {
      return res.json({ error: "Unauthorized" });
    }

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong" });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    // Only reporter or admin can delete
    const isAuthorized =
      report.reportedBy.toString() === req.user._id.toString() ||
      req.user.role.includes("Admin");

    if (!isAuthorized) {
      return res.json({ error: "Unauthorized" });
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong" });
  }
};

export const addUpdate = async (req, res) => {
  try {
    const { message } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          updates: {
            message,
            updatedBy: req.user._id,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    ).populate("updates.updatedBy", "name username");

    res.json(report);
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong" });
  }
};

export const upvoteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    const alreadyUpvoted = report.upvotes.includes(req.user._id);

    if (alreadyUpvoted) {
      // Remove upvote
      await Report.findByIdAndUpdate(req.params.id, {
        $pull: { upvotes: req.user._id },
      });
    } else {
      // Add upvote
      await Report.findByIdAndUpdate(req.params.id, {
        $addToSet: { upvotes: req.user._id },
      });
    }

    const updated = await Report.findById(req.params.id);
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong" });
  }
};

export const getUserReports = async (req, res) => {
  try {
    const page = req.params.page ? req.params.page : 1;
    const perPage = 6;

    const reports = await Report.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const total = await Report.countDocuments({ reportedBy: req.user._id });

    res.json({ reports, total });
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong" });
  }
};

export const getAssignedReports = async (req, res) => {
  try {
    const reports = await Report.find({ assignedTo: req.user._id })
      .populate("reportedBy", "name username email phone")
      .sort({ severity: -1, createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong" });
  }
};

export const assignReport = async (req, res) => {
  try {
    // Only admin can assign
    if (!req.user.role.includes("Admin")) {
      return res.json({ error: "Unauthorized" });
    }

    const { officialId } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: officialId,
        status: "In Progress",
      },
      { new: true }
    ).populate("assignedTo", "name username department");

    res.json(report);
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong" });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const newReports = await Report.countDocuments({ status: "New" });
    const inProgress = await Report.countDocuments({ status: "In Progress" });
    const resolved = await Report.countDocuments({ status: "Resolved" });

    const byCategory = await Report.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const bySeverity = await Report.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);

    res.json({
      totalReports,
      newReports,
      inProgress,
      resolved,
      byCategory,
      bySeverity,
    });
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong" });
  }
};

export const searchReports = async (req, res) => {
  try {
    const { address, category, severity, status, type } = req.query;

    let query = {};

    if (address) {
      query["location.address"] = { $regex: address, $options: "i" };
    }
    if (category && category !== "All") query.category = category;
    if (severity && severity !== "All") query.severity = severity;
    if (status && status !== "All") query.status = status;
    if (type && type !== "All") query.type = type;

    const reports = await Report.find(query)
      .populate("reportedBy", "name username")
      .populate("assignedTo", "name username department")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(reports);
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong" });
  }
};
