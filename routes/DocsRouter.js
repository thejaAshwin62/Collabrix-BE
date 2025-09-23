import { Router } from "express";
const router = Router();

import {
  CreateDocs,
  ListDocs,
  GetDocsById,
  UpdateDocument,
  DeleteDocument,
  RequestAccess,
  GetAccessRequests,
  RespondToAccessRequest,
  GetSharedDocs,
  GetDocumentByShareToken,
  AddCollaborator,
  RemoveCollaborator,
  UpdateCollaboratorPermission,
  GetUserActivity,
  GetDashboardStats,
} from "../controllers/docController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

// Document CRUD routes
router.post("/", authMiddleware, CreateDocs);
router.get("/", authMiddleware, ListDocs);

// Specific routes (must come before parameterized routes)
router.get("/shared", authMiddleware, GetSharedDocs);
router.get("/access-requests", authMiddleware, GetAccessRequests);
router.get("/activity", authMiddleware, GetUserActivity);
router.get("/stats", authMiddleware, GetDashboardStats);

// Parameterized routes (must come after specific routes)
router.get("/:docId", authMiddleware, GetDocsById);
router.put("/:docId", authMiddleware, UpdateDocument);
router.delete("/:docId", authMiddleware, DeleteDocument);

// Permission management routes
router.post("/:docId/request-access", authMiddleware, RequestAccess);
router.post(
  "/:docId/access-requests/:requestId",
  authMiddleware,
  RespondToAccessRequest
);

// Sharing routes
router.get("/share/:shareToken", GetDocumentByShareToken); // Public route, no auth needed
router.post("/:docId/collaborators", authMiddleware, AddCollaborator);
router.delete(
  "/:docId/collaborators/:userId",
  authMiddleware,
  RemoveCollaborator
);
router.put(
  "/:docId/collaborators/:userId",
  authMiddleware,
  UpdateCollaboratorPermission
);

export default router;
