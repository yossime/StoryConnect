/**
 * Push Notifications Service for StoryConnect
 * Handles push notifications using OneSignal
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface NotificationData {
  type: 'new_story' | 'new_follower' | 'new_reaction' | 'new_comment' | 'story_approved' | 'story_rejected';
  title: string;
  body: string;
  data?: Record<string, any>;
  userId?: string;
  storyId?: string;
}

export interface PushNotificationPayload {
  headings: { [key: string]: string };
  contents: { [key: string]: string };
  data?: Record<string, any>;
  include_external_user_ids?: string[];
  filters?: Array<{
    field: string;
    key: string;
    relation: string;
    value: string;
  }>;
}

class NotificationService {
  private isEnabled: boolean;
  private oneSignalAppId: string;
  private oneSignalApiKey: string;

  constructor() {
    this.isEnabled = process.env.ENABLE_PUSH_NOTIFICATIONS === 'true';
    this.oneSignalAppId = process.env.ONESIGNAL_APP_ID || '';
    this.oneSignalApiKey = process.env.ONESIGNAL_REST_API_KEY || '';
  }

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    if (!this.isEnabled) {
      console.log('Push notifications disabled');
      return;
    }

    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Get the push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      });

      console.log('Push token:', token.data);

      // Register with OneSignal if available
      if (this.oneSignalAppId && this.oneSignalApiKey) {
        await this.registerWithOneSignal(token.data);
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Register device with OneSignal
   */
  private async registerWithOneSignal(expoToken: string): Promise<void> {
    try {
      // In a real implementation, you would register the Expo token with OneSignal
      // This typically involves calling OneSignal's REST API
      console.log('Registering with OneSignal:', expoToken);
    } catch (error) {
      console.error('Failed to register with OneSignal:', error);
    }
  }

  /**
   * Send a push notification
   */
  async sendNotification(notificationData: NotificationData): Promise<void> {
    if (!this.isEnabled) {
      console.log('Notifications disabled, skipping:', notificationData.title);
      return;
    }

    try {
      if (this.oneSignalAppId && this.oneSignalApiKey) {
        await this.sendOneSignalNotification(notificationData);
      } else {
        await this.sendExpoNotification(notificationData);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Send notification via OneSignal
   */
  private async sendOneSignalNotification(notificationData: NotificationData): Promise<void> {
    const payload: PushNotificationPayload = {
      headings: {
        en: notificationData.title,
        he: notificationData.title, // Assuming Hebrew translation is handled elsewhere
      },
      contents: {
        en: notificationData.body,
        he: notificationData.body,
      },
      data: notificationData.data || {},
    };

    // Add targeting
    if (notificationData.userId) {
      payload.include_external_user_ids = [notificationData.userId];
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.oneSignalApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: this.oneSignalAppId,
        ...payload,
      }),
    });

    if (!response.ok) {
      throw new Error(`OneSignal API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('OneSignal notification sent:', result.id);
  }

  /**
   * Send notification via Expo Push Notifications
   */
  private async sendExpoNotification(notificationData: NotificationData): Promise<void> {
    // In a real implementation, you would send this to your backend
    // which would then use the Expo Push API
    console.log('Would send Expo notification:', notificationData);
  }

  /**
   * Send notification to followers when user posts a story
   */
  async notifyNewStory(storyId: string, authorId: string, authorName: string): Promise<void> {
    // In a real implementation, you would get the list of followers
    // and send notifications to each one
    const notificationData: NotificationData = {
      type: 'new_story',
      title: 'New Story',
      body: `${authorName} posted a new story`,
      data: {
        storyId,
        authorId,
        type: 'new_story',
      },
    };

    await this.sendNotification(notificationData);
  }

  /**
   * Send notification when someone follows you
   */
  async notifyNewFollower(followerId: string, followerName: string, targetUserId: string): Promise<void> {
    const notificationData: NotificationData = {
      type: 'new_follower',
      title: 'New Follower',
      body: `${followerName} started following you`,
      data: {
        followerId,
        type: 'new_follower',
      },
      userId: targetUserId,
    };

    await this.sendNotification(notificationData);
  }

  /**
   * Send notification when someone reacts to your story
   */
  async notifyNewReaction(
    storyId: string,
    reactorId: string,
    reactorName: string,
    reactionType: string,
    storyAuthorId: string
  ): Promise<void> {
    const reactionEmoji = this.getReactionEmoji(reactionType);
    const notificationData: NotificationData = {
      type: 'new_reaction',
      title: 'New Reaction',
      body: `${reactorName} reacted ${reactionEmoji} to your story`,
      data: {
        storyId,
        reactorId,
        reactionType,
        type: 'new_reaction',
      },
      userId: storyAuthorId,
    };

    await this.sendNotification(notificationData);
  }

  /**
   * Send notification when someone comments on your story
   */
  async notifyNewComment(
    storyId: string,
    commenterId: string,
    commenterName: string,
    commentText: string,
    storyAuthorId: string
  ): Promise<void> {
    const truncatedComment = commentText.length > 50 
      ? commentText.substring(0, 50) + '...' 
      : commentText;

    const notificationData: NotificationData = {
      type: 'new_comment',
      title: 'New Comment',
      body: `${commenterName}: ${truncatedComment}`,
      data: {
        storyId,
        commenterId,
        commentText,
        type: 'new_comment',
      },
      userId: storyAuthorId,
    };

    await this.sendNotification(notificationData);
  }

  /**
   * Send notification when story is approved/rejected
   */
  async notifyStoryModeration(
    storyId: string,
    status: 'approved' | 'rejected',
    reason: string,
    storyAuthorId: string
  ): Promise<void> {
    const isApproved = status === 'approved';
    const notificationData: NotificationData = {
      type: isApproved ? 'story_approved' : 'story_rejected',
      title: isApproved ? 'Story Approved' : 'Story Rejected',
      body: isApproved 
        ? 'Your story has been approved and is now visible'
        : `Your story was rejected: ${reason}`,
      data: {
        storyId,
        status,
        reason,
        type: isApproved ? 'story_approved' : 'story_rejected',
      },
      userId: storyAuthorId,
    };

    await this.sendNotification(notificationData);
  }

  /**
   * Schedule a notification for later
   */
  async scheduleNotification(
    notificationData: NotificationData,
    triggerDate: Date
  ): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
      },
      trigger: triggerDate,
    });

    return identifier;
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(): Promise<Notifications.Notification[]> {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Get reaction emoji for notification
   */
  private getReactionEmoji(reactionType: string): string {
    const emojiMap: Record<string, string> = {
      'LIKE': '❤️',
      'LAUGH': '😂',
      'WOW': '😮',
      'SAD': '😢',
      'ANGRY': '😠',
    };
    return emojiMap[reactionType] || '👍';
  }

  /**
   * Handle notification received while app is in foreground
   */
  handleNotificationReceived(notification: Notifications.Notification): void {
    console.log('Notification received:', notification);
    
    // Handle different notification types
    const data = notification.request.content.data;
    if (data?.type) {
      switch (data.type) {
        case 'new_story':
          // Navigate to story viewer
          break;
        case 'new_follower':
          // Navigate to profile
          break;
        case 'new_reaction':
        case 'new_comment':
          // Navigate to story
          break;
        case 'story_approved':
        case 'story_rejected':
          // Show toast or navigate to activity
          break;
      }
    }
  }

  /**
   * Handle notification response (when user taps notification)
   */
  handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data;
    console.log('Notification tapped:', data);

    // Handle navigation based on notification type
    if (data?.type) {
      switch (data.type) {
        case 'new_story':
          // Navigate to story viewer with storyId
          break;
        case 'new_follower':
          // Navigate to profile with followerId
          break;
        case 'new_reaction':
        case 'new_comment':
          // Navigate to story with storyId
          break;
        case 'story_approved':
        case 'story_rejected':
          // Navigate to activity tab
          break;
      }
    }
  }

  /**
   * Update user's notification preferences
   */
  async updateNotificationPreferences(preferences: {
    newStories: boolean;
    newFollowers: boolean;
    newReactions: boolean;
    newComments: boolean;
    moderationUpdates: boolean;
  }): Promise<void> {
    // In a real implementation, you would save these preferences
    // to your backend and use them when sending notifications
    console.log('Updated notification preferences:', preferences);
  }

  /**
   * Get current notification settings
   */
  async getNotificationSettings(): Promise<{
    enabled: boolean;
    permissions: Notifications.NotificationPermissionsStatus;
  }> {
    const permissions = await Notifications.getPermissionsAsync();
    return {
      enabled: this.isEnabled && permissions.status === 'granted',
      permissions,
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export types
export type { NotificationData, PushNotificationPayload };

