import DocsModel from "../models/DocsModel.js";

export const CreateDocs = async (req, res) => {
  const { title, content, description } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const doc = await DocsModel.create({
      title: title || "Untitled Document",
      description: description || "",
      content: content || "",
      owner: req.user.userId,
    });
    res.status(201).json(doc);
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
export const ListDocs = async (req, res) => {
  try {
    const docs = await DocsModel.find({ owner: req.user.userId }).select(
      "_id title description createdAt updatedAt"
    );
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const GetDocsById = async (req, res) => {
  const { docId } = req.params;

  console.log("GetDocsById called with:", { docId, userId: req.user?.userId });

  if (!docId) return res.status(400).json({ error: "Document ID is required" });

  try {
    // Find document by MongoDB _id (which is what we're calling docId in the URL)
    const doc = await DocsModel.findById(docId).populate([
      { path: "permissions.user", select: "name email username" },
      { path: "owner", select: "name email username" },
    ]);

    if (!doc) {
      console.log("Document not found:", docId);
      return res.status(404).json({ error: "Document not found" });
    }

    console.log("Document found:", {
      id: doc._id,
      title: doc.title,
      owner: doc.owner._id,
    });

    const userId = req.user.userId;
    console.log("Checking permissions for user:", userId);

    // Check if user is owner
    if (doc.owner._id.toString() === userId) {
      console.log("User is owner");
      return res
        .status(200)
        .json({ ...doc.toObject(), userPermission: "owner" });
    }

    // Check if user has permission
    const userPermission = doc.permissions.find(
      (p) => p.user._id.toString() === userId
    );
    if (userPermission) {
      console.log("User has permission:", userPermission.permission);
      return res.status(200).json({
        ...doc.toObject(),
        userPermission: userPermission.permission,
      });
    }

    // User doesn't have access - return basic info for access request
    console.log("User has no access, returning basic info");
    return res.status(200).json({
      _id: doc._id,
      title: doc.title,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      userPermission: null, // Indicates no access
      canRequestAccess: true,
    });
  } catch (error) {
    console.error("Error in GetDocsById:", error);
    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid document ID format" });
    }
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Request access to a document
export const RequestAccess = async (req, res) => {
  const { docId } = req.params;
  const userId = req.user.userId;

  try {
    const doc = await DocsModel.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Check if user is owner
    if (doc.owner.toString() === userId) {
      return res.status(400).json({ error: "You already own this document" });
    }

    // Check if user already has permission
    const existingPermission = doc.permissions.find(
      (p) => p.user.toString() === userId
    );
    if (existingPermission) {
      return res
        .status(400)
        .json({ error: "You already have access to this document" });
    }

    // Check if request already exists
    const existingRequest = doc.accessRequests.find(
      (r) => r.user.toString() === userId && r.status === "pending"
    );
    if (existingRequest) {
      return res.status(400).json({ error: "Access request already pending" });
    }

    // Add access request
    const newRequest = {
      user: userId,
      status: "pending",
    };

    doc.accessRequests.push(newRequest);
    await doc.save();

    // Get the newly created request with its generated _id
    const savedDoc = await DocsModel.findById(docId);
    const createdRequest = savedDoc.accessRequests.find(
      (r) => r.user.toString() === userId && r.status === "pending"
    );

    res.status(200).json({
      message: "Access request sent successfully",
      requestId: createdRequest._id,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get pending access requests for user's documents
export const GetAccessRequests = async (req, res) => {
  try {
    console.log("Getting access requests for user:", req.user.userId);

    // First, let's get all documents owned by the user
    const docs = await DocsModel.find({ owner: req.user.userId });
    console.log("Total documents owned:", docs.length);

    // Then filter and populate
    const docsWithRequests = await DocsModel.find({
      owner: req.user.userId,
      "accessRequests.0": { $exists: true }, // Has at least one access request
    }).populate("accessRequests.user", "username email");

    console.log("Documents with any access requests:", docsWithRequests.length);

    const requests = [];
    docsWithRequests.forEach((doc) => {
      console.log(`Processing document: ${doc.title} (${doc._id})`);
      console.log(`All access requests:`, doc.accessRequests.length);

      const pendingRequests = doc.accessRequests.filter(
        (request) => request.status === "pending"
      );
      console.log(`Pending requests:`, pendingRequests.length);

      pendingRequests.forEach((request) => {
        console.log("Adding request:", request._id, "User:", request.user);
        requests.push({
          requestId: request._id,
          documentId: doc._id,
          documentTitle: doc.title,
          requester: {
            name: request.user.username,
            email: request.user.email,
          },
          requestedAt: request.requestedAt,
        });
      });
    });

    console.log("Total pending requests found:", requests.length);
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in GetAccessRequests:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Respond to access request (approve/reject)
export const RespondToAccessRequest = async (req, res) => {
  const { docId, requestId } = req.params;
  const { action, permission } = req.body; // action: 'approve' or 'reject', permission: 'view' or 'edit'

  try {
    const doc = await DocsModel.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Check if user is owner
    if (doc.owner.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Only document owner can respond to access requests" });
    }

    const request = doc.accessRequests.id(requestId);
    if (!request)
      return res.status(404).json({ error: "Access request not found" });

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Request has already been processed" });
    }

    if (action === "approve") {
      // Add user to permissions
      doc.permissions.push({
        user: request.user,
        permission: permission || "view",
      });
      request.status = "approved";
    } else if (action === "reject") {
      request.status = "rejected";
    } else {
      return res
        .status(400)
        .json({ error: "Invalid action. Use 'approve' or 'reject'" });
    }

    await doc.save();
    res.status(200).json({ message: `Access request ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get documents shared with user
export const GetSharedDocs = async (req, res) => {
  try {
    const docs = await DocsModel.find({
      "permissions.user": req.user.userId,
    }).populate("owner", "name email");

    const sharedDocs = docs.map((doc) => {
      const userPermission = doc.permissions.find(
        (p) => p.user.toString() === req.user.userId
      );
      return {
        _id: doc._id,
        title: doc.title,
        owner: doc.owner,
        permission: userPermission.permission,
        grantedAt: userPermission.grantedAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });

    res.status(200).json(sharedDocs);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update document content
export const UpdateDocument = async (req, res) => {
  const { docId } = req.params;
  const { title, content, description } = req.body; // Add description support

  try {
    const doc = await DocsModel.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const userId = req.user.userId;

    // Check if user has edit permission
    const hasEditPermission =
      doc.owner.toString() === userId ||
      doc.permissions.some(
        (p) => p.user.toString() === userId && p.permission === "edit"
      );

    if (!hasEditPermission) {
      return res
        .status(403)
        .json({ error: "You don't have permission to edit this document" });
    }

    // Update document
    if (title !== undefined) doc.title = title;
    if (content !== undefined) doc.content = content;
    if (description !== undefined) doc.description = description;

    await doc.save();

    res.status(200).json({
      message: "Document updated successfully",
      document: {
        _id: doc._id,
        title: doc.title,
        content: doc.content,
        description: doc.description,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid document ID format" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Delete document
export const DeleteDocument = async (req, res) => {
  const { docId } = req.params;

  try {
    const doc = await DocsModel.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const userId = req.user.userId;

    // Only the owner can delete the document
    if (doc.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Only the document owner can delete this document" });
    }

    // Delete the document
    await DocsModel.findByIdAndDelete(docId);

    res.status(200).json({
      message: "Document deleted successfully",
      documentId: docId,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid document ID format" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Get document by share token (public access)
export const GetDocumentByShareToken = async (req, res) => {
  const { shareToken } = req.params;

  try {
    // For now, we'll use the document ID as the share token
    // In production, you'd want to use a separate share token field
    const doc = await DocsModel.findById(shareToken).populate([
      { path: "owner", select: "name email username" },
    ]);

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Return document info for sharing (without sensitive data)
    return res.status(200).json({
      _id: doc._id,
      title: doc.title,
      content: doc.content,
      owner: {
        name: doc.owner.name || doc.owner.username,
        email: doc.owner.email,
      },
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isShared: true,
    });
  } catch (error) {
    console.error("Error in GetDocumentByShareToken:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid share token format" });
    }
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Add collaborator to document
export const AddCollaborator = async (req, res) => {
  const { docId } = req.params;
  const { email, permission } = req.body; // permission: 'view' or 'edit'

  try {
    const doc = await DocsModel.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Check if user is owner
    if (doc.owner.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Only document owner can add collaborators" });
    }

    // Find user by email
    const UserModel = (await import("../models/UserModel.js")).default;
    const collaboratorUser = await UserModel.findOne({ email });
    if (!collaboratorUser) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    // Check if user already has permission
    const existingPermission = doc.permissions.find(
      (p) => p.user.toString() === collaboratorUser._id.toString()
    );
    if (existingPermission) {
      return res
        .status(400)
        .json({ error: "User already has access to this document" });
    }

    // Add permission
    doc.permissions.push({
      user: collaboratorUser._id,
      permission: permission || "view",
    });

    await doc.save();

    // Return the updated collaborator info
    const updatedDoc = await DocsModel.findById(docId).populate([
      { path: "permissions.user", select: "name email username" },
    ]);

    const newCollaborator = updatedDoc.permissions.find(
      (p) => p.user._id.toString() === collaboratorUser._id.toString()
    );

    res.status(200).json({
      message: "Collaborator added successfully",
      collaborator: {
        id: newCollaborator.user._id,
        name: newCollaborator.user.name || newCollaborator.user.username,
        email: newCollaborator.user.email,
        permission: newCollaborator.permission,
        grantedAt: newCollaborator.grantedAt,
      },
    });
  } catch (error) {
    console.error("Error in AddCollaborator:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Remove collaborator from document
export const RemoveCollaborator = async (req, res) => {
  const { docId, userId } = req.params;

  try {
    const doc = await DocsModel.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Check if user is owner
    if (doc.owner.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Only document owner can remove collaborators" });
    }

    // Remove permission
    doc.permissions = doc.permissions.filter(
      (p) => p.user.toString() !== userId
    );

    await doc.save();

    res.status(200).json({ message: "Collaborator removed successfully" });
  } catch (error) {
    console.error("Error in RemoveCollaborator:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Update collaborator permission
export const UpdateCollaboratorPermission = async (req, res) => {
  const { docId, userId } = req.params;
  const { permission } = req.body; // 'view' or 'edit'

  try {
    const doc = await DocsModel.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Check if user is owner
    if (doc.owner.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Only document owner can update permissions" });
    }

    // Find and update permission
    const permissionIndex = doc.permissions.findIndex(
      (p) => p.user.toString() === userId
    );

    if (permissionIndex === -1) {
      return res
        .status(404)
        .json({ error: "Collaborator not found in this document" });
    }

    doc.permissions[permissionIndex].permission = permission;
    await doc.save();

    res.status(200).json({ message: "Permission updated successfully" });
  } catch (error) {
    console.error("Error in UpdateCollaboratorPermission:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Activity tracking endpoint
export const GetUserActivity = async (req, res) => {
  try {
    console.log("GetUserActivity called");
    console.log("User:", req.user);
    console.log("Query params:", req.query);

    if (!req.user || !req.user.userId) {
      console.log("No user found in request");
      return res.status(400).json({ error: "User authentication required" });
    }

    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    console.log("Fetching activities for user:", userId);

    // Get user's documents (created, edited, shared)
    const userDocs = await DocsModel.find({
      $or: [{ owner: userId }, { "permissions.user": userId }],
    })
      .populate([
        { path: "owner", select: "name email username" },
        { path: "permissions.user", select: "name email username" },
      ])
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit) * 2); // Get more to filter activities

    console.log("Found documents:", userDocs.length);

    const activities = [];

    // Process documents to create activity entries
    userDocs.forEach((doc) => {
      // Document created activity
      if (doc.owner._id.toString() === userId) {
        activities.push({
          id: `doc_created_${doc._id}`,
          type: "document_created",
          user: doc.owner.name || doc.owner.username || "You",
          userAvatar: null,
          action: "created",
          target: doc.title,
          targetType: "document",
          targetId: doc._id,
          timestamp: doc.createdAt,
          details: `Document with ${
            doc.content ? doc.content.length : 0
          } characters`,
          icon: "FileText",
          color: "text-neon-purple",
        });
      }

      // Document edited activity (if updated after creation)
      if (doc.updatedAt > doc.createdAt) {
        const editor =
          doc.owner._id.toString() === userId
            ? doc.owner
            : doc.permissions.find((p) => p.user._id.toString() === userId)
                ?.user || doc.owner;

        activities.push({
          id: `doc_edited_${doc._id}_${doc.updatedAt.getTime()}`,
          type: "document_edited",
          user: editor.name || editor.username || "Unknown User",
          userAvatar: null,
          action: "edited",
          target: doc.title,
          targetType: "document",
          targetId: doc._id,
          timestamp: doc.updatedAt,
          details: "Made changes to the document",
          icon: "Edit",
          color: "text-neon-teal",
        });
      }

      // Collaboration activities
      doc.permissions.forEach((permission) => {
        if (permission.user._id.toString() !== doc.owner._id.toString()) {
          activities.push({
            id: `collab_${doc._id}_${
              permission.user._id
            }_${permission.grantedAt.getTime()}`,
            type: "collaboration_invited",
            user: doc.owner.name || doc.owner.username || "Document Owner",
            userAvatar: null,
            action:
              permission.user._id.toString() === userId
                ? "invited you to collaborate on"
                : "invited someone to collaborate on",
            target: doc.title,
            targetType: "document",
            targetId: doc._id,
            timestamp: permission.grantedAt,
            details: `${
              permission.permission.charAt(0).toUpperCase() +
              permission.permission.slice(1)
            } permissions granted`,
            icon: "Users",
            color: "text-neon-pink",
          });
        }
      });
    });

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const paginatedActivities = activities.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    // Add relative timestamps
    const now = new Date();
    const activitiesWithRelativeTime = paginatedActivities.map((activity) => {
      const activityTime = new Date(activity.timestamp);
      const diffInMs = now - activityTime;
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      let relativeTime;
      if (diffInMins < 1) {
        relativeTime = "Just now";
      } else if (diffInMins < 60) {
        relativeTime = `${diffInMins} minute${diffInMins > 1 ? "s" : ""} ago`;
      } else if (diffInHours < 24) {
        relativeTime = `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
      } else if (diffInDays < 7) {
        relativeTime = `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
      } else {
        relativeTime = activityTime.toLocaleDateString();
      }

      return {
        ...activity,
        timestamp: relativeTime,
      };
    });

    console.log("Total activities before pagination:", activities.length);

    res.status(200).json({
      success: true,
      activities: activitiesWithRelativeTime,
      total: activities.length,
      hasMore: parseInt(offset) + parseInt(limit) < activities.length,
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Dashboard statistics endpoint
export const GetDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get total documents count for the user
    const totalDocuments = await DocsModel.countDocuments({ owner: userId });

    // Get total collaborators (unique users who have permissions on user's documents)
    const docsWithCollaborators = await DocsModel.find({
      owner: userId,
    }).populate("permissions.user");
    const uniqueCollaborators = new Set();
    docsWithCollaborators.forEach((doc) => {
      doc.permissions.forEach((permission) => {
        if (permission.user && permission.user._id.toString() !== userId) {
          uniqueCollaborators.add(permission.user._id.toString());
        }
      });
    });

    // Get documents created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const documentsThisMonth = await DocsModel.countDocuments({
      owner: userId,
      createdAt: { $gte: startOfMonth },
    });

    // Get recently modified documents (within last 7 days) as "active projects"
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeProjects = await DocsModel.countDocuments({
      owner: userId,
      updatedAt: { $gte: sevenDaysAgo },
    });

    // Calculate growth percentages (mock for now, could be enhanced with historical data)
    const stats = {
      totalDocuments: {
        value: totalDocuments,
        change: totalDocuments > 0 ? "+12%" : "0%",
      },
      collaborators: {
        value: uniqueCollaborators.size,
        change: uniqueCollaborators.size > 0 ? "+8%" : "0%",
      },
      viewsThisMonth: {
        value: documentsThisMonth * 15, // Mock calculation
        change: documentsThisMonth > 0 ? "+23%" : "0%",
      },
      activeProjects: {
        value: activeProjects,
        change: activeProjects > 0 ? `+${Math.min(activeProjects, 5)}` : "0",
      },
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
