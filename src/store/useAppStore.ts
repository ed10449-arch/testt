import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChatMessage, ProfileId, ThemeMode } from "../types/chat";
import { createMessageId } from "../utils/time";

interface AppState {
  theme: ThemeMode;
  passwordUnlocked: boolean;
  activeProfileId: ProfileId | null;
  messages: ChatMessage[];
  toggleTheme: () => void;
  unlockGate: () => void;
  lockGate: () => void;
  selectProfile: (profileId: ProfileId) => void;
  leaveChat: () => void;
  sendMessage: (authorId: ProfileId, text: string) => void;
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
          return;
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
        }));
      },
      editMessage: (messageId, nextText, requesterId) => {
        const normalized = nextText.trim();
        if (!normalized) {
          return;
        }
        set((state) => ({
          messages: state.messages.map((message) => {
            if (message.id !== messageId || message.authorId !== requesterId) {
              return message;
            }
            return {
              ...message,
              text: normalized,
              editedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      deleteMessage: (messageId, requesterId) =>
        set((state) => ({
          messages: state.messages.filter(
            (message) =>
              message.id !== messageId || message.authorId !== requesterId,
          ),
        })),
      toggleReaction: (messageId, emoji, requesterId) =>
        set((state) => ({
          messages: state.messages.map((message) => {
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

            return {
              ...message,
              reactions: nextReactions,
            };
          }),
        })),
    }),
    {
      name: "classroom-chat-storage",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        const state = (persistedState ?? {}) as Partial<AppState>;
        if (version < 2 && persistedState) {
          return {
            ...state,
            messages: [],
          };
        }
        return state;
      },
      partialize: (state) => ({
        theme: state.theme,
        passwordUnlocked: state.passwordUnlocked,
        activeProfileId: state.activeProfileId,
        messages: state.messages,
      }),
    },
  ),
);
