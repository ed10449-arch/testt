interface TypingIndicatorProps {
  label: string | null;
}

export default function TypingIndicator({ label }: TypingIndicatorProps) {
  if (!label) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-muted shadow-soft">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-accent/80" />
        <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
        <span className="h-1.5 w-1.5 rounded-full bg-accent/40" />
      </div>
      {label}
    </div>
  );
}
