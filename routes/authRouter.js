import { Router } from "express";
const router = Router();
import {
  Login,
  Register,
  getCurrentUser,
  testAuth,
  GetUserProfile,
  UpdateUserProfile,
  GetUserStats,
  Logout,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", authMiddleware, Logout);
router.get("/me", authMiddleware, getCurrentUser);
router.get("/test", authMiddleware, testAuth);
router.get("/profile", authMiddleware, GetUserProfile);
router.put("/profile", authMiddleware, UpdateUserProfile);
router.get("/profile/stats", authMiddleware, GetUserStats);

export default router;
