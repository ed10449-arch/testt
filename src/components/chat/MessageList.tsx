import { useMemo, type RefObject, type UIEventHandler } from "react";
import { getProfileById } from "../../data/profiles";
import type { ChatMessage, ProfileId } from "../../types/chat";
import { buildTimelineItems } from "../../utils/time";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  currentProfileId: ProfileId;
  compact?: boolean;
  className?: string;
  emptyLabel?: string;
  bottomRef: RefObject<HTMLDivElement | null>;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  onScroll?: UIEventHandler<HTMLElement>;
  onEditRequest: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

export default function MessageList({
  messages,
  currentProfileId,
  compact = false,
  className = "",
  emptyLabel = "No messages yet. Start the conversation.",
  bottomRef,
  scrollContainerRef,
  onScroll,
  onEditRequest,
  onDelete,
  onToggleReaction,
}: MessageListProps) {
  const timeline = useMemo(() => buildTimelineItems(messages), [messages]);

  return (
    <section
      ref={scrollContainerRef}
      onScroll={onScroll}
      className={`glass-card flex-1 overflow-y-auto rounded-2xl border border-border shadow-soft ${compact ? "p-2.5" : "p-4"} ${className}`}
    >
      <div className={compact ? "space-y-2" : "space-y-3"}>
        {timeline.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted">
            {emptyLabel}
          </div>
        )}

        {timeline.map((item, index) => {
          if (item.type === "date") {
            return (
              <div key={`${item.value}-${index}`} className="py-1 text-center">
                <span
                  className={`rounded-full border border-border bg-surface font-semibold text-muted ${compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}`}
                >
                  {item.value}
                </span>
              </div>
            );
          }

          const message = item.value;
          const isOwn = message.authorId === currentProfileId;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              compact={compact}
              isOwn={isOwn}
              currentProfileId={currentProfileId}
              authorProfile={getProfileById(message.authorId)}
              onEditRequest={onEditRequest}
              onDelete={onDelete}
              onToggleReaction={onToggleReaction}
            />
          );
        })}

        <div ref={bottomRef} />
      </div>
    </section>
  );
}
