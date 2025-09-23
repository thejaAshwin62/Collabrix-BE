import * as Y from "yjs";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";

const messageSync = 0;
const messageQueryAwareness = 3;
const messageAwareness = 1;
const messageAuth = 2;

/**
 * Setup WebSocket connection for Yjs collaboration
 * @param {WebSocket} ws - WebSocket connection
 * @param {object} req - HTTP request object
 * @param {object} options - Options object
 * @param {object} options.persistence - Persistence adapter (e.g., LevelDB)
 * @param {boolean} options.gc - Enable garbage collection
 */
export const setupWSConnection = async (
  ws,
  req,
  { persistence, gc = true } = {}
) => {
  // Extract document name from URL path (e.g., "/docId" -> "docId")
  const docName = req.url.slice(1).split("?")[0];

  if (!docName) {
    ws.close(1008, "Invalid document name");
    return;
  }

  try {
    // Create or get existing Yjs document
    const doc = await getYDoc(docName, gc, persistence);

    // Get or create shared awareness for this document
    let awareness = docAwareness.get(docName);
    if (!awareness) {
      awareness = new awarenessProtocol.Awareness(doc);
      docAwareness.set(docName, awareness);
    }

    // Store this connection
    if (!connections.has(docName)) {
      connections.set(docName, new Set());
    }
    const docConnections = connections.get(docName);
    docConnections.add(ws);

    // Store awareness reference on the WebSocket
    ws.awareness = awareness;
    ws.docName = docName;

    // Handle incoming messages
    ws.on("message", (message) => {
      handleMessage(ws, doc, awareness, message, persistence, docConnections);
    });

    // Handle connection close
    ws.on("close", () => {
      // Clean up awareness for this connection
      if (awareness && ws.awarenessClientId !== undefined) {
        awareness.setLocalState(null);
      }
      // Remove connection from the set
      if (docConnections) {
        docConnections.delete(ws);
        if (docConnections.size === 0) {
          connections.delete(docName);
          // Clean up shared awareness when no connections left
          if (docAwareness.has(docName)) {
            docAwareness.get(docName).destroy();
            docAwareness.delete(docName);
          }
        }
      }
    });

    // Send initial sync message
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    ws.send(encoding.toUint8Array(encoder));

    // Send current awareness states to the new client
    const awarenessStates = awareness.getStates();
    if (awarenessStates.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, messageAwareness);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          awareness,
          Array.from(awarenessStates.keys())
        )
      );
      ws.send(encoding.toUint8Array(awarenessEncoder));
    }
  } catch (error) {
    console.error("Error setting up WebSocket connection:", error);
    ws.close(1011, "Server error");
  }
};

// Map to store active documents
const docs = new Map();
// Map to store WebSocket connections by document
const connections = new Map();
// Map to store shared awareness instances by document
const docAwareness = new Map();

/**
 * Get or create a Yjs document
 * @param {string} docName - Document name
 * @param {boolean} gc - Enable garbage collection
 * @param {object} persistence - Persistence adapter
 * @returns {Y.Doc} Yjs document
 */
const getYDoc = async (docName, gc, persistence) => {
  if (docs.has(docName)) {
    return docs.get(docName);
  }

  const doc = new Y.Doc();

  if (gc) {
    doc.gc = true;
  }

  // Load document from persistence if available
  if (persistence) {
    try {
      // Get persisted state
      const persistedYdoc = await persistence.getYDoc(docName);
      if (persistedYdoc) {
        const state = Y.encodeStateAsUpdate(persistedYdoc);
        Y.applyUpdate(doc, state);
      }

      // Set up auto-save on document updates
      doc.on("update", async (update, origin) => {
        if (origin !== "persistence") {
          try {
            await persistence.storeUpdate(docName, update);
          } catch (error) {
            console.error("Failed to persist update:", error);
          }
        }
      });
    } catch (error) {
      console.error("Failed to load document from persistence:", error);
    }
  }

  docs.set(docName, doc);

  // Clean up document when no more connections
  doc.on("destroy", () => {
    docs.delete(docName);
  });

  return doc;
};

/**
 * Handle incoming WebSocket messages
 * @param {WebSocket} ws - WebSocket connection
 * @param {Y.Doc} doc - Yjs document
 * @param {awarenessProtocol.Awareness} awareness - Awareness instance
 * @param {ArrayBuffer} message - Incoming message
 * @param {object} persistence - Persistence adapter
 * @param {Set} docConnections - All connections for this document
 */
const handleMessage = (
  ws,
  doc,
  awareness,
  message,
  persistence,
  docConnections
) => {
  try {
    const uint8Array = new Uint8Array(message);
    const decoder = decoding.createDecoder(uint8Array);
    const encoder = encoding.createEncoder();
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync);
        const syncMessageType = syncProtocol.readSyncMessage(
          decoder,
          encoder,
          doc,
          ws
        );

        // Send response if there's content to send
        if (encoding.length(encoder) > 1) {
          ws.send(encoding.toUint8Array(encoder));
        }

        // If this was a document update, broadcast it to all other clients
        if (syncMessageType === syncProtocol.messageYjsUpdate) {
          broadcastUpdate(ws, doc, docConnections, uint8Array);
        }
        break;

      case messageQueryAwareness:
        encoding.writeVarUint(encoder, messageAwareness);
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(
            awareness,
            Array.from(awareness.getStates().keys())
          )
        );
        ws.send(encoding.toUint8Array(encoder));
        break;

      case messageAwareness:
        awarenessProtocol.applyAwarenessUpdate(
          awareness,
          decoding.readVarUint8Array(decoder),
          ws
        );
        // Broadcast awareness update to all other clients
        broadcastAwareness(ws, docConnections, uint8Array);
        break;

      case messageAuth:
        // Handle authentication if needed
        // This is a placeholder - implement based on your auth requirements
        break;

      default:
        console.warn("Unknown message type:", messageType);
    }
  } catch (error) {
    console.error("Error handling message:", error);
    ws.close(1008, "Message handling error");
  }
};

/**
 * Broadcast document update to all connected clients except sender
 * @param {WebSocket} sender - The WebSocket that sent the update
 * @param {Y.Doc} doc - Yjs document
 * @param {Set} docConnections - All connections for this document
 * @param {Uint8Array} message - The original message to broadcast
 */
const broadcastUpdate = (sender, doc, docConnections, message) => {
  docConnections.forEach((client) => {
    if (client !== sender && client.readyState === 1) {
      // 1 = OPEN
      try {
        client.send(message);
      } catch (error) {
        console.error("Error broadcasting update:", error);
        // Remove dead connection
        docConnections.delete(client);
      }
    }
  });
};

/**
 * Broadcast awareness update to all connected clients except sender
 * @param {WebSocket} sender - The WebSocket that sent the update
 * @param {Set} docConnections - All connections for this document
 * @param {Uint8Array} message - The original message to broadcast
 */
const broadcastAwareness = (sender, docConnections, message) => {
  docConnections.forEach((client) => {
    if (client !== sender && client.readyState === 1) {
      // 1 = OPEN
      try {
        client.send(message);
      } catch (error) {
        console.error("Error broadcasting awareness:", error);
        // Remove dead connection
        docConnections.delete(client);
      }
    }
  });
};

/**
 * Get the number of active documents
 * @returns {number} Number of active documents
 */
export const getActiveDocumentsCount = () => docs.size;

/**
 * Get all active document names
 * @returns {string[]} Array of document names
 */
export const getActiveDocumentNames = () => Array.from(docs.keys());
