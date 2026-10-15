import { create } from "zustand";
import { getSessionUser, setSession, clearSession } from "../lib/auth";

export const useAuthStore = create((set) => ({
  user: getSessionUser(),

  login: (token, user) => {
    setSession(token, user);
    set({ user });
  },

  logout: () => {
    clearSession();
    set({ user: null });
  },
}));
