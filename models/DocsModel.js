import mongoose from "mongoose";

const DocsModel = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled Document" },
    description: { type: String, default: "" },
    content: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Permissions for users who have access
    permissions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        permission: {
          type: String,
          enum: ["view", "edit"],
          default: "view",
        },
        grantedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Pending access requests
    accessRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Docs", DocsModel);
