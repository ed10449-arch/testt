import type { RefObject } from "react";
import { AnimatePresence } from "framer-motion";
import { getProfileById } from "../../data/profiles";
import type { ChatMessage, ProfileId } from "../../types/chat";
import { buildTimelineItems } from "../../utils/time";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  currentProfileId: ProfileId;
  bottomRef: RefObject<HTMLDivElement | null>;
  onEditRequest: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

export default function MessageList({
  messages,
  currentProfileId,
  bottomRef,
  onEditRequest,
  onDelete,
  onToggleReaction,
}: MessageListProps) {
  const timeline = buildTimelineItems(messages);

  return (
    <section className="glass-card flex-1 overflow-y-auto rounded-2xl border border-border p-4 shadow-soft">
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {timeline.map((item, index) => {
            if (item.type === "date") {
              return (
                <div key={`${item.value}-${index}`} className="py-1 text-center">
                  <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
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
                isOwn={isOwn}
                currentProfileId={currentProfileId}
                authorProfile={getProfileById(message.authorId)}
                onEditRequest={onEditRequest}
                onDelete={onDelete}
                onToggleReaction={onToggleReaction}
              />
            );
          })}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </section>
  );
}
