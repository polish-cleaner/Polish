import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import ToastStack from "./components/ToastStack";
import { useRoute } from "./hooks/useRoute";
import { fadeUp } from "./lib/motion";
import { resolvePage } from "./lib/page-resolver";

/**
 * Root shell — sidebar + page-swap region + global toast stack.
 * Per Rule 6 the App file is intentionally thin: routing decision
 * (delegated to lib/page-resolver), AnimatePresence wrapper, and
 * global overlays only. Each page owns its own PageLayout chrome.
 */
export default function App() {
  const route = useRoute((s) => s.route);
  return (
    <div className="flex h-screen w-screen bg-bg text-ink overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-bg">
        <AnimatePresence mode="wait">
          <motion.div
            key={route}
            variants={fadeUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {resolvePage(route)}
          </motion.div>
        </AnimatePresence>
      </main>
      <ToastStack />
    </div>
  );
}
