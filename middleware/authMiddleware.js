import { verify } from "../utils/jwt.js";

export async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header) {
      console.log("Auth Error: No authorization header provided");
      return res
        .status(401)
        .json({ error: "No authorization header provided" });
    }

    if (!header.startsWith("Bearer ")) {
      console.log(
        'Auth Error: Invalid authorization header format. Expected "Bearer <token>"'
      );
      return res
        .status(401)
        .json({
          error:
            'Invalid authorization header format. Expected "Bearer <token>"',
        });
    }

    const token = header.split(" ")[1];

    if (!token) {
      console.log("Auth Error: No token provided in authorization header");
      return res
        .status(401)
        .json({ error: "No token provided in authorization header" });
    }

    console.log("Attempting to verify token:", token.substring(0, 20) + "...");

    const payload = verify(token);
    console.log(
      "Token verified successfully for user:",
      payload.userId || payload.id
    );

    req.user = payload; // payload should contain userId and email
    next();
  } catch (err) {
    console.log("Auth Error: Token verification failed:", err.message);
    return res.status(401).json({
      error: "Invalid or expired token",
      details: err.message,
    });
  }
}
