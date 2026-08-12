const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");
const url = require("url");
const logger = require("../config/logger");

const JWT_SECRET = process.env.JWT_SECRET || "mlinzi-dev-secret-change-in-production";

let wss;
const counselorSockets = new Map();

function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const { query } = url.parse(req.url, true);
    const token = query.token;

    if (!token) {
      ws.close(4001, "Authentication required");
      return;
    }

    let user;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch {
      ws.close(4001, "Invalid token");
      return;
    }

    ws.userId = user.id;
    ws.userRole = user.role;
    ws.isAlive = true;

    if (user.role === "counselor") {
      if (!counselorSockets.has(user.id)) {
        counselorSockets.set(user.id, new Set());
      }
      counselorSockets.get(user.id).add(ws);
      logger.info({ userId: user.id }, "Counselor connected via WebSocket");
    }

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", () => {
      if (user.role === "counselor") {
        const sockets = counselorSockets.get(user.id);
        if (sockets) {
          sockets.delete(ws);
          if (sockets.size === 0) {
            counselorSockets.delete(user.id);
          }
        }
        logger.info({ userId: user.id }, "Counselor disconnected from WebSocket");
      }
    });

    ws.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));
  });

  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(heartbeat));

  logger.info("WebSocket server initialized");
}

function notifyCounselor(counselorId, payload) {
  const sockets = counselorSockets.get(counselorId);
  if (!sockets || sockets.size === 0) return;

  const message = JSON.stringify(payload);
  for (const ws of sockets) {
    if (ws.readyState === 1) {
      ws.send(message);
    }
  }
}

function broadcastToCounselors(payload) {
  const message = JSON.stringify(payload);
  for (const [, sockets] of counselorSockets) {
    for (const ws of sockets) {
      if (ws.readyState === 1) {
        ws.send(message);
      }
    }
  }
}

function getConnectedCounselorCount() {
  return counselorSockets.size;
}

module.exports = {
  initWebSocket,
  notifyCounselor,
  broadcastToCounselors,
  getConnectedCounselorCount,
};
