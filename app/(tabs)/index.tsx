import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import { useStoriesStore } from '@/store/storiesStore';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface StoryPreviewProps {
  story: any;
  onPress: () => void;
}

function StoryPreview({ story, onPress }: StoryPreviewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getTimeUntilExpiry = () => {
    const now = new Date();
    const expiry = new Date(story.expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return '0m';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <TouchableOpacity style={styles.storyPreview} onPress={onPress}>
      <View style={[styles.storyRing, { borderColor: colors.secondary }]}>
        <Image
          source={{ uri: story.author?.avatarUrl || 'https://via.placeholder.com/60' }}
          style={[styles.avatar, { backgroundColor: colors.surface }]}
        />
      </View>
      <Text style={[styles.storyAuthor, { color: colors.text }]} numberOfLines={1}>
        {story.author?.displayName || story.author?.handle}
      </Text>
      <Text style={[styles.storyTime, { color: colors.textSecondary }]}>
        {getTimeUntilExpiry()}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { stories, loadStories, isLoading } = useStoriesStore();
  const colors = Colors[colorScheme ?? 'light'];

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadStories();
    }
  }, [isAuthenticated, loadStories]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStories();
    setRefreshing(false);
  };

  const openStoryViewer = (storyIndex: number) => {
    router.push({
      pathname: '/story-viewer',
      params: { initialIndex: storyIndex },
    });
  };

  const renderStory = ({ item, index }: { item: any; index: number }) => (
    <StoryPreview
      story={item}
      onPress={() => openStoryViewer(index)}
    />
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Ionicons name="lock-closed" size={64} color={colors.textSecondary} />
          <Text style={[styles.message, { color: colors.text }]}>
            Please sign in to view stories
          </Text>
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={[styles.signInButtonText, { color: colors.primary }]}>
              {t('auth.signIn')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.title')}
        </Text>
        <TouchableOpacity onPress={onRefresh} disabled={isLoading}>
          <Ionicons 
            name="refresh" 
            size={24} 
            color={colors.textSecondary} 
            style={[styles.refreshIcon, isLoading && styles.refreshIconSpinning]}
          />
        </TouchableOpacity>
      </View>

      {stories.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t('home.noStories')}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Follow some people to see their stories, or create your own!
          </Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          renderItem={renderStory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.secondary}
            />
          }
        />
      )}

      {/* Your Stories Section */}
      <View style={styles.yourStoriesSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('home.yourStories')}
        </Text>
        <TouchableOpacity
          style={[styles.createStoryButton, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/(tabs)/create')}
        >
          <Ionicons name="add" size={24} color={colors.secondary} />
          <Text style={[styles.createStoryText, { color: colors.text }]}>
            Create Story
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  refreshIcon: {
    padding: Layout.spacing.sm,
  },
  refreshIconSpinning: {
    transform: [{ rotate: '360deg' }],
  },
  storiesList: {
    paddingHorizontal: Layout.spacing.md,
    gap: Layout.spacing.md,
  },
  storyPreview: {
    alignItems: 'center',
    marginHorizontal: Layout.spacing.sm,
    width: 80,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  storyAuthor: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  storyTime: {
    fontSize: 10,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
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
  message: {
    fontSize: 18,
    marginVertical: Layout.spacing.lg,
    textAlign: 'center',
  },
  signInButton: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.lg,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  yourStoriesSection: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
  },
  createStoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    gap: Layout.spacing.sm,
  },
  createStoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
