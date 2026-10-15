import { create } from "zustand";

let counter = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],
  push: (message, type = "info") => {
    const id = ++counter;
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 3500);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  success: (msg) => useToastStore.getState().push(msg, "success"),
  error: (msg) => useToastStore.getState().push(msg, "error"),
  info: (msg) => useToastStore.getState().push(msg, "info"),
};
