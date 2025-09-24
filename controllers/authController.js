import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import { sign } from "../utils/jwt.js";

export const Register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = sign({ userId: newUser._id, email: newUser.email });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const token = sign({ userId: user._id, email: user.email });
    res.status(200).json({
      token,
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  // Check if user object exists (should be set by authMiddleware)
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const usersId = req.user.userId;
  try {
    const user = await UserModel.findById(usersId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const testAuth = async (req, res) => {
  try {
    console.log("Test auth endpoint hit");
    console.log("Headers:", req.headers.authorization);
    console.log("User object:", req.user);

    res.status(200).json({
      message: "Authentication successful",
      user: req.user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test auth error:", error);
    res.status(500).json({ error: "Server error in test auth" });
  }
};

export const GetUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate user stats
    const DocsModel = (await import("../models/DocsModel.js")).default;

    const documentsCreated = await DocsModel.countDocuments({
      owner: req.user.userId,
    });

    // Count collaborations (documents where user has permissions but is not owner)
    const collaborations = await DocsModel.countDocuments({
      "permissions.user": req.user.userId,
      owner: { $ne: req.user.userId },
    });

    // Calculate hours active (mock calculation based on document activity)
    const userDocs = await DocsModel.find({ owner: req.user.userId });
    const hoursActive = Math.round(userDocs.length * 2.5); // Mock calculation

    // Achievement score based on activity
    const achievementScore =
      documentsCreated * 25 + collaborations * 15 + hoursActive * 5;

    const profileData = {
      ...user.toObject(),
      stats: {
        documentsCreated,
        collaborations,
        hoursActive,
        achievementScore,
      },
      joinDate: user.createdAt,
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

export const UpdateUserProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, website, company, role, preferences } =
      req.body;

    const updateData = {};

    // Update basic profile fields
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (company !== undefined) updateData.company = company;
    if (role !== undefined) updateData.role = role;

    // Update preferences if provided
    if (preferences) {
      updateData.preferences = { ...preferences };
    }

    const user = await UserModel.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

export const GetUserStats = async (req, res) => {
  try {
    const DocsModel = (await import("../models/DocsModel.js")).default;

    // Get total documents created by user
    const totalDocuments = await DocsModel.countDocuments({
      owner: req.user.userId,
    });

    // Get total collaborations (documents where user has permissions but is not owner)
    const totalCollaborations = await DocsModel.countDocuments({
      "permissions.user": req.user.userId,
      owner: { $ne: req.user.userId },
    });

    // Get documents created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const documentsThisMonth = await DocsModel.countDocuments({
      owner: req.user.userId,
      createdAt: { $gte: startOfMonth },
    });

    // Get collaborations this month
    const collaborationsThisMonth = await DocsModel.countDocuments({
      "permissions.user": req.user.userId,
      owner: { $ne: req.user.userId },
      createdAt: { $gte: startOfMonth },
    });

    // Get this week's activity
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const activityThisWeek = await DocsModel.countDocuments({
      $or: [
        { owner: req.user.userId },
        { "permissions.user": req.user.userId },
      ],
      updatedAt: { $gte: startOfWeek },
    });

    // Calculate hours active based on document activity and collaborations
    const hoursActiveThisWeek = Math.round(
      activityThisWeek * 1.5 + totalCollaborations * 0.5
    );

    // Calculate achievement score based on all activity
    const achievementScore =
      totalDocuments * 25 + totalCollaborations * 15 + hoursActiveThisWeek * 5;

    // Calculate score gained this month
    const scoreThisMonth =
      documentsThisMonth * 25 + collaborationsThisMonth * 15;

    const stats = {
      totalDocuments,
      documentsThisMonth,
      totalCollaborations,
      collaborationsThisMonth,
      hoursActiveThisWeek,
      achievementScore,
      scoreThisMonth,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

export const Logout = async (req, res) => {
  try {
    // Since we're using stateless JWT tokens, logout is primarily a client-side operation
    // But we can perform server-side cleanup if needed

    // Log the logout activity
    console.log(
      `User ${req.user.userId} logged out at ${new Date().toISOString()}`
    );

    // You could implement token blacklisting here if needed
    // For now, we'll just return a success response
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
};
