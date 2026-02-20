import { useCallback, useEffect, useState } from "react";
import {
  BellRing,
  BookCheck,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  NotebookPen,
} from "lucide-react";
import { getProfileById } from "../../data/profiles";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { localRealtimeAdapter } from "../../services/realtimeAdapter";
import { useAppStore } from "../../store/useAppStore";
import type { ChatMessage, ProfileId } from "../../types/chat";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";

const activityCards = [
  {
    icon: CalendarClock,
    title: "Schedule",
    value: "4 classes today",
    detail: "Next: Science Lab at 10:15 AM",
  },
  {
    icon: ClipboardList,
    title: "Assignments",
    value: "3 due this week",
    detail: "Math worksheet due tomorrow",
  },
  {
    icon: BellRing,
    title: "Announcements",
    value: "2 new updates",
    detail: "Field trip form closes Friday",
  },
];

const todaySchedule = [
  { time: "08:30", label: "Homeroom check-in", tag: "Attendance" },
  { time: "09:00", label: "Math problem workshop", tag: "Class" },
  { time: "10:15", label: "Science lab partner activity", tag: "Lab" },
  { time: "12:30", label: "Reading club prep", tag: "Club" },
];

const focusTasks = [
  "Submit chapter summary",
  "Review science formulas",
  "Complete vocabulary quiz",
  "Prepare group presentation notes",
];

export default function ChatRoom() {
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const messages = useAppStore((state) => state.messages);
  const leaveChat = useAppStore((state) => state.leaveChat);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const editMessage = useAppStore((state) => state.editMessage);
  const deleteMessage = useAppStore((state) => state.deleteMessage);
  const toggleReaction = useAppStore((state) => state.toggleReaction);

  const [draft, setDraft] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const bottomRef = useAutoScroll(messages.at(-1)?.id, "auto");

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

  if (!activeProfileId) {
    return null;
  }

  const currentProfileId: ProfileId = activeProfileId;
  const partnerProfileId: ProfileId =
    currentProfileId === "alli" ? "eddie" : "alli";
  const currentProfile = getProfileById(currentProfileId);
  const partnerProfile = getProfileById(partnerProfileId);
  const typingLabel = draft.trim().length > 0 ? "Drafting update..." : null;

  const handleSubmit = useCallback((): void => {
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
    if (editingMessageId === messageId) {
      setEditingMessageId(null);
      setDraft("");
    }
  }, [currentProfileId, deleteMessage, editingMessageId]);

  const handleToggleReaction = useCallback((messageId: string, emoji: string): void => {
    toggleReaction(messageId, emoji, currentProfileId);
  }, [currentProfileId, toggleReaction]);

  const handleCancelEdit = useCallback((): void => {
    setEditingMessageId(null);
    setDraft("");
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-3 pb-5 pt-20 md:px-6">
      <ChatHeader
        currentProfile={currentProfile}
        partnerProfile={partnerProfile}
        onLeave={leaveChat}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.45fr_0.95fr]">
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activityCards.map((item) => (
              <article
                key={item.title}
                className="glass-card rounded-2xl border border-border p-4 shadow-soft"
              >
                <div className="mb-2 inline-flex rounded-xl bg-accent/15 p-2 text-accent">
                  <item.icon size={16} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {item.title}
                </p>
                <p className="mt-1 text-base font-bold">{item.value}</p>
                <p className="mt-1 text-xs text-muted">{item.detail}</p>
              </article>
            ))}
          </div>

          <article className="glass-card rounded-2xl border border-border p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <CalendarClock size={17} className="text-accent" />
              <h2 className="text-base font-black">Today&apos;s Activity Schedule</h2>
            </div>
            <ul className="space-y-2">
              {todaySchedule.map((entry) => (
                <li
                  key={`${entry.time}-${entry.label}`}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-surface/80 px-3 py-2"
                >
                  <div>
                    <p className="text-xs font-semibold">{entry.label}</p>
                    <p className="text-[11px] text-muted">{entry.tag}</p>
                  </div>
                  <span className="rounded-full border border-border px-2 py-1 text-[11px] text-muted">
                    {entry.time}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <div className="grid gap-3 sm:grid-cols-2">
            <article className="glass-card rounded-2xl border border-border p-4 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <BookCheck size={17} className="text-accent" />
                <h2 className="text-base font-black">Focus Tasks</h2>
              </div>
              <ul className="space-y-2">
                {focusTasks.map((task) => (
                  <li
                    key={task}
                    className="flex items-start gap-2 rounded-xl border border-border/80 bg-surface/80 px-3 py-2 text-xs"
                  >
                    <NotebookPen size={14} className="mt-0.5 shrink-0 text-accent" />
                    {task}
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass-card rounded-2xl border border-border p-4 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <GraduationCap size={17} className="text-accent" />
                <h2 className="text-base font-black">Notes</h2>
              </div>
              <p className="rounded-xl border border-border/80 bg-surface/80 px-3 py-3 text-xs leading-relaxed text-muted">
                Keep class updates short and actionable in the right-side feed.
                This keeps the page focused on activities instead of long chat
                threads.
              </p>
            </article>
          </div>
        </section>

        <aside className="flex min-h-[620px] flex-col gap-2">
          <div className="glass-card rounded-2xl border border-border p-3 shadow-soft">
            <p className="text-sm font-black">Team Updates Feed</p>
            <p className="text-xs text-muted">
              Compact channel for quick coordination with {partnerProfile.name}.
            </p>
          </div>

          <MessageList
            messages={messages}
            compact
            className="h-[360px]"
            currentProfileId={currentProfileId}
            bottomRef={bottomRef}
            onEditRequest={handleEditRequest}
            onDelete={handleDelete}
            onToggleReaction={handleToggleReaction}
          />

          <div className="min-h-5">
            <TypingIndicator label={typingLabel} />
          </div>

          <ChatInput
            compact
            draft={draft}
            isEditing={Boolean(editingMessageId)}
            onDraftChange={setDraft}
            onSubmit={handleSubmit}
            onCancelEdit={handleCancelEdit}
          />
        </aside>
      </div>
    </main>
  );
}
