import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface UserProfile {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  isPrivate: boolean;
  waPhoneE164?: string;
  waContactOpt: 'OFF' | 'FOLLOWERS_ONLY' | 'EVERYONE';
  createdAt: string;
  role?: 'user' | 'admin';
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const colors = Colors[colorScheme ?? 'light'];

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadFollowStatus();
      loadStats();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFollowStatus = async () => {
    if (!isAuthenticated || !currentUser || userId === currentUser.id) return;

    try {
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('followerId', currentUser.id)
        .eq('followeeId', userId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // Not following
      setIsFollowing(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load followers count
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followeeId', userId);

      // Load following count
      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followerId', userId);

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated || !currentUser || userId === currentUser.id) return;

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('followerId', currentUser.id)
          .eq('followeeId', userId);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            followerId: currentUser.id,
            followeeId: userId,
          });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleWhatsAppContact = () => {
    if (!profile?.waPhoneE164) return;
    
    const message = `Hi ${profile.displayName}! I saw your story on StoryConnect.`;
    const url = `https://wa.me/${profile.waPhoneE164}?text=${encodeURIComponent(message)}`;
    
    // This would open WhatsApp with the message
    console.log('WhatsApp URL:', url);
    Alert.alert('WhatsApp', `Would open WhatsApp with message to ${profile.waPhoneE164}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.error}>
          <Text style={{ color: colors.text }}>Profile not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: colors.secondary }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const canContactWhatsApp = profile.waPhoneE164 && 
    (profile.waContactOpt === 'EVERYONE' || 
     (profile.waContactOpt === 'FOLLOWERS_ONLY' && isFollowing));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {profile.displayName}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: profile.avatarUrl || 'https://via.placeholder.com/100' }}
            style={[styles.avatar, { backgroundColor: colors.surface }]}
          />
          <Text style={[styles.displayName, { color: colors.text }]}>
            {profile.displayName}
          </Text>
          <Text style={[styles.handle, { color: colors.textSecondary }]}>
            @{profile.handle}
          </Text>
          
          {profile.bio && (
            <Text style={[styles.bio, { color: colors.text }]}>
              {profile.bio}
            </Text>
          )}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {followersCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('profile.followers')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {followingCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('profile.following')}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.followButton,
                {
                  backgroundColor: isFollowing ? colors.surface : colors.secondary,
                  borderColor: colors.secondary,
                }
              ]}
              onPress={handleFollow}
            >
              <Text
                style={[
                  styles.followButtonText,
                  { color: isFollowing ? colors.secondary : colors.primary }
                ]}
              >
                {isFollowing ? t('common.unfollow') : t('common.follow')}
              </Text>
            </TouchableOpacity>

            {canContactWhatsApp && (
              <TouchableOpacity
                style={[styles.whatsappButton, { backgroundColor: colors.surface }]}
                onPress={handleWhatsAppContact}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={[styles.whatsappButtonText, { color: colors.text }]}>
                  {t('story.viewer.messageOnWhatsApp')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Privacy Info */}
        {profile.isPrivate && (
          <View style={[styles.privacyInfo, { backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
            <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
              {t('profile.whatsapp.private')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Layout.spacing.md,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
  },
  handle: {
    fontSize: 16,
    marginBottom: Layout.spacing.md,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Layout.spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    gap: Layout.spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: Layout.spacing.xs,
  },
  actions: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    gap: Layout.spacing.md,
  },
  followButton: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.lg,
    gap: Layout.spacing.sm,
  },
  whatsappButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    marginHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    gap: Layout.spacing.sm,
  },
  privacyText: {
    fontSize: 14,
  },
});
