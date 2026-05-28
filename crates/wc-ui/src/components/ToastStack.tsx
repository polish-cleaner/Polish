import { AnimatePresence } from "framer-motion";
import Toast from "./ui/Toast";
import { useToastStack } from "../hooks/useToastStack";

/**
 * Global toast stack — anchored bottom-right, 16px gutters, 8px gap.
 * AnimatePresence wraps the items so each <Toast> can run its toastSlide
 * exit when dismissed (manually or by the 5s auto-timer).
 *
 * No props: this is a singleton render of the global Zustand store
 * (Rule 8: cross-component state lives in Zustand).
 */
export default function ToastStack() {
  const toasts = useToastStack((s) => s.toasts);
  const dismiss = useToastStack((s) => s.dismiss);

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              title={t.title}
              body={t.body}
              variant={t.variant}
              action={t.action}
              onClose={() => dismiss(t.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
