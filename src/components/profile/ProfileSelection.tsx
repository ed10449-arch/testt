import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PROFILES } from "../../data/profiles";
import { useAppStore } from "../../store/useAppStore";

export default function ProfileSelection() {
  const selectProfile = useAppStore((state) => state.selectProfile);
  const lockGate = useAppStore((state) => state.lockGate);

  return (
    <main className="flex min-h-screen items-center px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Access Granted
          </p>
          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            Choose your profile to enter the chat
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PROFILES.map((profile, index) => (
            <motion.button
              key={profile.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card group rounded-3xl p-7 text-left shadow-soft transition"
              onClick={() => selectProfile(profile.id)}
            >
              <div
                className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${profile.accentClass} text-3xl shadow-soft`}
              >
                {profile.avatar}
              </div>
              <h2 className="text-2xl font-black">{profile.name}</h2>
              <p className="text-muted">{profile.subtitle}</p>
              <p className="mt-3 text-sm text-muted transition group-hover:text-text">
                Click to enter as {profile.name}.
              </p>
            </motion.button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={lockGate}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted transition hover:text-text"
          >
            <ArrowLeft size={16} />
            Back to password gate
          </button>
        </div>
      </div>
    </main>
  );
}
