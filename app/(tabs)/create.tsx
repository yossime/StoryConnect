import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/lib/i18n';
import { useStoriesStore } from '@/store/storiesStore';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

const { width } = Dimensions.get('window');

export default function CreateStoryScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { createStory, isLoading } = useStoriesStore();
  const colors = Colors[colorScheme ?? 'light'];

  const [storyType, setStoryType] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('TEXT');
  const [text, setText] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'FOLLOWERS' | 'PUBLIC'>('FOLLOWERS');
  const [isPosting, setIsPosting] = useState(false);

  const handleSelectMedia = async (type: 'image' | 'video') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [9, 16], // Story aspect ratio
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
        setStoryType(type === 'image' ? 'IMAGE' : 'VIDEO');
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to select media');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
        setStoryType('IMAGE');
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to take photo');
    }
  };

  const handlePost = async () => {
    if (storyType === 'TEXT' && !text.trim()) {
      Alert.alert(t('common.error'), 'Please enter some text');
      return;
    }

    if ((storyType === 'IMAGE' || storyType === 'VIDEO') && !mediaUri) {
      Alert.alert(t('common.error'), 'Please select media');
      return;
    }

    setIsPosting(true);
    try {
      await createStory({
        type: storyType,
        text: storyType === 'TEXT' ? text : undefined,
        mediaUrl: mediaUri || undefined,
        visibility,
      });

      // Reset form
      setText('');
      setMediaUri(null);
      setStoryType('TEXT');
      setVisibility('FOLLOWERS');

      Alert.alert(t('success.storyPosted'), 'Your story has been posted successfully!');
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to post story');
    } finally {
      setIsPosting(false);
    }
  };

  const renderMediaPreview = () => {
    if (!mediaUri) return null;

    return (
      <View style={styles.mediaPreview}>
        <Image source={{ uri: mediaUri }} style={styles.mediaImage} />
        <TouchableOpacity
          style={styles.removeMediaButton}
          onPress={() => setMediaUri(null)}
        >
          <Ionicons name="close-circle" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('story.create.title')}
        </Text>
        <TouchableOpacity
          style={[
            styles.postButton,
            {
              backgroundColor: isPosting ? colors.disabled : colors.secondary,
            },
          ]}
          onPress={handlePost}
          disabled={isPosting || isLoading}
        >
          <Text style={[styles.postButtonText, { color: colors.primary }]}>
            {isPosting ? t('story.create.posting') : t('story.create.post')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Story Type Selection */}
        <View style={styles.typeSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose Story Type
          </Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor: storyType === 'TEXT' ? colors.secondary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setStoryType('TEXT')}
            >
              <Ionicons
                name="text"
                size={24}
                color={storyType === 'TEXT' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color: storyType === 'TEXT' ? colors.primary : colors.text,
                  },
                ]}
              >
                {t('story.types.text')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor: storyType === 'IMAGE' ? colors.secondary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleSelectMedia('image')}
            >
              <Ionicons
                name="image"
                size={24}
                color={storyType === 'IMAGE' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color: storyType === 'IMAGE' ? colors.primary : colors.text,
                  },
                ]}
              >
                {t('story.types.image')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor: storyType === 'VIDEO' ? colors.secondary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleSelectMedia('video')}
            >
              <Ionicons
                name="videocam"
                size={24}
                color={storyType === 'VIDEO' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color: storyType === 'VIDEO' ? colors.primary : colors.text,
                  },
                ]}
              >
                {t('story.types.video')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Camera Button */}
          {storyType === 'IMAGE' && (
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.action }]}
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera" size={20} color={colors.primary} />
              <Text style={[styles.cameraButtonText, { color: colors.primary }]}>
                Take Photo
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Media Preview */}
        {renderMediaPreview()}

        {/* Text Input */}
        {storyType === 'TEXT' && (
          <View style={styles.textSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('story.create.addText')}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder={t('story.create.textPlaceholder')}
              placeholderTextColor={colors.placeholder}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={280}
              textAlignVertical="top"
            />
            <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
              {text.length}/280
            </Text>
          </View>
        )}

        {/* Visibility Settings */}
        <View style={styles.visibilitySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('story.create.visibility')}
          </Text>
          <View style={styles.visibilityButtons}>
            <TouchableOpacity
              style={[
                styles.visibilityButton,
                {
                  backgroundColor: visibility === 'FOLLOWERS' ? colors.secondary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setVisibility('FOLLOWERS')}
            >
              <Ionicons
                name="people"
                size={20}
                color={visibility === 'FOLLOWERS' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.visibilityButtonText,
                  {
                    color: visibility === 'FOLLOWERS' ? colors.primary : colors.text,
                  },
                ]}
              >
                {t('story.create.followersOnly')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityButton,
                {
                  backgroundColor: visibility === 'PUBLIC' ? colors.secondary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setVisibility('PUBLIC')}
            >
              <Ionicons
                name="globe"
                size={20}
                color={visibility === 'PUBLIC' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.visibilityButtonText,
                  {
                    color: visibility === 'PUBLIC' ? colors.primary : colors.text,
                  },
                ]}
              >
                {t('story.create.public')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Warning */}
        <View style={[styles.warning, { backgroundColor: colors.surface }]}>
          <Ionicons name="time" size={20} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.text }]}>
            {t('story.create.postWarning')}
          </Text>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  postButton: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
    gap: Layout.spacing.xl,
  },
  typeSection: {
    gap: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    gap: Layout.spacing.sm,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    gap: Layout.spacing.sm,
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mediaPreview: {
    position: 'relative',
    alignItems: 'center',
  },
  mediaImage: {
    width: width - Layout.spacing.lg * 2,
    height: (width - Layout.spacing.lg * 2) * (16 / 9),
    borderRadius: Layout.borderRadius.lg,
  },
  removeMediaButton: {
    position: 'absolute',
    top: Layout.spacing.sm,
    right: Layout.spacing.sm,
  },
  textSection: {
    gap: Layout.spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    fontSize: 16,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  visibilitySection: {
    gap: Layout.spacing.md,
  },
  visibilityButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  visibilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    gap: Layout.spacing.sm,
  },
  visibilityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    gap: Layout.spacing.sm,
  },
  warningText: {
    fontSize: 14,
    flex: 1,
  },
});

