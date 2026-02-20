import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export default function ThemeToggle() {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm font-semibold shadow-soft transition-colors md:right-6 md:top-6"
      aria-label="Toggle light and dark mode"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
      <span>{theme === "light" ? "Dark" : "Light"} mode</span>
    </motion.button>
  );
}
