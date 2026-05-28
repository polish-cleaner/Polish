import { create } from "zustand";
import type { ToastStackInput, ToastStackItem } from "../types/toast";

interface ToastStackState {
  toasts: ToastStackItem[];
  push: (input: ToastStackInput) => string;
  dismiss: (id: string) => void;
}

/** Auto-dismiss after 5s — matches the prototype's notify() timeout. */
const AUTO_DISMISS_MS = 5000;

/** Pending setTimeout handles by toast id — used to cancel on manual dismiss. */
const TIMERS = new Map<string, ReturnType<typeof setTimeout>>();

function nextId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useToastStack = create<ToastStackState>((set, get) => ({
  toasts: [],
  push: (input) => {
    const id = nextId();
    set((s) => ({ toasts: [...s.toasts, { ...input, id }] }));
    const handle = setTimeout(() => {
      get().dismiss(id);
    }, AUTO_DISMISS_MS);
    TIMERS.set(id, handle);
    return id;
  },
  dismiss: (id) => {
    const handle = TIMERS.get(id);
    if (handle !== undefined) {
      clearTimeout(handle);
      TIMERS.delete(id);
    }
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
