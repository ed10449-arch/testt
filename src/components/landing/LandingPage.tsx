import { motion } from "framer-motion";
import AboutSection from "./AboutSection";
import HeroSection from "./HeroSection";
import PasswordPanel from "./PasswordPanel";
import ProfilePreviewSection from "./ProfilePreviewSection";

export default function LandingPage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory"
    >
      <HeroSection />
      <AboutSection />
      <ProfilePreviewSection />
      <PasswordPanel />
    </motion.main>
  );
}
