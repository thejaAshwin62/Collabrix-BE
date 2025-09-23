import { Router } from "express";
const router = Router();
import {
  Login,
  Register,
  getCurrentUser,
  testAuth,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

router.post("/register", Register);
router.post("/login", Login);
router.get("/me", authMiddleware, getCurrentUser);
router.get("/test", authMiddleware, testAuth);

export default router;
