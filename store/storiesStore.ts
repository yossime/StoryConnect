import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Story {
  id: string;
  authorId: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  text?: string;
  mediaUrl?: string;
  thumbUrl?: string;
  createdAt: string;
  expiresAt: string;
  visibility: 'FOLLOWERS' | 'PUBLIC';
  modStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SHADOW';
  modRisk?: number;
  modTags?: string[];
  
  // Author info (populated from join)
  author?: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl?: string;
    waContactOpt: 'OFF' | 'FOLLOWERS_ONLY' | 'EVERYONE';
  };
  
  // View info
  viewCount?: number;
  hasViewed?: boolean;
  reactions?: Reaction[];
  comments?: Comment[];
}

export interface StoryView {
  storyId: string;
  viewerId: string;
  startedAt: string;
  completed: boolean;
  quartile?: number;
}

export interface Reaction {
  id: string;
  storyId: string;
  userId: string;
  type: 'LIKE' | 'LAUGH' | 'WOW' | 'SAD' | 'ANGRY';
  createdAt: string;
  user?: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface Comment {
  id: string;
  storyId: string;
  authorId: string;
  text: string;
  createdAt: string;
  parentId?: string;
  author?: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl?: string;
  };
}

interface StoriesState {
  stories: Story[];
  activeStoryIndex: number;
  isLoading: boolean;
  isViewing: boolean;
  
  // Actions
  loadStories: () => Promise<void>;
  loadUserStories: (userId: string) => Promise<void>;
  createStory: (storyData: {
    type: 'TEXT' | 'IMAGE' | 'VIDEO';
    text?: string;
    mediaUrl?: string;
    thumbUrl?: string;
    visibility: 'FOLLOWERS' | 'PUBLIC';
  }) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;
  completeStoryView: (storyId: string) => Promise<void>;
  reactToStory: (storyId: string, reactionType: string) => Promise<void>;
  commentOnStory: (storyId: string, text: string) => Promise<void>;
  reportStory: (storyId: string, reason: string) => Promise<void>;
  clickWhatsApp: (storyId: string, authorId: string) => Promise<void>;
  setActiveStoryIndex: (index: number) => void;
  setViewing: (isViewing: boolean) => void;
}

