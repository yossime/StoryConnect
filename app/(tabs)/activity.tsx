import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/lib/i18n';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface Notification {
  id: string;
  type: 'follow' | 'reaction' | 'comment' | 'story_approved' | 'story_rejected';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  user?: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl?: string;
  };
  story?: {
    id: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO';
    thumbUrl?: string;
  };
}

interface AnalyticsMetric {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function ActivityScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const colors = Colors[colorScheme ?? 'light'];

  const [activeTab, setActiveTab] = useState<'notifications' | 'analytics'>('notifications');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - in real app, this would come from the store
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'follow',
      title: t('activity.newFollower'),
      message: 'john_doe started following you',
      timestamp: '2 hours ago',
      read: false,
      user: {
        id: '1',
        handle: 'john_doe',
        displayName: 'John Doe',
        avatarUrl: 'https://via.placeholder.com/40',
      },
    },
    {
      id: '2',
      type: 'reaction',
      title: t('activity.newReaction'),
      message: 'jane_smith liked your story',
      timestamp: '5 hours ago',
      read: false,
      user: {
        id: '2',
        handle: 'jane_smith',
        displayName: 'Jane Smith',
        avatarUrl: 'https://via.placeholder.com/40',
      },
      story: {
        id: '1',
        type: 'IMAGE',
        thumbUrl: 'https://via.placeholder.com/60',
      },
    },
    {
      id: '3',
      type: 'comment',
      title: t('activity.newComment'),
      message: 'mike_wilson commented on your story',
      timestamp: '1 day ago',
      read: true,
      user: {
        id: '3',
        handle: 'mike_wilson',
        displayName: 'Mike Wilson',
        avatarUrl: 'https://via.placeholder.com/40',
      },
      story: {
        id: '2',
        type: 'VIDEO',
        thumbUrl: 'https://via.placeholder.com/60',
      },
    },
    {
      id: '4',
      type: 'story_approved',
      title: t('activity.storyApproved'),
      message: 'Your story has been approved and is now visible',
      timestamp: '2 days ago',
      read: true,
    },
  ]);

  const [analytics] = useState<AnalyticsMetric[]>([
    {
      label: t('analytics.views'),
      value: '1,234',
      change: '+12%',
      trend: 'up',
    },
    {
      label: t('analytics.uniqueViewers'),
      value: '856',
      change: '+8%',
      trend: 'up',
    },
    {
      label: t('analytics.completionRate'),
      value: '78%',
      change: '+5%',
      trend: 'up',
    },
    {
      label: t('analytics.reactions'),
      value: '92',
      change: '+15%',
      trend: 'up',
    },
    {
      label: t('analytics.whatsappClicks'),
      value: '23',
      change: '+3%',
      trend: 'up',
    },
    {
      label: t('analytics.newFollowers'),
      value: '12',
      change: '-2%',
      trend: 'down',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return 'person-add';
      case 'reaction':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      case 'story_approved':
        return 'checkmark-circle';
      case 'story_rejected':
        return 'close-circle';
      default:
        return 'notifications';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: item.read ? colors.background : colors.surface,
          borderLeftColor: item.read ? 'transparent' : colors.secondary,
        },
      ]}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <Ionicons
              name={getNotificationIcon(item.type) as any}
              size={20}
              color={colors.secondary}
            />
          </View>
          <View style={styles.notificationText}>
            <Text style={[styles.notificationTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
              {item.message}
            </Text>
          </View>
          <Text style={[styles.notificationTime, { color: colors.textTertiary }]}>
            {item.timestamp}
          </Text>
        </View>
        
        {item.user && (
          <View style={styles.notificationUser}>
            <Image
              source={{ uri: item.user.avatarUrl || 'https://via.placeholder.com/20' }}
              style={[styles.userAvatar, { backgroundColor: colors.surface }]}
            />
            <Text style={[styles.userName, { color: colors.textSecondary }]}>
              {item.user.displayName}
            </Text>
          </View>
        )}

        {item.story && (
          <View style={styles.storyThumbnail}>
            <Image
              source={{ uri: item.story.thumbUrl || 'https://via.placeholder.com/40' }}
              style={[styles.thumbnailImage, { backgroundColor: colors.surface }]}
            />
            <View style={styles.storyType}>
              <Ionicons
                name={item.story.type === 'IMAGE' ? 'image' : 'videocam'}
                size={12}
                color={colors.primary}
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAnalyticsMetric = ({ item }: { item: AnalyticsMetric }) => (
    <View style={[styles.analyticsCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
        {item.label}
      </Text>
      <Text style={[styles.analyticsValue, { color: colors.text }]}>
        {item.value}
      </Text>
      {item.change && (
        <View style={styles.analyticsChange}>
          <Ionicons
            name={getTrendIcon(item.trend) as any}
            size={14}
            color={getTrendColor(item.trend)}
          />
          <Text style={[styles.changeText, { color: getTrendColor(item.trend) }]}>
            {item.change}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('activity.title')}
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'notifications' ? colors.secondary : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'notifications' ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            {t('activity.notifications')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'analytics' ? colors.secondary : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'analytics' ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            {t('analytics.title')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'notifications' ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.secondary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No notifications yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                When people interact with your stories, you'll see notifications here
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.analyticsContainer}>
          <View style={styles.analyticsHeader}>
            <Text style={[styles.analyticsSubtitle, { color: colors.textSecondary }]}>
              {t('analytics.last7Days')}
            </Text>
          </View>
          <FlatList
            data={analytics}
            renderItem={renderAnalyticsMetric}
            keyExtractor={(item) => item.label}
            numColumns={2}
            contentContainerStyle={styles.analyticsGrid}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.secondary}
              />
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabSelector: {
    flexDirection: 'row',
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: Layout.borderRadius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    paddingHorizontal: Layout.spacing.lg,
  },
  notificationItem: {
    marginBottom: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderLeftWidth: 4,
    padding: Layout.spacing.md,
  },
  notificationContent: {
    gap: Layout.spacing.sm,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.sm,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(88, 101, 242, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  userName: {
    fontSize: 12,
  },
  storyThumbnail: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  thumbnailImage: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.sm,
  },
  storyType: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsContainer: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  analyticsHeader: {
    marginBottom: Layout.spacing.lg,
  },
  analyticsSubtitle: {
    fontSize: 14,
  },
  analyticsGrid: {
    gap: Layout.spacing.md,
  },
  analyticsCard: {
    flex: 1,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginHorizontal: Layout.spacing.xs,
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: 12,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.sm,
  },
  analyticsChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
    paddingTop: Layout.spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

