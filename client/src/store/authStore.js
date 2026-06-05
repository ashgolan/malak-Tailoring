import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * authStore — يحفظ فقط accessToken + user في localStorage
 * refreshToken يبقى في memory فقط (لا يُحفظ على disk)
 * هذا أكثر أماناً ضد XSS
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,  // في memory فقط — لا يُستخدم في partialize

      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "malak-auth",
      // ✅ لا نحفظ refreshToken في localStorage — يُخزَّن في memory فقط
      partialize: (state) => ({
        accessToken: state.accessToken,
        user:        state.user,
        // refreshToken مقصود إغفاله هنا
      }),
    }
  )
);
