import { io, type Socket } from "socket.io-client";
import type { ChatMessage, ProfileId } from "../types/chat";

export interface RealtimeAdapter {
  connect: (
    profileId: ProfileId,
    handlers: {
      onMessagesSync: (messages: ChatMessage[]) => void;
      onMessage: (message: ChatMessage) => void;
      onMessageEdit: (
        messageId: string,
        nextText: string,
        requesterId: ProfileId,
      ) => void;
      onMessageDelete: (messageId: string, requesterId: ProfileId) => void;
      onReactionToggle: (
        messageId: string,
        emoji: string,
        requesterId: ProfileId,
      ) => void;
      onTypingChange: (profileId: ProfileId, isTyping: boolean) => void;
      onPresenceChange: (profileId: ProfileId, isOnline: boolean) => void;
    },
  ) => () => void;
  sendMessage: (message: ChatMessage) => Promise<void>;
  sendMessageEdit: (
    messageId: string,
    nextText: string,
    requesterId: ProfileId,
  ) => Promise<void>;
  sendMessageDelete: (messageId: string, requesterId: ProfileId) => Promise<void>;
  sendReactionToggle: (
    messageId: string,
    emoji: string,
    requesterId: ProfileId,
  ) => Promise<void>;
  sendTyping: (profileId: ProfileId, isTyping: boolean) => Promise<void>;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;
const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  path: "/socket.io",
  transports: ["websocket", "polling"],
});

function ensureConnected(): void {
  if (!socket.connected) {
    socket.connect();
  }
}

export const localRealtimeAdapter: RealtimeAdapter = {
  connect: (profileId, handlers) => {
    const join = () => {
      socket.emit("join", { profileId });
    };
    const onConnect = () => {
      join();
    };
    const onMessagesSync = (messages: ChatMessage[]) => {
      handlers.onMessagesSync(messages);
    };
    const onMessageCreate = (message: ChatMessage) => {
      handlers.onMessage(message);
    };
    const onMessageEdit = (payload: {
      messageId: string;
      nextText: string;
      requesterId: ProfileId;
    }) => {
      handlers.onMessageEdit(
        payload.messageId,
        payload.nextText,
        payload.requesterId,
      );
    };
    const onMessageDelete = (payload: {
      messageId: string;
      requesterId: ProfileId;
    }) => {
      handlers.onMessageDelete(payload.messageId, payload.requesterId);
    };
    const onReactionToggle = (payload: {
      messageId: string;
      emoji: string;
      requesterId: ProfileId;
    }) => {
      handlers.onReactionToggle(
        payload.messageId,
        payload.emoji,
        payload.requesterId,
      );
    };
    const onTypingUpdate = (payload: {
      profileId: ProfileId;
      isTyping: boolean;
    }) => {
      handlers.onTypingChange(payload.profileId, payload.isTyping);
    };
    const onPresenceUpdate = (payload: {
      profileId: ProfileId;
      isOnline: boolean;
    }) => {
      handlers.onPresenceChange(payload.profileId, payload.isOnline);
    };

    ensureConnected();
    socket.on("connect", onConnect);
    socket.on("messages:sync", onMessagesSync);
    socket.on("message:create", onMessageCreate);
    socket.on("message:edit", onMessageEdit);
    socket.on("message:delete", onMessageDelete);
    socket.on("reaction:toggle", onReactionToggle);
    socket.on("typing:update", onTypingUpdate);
    socket.on("presence:update", onPresenceUpdate);
    if (socket.connected) {
      join();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("messages:sync", onMessagesSync);
      socket.off("message:create", onMessageCreate);
      socket.off("message:edit", onMessageEdit);
      socket.off("message:delete", onMessageDelete);
      socket.off("reaction:toggle", onReactionToggle);
      socket.off("typing:update", onTypingUpdate);
      socket.off("presence:update", onPresenceUpdate);
      socket.emit("leave", { profileId });
      socket.disconnect();
    };
  },
  sendMessage: async (message) => {
    ensureConnected();
    socket.emit("message:create", { message });
  },
  sendMessageEdit: async (messageId, nextText, requesterId) => {
    ensureConnected();
    socket.emit("message:edit", {
      messageId,
      nextText,
      requesterId,
    });
  },
  sendMessageDelete: async (messageId, requesterId) => {
    ensureConnected();
    socket.emit("message:delete", {
      messageId,
      requesterId,
    });
  },
  sendReactionToggle: async (messageId, emoji, requesterId) => {
    ensureConnected();
    socket.emit("reaction:toggle", {
      messageId,
      emoji,
      requesterId,
    });
  },
  sendTyping: async (profileId, isTyping) => {
    ensureConnected();
    socket.emit("typing", {
      profileId,
      isTyping,
    });
  },
};
