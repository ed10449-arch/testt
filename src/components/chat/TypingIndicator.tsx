import { AnimatePresence, motion } from "framer-motion";

interface TypingIndicatorProps {
  label: string | null;
}

export default function TypingIndicator({ label }: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {label && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted shadow-soft"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-1.5 w-1.5 rounded-full bg-accent"
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 0.7,
                  repeat: Infinity,
                  delay: dot * 0.12,
                }}
              />
            ))}
          </div>
          {label}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
