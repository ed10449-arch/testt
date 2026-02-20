import { KeyboardEvent, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { SendHorizontal, Smile, X } from "lucide-react";

const QUICK_EMOJIS = ["😀", "😂", "❤️", "👍", "🎓", "📚"];

interface ChatInputProps {
  draft: string;
  isEditing: boolean;
  onDraftChange: (nextText: string) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
}

export default function ChatInput({
  draft,
  isEditing,
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
    <section className="glass-card rounded-2xl border border-border p-3 shadow-soft">
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
          Emojis
        </span>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onDraftChange(`${draft}${emoji}`)}
            className="rounded-md border border-border bg-surface px-2 py-1 text-sm transition hover:scale-105"
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
          placeholder="Type your classroom message..."
          className="min-h-[52px] flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSubmit}
          className="inline-flex h-[52px] items-center gap-1 rounded-xl bg-accent px-4 text-sm font-semibold text-white shadow-soft transition hover:brightness-110"
        >
          <SendHorizontal size={16} />
          {isEditing ? "Save" : "Send"}
        </motion.button>
      </div>
    </section>
  );
}
