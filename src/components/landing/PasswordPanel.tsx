import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Lock } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { verifyPassword } from "../../utils/hash";

export default function PasswordPanel() {
  const unlockGate = useAppStore((state) => state.unlockGate);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const isValid = await verifyPassword(password);
    if (!isValid) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setHasError(false);
    setIsLoading(false);
    unlockGate();
  }

  return (
    <section
      id="password-panel"
      className="flex min-h-screen snap-start items-center px-6 py-16 md:px-12 lg:px-20"
    >
      <div className="mx-auto w-full max-w-3xl">
        <motion.div
          animate={
            hasError
              ? { x: [0, -8, 8, -6, 6, -4, 4, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.42 }}
          className="glass-card rounded-3xl p-7 shadow-soft md:p-10"
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            <Lock size={14} />
            Chat Access
          </p>
          <h2 className="text-2xl font-black md:text-4xl">
            Enter password to join the chatroom
          </h2>
          <p className="mt-3 text-muted">
            Alli and Eddie share the same room.
          </p>

          <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
            <label htmlFor="password-input" className="text-sm font-semibold">
              Chatroom Password
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="password-input"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (hasError) {
                    setHasError(false);
                  }
                }}
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-lg tracking-[0.35em] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isLoading}
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <KeyRound size={18} />
                {isLoading ? "Checking..." : "Unlock"}
              </motion.button>
            </div>

            {hasError && (
              <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300">
                Incorrect password. Please try again.
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
