import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";

const schoolIcons = ["📚", "📘", "📝", "✏️", "📐", "🎓"];

export default function HeroSection() {
  const iconRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const animations = iconRefs.current.map((node, index) => {
      if (!node) {
        return null;
      }
      return gsap.to(node, {
        y: index % 2 === 0 ? -14 : 14,
        rotation: index % 2 === 0 ? -6 : 6,
        duration: 1.8 + index * 0.2,
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
            Classroom Collaboration Space
          </p>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            Study together.
            <br />
            Chat smarter.
            <br />
            Learn faster.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            An educational chat room with profile-based entry, polished motion,
            and a delightful student-first interface.
          </p>
          <a
            href="#password-panel"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110"
          >
            Scroll to unlock
            <ChevronDown size={18} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="glass-card relative rounded-3xl p-6 shadow-soft"
        >
          <div className="grid grid-cols-3 gap-4">
            {schoolIcons.map((icon, index) => (
              <div
                key={`${icon}-${index}`}
                ref={(node) => {
                  iconRefs.current[index] = node;
                }}
                className="flex h-20 items-center justify-center rounded-2xl border border-border bg-surface text-3xl shadow-soft"
              >
                {icon}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            Animated educational icons powered by GSAP.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
