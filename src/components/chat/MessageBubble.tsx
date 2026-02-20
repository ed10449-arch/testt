import { memo } from "react";
import { PencilLine, Trash2 } from "lucide-react";
import type { ChatMessage, ProfileId, UserProfile } from "../../types/chat";
import { formatTime } from "../../utils/time";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "📚", "🔥"];

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  compact?: boolean;
  authorProfile: UserProfile;
  currentProfileId: ProfileId;
  onEditRequest: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

function MessageBubble({
  message,
  isOwn,
  compact = false,
  authorProfile,
  currentProfileId,
  onEditRequest,
  onDelete,
  onToggleReaction,
}: MessageBubbleProps) {
  return (
    <article className={`group flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[95%] rounded-2xl border shadow-soft sm:max-w-[82%] ${
          isOwn
            ? "border-cyan-400/35 bg-cyan-500/15"
            : "border-border bg-surface text-text"
        } ${compact ? "px-3 py-2" : "px-4 py-3"}`}
      >
        <div className={`mb-1 flex items-center gap-2 ${compact ? "text-[11px]" : ""}`}>
          <span className="text-xs font-semibold text-muted">
            {authorProfile.name}
          </span>
          <span className={compact ? "text-sm" : "text-base"}>{authorProfile.avatar}</span>
        </div>

        <p className={`whitespace-pre-wrap ${compact ? "text-xs leading-snug" : "text-sm leading-relaxed"}`}>
          {message.text}
        </p>

        <div className={`mt-2 flex flex-wrap items-center gap-2 ${compact ? "text-[10px]" : ""}`}>
          <span className="text-[11px] text-muted">
            {formatTime(message.createdAt)}
            {message.editedAt ? " • edited" : ""}
          </span>

          {isOwn && (
            <div className="ml-auto flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <button
                onClick={() => onEditRequest(message)}
                className="rounded-md border border-border p-1 text-muted transition hover:text-text"
                title="Edit message"
              >
                <PencilLine size={13} />
              </button>
              <button
                onClick={() => onDelete(message.id)}
                className="rounded-md border border-border p-1 text-muted transition hover:text-red-400"
                title="Delete message"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(message.reactions).map(([emoji, userIds]) => {
            const isActive = userIds.includes(currentProfileId);
            return (
              <button
                key={emoji}
                onClick={() => onToggleReaction(message.id, emoji)}
                className={`rounded-full border transition ${
                  isActive
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-surface text-muted hover:text-text"
                } ${compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"}`}
                title="Toggle reaction"
              >
                {emoji} {userIds.length}
              </button>
            );
          })}
        </div>

        <div className="mt-2 hidden flex-wrap gap-1 group-hover:flex">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onToggleReaction(message.id, emoji)}
              className={`rounded-full border border-border bg-surface text-muted transition hover:scale-105 hover:text-text ${
                compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
              }`}
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

export default memo(MessageBubble);
