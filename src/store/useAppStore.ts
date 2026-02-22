import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChatMessage, ProfileId, ThemeMode } from "../types/chat";
import { createMessageId } from "../utils/time";

function areMessagesEqual(left: ChatMessage[], right: ChatMessage[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const a = left[index];
    const b = right[index];
    if (!a || !b) {
      return false;
    }

    if (
      a.id !== b.id ||
      a.authorId !== b.authorId ||
      a.text !== b.text ||
      a.createdAt !== b.createdAt ||
      a.editedAt !== b.editedAt
    ) {
      return false;
    }

    const aReactions = Object.entries(a.reactions);
    const bReactions = Object.entries(b.reactions);
    if (aReactions.length !== bReactions.length) {
      return false;
    }

    for (const [emoji, users] of aReactions) {
      const otherUsers = b.reactions[emoji];
      if (!otherUsers || otherUsers.length !== users.length) {
        return false;
      }
      for (let reactionIndex = 0; reactionIndex < users.length; reactionIndex += 1) {
        if (users[reactionIndex] !== otherUsers[reactionIndex]) {
          return false;
        }
      }
    }
  }

  return true;
}

interface AppState {
  theme: ThemeMode;
  passwordUnlocked: boolean;
  activeProfileId: ProfileId | null;
  messages: ChatMessage[];
  messagesVersion: number;
  toggleTheme: () => void;
  unlockGate: () => void;
  lockGate: () => void;
  selectProfile: (profileId: ProfileId) => void;
  leaveChat: () => void;
  sendMessage: (authorId: ProfileId, text: string) => ChatMessage | null;
  receiveMessage: (message: ChatMessage) => void;
  replaceMessages: (messages: ChatMessage[], version?: number) => void;
  editMessage: (messageId: string, nextText: string, requesterId: ProfileId) => void;
  deleteMessage: (messageId: string, requesterId: ProfileId) => void;
  toggleReaction: (messageId: string, emoji: string, requesterId: ProfileId) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "light",
      passwordUnlocked: false,
      activeProfileId: null,
      messages: [],
      messagesVersion: 0,
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      unlockGate: () => set({ passwordUnlocked: true }),
      lockGate: () =>
        set({
          passwordUnlocked: false,
          activeProfileId: null,
        }),
      selectProfile: (profileId) => set({ activeProfileId: profileId }),
      leaveChat: () => set({ activeProfileId: null }),
      sendMessage: (authorId, text) => {
        const normalized = text.trim();
        if (!normalized) {
          return null;
        }
        const nextMessage: ChatMessage = {
          id: createMessageId(),
          authorId,
          text: normalized,
          createdAt: new Date().toISOString(),
          reactions: {},
        };
        set((state) => ({
          messages: [...state.messages, nextMessage],
          messagesVersion: state.messagesVersion + 1,
        }));
        return nextMessage;
      },
      receiveMessage: (message) =>
        set((state) => {
          const exists = state.messages.some((item) => item.id === message.id);
          if (exists) {
            return state;
          }
          return {
            messages: [...state.messages, message],
            messagesVersion: state.messagesVersion + 1,
          };
        }),
      replaceMessages: (messages, version) =>
        set((state) => {
          if (areMessagesEqual(state.messages, messages)) {
            return state;
          }
          return {
            messages,
            messagesVersion: version ?? state.messagesVersion + 1,
          };
        }),
      editMessage: (messageId, nextText, requesterId) => {
        const normalized = nextText.trim();
        if (!normalized) {
          return;
        }
        set((state) => {
          let changed = false;
          const nextMessages = state.messages.map((message) => {
            if (message.id !== messageId || message.authorId !== requesterId) {
              return message;
            }

            if (message.text === normalized) {
              return message;
            }

            changed = true;
            return {
              ...message,
              text: normalized,
              editedAt: new Date().toISOString(),
            };
          });

          if (!changed) {
            return state;
          }

          return {
            messages: nextMessages,
            messagesVersion: state.messagesVersion + 1,
          };
        });
      },
      deleteMessage: (messageId, requesterId) =>
        set((state) => {
          const nextMessages = state.messages.filter(
            (message) =>
              message.id !== messageId || message.authorId !== requesterId,
          );
          if (nextMessages.length === state.messages.length) {
            return state;
          }
          return {
            messages: nextMessages,
            messagesVersion: state.messagesVersion + 1,
          };
        }),
      toggleReaction: (messageId, emoji, requesterId) =>
        set((state) => {
          let changed = false;
          const nextMessages = state.messages.map((message) => {
            if (message.id !== messageId) {
              return message;
            }

            const existingForEmoji = message.reactions[emoji] ?? [];
            const alreadyReacted = existingForEmoji.includes(requesterId);
            const nextForEmoji = alreadyReacted
              ? existingForEmoji.filter((profileId) => profileId !== requesterId)
              : [...existingForEmoji, requesterId];

            const nextReactions = {
              ...message.reactions,
              [emoji]: nextForEmoji,
            };

            if (nextForEmoji.length === 0) {
              delete nextReactions[emoji];
            }

            changed = true;
            return {
              ...message,
              reactions: nextReactions,
            };
          });

          if (!changed) {
            return state;
          }

          return {
            messages: nextMessages,
            messagesVersion: state.messagesVersion + 1,
          };
        }),
    }),
    {
      name: "classroom-chat-storage",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        const state = (persistedState ?? {}) as Partial<AppState>;
        if (version < 2 && persistedState) {
          return {
            ...state,
            messages: [],
            messagesVersion: 0,
          };
        }
        if (version < 3) {
          return {
            ...state,
            messagesVersion:
              typeof state.messagesVersion === "number" ? state.messagesVersion : 0,
          };
        }
        return state;
      },
      partialize: (state) => ({
        theme: state.theme,
        passwordUnlocked: state.passwordUnlocked,
        activeProfileId: state.activeProfileId,
        messages: state.messages,
        messagesVersion: state.messagesVersion,
      }),
    },
  ),
);
