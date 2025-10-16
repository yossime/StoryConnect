import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import { useStoriesStore } from '@/store/storiesStore';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { user, signOut, updateProfile } = useAuthStore();
  const { loadUserStories } = useStoriesStore();
  const colors = Colors[colorScheme ?? 'light'];

  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (user?.waPhoneE164) {
      setPhoneNumber(user.waPhoneE164);
    }
  }, [user]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const handleWhatsAppToggle = () => {
    if (!user?.waPhoneE164) {
      setShowWhatsAppModal(true);
    } else {
      Alert.alert(
        'WhatsApp Settings',
        'Change WhatsApp settings?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change',
            onPress: () => setShowWhatsAppModal(true),
          },
        ]
      );
    }
  };

  const handlePhoneVerification = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert(t('common.error'), 'Please enter a phone number');
      return;
    }

    setIsVerifying(true);
    try {
      // In real app, this would call the verification service
      console.log('Sending verification code to:', phoneNumber);
      Alert.alert('Code Sent', `Verification code sent to ${phoneNumber}`);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to send verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert(t('common.error'), 'Please enter the verification code');
      return;
    }

    try {
      // In real app, this would verify the code
      await updateProfile({
        waPhoneE164: phoneNumber,
        waContactOpt: 'FOLLOWERS_ONLY',
      });
      
      setShowWhatsAppModal(false);
      setVerificationCode('');
      Alert.alert(t('success.phoneVerified'), 'Your phone number has been verified!');
    } catch (error) {
      Alert.alert(t('common.error'), 'Invalid verification code');
    }
  };

  const handleWhatsAppContactChange = (option: 'OFF' | 'FOLLOWERS_ONLY' | 'EVERYONE') => {
    if (user?.waPhoneE164) {
      updateProfile({ waContactOpt: option });
    }
  };

  const getWhatsAppButtonText = () => {
    switch (user?.waContactOpt) {
      case 'EVERYONE':
        return t('profile.whatsapp.everyone');
      case 'FOLLOWERS_ONLY':
        return t('profile.whatsapp.followersOnly');
      default:
        return t('profile.whatsapp.off');
    }
  };

  const getWhatsAppButtonColor = () => {
    switch (user?.waContactOpt) {
      case 'EVERYONE':
        return colors.success;
      case 'FOLLOWERS_ONLY':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Please sign in to view your profile
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('profile.title')}
          </Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.avatarUrl || 'https://via.placeholder.com/80' }}
              style={[styles.avatar, { backgroundColor: colors.surface }]}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.displayName, { color: colors.text }]}>
            {user.displayName}
          </Text>
          <Text style={[styles.handle, { color: colors.textSecondary }]}>
            @{user.handle}
          </Text>
          {user.bio && (
            <Text style={[styles.bio, { color: colors.text }]}>
              {user.bio}
            </Text>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('profile.followers')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('profile.following')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('profile.stories')}
              </Text>
            </View>
          </View>
        </View>

        {/* WhatsApp Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('profile.whatsapp.title')}
          </Text>
          
          <TouchableOpacity
            style={[styles.whatsappButton, { borderColor: colors.border }]}
            onPress={handleWhatsAppToggle}
          >
            <View style={styles.whatsappButtonContent}>
              <Ionicons name="logo-whatsapp" size={24} color={getWhatsAppButtonColor()} />
              <View style={styles.whatsappButtonText}>
                <Text style={[styles.whatsappButtonTitle, { color: colors.text }]}>
                  {t('profile.whatsapp.enable')}
                </Text>
                <Text style={[styles.whatsappButtonSubtitle, { color: colors.textSecondary }]}>
                  {getWhatsAppButtonText()}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {user.waPhoneE164 && (
            <View style={styles.whatsappOptions}>
              <TouchableOpacity
                style={[
                  styles.whatsappOption,
                  {
                    backgroundColor: user.waContactOpt === 'OFF' ? colors.surface : 'transparent',
                  },
                ]}
                onPress={() => handleWhatsAppContactChange('OFF')}
              >
                <Text style={[styles.whatsappOptionText, { color: colors.text }]}>
                  {t('profile.whatsapp.off')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.whatsappOption,
                  {
                    backgroundColor: user.waContactOpt === 'FOLLOWERS_ONLY' ? colors.surface : 'transparent',
                  },
                ]}
                onPress={() => handleWhatsAppContactChange('FOLLOWERS_ONLY')}
              >
                <Text style={[styles.whatsappOptionText, { color: colors.text }]}>
                  {t('profile.whatsapp.followersOnly')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.whatsappOption,
                  {
                    backgroundColor: user.waContactOpt === 'EVERYONE' ? colors.surface : 'transparent',
                  },
                ]}
                onPress={() => handleWhatsAppContactChange('EVERYONE')}
              >
                <Text style={[styles.whatsappOptionText, { color: colors.text }]}>
                  {t('profile.whatsapp.everyone')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('profile.settings')}
          </Text>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingItemContent}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>
                {t('profile.editProfile')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingItemContent}>
              <Ionicons name="analytics-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>
                {t('analytics.title')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>
                Notifications
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* WhatsApp Modal */}
      <Modal
        visible={showWhatsAppModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowWhatsAppModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.secondary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('profile.whatsapp.verifyPhone')}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.modalContent}>
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Enter your phone number to enable WhatsApp messaging
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Phone Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder={t('profile.whatsapp.phonePlaceholder')}
                placeholderTextColor={colors.placeholder}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            {phoneNumber && (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('profile.whatsapp.verifyCode')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Enter verification code"
                  placeholderTextColor={colors.placeholder}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                />
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.verifyButton,
                {
                  backgroundColor: verificationCode ? colors.secondary : colors.disabled,
                },
              ]}
              onPress={verificationCode ? handleVerifyCode : handlePhoneVerification}
              disabled={isVerifying}
            >
              <Text style={[styles.verifyButtonText, { color: colors.primary }]}>
                {verificationCode ? t('profile.whatsapp.verify') : 'Send Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  profileSection: {
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Layout.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5865F2',
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
  },
  handle: {
    fontSize: 14,
    marginBottom: Layout.spacing.sm,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Layout.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: Layout.spacing.xs,
  },
  section: {
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
  },
  whatsappButton: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  whatsappButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  whatsappButtonText: {
    flex: 1,
  },
  whatsappButtonTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  whatsappButtonSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  whatsappOptions: {
    gap: Layout.spacing.sm,
  },
  whatsappOption: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  whatsappOptionText: {
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  settingItemText: {
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.xl,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: Layout.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: Layout.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    fontSize: 16,
  },
  verifyButton: {
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

