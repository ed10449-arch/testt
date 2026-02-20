import { motion } from "framer-motion";
import { PencilLine, Trash2 } from "lucide-react";
import type { ChatMessage, ProfileId, UserProfile } from "../../types/chat";
import { formatTime } from "../../utils/time";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "📚", "🔥"];

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  authorProfile: UserProfile;
  currentProfileId: ProfileId;
  onEditRequest: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

export default function MessageBubble({
  message,
  isOwn,
  authorProfile,
  currentProfileId,
  onEditRequest,
  onDelete,
  onToggleReaction,
}: MessageBubbleProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[90%] rounded-2xl border px-4 py-3 shadow-soft sm:max-w-[75%] ${
          isOwn
            ? "border-cyan-400/35 bg-cyan-500/15"
            : "border-border bg-surface text-text"
        }`}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold text-muted">
            {authorProfile.name}
          </span>
          <span className="text-base">{authorProfile.avatar}</span>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
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
                className={`rounded-full border px-2 py-0.5 text-xs transition ${
                  isActive
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-surface text-muted hover:text-text"
                }`}
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
              className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted transition hover:scale-105 hover:text-text"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
