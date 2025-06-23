import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Define the shape of your User object (adjust based on your backend response)
interface User {
  _id: string;
  username: string;
  email: string;
  role: "guest" | "host" | "admin"; // Add other roles if applicable
  // Add any other user properties you receive
}

// Define the state for your authentication store
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Define the actions/methods for your authentication store
interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (errorMessage: string | null) => void;
  clearError: () => void;
}

// Combine state and actions
type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      login: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      },
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      },
      setLoading: (isLoading) => set({ loading: isLoading }),
      setError: (errorMessage) => set({ error: errorMessage, loading: false }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage", // unique name for local storage key
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      // Optionally, only persist specific parts of the state
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
