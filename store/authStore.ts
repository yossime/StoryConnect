import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { supabase } from "../lib/supabase";

const storage = {
  set: async (key: string, value: string) => {
    if (Platform.OS !== "web") {
      return await AsyncStorage.setItem(key, value);
    } else if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.setItem(key, value);
    }
  },
  getString: async (key: string) => {
    if (Platform.OS !== "web") {
      return await AsyncStorage.getItem(key);
    } else if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  delete: async (key: string) => {
    if (Platform.OS !== "web") {
      return await AsyncStorage.removeItem(key);
    } else if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.removeItem(key);
    }
  },
};

export interface User {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  isPrivate: boolean;
  waPhoneE164?: string;
  waContactOpt: "OFF" | "FOLLOWERS_ONLY" | "EVERYONE";
  createdAt: string;
  role?: "user" | "admin";
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    handle: string,
    displayName: string
  ) => Promise<void>;
  signInWithProvider: (provider: "google" | "apple") => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  verifyPhone: (phone: string) => Promise<void>;
  confirmPhoneVerification: (code: string) => Promise<void>;
  setUser: (user: User | null) => void;
  loadStoredAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profile) {
          const userData = { ...profile, role: profile.role || "user" };
          set({ user: userData, isAuthenticated: true });
          await storage.set("user", JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (
    email: string,
    password: string,
    handle: string,
    displayName: string
  ) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            handle,
            displayName,
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithProvider: async (provider: "google" | "apple") => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
      });

      if (error) throw error;
    } catch (error) {
      console.error("OAuth sign in error:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ user: null, isAuthenticated: false });
      await storage.delete("user");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      const updatedUser = { ...user, ...updates };
      set({ user: updatedUser });
      await storage.set("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyPhone: async (phone: string) => {
    const { user } = get();
    if (!user) return;

    try {
      // This would integrate with a phone verification service
      // For now, we'll simulate it
      console.log("Verifying phone:", phone);
    } catch (error) {
      console.error("Phone verification error:", error);
      throw error;
    }
  },

  confirmPhoneVerification: async (code: string) => {
    const { user } = get();
    if (!user) return;

    try {
      // This would confirm the verification code
      // For now, we'll simulate it
      console.log("Confirming phone verification code:", code);

      // Update user's phone verification status
      await get().updateProfile({ waPhoneE164: user.waPhoneE164 });
    } catch (error) {
      console.error("Phone verification confirmation error:", error);
      throw error;
    }
  },

  setUser: async (user: User | null) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      storage.set("user", JSON.stringify(user));
    } else {
      await storage.delete("user");
    }
  },

  loadStoredAuth: async () => {
    try {
      const storedUser = await storage.getString("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      await storage.delete("user");
    }
  },
}));
