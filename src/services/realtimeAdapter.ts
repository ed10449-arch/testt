import type { ChatMessage, ProfileId } from "../types/chat";

const CHANNEL_NAME = "classroom-chat-realtime-v1";
const PRESENCE_STALE_MS = 12000;
const PRESENCE_PING_MS = 4000;
const PROFILE_IDS: ProfileId[] = ["alli", "eddie"];
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

type RealtimeEvent =
  | {
      type: "message:create";
      sourceTabId: string;
      payload: {
        message: ChatMessage;
      };
    }
  | {
      type: "message:edit";
      sourceTabId: string;
      payload: {
        messageId: string;
        nextText: string;
        requesterId: ProfileId;
      };
    }
  | {
      type: "message:delete";
      sourceTabId: string;
      payload: {
        messageId: string;
        requesterId: ProfileId;
      };
    }
  | {
      type: "reaction:toggle";
      sourceTabId: string;
      payload: {
        messageId: string;
        emoji: string;
        requesterId: ProfileId;
      };
    }
  | {
      type: "typing";
      sourceTabId: string;
      payload: {
        profileId: ProfileId;
        isTyping: boolean;
      };
    }
  | {
      type: "presence";
      sourceTabId: string;
      payload: {
        profileId: ProfileId;
        isOnline: boolean;
      };
    };

export interface RealtimeAdapter {
  connect: (
    profileId: ProfileId,
    handlers: {
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

function postEvent(event: RealtimeEvent): void {
  if (typeof BroadcastChannel === "undefined") {
    return;
  }
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage(event);
  channel.close();
}

function pingPresence(profileId: ProfileId, isOnline: boolean): void {
  postEvent({
    type: "presence",
    sourceTabId: TAB_ID,
    payload: { profileId, isOnline },
  });
}

export const localRealtimeAdapter: RealtimeAdapter = {
  connect: (profileId, handlers) => {
    if (typeof BroadcastChannel === "undefined") {
      handlers.onPresenceChange(profileId, true);
      return () => {
        handlers.onPresenceChange(profileId, false);
      };
    }

    const channel = new BroadcastChannel(CHANNEL_NAME);
    const lastPresenceByProfile: Record<ProfileId, number> = {
      alli: 0,
      eddie: 0,
    };

    handlers.onPresenceChange(profileId, true);
    pingPresence(profileId, true);

    const handlePresenceTimeout = window.setInterval(() => {
      const now = Date.now();
      PROFILE_IDS.forEach((id) => {
        if (id === profileId) {
          return;
        }
        const lastSeen = lastPresenceByProfile[id];
        if (lastSeen > 0 && now - lastSeen > PRESENCE_STALE_MS) {
          lastPresenceByProfile[id] = 0;
          handlers.onPresenceChange(id, false);
        }
      });
    }, 2000);

    const heartbeat = window.setInterval(() => {
      pingPresence(profileId, true);
    }, PRESENCE_PING_MS);

    channel.onmessage = (event: MessageEvent<RealtimeEvent>) => {
      const payload = event.data;
      if (!payload || payload.sourceTabId === TAB_ID) {
        return;
      }

      switch (payload.type) {
        case "message:create":
          handlers.onMessage(payload.payload.message);
          break;
        case "message:edit":
          handlers.onMessageEdit(
            payload.payload.messageId,
            payload.payload.nextText,
            payload.payload.requesterId,
          );
          break;
        case "message:delete":
          handlers.onMessageDelete(
            payload.payload.messageId,
            payload.payload.requesterId,
          );
          break;
        case "reaction:toggle":
          handlers.onReactionToggle(
            payload.payload.messageId,
            payload.payload.emoji,
            payload.payload.requesterId,
          );
          break;
        case "typing":
          handlers.onTypingChange(
            payload.payload.profileId,
            payload.payload.isTyping,
          );
          break;
        case "presence":
          if (payload.payload.isOnline) {
            lastPresenceByProfile[payload.payload.profileId] = Date.now();
            handlers.onPresenceChange(payload.payload.profileId, true);
          } else {
            lastPresenceByProfile[payload.payload.profileId] = 0;
            handlers.onPresenceChange(payload.payload.profileId, false);
          }
          break;
        default:
          break;
      }
    };

    return () => {
      pingPresence(profileId, false);
      window.clearInterval(heartbeat);
      window.clearInterval(handlePresenceTimeout);
      channel.close();
    };
  },
  sendMessage: async (message) => {
    postEvent({
      type: "message:create",
      sourceTabId: TAB_ID,
      payload: { message },
    });
  },
  sendMessageEdit: async (messageId, nextText, requesterId) => {
    postEvent({
      type: "message:edit",
      sourceTabId: TAB_ID,
      payload: {
        messageId,
        nextText,
        requesterId,
      },
    });
  },
  sendMessageDelete: async (messageId, requesterId) => {
    postEvent({
      type: "message:delete",
      sourceTabId: TAB_ID,
      payload: {
        messageId,
        requesterId,
      },
    });
  },
  sendReactionToggle: async (messageId, emoji, requesterId) => {
    postEvent({
      type: "reaction:toggle",
      sourceTabId: TAB_ID,
      payload: {
        messageId,
        emoji,
        requesterId,
      },
    });
  },
  sendTyping: async (profileId, isTyping) => {
    postEvent({
      type: "typing",
      sourceTabId: TAB_ID,
      payload: {
        profileId,
        isTyping,
      },
    });
  },
};

/**
 * Example extension points:
 *
 * - createFirebaseAdapter() { ... }
 * - createSocketAdapter(socket: Socket) { ... }
 *
 * Keep the same RealtimeAdapter interface so the UI layer stays unchanged.
 */
