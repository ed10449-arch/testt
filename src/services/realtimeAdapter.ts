import type { ChatMessage, ProfileId } from "../types/chat";

export interface RealtimeAdapter {
  connect: (
    profileId: ProfileId,
    handlers: {
      onMessage: (message: ChatMessage) => void;
      onTypingChange: (profileId: ProfileId, isTyping: boolean) => void;
    },
  ) => () => void;
  sendMessage: (message: ChatMessage) => Promise<void>;
  sendTyping: (profileId: ProfileId, isTyping: boolean) => Promise<void>;
}

/**
 * Local adapter used in demo mode.
 * Swap this with a Firebase/Socket.io implementation for true realtime sync.
 */
export const localRealtimeAdapter: RealtimeAdapter = {
  connect: () => () => undefined,
  sendMessage: async () => undefined,
  sendTyping: async () => undefined,
};

/**
 * Example extension points:
 *
 * - createFirebaseAdapter() { ... }
 * - createSocketAdapter(socket: Socket) { ... }
 *
 * Keep the same RealtimeAdapter interface so the UI layer stays unchanged.
 */
