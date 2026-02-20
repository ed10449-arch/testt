import { motion } from "framer-motion";
import { BookOpen, CalendarDays, ClipboardCheck } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Daily Learning Flow",
    description:
      "Keep assignments, revision sessions, and in-class tasks structured in one place.",
  },
  {
    icon: CalendarDays,
    title: "Activity Timeline",
    description:
      "See what is happening now, what is due next, and what is planned for the week.",
  },
  {
    icon: ClipboardCheck,
    title: "Quick Coordination",
    description:
      "Use the compact feed for short updates without taking focus away from school work.",
  },
];

export default function AboutSection() {
  return (
    <section className="flex min-h-screen snap-start items-center px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
          className="space-y-3"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            About This School Hub
          </p>
          <h2 className="text-3xl font-black md:text-5xl">
            Built around school activities first.
          </h2>
          <p className="max-w-2xl text-lg text-muted">
            This interface prioritizes classes, assignments, and announcements,
            while keeping collaboration lightweight and easy to access.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="glass-card rounded-2xl p-5 shadow-soft"
            >
              <feature.icon className="mb-3 text-accent" size={22} />
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
