import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/mongoose/database.js";
import authRouter from "./routes/authRouter.js";
import docsRouter from "./routes/DocsRouter.js";

dotenv.config();

// Express App Setup
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL || "https://collabrix-fe.vercel.app/"]
        : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/docs", docsRouter);

// Test endpoint for WebSocket info
app.get("/api/v1/ws-info", (req, res) => {
  res.json({
    message: "WebSocket server is running",
    websocketUrl: `ws://localhost:${process.env.PORT || 5000}`,
    usage: "Connect to ws://localhost:PORT/document-id?token=JWT_TOKEN",
    example: `ws://localhost:${
      process.env.PORT || 5000
    }/test-doc?token=your-jwt-token`,
  });
});

// Export the app for use in index.js
export default app;
