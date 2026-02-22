import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server as SocketIOServer } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, "dist");
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
  },
});

const ROOM_ID = "classroom-main-room";
const MAX_MESSAGES = 500;
const VALID_PROFILES = new Set(["alli", "eddie"]);
const messages = [];
const onlineSocketsByProfile = {
  alli: new Set(),
  eddie: new Set(),
};

app.disable("x-powered-by");
app.use(express.static(distPath, { index: false }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

function isValidProfileId(profileId) {
  return typeof profileId === "string" && VALID_PROFILES.has(profileId);
}

function currentPresence() {
  return {
    alli: onlineSocketsByProfile.alli.size > 0,
    eddie: onlineSocketsByProfile.eddie.size > 0,
  };
}

function emitPresence() {
  const presence = currentPresence();
  io.to(ROOM_ID).emit("presence:update", {
    profileId: "alli",
    isOnline: presence.alli,
  });
  io.to(ROOM_ID).emit("presence:update", {
    profileId: "eddie",
    isOnline: presence.eddie,
  });
}

function removeSocketFromPresence(socket) {
  const profileId = socket.data.profileId;
  if (!isValidProfileId(profileId)) {
    return;
  }
  onlineSocketsByProfile[profileId].delete(socket.id);
  socket.data.profileId = null;
}

io.on("connection", (socket) => {
  socket.data.profileId = null;

  socket.on("join", (payload) => {
    const profileId = payload?.profileId;
    if (!isValidProfileId(profileId)) {
      return;
    }

    removeSocketFromPresence(socket);
    socket.data.profileId = profileId;
    onlineSocketsByProfile[profileId].add(socket.id);
    socket.join(ROOM_ID);

    socket.emit("messages:sync", messages);
    emitPresence();
  });

  socket.on("leave", () => {
    removeSocketFromPresence(socket);
    socket.leave(ROOM_ID);
    emitPresence();
  });

  socket.on("message:create", (payload) => {
    const message = payload?.message;
    if (
      !message ||
      typeof message.id !== "string" ||
      !isValidProfileId(message.authorId) ||
      typeof message.text !== "string" ||
      typeof message.createdAt !== "string" ||
      typeof message.reactions !== "object"
    ) {
      return;
    }

    const exists = messages.some((item) => item.id === message.id);
    if (exists) {
      return;
    }

    messages.push(message);
    if (messages.length > MAX_MESSAGES) {
      messages.splice(0, messages.length - MAX_MESSAGES);
    }

    socket.to(ROOM_ID).emit("message:create", message);
  });

  socket.on("message:edit", (payload) => {
    const messageId = payload?.messageId;
    const nextText = payload?.nextText;
    const requesterId = payload?.requesterId;
    if (
      typeof messageId !== "string" ||
      typeof nextText !== "string" ||
      !isValidProfileId(requesterId)
    ) {
      return;
    }

    const normalized = nextText.trim();
    if (!normalized) {
      return;
    }

    const target = messages.find((message) => message.id === messageId);
    if (!target || target.authorId !== requesterId) {
      return;
    }

    target.text = normalized;
    target.editedAt = new Date().toISOString();

    socket
      .to(ROOM_ID)
      .emit("message:edit", { messageId, nextText: normalized, requesterId });
  });

  socket.on("message:delete", (payload) => {
    const messageId = payload?.messageId;
    const requesterId = payload?.requesterId;
    if (typeof messageId !== "string" || !isValidProfileId(requesterId)) {
      return;
    }

    const targetIndex = messages.findIndex(
      (message) => message.id === messageId && message.authorId === requesterId,
    );
    if (targetIndex === -1) {
      return;
    }

    messages.splice(targetIndex, 1);
    socket.to(ROOM_ID).emit("message:delete", { messageId, requesterId });
  });

  socket.on("reaction:toggle", (payload) => {
    const messageId = payload?.messageId;
    const emoji = payload?.emoji;
    const requesterId = payload?.requesterId;
    if (
      typeof messageId !== "string" ||
      typeof emoji !== "string" ||
      !isValidProfileId(requesterId)
    ) {
      return;
    }

    const target = messages.find((message) => message.id === messageId);
    if (!target) {
      return;
    }

    const existing = target.reactions[emoji] ?? [];
    const alreadyReacted = existing.includes(requesterId);
    const next = alreadyReacted
      ? existing.filter((id) => id !== requesterId)
      : [...existing, requesterId];

    target.reactions[emoji] = next;
    if (target.reactions[emoji].length === 0) {
      delete target.reactions[emoji];
    }

    socket
      .to(ROOM_ID)
      .emit("reaction:toggle", { messageId, emoji, requesterId });
  });

  socket.on("typing", (payload) => {
    const profileId = payload?.profileId;
    const isTyping = payload?.isTyping;
    if (!isValidProfileId(profileId) || typeof isTyping !== "boolean") {
      return;
    }
    if (socket.data.profileId !== profileId) {
      return;
    }

    socket.to(ROOM_ID).emit("typing:update", { profileId, isTyping });
  });

  socket.on("disconnect", () => {
    removeSocketFromPresence(socket);
    emitPresence();
  });
});

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
