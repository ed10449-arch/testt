import { motion } from "framer-motion";
import { PROFILES } from "../../data/profiles";

export default function ProfilePreviewSection() {
  return (
    <section className="flex min-h-screen snap-start items-center px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.45 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-black md:text-5xl">
            Student dashboard profiles
          </h2>
          <p className="mt-3 text-muted">
            Choose Alli or Eddie to open the same activity portal with a personal identity.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2">
          {PROFILES.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-90px" }}
              transition={{ duration: 0.35, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-card rounded-3xl p-7 shadow-soft"
            >
              <div
                className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${profile.accentClass} text-3xl`}
              >
                {profile.avatar}
              </div>
              <h3 className="text-2xl font-bold">{profile.name}</h3>
              <p className="mt-1 text-muted">{profile.subtitle}</p>
              <p className="mt-4 text-sm text-muted">
                Scroll to unlock the portal and continue as {profile.name}.
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
