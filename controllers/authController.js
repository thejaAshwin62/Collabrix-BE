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
