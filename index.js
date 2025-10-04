import http from "http";
import { WebSocketServer } from "ws";
import app from "./server.js";
import ldb from "./persistence/leveldb.js";
import { setupWSConnection } from "./utils/websocket-utils.js";
import { verify } from "./utils/jwt.js";
import connectDB from "./config/mongoose/database.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
// create WebSocket server on the same http server
const wss = new WebSocketServer({ server });

wss.on("connection", async (ws, req) => {
  try {
    // req.url example: "/<docId>?token=<JWT>"
    const base = `http://${req.headers.host}`;
    const url = new URL(req.url, base);
    const token = url.searchParams.get("token") || "";
    if (!token) {
      ws.close(4001, "Missing token");
      return;
    }
    // verify token -> throws on invalid
    const payload = verify(token);
    // optional: check payload contains userId and optionally authorization for doc
    // At this point we allow the socket to join the Yjs room. setupWSConnection will
    // parse the doc name from the request path.
    await setupWSConnection(ws, req, { persistence: ldb, gc: true });
  } catch (err) {
    console.error("ws auth failed", err.message || err);
    try {
      ws.close(4003, "Unauthorized");
    } catch (e) {
      // ignore if already closed
    }
  }
});

server.listen(PORT, async () => {
  console.log(`HTTP + WS server running on ${BASE_URL}`);
  try {
    await connectDB();
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
});
