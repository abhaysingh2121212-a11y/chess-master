import { createContext, useContext, useEffect, useState } from "react";
import { FIREBASE_DEMO_MODE } from "../firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isGuest: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    _password: string,
    displayName: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  playAsGuest: () => void;
}

const STORAGE_KEY = "chess_auth_user";

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function saveUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isGuest: false,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  playAsGuest: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function createAuthValue(): AuthContextValue {
  // This is called inside AuthProvider component
  // We return state management as a plain object — the provider calls this
  // and manages state itself
  throw new Error("Use AuthProvider");
}

// Auth state — used by AuthProvider in main.tsx
export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Simulate onAuthStateChanged
    const stored = loadStoredUser();
    if (stored?.isGuest) {
      setIsGuest(true);
      setUser(stored);
    } else if (stored) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const signInWithEmail = async (email: string, _password: string) => {
    if (FIREBASE_DEMO_MODE) {
      // Demo: simulate successful login
      const mockUser: AuthUser = {
        uid: `demo_${email}`,
        email,
        displayName: email.split("@")[0],
        photoURL: null,
      };
      saveUser(mockUser);
      setUser(mockUser);
      setIsGuest(false);
      return;
    }
    // Real Firebase would go here
    throw new Error("Configure Firebase credentials to enable authentication");
  };

  const signUpWithEmail = async (
    email: string,
    _password: string,
    displayName: string,
  ) => {
    if (FIREBASE_DEMO_MODE) {
      const mockUser: AuthUser = {
        uid: `demo_${email}`,
        email,
        displayName,
        photoURL: null,
      };
      saveUser(mockUser);
      setUser(mockUser);
      setIsGuest(false);
      return;
    }
    throw new Error("Configure Firebase credentials to enable authentication");
  };

  const signInWithGoogle = async () => {
    if (FIREBASE_DEMO_MODE) {
      throw new Error(
        "Google Sign-In requires a real Firebase project. Please configure Firebase credentials.",
      );
    }
    throw new Error("Configure Firebase credentials to enable authentication");
  };

  const signOut = async () => {
    saveUser(null);
    setUser(null);
    setIsGuest(false);
  };

  const playAsGuest = () => {
    const guestUser: AuthUser = {
      uid: `guest_${Date.now()}`,
      email: null,
      displayName: "Guest",
      photoURL: null,
      isGuest: true,
    };
    saveUser(guestUser);
    setUser(guestUser);
    setIsGuest(true);
  };

  return {
    user,
    loading,
    isGuest,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    playAsGuest,
  };
}
