import { motion } from "framer-motion";
import PasswordPanel from "./PasswordPanel";

export default function LandingPage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <PasswordPanel />
    </motion.main>
  );
}
