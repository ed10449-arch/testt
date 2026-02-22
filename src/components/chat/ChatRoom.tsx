import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { getProfileById } from "../../data/profiles";
import { localRealtimeAdapter } from "../../services/realtimeAdapter";
import { useAppStore } from "../../store/useAppStore";
import type { ChatMessage, ProfileId } from "../../types/chat";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";

const BOTTOM_LOCK_THRESHOLD = 60;
const TYPING_RESET_MS = 2200;

export default function ChatRoom() {
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const messages = useAppStore((state) => state.messages);
  const messagesVersion = useAppStore((state) => state.messagesVersion);
  const leaveChat = useAppStore((state) => state.leaveChat);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const receiveMessage = useAppStore((state) => state.receiveMessage);
  const replaceMessages = useAppStore((state) => state.replaceMessages);
  const editMessage = useAppStore((state) => state.editMessage);
  const deleteMessage = useAppStore((state) => state.deleteMessage);
  const toggleReaction = useAppStore((state) => state.toggleReaction);

  const [draft, setDraft] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [typingByProfile, setTypingByProfile] = useState<Record<ProfileId, boolean>>({
    alli: false,
    eddie: false,
  });
  const [onlineByProfile, setOnlineByProfile] = useState<Record<ProfileId, boolean>>({
    alli: false,
    eddie: false,
  });
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);
  const previousMessageCountRef = useRef(0);
  const localTypingRef = useRef(false);
  const typingTimeoutsRef = useRef<Partial<Record<ProfileId, number>>>({});

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior });
    isAtBottomRef.current = true;
    setShowJumpToBottom(false);
    setNewMessageCount(0);
  }, []);

  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isAtBottom = distanceFromBottom <= BOTTOM_LOCK_THRESHOLD;
    isAtBottomRef.current = isAtBottom;
    setShowJumpToBottom((previous) =>
      previous === !isAtBottom ? previous : !isAtBottom,
    );
    if (isAtBottom) {
      setNewMessageCount(0);
    }
  }, []);

  const handleScroll = useCallback(() => {
    updateScrollState();
  }, [updateScrollState]);

  useEffect(() => {
    if (!activeProfileId) {
      return;
    }

    setOnlineByProfile((state) => ({
      ...state,
      [activeProfileId]: true,
    }));

    const disconnect = localRealtimeAdapter.connect(activeProfileId, {
      onMessage: (message) => {
        receiveMessage(message);
        setOnlineByProfile((state) => ({
          ...state,
          [message.authorId]: true,
        }));
      },
      onMessageEdit: (messageId, nextText, requesterId) => {
        editMessage(messageId, nextText, requesterId);
        setOnlineByProfile((state) => ({
          ...state,
          [requesterId]: true,
        }));
      },
      onMessageDelete: (messageId, requesterId) => {
        deleteMessage(messageId, requesterId);
        setOnlineByProfile((state) => ({
          ...state,
          [requesterId]: true,
        }));
      },
      onReactionToggle: (messageId, emoji, requesterId) => {
        toggleReaction(messageId, emoji, requesterId);
        setOnlineByProfile((state) => ({
          ...state,
          [requesterId]: true,
        }));
      },
      onTypingChange: (profileId, isTyping) => {
        if (profileId === activeProfileId) {
          return;
        }

        const existingTimeout = typingTimeoutsRef.current[profileId];
        if (existingTimeout) {
          window.clearTimeout(existingTimeout);
        }

        setTypingByProfile((state) => ({
          ...state,
          [profileId]: isTyping,
        }));

        if (isTyping) {
          setOnlineByProfile((state) => ({
            ...state,
            [profileId]: true,
          }));
        }

        if (isTyping) {
          typingTimeoutsRef.current[profileId] = window.setTimeout(() => {
            setTypingByProfile((state) => ({
              ...state,
              [profileId]: false,
            }));
          }, TYPING_RESET_MS);
        }
      },
      onPresenceChange: (profileId, isOnline) => {
        setOnlineByProfile((state) => ({
          ...state,
          [profileId]: isOnline,
        }));
      },
    });

    return () => {
      disconnect();
      Object.values(typingTimeoutsRef.current).forEach((timeoutId) => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      });
      typingTimeoutsRef.current = {};
      setTypingByProfile({ alli: false, eddie: false });
      setOnlineByProfile((state) => ({
        ...state,
        [activeProfileId]: false,
      }));
    };
  }, [
    activeProfileId,
    deleteMessage,
    editMessage,
    receiveMessage,
    toggleReaction,
  ]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "classroom-chat-storage" || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as {
          state?: {
            messages?: ChatMessage[];
            messagesVersion?: number;
          };
        };

        const nextMessages = payload.state?.messages;
        const nextVersion = payload.state?.messagesVersion;
        if (!Array.isArray(nextMessages) || typeof nextVersion !== "number") {
          return;
        }
        if (nextVersion <= messagesVersion) {
          return;
        }

        replaceMessages(nextMessages, nextVersion);
      } catch {
        // Ignore malformed storage payloads.
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [messagesVersion, replaceMessages]);

  useEffect(() => {
    if (!activeProfileId) {
      return;
    }

    const isTyping = draft.trim().length > 0;
    if (localTypingRef.current === isTyping) {
      return;
    }

    localTypingRef.current = isTyping;
    void localRealtimeAdapter.sendTyping(activeProfileId, isTyping);
  }, [activeProfileId, draft]);

  useEffect(() => {
    if (!activeProfileId) {
      return;
    }

    return () => {
      if (localTypingRef.current) {
        localTypingRef.current = false;
        void localRealtimeAdapter.sendTyping(activeProfileId, false);
      }
    };
  }, [activeProfileId]);

  useEffect(() => {
    previousMessageCountRef.current = 0;
    requestAnimationFrame(() => {
      scrollToBottom("auto");
      updateScrollState();
    });
  }, [activeProfileId, scrollToBottom, updateScrollState]);

  useEffect(() => {
    const currentCount = messages.length;
    const previousCount = previousMessageCountRef.current;
    previousMessageCountRef.current = currentCount;

    if (currentCount === 0 || currentCount <= previousCount) {
      return;
    }

    if (isAtBottomRef.current) {
      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
      return;
    }

    setShowJumpToBottom(true);
    setNewMessageCount((count) => count + 1);
  }, [messages, scrollToBottom]);

  if (!activeProfileId) {
    return null;
  }

  const currentProfileId: ProfileId = activeProfileId;
  const partnerProfileId: ProfileId =
    currentProfileId === "alli" ? "eddie" : "alli";
  const currentProfile = getProfileById(currentProfileId);
  const partnerProfile = getProfileById(partnerProfileId);
  const typingLabel = typingByProfile[partnerProfileId]
    ? `${partnerProfile.name} is typing...`
    : null;

  const handleSubmit = useCallback((): void => {
    const normalized = draft.trim();
    if (!normalized) {
      return;
    }

    if (editingMessageId) {
      editMessage(editingMessageId, normalized, currentProfileId);
      void localRealtimeAdapter.sendMessageEdit(
        editingMessageId,
        normalized,
        currentProfileId,
      );
      setEditingMessageId(null);
      setDraft("");
      return;
    }

    const nextMessage = sendMessage(currentProfileId, normalized);
    if (nextMessage) {
      void localRealtimeAdapter.sendMessage(nextMessage);
    }
    setDraft("");
  }, [
    currentProfileId,
    draft,
    editMessage,
    editingMessageId,
    sendMessage,
  ]);

  const handleEditRequest = useCallback((message: ChatMessage): void => {
    if (message.authorId !== currentProfileId) {
      return;
    }
    setEditingMessageId(message.id);
    setDraft(message.text);
  }, [currentProfileId]);

  const handleDelete = useCallback((messageId: string): void => {
    deleteMessage(messageId, currentProfileId);
    void localRealtimeAdapter.sendMessageDelete(messageId, currentProfileId);
    if (editingMessageId === messageId) {
      setEditingMessageId(null);
      setDraft("");
    }
  }, [currentProfileId, deleteMessage, editingMessageId]);

  const handleToggleReaction = useCallback((messageId: string, emoji: string): void => {
    toggleReaction(messageId, emoji, currentProfileId);
    void localRealtimeAdapter.sendReactionToggle(
      messageId,
      emoji,
      currentProfileId,
    );
  }, [currentProfileId, toggleReaction]);

  const handleCancelEdit = useCallback((): void => {
    setEditingMessageId(null);
    setDraft("");
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-3 px-3 pb-4 pt-20 md:px-6">
      <ChatHeader
        currentProfile={currentProfile}
        partnerProfile={partnerProfile}
        partnerOnline={onlineByProfile[partnerProfileId]}
        onLeave={leaveChat}
      />

      <section className="relative flex min-h-0 flex-1">
        <MessageList
          messages={messages}
          className="h-[calc(100vh-245px)] w-full md:h-[calc(100vh-230px)]"
          currentProfileId={currentProfileId}
          emptyLabel={`No messages yet. Start chatting with ${partnerProfile.name}.`}
          bottomRef={bottomRef}
          scrollContainerRef={scrollContainerRef}
          onScroll={handleScroll}
          onEditRequest={handleEditRequest}
          onDelete={handleDelete}
          onToggleReaction={handleToggleReaction}
        />

        {showJumpToBottom && (
          <button
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted shadow-soft transition hover:text-text"
          >
            <ArrowDown size={13} />
            Jump to latest
            {newMessageCount > 0 ? ` (${newMessageCount})` : ""}
          </button>
        )}
      </section>

      <div className="min-h-5">
        <TypingIndicator label={typingLabel} />
      </div>

      <ChatInput
        draft={draft}
        isEditing={Boolean(editingMessageId)}
        onDraftChange={setDraft}
        onSubmit={handleSubmit}
        onCancelEdit={handleCancelEdit}
      />
    </main>
  );
}
