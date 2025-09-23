import { customFetch } from "./customFetch";

export const documentAPI = {
  // Test authentication endpoint
  testAuth: async () => {
    try {
      const response = await customFetch.get("/auth/test");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Auth test error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || "Authentication test failed",
        details: error.response?.data?.details || error.message,
      };
    }
  },

  // Create a new document
  createDocument: async (title, content = "") => {
    try {
      const response = await customFetch.post("/docs", {
        title,
        content,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create document",
      };
    }
  },

  // Get all documents
  getDocuments: async () => {
    try {
      const response = await customFetch.get("/docs");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch documents",
      };
    }
  },

  // Get shared documents
  getSharedDocuments: async () => {
    try {
      const response = await customFetch.get("/docs/shared");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch shared documents",
      };
    }
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await customFetch.get("/docs/stats");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch dashboard stats",
      };
    }
  },

  // Get document by ID
  getDocumentById: async (docId) => {
    try {
      const response = await customFetch.get(`/docs/${docId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch document",
      };
    }
  },

  // Request access to a document
  requestAccess: async (docId, message = "") => {
    try {
      const response = await customFetch.post(`/docs/${docId}/request-access`, {
        message,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to request access",
      };
    }
  },

  // Get access requests
  getAccessRequests: async () => {
    try {
      const response = await customFetch.get("/docs/access-requests");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch access requests",
      };
    }
  },

  // Respond to access request
  respondToAccessRequest: async (
    docId,
    requestId,
    action,
    permission = "view"
  ) => {
    try {
      const response = await customFetch.post(
        `/docs/${docId}/access-requests/${requestId}`,
        {
          action, // 'approve' or 'deny'
          permission,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to respond to request",
      };
    }
  },

  // Update document content
  updateDocument: async (docId, title, content) => {
    try {
      const response = await customFetch.put(`/docs/${docId}`, {
        title,
        content,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update document",
      };
    }
  },

  // Share functionality
  getDocumentByShareToken: async (shareToken) => {
    try {
      const response = await customFetch.get(`/docs/share/${shareToken}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error || "Failed to access shared document",
      };
    }
  },

  // Add collaborator
  addCollaborator: async (docId, email, permission = "view") => {
    try {
      const response = await customFetch.post(`/docs/${docId}/collaborators`, {
        email,
        permission,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to add collaborator",
      };
    }
  },

  // Remove collaborator
  removeCollaborator: async (docId, userId) => {
    try {
      const response = await customFetch.delete(
        `/docs/${docId}/collaborators/${userId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to remove collaborator",
      };
    }
  },

  // Update collaborator permission
  updateCollaboratorPermission: async (docId, userId, permission) => {
    try {
      const response = await customFetch.put(
        `/docs/${docId}/collaborators/${userId}`,
        {
          permission,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to update permission",
      };
    }
  },

  // Get user activity
  getUserActivity: async (limit = 20, offset = 0) => {
    try {
      const response = await customFetch.get(
        `/docs/activity?limit=${limit}&offset=${offset}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch activity",
      };
    }
  },

  // Update document details (title, description)
  updateDocument: async (docId, updates) => {
    try {
      const response = await customFetch.put(`/docs/${docId}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update document",
      };
    }
  },

  // Delete document
  deleteDocument: async (docId) => {
    try {
      const response = await customFetch.delete(`/docs/${docId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete document",
      };
    }
  },
};
