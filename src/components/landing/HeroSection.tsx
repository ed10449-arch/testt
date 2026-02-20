import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";

const schoolIcons = ["📚", "📘", "📝", "✏️", "📐", "🎓"];
const highlights = [
  "Morning homeroom check-ins",
  "Assignment board and due dates",
  "Club activities and announcements",
];

export default function HeroSection() {
  const iconRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const animations = iconRefs.current.map((node, index) => {
      if (!node) {
        return null;
      }
      return gsap.to(node, {
        y: index % 2 === 0 ? -10 : 10,
        rotation: index % 2 === 0 ? -6 : 6,
        duration: 2.4 + index * 0.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });

    return () => {
      animations.forEach((animation) => animation?.kill());
    };
  }, []);

  return (
    <section className="hero-grid relative flex min-h-screen snap-start items-center overflow-hidden px-6 pb-20 pt-28 md:px-12 lg:px-20">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="space-y-6"
        >
          <p className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-sm font-medium text-muted">
            School Activities Main Page
          </p>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            Plan your school day.
            <br />
            Track activities.
            <br />
            Stay on schedule.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            A student-friendly dashboard for assignments, classroom updates, and
            team activity planning, with a compact collaboration feed.
          </p>
          <a
            href="#password-panel"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110"
          >
            Open activity portal
            <ChevronDown size={18} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="glass-card relative rounded-3xl p-6 shadow-soft"
        >
          <div className="grid grid-cols-3 gap-3">
            {schoolIcons.map((icon, index) => (
              <div
                key={`${icon}-${index}`}
                ref={(node) => {
                  iconRefs.current[index] = node;
                }}
                className="flex h-16 items-center justify-center rounded-2xl border border-border bg-surface text-2xl shadow-soft"
              >
                {icon}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-surface/80 p-4">
            <p className="text-sm font-semibold">Today&apos;s focus</p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {highlights.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
