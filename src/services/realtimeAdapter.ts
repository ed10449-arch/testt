import type { ChatMessage, ProfileId } from "../types/chat";

const CHANNEL_NAME = "classroom-chat-realtime-v1";
const STORAGE_EVENT_KEY = "classroom-chat-realtime-event-v1";
const PRESENCE_STALE_MS = 90000;
const PRESENCE_PING_MS = 4000;
const SEEN_EVENT_LIMIT = 400;
const PROFILE_IDS: ProfileId[] = ["alli", "eddie"];
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

type RealtimeEventPayload =
  | {
      type: "message:create";
      payload: {
        message: ChatMessage;
      };
    }
  | {
      type: "message:edit";
      payload: {
        messageId: string;
        nextText: string;
        requesterId: ProfileId;
      };
    }
  | {
      type: "message:delete";
      payload: {
        messageId: string;
        requesterId: ProfileId;
      };
    }
  | {
      type: "reaction:toggle";
      payload: {
        messageId: string;
        emoji: string;
        requesterId: ProfileId;
      };
    }
  | {
      type: "typing";
      payload: {
        profileId: ProfileId;
        isTyping: boolean;
      };
    }
  | {
      type: "presence";
      payload: {
        profileId: ProfileId;
        isOnline: boolean;
      };
    };

type RealtimeEvent = RealtimeEventPayload & {
  eventId: string;
  sourceTabId: string;
  emittedAt: number;
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

function createEvent(event: RealtimeEventPayload): RealtimeEvent {
  return {
    ...event,
    eventId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    sourceTabId: TAB_ID,
    emittedAt: Date.now(),
  };
}

function postEvent(eventPayload: RealtimeEventPayload): void {
  const event = createEvent(eventPayload);

  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(event);
    channel.close();
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(event));
    } catch {
      // Ignore localStorage failures in restricted environments.
    }
  }
}

function pingPresence(profileId: ProfileId, isOnline: boolean): void {
  postEvent({
    type: "presence",
    payload: { profileId, isOnline },
  });
}

export const localRealtimeAdapter: RealtimeAdapter = {
  connect: (profileId, handlers) => {
    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(CHANNEL_NAME)
        : null;
    const lastPresenceByProfile: Record<ProfileId, number> = {
      alli: 0,
      eddie: 0,
    };
    const seenEvents = new Set<string>();
    const eventQueue: string[] = [];

    const markSeen = (eventId: string): boolean => {
      if (seenEvents.has(eventId)) {
        return false;
      }

      seenEvents.add(eventId);
      eventQueue.push(eventId);
      if (eventQueue.length > SEEN_EVENT_LIMIT) {
        const expired = eventQueue.shift();
        if (expired) {
          seenEvents.delete(expired);
        }
      }

      return true;
    };

    const handleEvent = (event: RealtimeEvent) => {
      if (
        !event ||
        typeof event.eventId !== "string" ||
        event.sourceTabId === TAB_ID ||
        !markSeen(event.eventId)
      ) {
        return;
      }

      switch (event.type) {
        case "message:create":
          handlers.onMessage(event.payload.message);
          break;
        case "message:edit":
          handlers.onMessageEdit(
            event.payload.messageId,
            event.payload.nextText,
            event.payload.requesterId,
          );
          break;
        case "message:delete":
          handlers.onMessageDelete(
            event.payload.messageId,
            event.payload.requesterId,
          );
          break;
        case "reaction:toggle":
          handlers.onReactionToggle(
            event.payload.messageId,
            event.payload.emoji,
            event.payload.requesterId,
          );
          break;
        case "typing":
          handlers.onTypingChange(event.payload.profileId, event.payload.isTyping);
          break;
        case "presence":
          if (event.payload.isOnline) {
            lastPresenceByProfile[event.payload.profileId] = Date.now();
            handlers.onPresenceChange(event.payload.profileId, true);
          } else {
            lastPresenceByProfile[event.payload.profileId] = 0;
            handlers.onPresenceChange(event.payload.profileId, false);
          }
          break;
        default:
          break;
      }
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

    const onVisibilityChange = () => {
      if (!document.hidden) {
        pingPresence(profileId, true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onStorageEvent = (event: StorageEvent) => {
      if (event.key !== STORAGE_EVENT_KEY || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as RealtimeEvent;
        handleEvent(payload);
      } catch {
        // Ignore malformed payloads.
      }
    };

    if (channel) {
      channel.onmessage = (event: MessageEvent<RealtimeEvent>) => {
        handleEvent(event.data);
      };
    }
    window.addEventListener("storage", onStorageEvent);

    return () => {
      pingPresence(profileId, false);
      window.clearInterval(heartbeat);
      window.clearInterval(handlePresenceTimeout);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("storage", onStorageEvent);
      channel?.close();
    };
  },
  sendMessage: async (message) => {
    postEvent({
      type: "message:create",
      payload: { message },
    });
  },
  sendMessageEdit: async (messageId, nextText, requesterId) => {
    postEvent({
      type: "message:edit",
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
      payload: {
        messageId,
        requesterId,
      },
    });
  },
  sendReactionToggle: async (messageId, emoji, requesterId) => {
    postEvent({
      type: "reaction:toggle",
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
