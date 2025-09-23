import React, { useState, useEffect } from "react";

export default function DocumentList({ user, onSelectDocument, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [joinDocId, setJoinDocId] = useState("");
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState("my-docs");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchDocuments(),
      fetchSharedDocuments(),
      fetchAccessRequests(),
    ]);
    setLoading(false);
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/docs", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        console.error("Failed to fetch documents");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchSharedDocuments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/docs/shared", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSharedDocuments(data);
      } else {
        console.error("Failed to fetch shared documents");
      }
    } catch (error) {
      console.error("Error fetching shared documents:", error);
    }
  };

  const fetchAccessRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/docs/access-requests",
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAccessRequests(data);
      } else {
        console.error("Failed to fetch access requests");
      }
    } catch (error) {
      console.error("Error fetching access requests:", error);
    }
  };

  const createDocument = async () => {
    if (!newDocTitle.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("http://localhost:5000/api/v1/docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ title: newDocTitle }),
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments((prev) => [newDoc, ...prev]);
        setNewDocTitle("");
      } else {
        console.error("Failed to create document");
      }
    } catch (error) {
      console.error("Error creating document:", error);
    } finally {
      setCreating(false);
    }
  };

  const joinDocument = async () => {
    if (!joinDocId.trim()) return;

    setJoining(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/docs/${joinDocId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.ok) {
        const doc = await response.json();
        onSelectDocument(doc);
      } else if (response.status === 403) {
        // User doesn't have access, offer to request it
        const confirmRequest = window.confirm(
          "You don't have access to this document. Would you like to request access from the owner?"
        );
        if (confirmRequest) {
          await requestAccess(joinDocId);
        }
      } else if (response.status === 404) {
        alert("Document not found. Please check the Document ID.");
      } else {
        alert("Failed to access document.");
      }
    } catch (error) {
      console.error("Error joining document:", error);
      alert("Error accessing document. Please try again.");
    } finally {
      setJoining(false);
      setJoinDocId("");
    }
  };

  const requestAccess = async (docId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/docs/${docId}/request-access`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.ok) {
        alert(
          "Access request sent successfully! The document owner will be notified."
        );
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send access request.");
      }
    } catch (error) {
      console.error("Error requesting access:", error);
      alert("Error sending access request. Please try again.");
    }
  };

  const respondToAccessRequest = async (
    docId,
    requestId,
    action,
    permission = "view"
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/docs/${docId}/access-requests/${requestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ action, permission }),
        }
      );

      if (response.ok) {
        alert(`Access request ${action}d successfully!`);
        fetchAccessRequests(); // Refresh the requests
      } else {
        const error = await response.json();
        alert(error.error || `Failed to ${action} access request.`);
      }
    } catch (error) {
      console.error(`Error ${action}ing access request:`, error);
      alert(`Error ${action}ing access request. Please try again.`);
    }
  };

  const copyDocumentId = async (docId) => {
    try {
      await navigator.clipboard.writeText(docId);
      alert("Document ID copied to clipboard!");
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = docId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Document ID copied to clipboard!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading documents...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          borderBottom: "1px solid #eee",
          paddingBottom: "1rem",
        }}
      >
        <div>
          <h1>Collaborative Documents</h1>
          <p style={{ color: "#666", margin: 0 }}>
            Welcome back, {user.user.name}! ({user.user.email})
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #ddd" }}>
          {[
            { key: "my-docs", label: `My Documents (${documents.length})` },
            {
              key: "shared",
              label: `Shared with Me (${sharedDocuments.length})`,
            },
            {
              key: "requests",
              label: `Access Requests (${accessRequests.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "1rem 1.5rem",
                border: "none",
                borderBottom:
                  activeTab === tab.key
                    ? "2px solid #007bff"
                    : "2px solid transparent",
                backgroundColor:
                  activeTab === tab.key ? "#f8f9fa" : "transparent",
                color: activeTab === tab.key ? "#007bff" : "#666",
                cursor: "pointer",
                fontWeight: activeTab === tab.key ? "600" : "normal",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "my-docs" && (
        <>
          {/* Create Document */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1rem",
              padding: "1rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <input
              type="text"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="Enter document title..."
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              onKeyPress={(e) => e.key === "Enter" && createDocument()}
            />
            <button
              onClick={createDocument}
              disabled={creating || !newDocTitle.trim()}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: creating ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: creating ? "not-allowed" : "pointer",
              }}
            >
              {creating ? "Creating..." : "Create Document"}
            </button>
          </div>

          {/* Join Document */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "2rem",
              padding: "1rem",
              backgroundColor: "#e8f4fd",
              borderRadius: "8px",
              border: "1px solid #bee5eb",
            }}
          >
            <input
              type="text"
              value={joinDocId}
              onChange={(e) => setJoinDocId(e.target.value)}
              placeholder="Enter Document ID to join collaboration..."
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              onKeyPress={(e) => e.key === "Enter" && joinDocument()}
            />
            <button
              onClick={joinDocument}
              disabled={joining || !joinDocId.trim()}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: joining ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: joining ? "not-allowed" : "pointer",
              }}
            >
              {joining ? "Joining..." : "Join Document"}
            </button>
          </div>

          {/* My Documents List */}
          {documents.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#666",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <h3>No documents yet</h3>
              <p>Create your first document to start collaborating!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    padding: "1.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    transition: "all 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    onClick={() => onSelectDocument(doc)}
                    style={{
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.target.closest("div").style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.15)";
                      e.target.closest("div").style.transform =
                        "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.closest("div").style.boxShadow =
                        "0 1px 3px rgba(0,0,0,0.1)";
                      e.target.closest("div").style.transform = "translateY(0)";
                    }}
                  >
                    <h3 style={{ margin: "0 0 0.5rem 0" }}>{doc.title}</h3>
                    <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                      Created: {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.75rem",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0 0 0.25rem 0",
                            fontSize: "12px",
                            color: "#666",
                            fontWeight: "bold",
                          }}
                        >
                          Share this Document ID:
                        </p>
                        <code
                          style={{
                            fontSize: "11px",
                            color: "#495057",
                            backgroundColor: "#e9ecef",
                            padding: "2px 4px",
                            borderRadius: "3px",
                          }}
                        >
                          {doc._id}
                        </code>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyDocumentId(doc._id);
                        }}
                        style={{
                          padding: "0.4rem 0.8rem",
                          backgroundColor: "#17a2b8",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        📋 Copy ID
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Shared Documents Tab */}
      {activeTab === "shared" && (
        <div>
          {sharedDocuments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#666",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <h3>No shared documents</h3>
              <p>Documents shared with you will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {sharedDocuments.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => onSelectDocument(doc)}
                  style={{
                    padding: "1.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <h3 style={{ margin: "0 0 0.5rem 0" }}>{doc.title}</h3>
                  <p
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    Owner: {doc.owner.name} ({doc.owner.email})
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    <span>
                      Permission:{" "}
                      <strong
                        style={{
                          color:
                            doc.permission === "edit" ? "#28a745" : "#007bff",
                        }}
                      >
                        {doc.permission === "edit" ? "Can Edit" : "View Only"}
                      </strong>
                    </span>
                    <span>
                      Granted: {new Date(doc.grantedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Access Requests Tab */}
      {activeTab === "requests" && (
        <div>
          {accessRequests.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#666",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <h3>No pending access requests</h3>
              <p>Access requests for your documents will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {accessRequests.map((request) => (
                <div
                  key={request.requestId}
                  style={{
                    padding: "1.5rem",
                    border: "1px solid #ffc107",
                    borderRadius: "8px",
                    backgroundColor: "#fff8e1",
                  }}
                >
                  <h3 style={{ margin: "0 0 0.5rem 0" }}>Access Request</h3>
                  <p style={{ margin: "0 0 0.5rem 0", fontSize: "14px" }}>
                    <strong>{request.requester.name}</strong> (
                    {request.requester.email}) wants access to:
                  </p>
                  <p
                    style={{
                      margin: "0 0 1rem 0",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    "{request.documentTitle}"
                  </p>
                  <p
                    style={{
                      margin: "0 0 1rem 0",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    Requested:{" "}
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </p>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() =>
                        respondToAccessRequest(
                          request.documentId,
                          request.requestId,
                          "approve",
                          "view"
                        )
                      }
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Grant View Access
                    </button>
                    <button
                      onClick={() =>
                        respondToAccessRequest(
                          request.documentId,
                          request.requestId,
                          "approve",
                          "edit"
                        )
                      }
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Grant Edit Access
                    </button>
                    <button
                      onClick={() =>
                        respondToAccessRequest(
                          request.documentId,
                          request.requestId,
                          "reject"
                        )
                      }
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