export const useStoriesStore = create<StoriesState>((set: any, get: any) => ({
  stories: [],
  activeStoryIndex: 0,
  isLoading: false,
  isViewing: false,

  loadStories: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:users!stories_authorId_fkey(id, handle, displayName, avatarUrl, waContactOpt),
          reactions:reactions(id, type, userId, createdAt, user:users!reactions_userId_fkey(id, handle, displayName, avatarUrl)),
          comments:comments(id, text, authorId, createdAt, author:users!comments_authorId_fkey(id, handle, displayName, avatarUrl))
        `)
        .eq('modStatus', 'APPROVED')
        .gt('expiresAt', new Date().toISOString())
        .order('createdAt', { ascending: false });

      if (error) throw error;

      // Group stories by author and get the latest one
      const groupedStories = new Map();
      data?.forEach((story: any) => {
        const existing = groupedStories.get(story.authorId);
        if (!existing || new Date(story.createdAt) > new Date(existing.createdAt)) {
          groupedStories.set(story.authorId, story);
        }
      });

      const sortedStories = Array.from(groupedStories.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      set({ stories: sortedStories });
    } catch (error) {
      console.error('Load stories error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loadUserStories: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          reactions:reactions(id, type, userId, createdAt, user:users!reactions_userId_fkey(id, handle, displayName, avatarUrl)),
          comments:comments(id, text, authorId, createdAt, author:users!comments_authorId_fkey(id, handle, displayName, avatarUrl))
        `)
        .eq('authorId', userId)
        .gt('expiresAt', new Date().toISOString())
        .order('createdAt', { ascending: false });

      if (error) throw error;

      set({ stories: data || [] });
    } catch (error) {
      console.error('Load user stories error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createStory: async (storyData: any) => {
    set({ isLoading: true });
    try {
      // First, upload media if needed
      let mediaUrl = storyData.mediaUrl;
      let thumbUrl = storyData.thumbUrl;

      if (storyData.mediaUrl && storyData.type !== 'TEXT') {
        // Upload to Supabase Storage
        const fileExt = storyData.mediaUrl.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `stories/${fileName}`;

        // This would be implemented with actual file upload
        console.log('Uploading media to:', filePath);
      }

      const { data, error } = await supabase
        .from('stories')
        .insert({
          ...storyData,
          mediaUrl,
          thumbUrl,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        })
        .select()
        .single();

      if (error) throw error;

      // Call AI moderation
      await get().moderateStory(data.id);

      // Reload stories
      await get().loadStories();
    } catch (error) {
      console.error('Create story error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  moderateStory: async (storyId: string) => {
    try {
      // This would call the AI moderation service
      // For now, we'll simulate it
      console.log('Moderating story:', storyId);
      
      // Simulate AI moderation result
      const modResult = {
        risk: 0.1,
        tags: [],
        decision: 'APPROVED' as const,
      };

      const { error } = await supabase
        .from('stories')
        .update({
          modStatus: modResult.decision,
          modRisk: modResult.risk,
          modTags: modResult.tags,
        })
        .eq('id', storyId);

      if (error) throw error;
    } catch (error) {
      console.error('Moderation error:', error);
      throw error;
    }
  },

  viewStory: async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('story_views')
        .upsert({
          storyId,
          startedAt: new Date().toISOString(),
          completed: false,
        });

      if (error) throw error;

      // Record event
      await supabase
        .from('events')
        .insert({
          type: 'VIEW_START',
          storyId,
          meta: { timestamp: new Date().toISOString() },
        });
    } catch (error) {
      console.error('View story error:', error);
    }
  },

  completeStoryView: async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('story_views')
        .update({
          completed: true,
          quartile: 100,
        })
        .eq('storyId', storyId);

      if (error) throw error;

      // Record event
      await supabase
        .from('events')
        .insert({
          type: 'VIEW_COMPLETE',
          storyId,
          meta: { 
            timestamp: new Date().toISOString(),
            completed: true,
            quartile: 100,
          },
        });
    } catch (error) {
      console.error('Complete story view error:', error);
    }
  },

  reactToStory: async (storyId: string, reactionType: string) => {
    try {
      const { error } = await supabase
        .from('reactions')
        .upsert({
          storyId,
          type: reactionType,
        });

      if (error) throw error;

      // Record event
      await supabase
        .from('events')
        .insert({
          type: 'REACTION',
          storyId,
          meta: { 
            reactionType,
            timestamp: new Date().toISOString(),
          },
        });

      // Reload stories to get updated reactions
      await get().loadStories();
    } catch (error) {
      console.error('React to story error:', error);
      throw error;
    }
  },

  commentOnStory: async (storyId: string, text: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          storyId,
          text,
        });

      if (error) throw error;

      // Record event
      await supabase
        .from('events')
        .insert({
          type: 'COMMENT',
          storyId,
          meta: { 
            text,
            timestamp: new Date().toISOString(),
          },
        });

      // Reload stories to get updated comments
      await get().loadStories();
    } catch (error) {
      console.error('Comment on story error:', error);
      throw error;
    }
  },

  reportStory: async (storyId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          entityType: 'STORY',
          entityId: storyId,
          reason,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Report story error:', error);
      throw error;
    }
  },

  clickWhatsApp: async (storyId: string, authorId: string) => {
    try {
      // Record event
      await supabase
        .from('events')
        .insert({
          type: 'CLICK_TO_WHATSAPP',
          storyId,
          meta: { 
            authorId,
            timestamp: new Date().toISOString(),
          },
        });

      // Get author's WhatsApp number
      const { data: author } = await supabase
        .from('users')
        .select('waPhoneE164, waContactOpt')
        .eq('id', authorId)
        .single();

      if (author?.waPhoneE164) {
        const url = `https://wa.me/${author.waPhoneE164}?text=${encodeURIComponent('Hi! I saw your story on StoryConnect')}`;
        // Open WhatsApp
        console.log('Opening WhatsApp:', url);
      }
    } catch (error) {
      console.error('Click WhatsApp error:', error);
      throw error;
    }
  },

  setActiveStoryIndex: (index: number) => {
    set({ activeStoryIndex: index });
  },

  setViewing: (isViewing: boolean) => {
    set({ isViewing });
  },
}));
