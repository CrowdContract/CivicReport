import { model, Schema, ObjectId } from "mongoose";

const schema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      maxLength: 256,
    },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    photo: {},
    role: {
      type: [String],
      default: ["Citizen"],
      enum: ["Citizen", "Official", "Admin"],
    },
    department: {
      type: String,
      enum: ["Roads", "Water", "Electricity", "Traffic", "General", ""],
      default: "",
    },
    followedReports: [{ type: ObjectId, ref: "Report" }],
    resetCode: "",
  },
  { timestamps: true }
);

export default model("User", schema);
