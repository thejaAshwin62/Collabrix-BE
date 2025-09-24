import mongoose from "mongoose";

const UserModel = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    website: { type: String, default: "" },
    company: { type: String, default: "" },
    role: { type: String, default: "" },
    avatar: { type: String, default: "" },
    preferences: {
      language: { type: String, default: "en" },
      timezone: { type: String, default: "America/Los_Angeles" },
      dateFormat: { type: String, default: "MM/DD/YYYY" },
      autoSave: { type: Boolean, default: true },
      collaboratorCursors: { type: Boolean, default: true },
      soundNotifications: { type: Boolean, default: false },
      emailDigest: { type: String, default: "weekly" },
      theme: { type: String, default: "dark" },
      accentColor: { type: String, default: "purple" },
    },
    stats: {
      documentsCreated: { type: Number, default: 0 },
      collaborations: { type: Number, default: 0 },
      hoursActive: { type: Number, default: 0 },
      achievementScore: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
export default mongoose.model("User", UserModel);
