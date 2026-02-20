import { useEffect, useRef, useState } from "react";
import { getProfileById } from "../../data/profiles";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { localRealtimeAdapter } from "../../services/realtimeAdapter";
import { useAppStore } from "../../store/useAppStore";
import type { ChatMessage, ProfileId } from "../../types/chat";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";

const BOT_REPLIES = [
  "Nice point! I added that to our class notes ✅",
  "Can we review this after the quiz warm-up?",
  "Love that idea. Let's make a mini checklist!",
  "I found a shortcut for that problem. Want it?",
  "Great explanation 👏",
];

export default function ChatRoom() {
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const messages = useAppStore((state) => state.messages);
  const typingByProfile = useAppStore((state) => state.typingByProfile);
  const leaveChat = useAppStore((state) => state.leaveChat);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const editMessage = useAppStore((state) => state.editMessage);
  const deleteMessage = useAppStore((state) => state.deleteMessage);
  const toggleReaction = useAppStore((state) => state.toggleReaction);
  const setTyping = useAppStore((state) => state.setTyping);

  const [draft, setDraft] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const bottomRef = useAutoScroll(messages.length);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!activeProfileId) {
      return;
    }
    const disconnect = localRealtimeAdapter.connect(activeProfileId, {
      onMessage: () => undefined,
      onTypingChange: () => undefined,
    });

    return disconnect;
  }, [activeProfileId]);

  useEffect(() => {
    if (!activeProfileId) {
      return;
    }
    setTyping(activeProfileId, draft.trim().length > 0);
    return () => setTyping(activeProfileId, false);
  }, [draft, activeProfileId, setTyping]);

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
    : draft.trim().length > 0
      ? "You are typing..."
      : null;

  function handleSubmit(): void {
    const normalized = draft.trim();
    if (!normalized) {
      return;
    }

    if (editingMessageId) {
      editMessage(editingMessageId, normalized, currentProfileId);
      setEditingMessageId(null);
      setDraft("");
      return;
    }

    sendMessage(currentProfileId, normalized);
    setDraft("");
    setTyping(currentProfileId, false);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setTyping(partnerProfileId, true);
    const nextReply =
      BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)] ??
      "Sounds great!";

    timeoutRef.current = window.setTimeout(() => {
      sendMessage(partnerProfileId, nextReply);
      setTyping(partnerProfileId, false);
    }, 1100 + Math.floor(Math.random() * 800));
  }

  function handleEditRequest(message: ChatMessage): void {
    if (message.authorId !== currentProfileId) {
      return;
    }
    setEditingMessageId(message.id);
    setDraft(message.text);
  }

  function handleDelete(messageId: string): void {
    deleteMessage(messageId, currentProfileId);
    if (editingMessageId === messageId) {
      setEditingMessageId(null);
      setDraft("");
    }
  }

  function handleToggleReaction(messageId: string, emoji: string): void {
    toggleReaction(messageId, emoji, currentProfileId);
  }

  function handleCancelEdit(): void {
    setEditingMessageId(null);
    setDraft("");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-3 px-3 pb-5 pt-20 md:gap-4 md:px-6">
      <ChatHeader
        currentProfile={currentProfile}
        partnerProfile={partnerProfile}
        onLeave={leaveChat}
      />

      <MessageList
        messages={messages}
        currentProfileId={currentProfileId}
        bottomRef={bottomRef}
        onEditRequest={handleEditRequest}
        onDelete={handleDelete}
        onToggleReaction={handleToggleReaction}
      />

      <div className="flex min-h-6 items-center">
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
