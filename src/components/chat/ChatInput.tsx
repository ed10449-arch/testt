import { KeyboardEvent, useEffect, useRef } from "react";
import { SendHorizontal, Smile, X } from "lucide-react";

const QUICK_EMOJIS = ["😀", "😂", "❤️", "👍", "🎓", "📚"];

interface ChatInputProps {
  draft: string;
  isEditing: boolean;
  compact?: boolean;
  onDraftChange: (nextText: string) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
}

export default function ChatInput({
  draft,
  isEditing,
  compact = false,
  onDraftChange,
  onSubmit,
  onCancelEdit,
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isEditing]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <section
      className={`glass-card rounded-2xl border border-border shadow-soft ${compact ? "p-2.5" : "p-3"}`}
    >
      {isEditing && (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
          Editing your message
          <button
            onClick={onCancelEdit}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold transition hover:text-text"
          >
            <X size={12} />
            Cancel
          </button>
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-1">
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Smile size={13} />
          {compact ? "Quick" : "Emojis"}
        </span>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onDraftChange(`${draft}${emoji}`)}
            className={`rounded-md border border-border bg-surface transition hover:scale-105 ${
              compact ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
            }`}
            title={`Insert ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Type a message..."
          className={`flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40 ${
            compact ? "min-h-[44px]" : "min-h-[52px]"
          }`}
        />
        <button
          onClick={onSubmit}
          className={`inline-flex items-center gap-1 rounded-xl bg-accent text-sm font-semibold text-white shadow-soft transition hover:brightness-110 ${
            compact ? "h-[44px] px-3" : "h-[52px] px-4"
          }`}
        >
          <SendHorizontal size={16} />
          {isEditing ? "Save" : compact ? "Post" : "Send"}
        </button>
      </div>
    </section>
  );
}
