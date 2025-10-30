import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";


const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

  const createStorage = () => {
  if (Platform.OS !== "web") {
    return AsyncStorage;
  } else {
    // For web, create a simple localStorage adapter
    return {
      getItem: (key: string) => {
        if (typeof window !== "undefined" && window.localStorage) {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          handle: string;
          displayName: string;
          avatarUrl: string | null;
          bio: string | null;
          isPrivate: boolean;
          waPhoneE164: string | null;
          waContactOpt: "OFF" | "FOLLOWERS_ONLY" | "EVERYONE";
          createdAt: string;
          role: "user" | "admin";
        };
        Insert: {
          id: string;
          handle: string;
          displayName: string;
          avatarUrl?: string | null;
          bio?: string | null;
          isPrivate?: boolean;
          waPhoneE164?: string | null;
          waContactOpt?: "OFF" | "FOLLOWERS_ONLY" | "EVERYONE";
          createdAt?: string;
          role?: "user" | "admin";
        };
        Update: {
          id?: string;
          handle?: string;
          displayName?: string;
          avatarUrl?: string | null;
          bio?: string | null;
          isPrivate?: boolean;
          waPhoneE164?: string | null;
          waContactOpt?: "OFF" | "FOLLOWERS_ONLY" | "EVERYONE";
          createdAt?: string;
          role?: "user" | "admin";
        };
      };
      profiles: {
        Row: {
          id: string;
          handle: string;
          displayName: string;
          avatarUrl: string | null;
          bio: string | null;
          isPrivate: boolean;
          waPhoneE164: string | null;
          waContactOpt: "OFF" | "FOLLOWERS_ONLY" | "EVERYONE";
          createdAt: string;
          role: "user" | "admin";
        };
        Insert: {
          id: string;
          handle: string;
          displayName: string;
          avatarUrl?: string | null;
          bio?: string | null;
          isPrivate?: boolean;
          waPhoneE164?: string | null;
          waContactOpt?: "OFF" | "FOLLOWERS_ONLY" | "EVERYONE";
          createdAt?: string;
          role?: "user" | "admin";
        };
        Update: {
          id?: string;
          handle?: string;
          displayName?: string;
          avatarUrl?: string | null;
          bio?: string | null;
          isPrivate?: boolean;
          waPhoneE164?: string | null;
          waContactOpt?: "OFF" | "FOLLOWERS_ONLY" | "EVERYONE";
          createdAt?: string;
          role?: "user" | "admin";
        };
      };
      follows: {
        Row: {
          followerId: string;
          followeeId: string;
          createdAt: string;
        };
        Insert: {
          followerId: string;
          followeeId: string;
          createdAt?: string;
        };
        Update: {
          followerId?: string;
          followeeId?: string;
          createdAt?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          authorId: string;
          type: "TEXT" | "IMAGE" | "VIDEO";
          text: string | null;
          mediaUrl: string | null;
          thumbUrl: string | null;
          createdAt: string;
          expiresAt: string;
          visibility: "FOLLOWERS" | "PUBLIC";
          modStatus: "PENDING" | "APPROVED" | "REJECTED" | "SHADOW";
          modRisk: number | null;
          modTags: string[] | null;
        };
        Insert: {
          id?: string;
          authorId: string;
          type: "TEXT" | "IMAGE" | "VIDEO";
          text?: string | null;
          mediaUrl?: string | null;
          thumbUrl?: string | null;
          createdAt?: string;
          expiresAt: string;
          visibility: "FOLLOWERS" | "PUBLIC";
          modStatus?: "PENDING" | "APPROVED" | "REJECTED" | "SHADOW";
          modRisk?: number | null;
          modTags?: string[] | null;
        };
        Update: {
          id?: string;
          authorId?: string;
          type?: "TEXT" | "IMAGE" | "VIDEO";
          text?: string | null;
          mediaUrl?: string | null;
          thumbUrl?: string | null;
          createdAt?: string;
          expiresAt?: string;
          visibility?: "FOLLOWERS" | "PUBLIC";
          modStatus?: "PENDING" | "APPROVED" | "REJECTED" | "SHADOW";
          modRisk?: number | null;
          modTags?: string[] | null;
        };
      };
      story_views: {
        Row: {
          storyId: string;
          viewerId: string;
          startedAt: string;
          completed: boolean;
          quartile: number | null;
        };
        Insert: {
          storyId: string;
          viewerId: string;
          startedAt: string;
          completed?: boolean;
          quartile?: number | null;
        };
        Update: {
          storyId?: string;
          viewerId?: string;
          startedAt?: string;
          completed?: boolean;
          quartile?: number | null;
        };
      };
      reactions: {
        Row: {
          id: string;
          storyId: string;
          userId: string;
          type: "LIKE" | "LAUGH" | "WOW" | "SAD" | "ANGRY";
          createdAt: string;
        };
        Insert: {
          id?: string;
          storyId: string;
          userId: string;
          type: "LIKE" | "LAUGH" | "WOW" | "SAD" | "ANGRY";
          createdAt?: string;
        };
        Update: {
          id?: string;
          storyId?: string;
          userId?: string;
          type?: "LIKE" | "LAUGH" | "WOW" | "SAD" | "ANGRY";
          createdAt?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          storyId: string;
          authorId: string;
          text: string;
          createdAt: string;
          parentId: string | null;
        };
        Insert: {
          id?: string;
          storyId: string;
          authorId: string;
          text: string;
          createdAt?: string;
          parentId?: string | null;
        };
        Update: {
          id?: string;
          storyId?: string;
          authorId?: string;
          text?: string;
          createdAt?: string;
          parentId?: string | null;
        };
      };
      reports: {
        Row: {
          id: string;
          entityType: "STORY" | "USER" | "COMMENT";
          entityId: string;
          reporterId: string;
          reason: string;
          createdAt: string;
          status: "PENDING" | "APPROVED" | "REJECTED";
        };
        Insert: {
          id?: string;
          entityType: "STORY" | "USER" | "COMMENT";
          entityId: string;
          reporterId: string;
          reason: string;
          createdAt?: string;
          status?: "PENDING" | "APPROVED" | "REJECTED";
        };
        Update: {
          id?: string;
          entityType?: "STORY" | "USER" | "COMMENT";
          entityId?: string;
          reporterId?: string;
          reason?: string;
          createdAt?: string;
          status?: "PENDING" | "APPROVED" | "REJECTED";
        };
      };
      events: {
        Row: {
          id: string;
          userId: string | null;
          storyId: string | null;
          type:
            | "VIEW_START"
            | "VIEW_COMPLETE"
            | "REACTION"
            | "COMMENT"
            | "FOLLOW"
            | "CLICK_TO_WHATSAPP"
            | "SHARE";
          meta: Record<string, any>;
          createdAt: string;
        };
        Insert: {
          id?: string;
          userId?: string | null;
          storyId?: string | null;
          type:
            | "VIEW_START"
            | "VIEW_COMPLETE"
            | "REACTION"
            | "COMMENT"
            | "FOLLOW"
            | "CLICK_TO_WHATSAPP"
            | "SHARE";
          meta: Record<string, any>;
          createdAt?: string;
        };
        Update: {
          id?: string;
          userId?: string | null;
          storyId?: string | null;
          type?:
            | "VIEW_START"
            | "VIEW_COMPLETE"
            | "REACTION"
            | "COMMENT"
            | "FOLLOW"
            | "CLICK_TO_WHATSAPP"
            | "SHARE";
          meta?: Record<string, any>;
          createdAt?: string;
        };
      };
    };
  };
}


export const uploadFile = async (
  file: string,
  path: string,
  bucket: string = "stories"
): Promise<string> => {
  const response = await fetch(file);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, {
      contentType: blob.type,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
};

export const deleteFile = async (
  path: string,
  bucket: string = "stories"
): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) throw error;
};
