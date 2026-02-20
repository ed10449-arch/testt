import { motion } from "framer-motion";
import { Circle, LogOut } from "lucide-react";
import type { UserProfile } from "../../types/chat";

interface ChatHeaderProps {
  currentProfile: UserProfile;
  partnerProfile: UserProfile;
  partnerOnline: boolean;
  onLeave: () => void;
}

export default function ChatHeader({
  currentProfile,
  partnerProfile,
  partnerOnline,
  onLeave,
}: ChatHeaderProps) {
  return (
    <header className="glass-card rounded-2xl border border-border px-4 py-3 shadow-soft md:px-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${currentProfile.accentClass} text-2xl`}
          >
            {currentProfile.avatar}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-muted">Alli & Eddie Chat Room</p>
            <h1 className="truncate text-lg font-black">
              {currentProfile.name}
              <span className="ml-2 text-xs font-medium text-muted">
                {currentProfile.subtitle}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted">
            <Circle
              size={10}
              className={partnerOnline ? "fill-emerald-400 text-emerald-400" : "fill-slate-400 text-slate-400"}
            />
            {partnerProfile.name} is {partnerOnline ? "online" : "offline"}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLeave}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:text-text"
          >
            <LogOut size={14} />
            Switch
          </motion.button>
        </div>
      </div>
    </header>
  );
}
