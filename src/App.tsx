import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatRoom from "./components/chat/ChatRoom";
import LandingPage from "./components/landing/LandingPage";
import ProfileSelection from "./components/profile/ProfileSelection";
import ThemeToggle from "./components/theme/ThemeToggle";
import { useThemeEffect } from "./hooks/useThemeEffect";
import { useAppStore } from "./store/useAppStore";

function ViewTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const theme = useAppStore((state) => state.theme);
  const passwordUnlocked = useAppStore((state) => state.passwordUnlocked);
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const lockGate = useAppStore((state) => state.lockGate);
  useThemeEffect(theme);

  useEffect(() => {
    if (!passwordUnlocked) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lockGate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [lockGate, passwordUnlocked]);

  const stage = !passwordUnlocked
    ? "landing"
    : activeProfileId
      ? "chat"
      : "profile";

  return (
    <div className="relative min-h-screen bg-bg text-text transition-colors duration-300">
      <ThemeToggle />
      <AnimatePresence mode="wait">
        {stage === "landing" && (
          <ViewTransition key="landing">
            <LandingPage />
          </ViewTransition>
        )}

        {stage === "profile" && (
          <ViewTransition key="profile">
            <ProfileSelection />
          </ViewTransition>
        )}

        {stage === "chat" && (
          <ViewTransition key="chat">
            <ChatRoom />
          </ViewTransition>
        )}
      </AnimatePresence>
    </div>
  );
}
