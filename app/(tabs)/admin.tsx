import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface ModerationItem {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  text?: string;
  mediaUrl?: string;
  thumbUrl?: string;
  author: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl?: string;
  };
  modStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SHADOW';
  modRisk: number;
  modTags: string[];
  createdAt: string;
}

interface AnalyticsMetric {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function AdminScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const colors = Colors[colorScheme ?? 'light'];

  const [activeTab, setActiveTab] = useState<'moderation' | 'analytics'>('moderation');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - in real app, this would come from the store
  const [moderationQueue] = useState<ModerationItem[]>([
    {
      id: '1',
      type: 'IMAGE',
      mediaUrl: 'https://via.placeholder.com/300x400',
      thumbUrl: 'https://via.placeholder.com/150x200',
      author: {
        id: '1',
        handle: 'user1',
        displayName: 'John Doe',
        avatarUrl: 'https://via.placeholder.com/40',
      },
      modStatus: 'PENDING',
      modRisk: 0.8,
      modTags: ['inappropriate_content', 'violence'],
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      type: 'TEXT',
      text: 'This is a test story with some content',
      author: {
        id: '2',
        handle: 'user2',
        displayName: 'Jane Smith',
        avatarUrl: 'https://via.placeholder.com/40',
      },
      modStatus: 'PENDING',
      modRisk: 0.3,
      modTags: ['low_risk'],
      createdAt: '5 hours ago',
    },
  ]);

  const [systemAnalytics] = useState<AnalyticsMetric[]>([
    {
      label: t('admin.dau'),
      value: '1,234',
      change: '+5%',
      trend: 'up',
    },
    {
      label: t('admin.mau'),
      value: '12,456',
      change: '+12%',
      trend: 'up',
    },
    {
      label: t('admin.riskyContent'),
      value: '8.2%',
      change: '-2%',
      trend: 'down',
    },
    {
      label: t('admin.avgModerationTime'),
      value: '2.3m',
      change: '+0.5m',
      trend: 'down',
    },
  ]);

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges');
      // In real app, redirect to home or show error
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleModerationAction = (storyId: string, action: 'APPROVE' | 'REJECT' | 'SHADOW') => {
    Alert.alert(
      'Moderation Action',
      `Are you sure you want to ${action.toLowerCase()} this story?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: action === 'REJECT' ? 'destructive' : 'default',
          onPress: () => {
            // In real app, this would call the moderation API
            console.log(`${action} story ${storyId}`);
          },
        },
      ]
    );
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 0.7) return colors.error;
    if (risk >= 0.4) return colors.warning;
    return colors.success;
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 0.7) return 'High Risk';
    if (risk >= 0.4) return 'Medium Risk';
    return 'Low Risk';
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

  const renderModerationItem = ({ item }: { item: ModerationItem }) => (
    <View style={[styles.moderationCard, { backgroundColor: colors.card }]}>
      <View style={styles.moderationHeader}>
        <View style={styles.authorInfo}>
          <Image
            source={{ uri: item.author.avatarUrl || 'https://via.placeholder.com/40' }}
            style={[styles.authorAvatar, { backgroundColor: colors.surface }]}
          />
          <View style={styles.authorDetails}>
            <Text style={[styles.authorName, { color: colors.text }]}>
              {item.author.displayName}
            </Text>
            <Text style={[styles.authorHandle, { color: colors.textSecondary }]}>
              @{item.author.handle}
            </Text>
          </View>
        </View>
        <View style={styles.moderationMeta}>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.modRisk) }]}>
            <Text style={styles.riskBadgeText}>
              {getRiskLabel(item.modRisk)} ({Math.round(item.modRisk * 100)}%)
            </Text>
          </View>
          <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
            {item.createdAt}
          </Text>
        </View>
      </View>

      <View style={styles.contentPreview}>
        {item.type === 'TEXT' ? (
          <View style={[styles.textPreview, { backgroundColor: colors.surface }]}>
            <Text style={[styles.textContent, { color: colors.text }]} numberOfLines={3}>
              {item.text}
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: item.thumbUrl || item.mediaUrl }}
            style={[styles.mediaPreview, { backgroundColor: colors.surface }]}
          />
        )}
      </View>

      {item.modTags.length > 0 && (
        <View style={styles.tagsContainer}>
          <Text style={[styles.tagsLabel, { color: colors.textSecondary }]}>
            Tags:
          </Text>
          <View style={styles.tags}>
            {item.modTags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Text style={[styles.tagText, { color: colors.text }]}>
                  {tag.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.moderationActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => handleModerationAction(item.id, 'APPROVE')}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.actionButtonText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={() => handleModerationAction(item.id, 'SHADOW')}
        >
          <Ionicons name="eye-off" size={20} color="white" />
          <Text style={styles.actionButtonText}>Shadow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleModerationAction(item.id, 'REJECT')}
        >
          <Ionicons name="close" size={20} color="white" />
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAnalyticsMetric = ({ item }: { item: AnalyticsMetric }) => (
    <View style={[styles.analyticsCard, { backgroundColor: colors.card }]}>
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

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Ionicons name="shield-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Access Denied
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
            You do not have admin privileges
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('admin.title')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          System Administration
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'moderation' ? colors.secondary : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('moderation')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'moderation' ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            {t('admin.moderation')}
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
            {t('admin.analytics')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'moderation' ? (
        <FlatList
          data={moderationQueue}
          renderItem={renderModerationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.moderationList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.secondary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                All caught up!
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                No stories pending moderation
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.analyticsContainer}>
          <View style={styles.analyticsHeader}>
            <Text style={[styles.analyticsSubtitle, { color: colors.textSecondary }]}>
              System Overview
            </Text>
          </View>
          <FlatList
            data={systemAnalytics}
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
  subtitle: {
    fontSize: 14,
    marginTop: Layout.spacing.xs,
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
  moderationList: {
    paddingHorizontal: Layout.spacing.lg,
  },
  moderationCard: {
    marginBottom: Layout.spacing.md,
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.lg,
    gap: Layout.spacing.md,
  },
  moderationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  authorHandle: {
    fontSize: 14,
  },
  moderationMeta: {
    alignItems: 'flex-end',
    gap: Layout.spacing.xs,
  },
  riskBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  riskBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  contentPreview: {
    alignItems: 'center',
  },
  textPreview: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    width: '100%',
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  mediaPreview: {
    width: 150,
    height: 200,
    borderRadius: Layout.borderRadius.lg,
  },
  tagsContainer: {
    gap: Layout.spacing.sm,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  tag: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  tagText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  moderationActions: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    gap: Layout.spacing.xs,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.xl,
    marginHorizontal: Layout.spacing.xs,
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: 14,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  analyticsValue: {
    fontSize: 24,
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
    fontSize: 20,
    fontWeight: '600',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
});

