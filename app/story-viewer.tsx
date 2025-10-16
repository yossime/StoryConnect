import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import { useStoriesStore } from '@/store/storiesStore';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

const { width, height } = Dimensions.get('window');

export default function StoryViewerScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { stories, viewStory, completeStoryView, reactToStory, clickWhatsApp } = useStoriesStore();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { initialIndex } = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(parseInt(initialIndex as string) || 0);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (currentStory) {
      viewStory(currentStory.id);
      startProgressAnimation();
    }
  }, [currentStory]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const startProgressAnimation = () => {
    setProgress(0);
    progressAnim.setValue(0);
    
    if (!isPaused) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000, // 5 seconds per story
        useNativeDriver: false,
      }).start(() => {
        handleNextStory();
      });
    }
  };

  const handleNextStory = () => {
    if (currentStory) {
      completeStoryView(currentStory.id);
    }
    
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.back();
    }
  };

  const handlePreviousStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      router.back();
    }
  };

  const handleTap = (event: any) => {
    const { locationX } = event.nativeEvent;
    const tapPosition = locationX / width;
    
    if (tapPosition < 0.3) {
      handlePreviousStory();
    } else if (tapPosition > 0.7) {
      handleNextStory();
    } else {
      togglePause();
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      progressAnim.stopAnimation();
    } else {
      startProgressAnimation();
    }
  };

  const handleLongPress = () => {
    setIsPaused(true);
    progressAnim.stopAnimation();
  };

  const handleLongPressEnd = () => {
    setIsPaused(false);
    startProgressAnimation();
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleReaction = async (type: string) => {
    if (currentStory) {
      await reactToStory(currentStory.id, type);
      showControlsTemporarily();
    }
  };

  const handleWhatsAppClick = async () => {
    if (currentStory?.author) {
      await clickWhatsApp(currentStory.id, currentStory.author.id);
      showControlsTemporarily();
    }
  };

  const getTimeUntilExpiry = () => {
    if (!currentStory) return '';
    
    const now = new Date();
    const expiry = new Date(currentStory.expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const canSendWhatsApp = () => {
    if (!currentStory?.author || !user) return false;
    
    const { waContactOpt } = currentStory.author;
    
    switch (waContactOpt) {
      case 'EVERYONE':
        return true;
      case 'FOLLOWERS_ONLY':
        // In real app, check if user follows the author
        return true; // Simplified for demo
      default:
        return false;
    }
  };

  if (!currentStory) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Story not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'black' }]}>
      <PanGestureHandler
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.BEGAN) {
            showControlsTemporarily();
          }
        }}
      >
        <View style={styles.storyContainer}>
          {/* Progress Bars */}
          <View style={styles.progressContainer}>
            {stories.map((_, index) => (
              <View key={index} style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: index === currentIndex 
                        ? progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          })
                        : index < currentIndex ? '100%' : '0%',
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Story Content */}
          <TouchableOpacity
            style={styles.storyContent}
            onPress={handleTap}
            onLongPress={handleLongPress}
            onPressOut={handleLongPressEnd}
            activeOpacity={1}
          >
            {currentStory.type === 'TEXT' ? (
              <View style={[styles.textStory, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.storyText, { color: colors.primary }]}>
                  {currentStory.text}
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: currentStory.mediaUrl }}
                style={styles.storyImage}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.authorInfo}>
              <Image
                source={{ uri: currentStory.author?.avatarUrl || 'https://via.placeholder.com/40' }}
                style={[styles.authorAvatar, { backgroundColor: colors.surface }]}
              />
              <View style={styles.authorDetails}>
                <Text style={[styles.authorName, { color: colors.primary }]}>
                  {currentStory.author?.displayName || currentStory.author?.handle}
                </Text>
                <Text style={[styles.storyTime, { color: colors.textSecondary }]}>
                  {getTimeUntilExpiry()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Controls */}
          {showControls && (
            <Animated.View style={[styles.controls, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
              <View style={styles.controlsTop}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => handleReaction('LIKE')}
                >
                  <Ionicons name="heart" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => handleReaction('LAUGH')}
                >
                  <Ionicons name="happy" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => handleReaction('WOW')}
                >
                  <Ionicons name="flash" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => handleReaction('SAD')}
                >
                  <Ionicons name="sad" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => handleReaction('ANGRY')}
                >
                  <Ionicons name="thunderstorm" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.controlsBottom}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => {/* Handle reply */}}
                >
                  <Ionicons name="chatbubble" size={24} color="white" />
                </TouchableOpacity>
                
                {canSendWhatsApp() && (
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={handleWhatsAppClick}
                  >
                    <Ionicons name="logo-whatsapp" size={24} color="white" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => {/* Handle share */}}
                >
                  <Ionicons name="share" size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => {/* Handle report */}}
                >
                  <Ionicons name="flag" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Pause Indicator */}
          {isPaused && (
            <View style={styles.pauseIndicator}>
              <Ionicons name="pause" size={32} color="white" />
            </View>
          )}

          {/* Instructions */}
          {showControls && (
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>
                {t('story.viewer.tapToAdvance')}
              </Text>
              <Text style={styles.instructionText}>
                {t('story.viewer.longPressToPause')}
              </Text>
            </View>
          )}
        </View>
      </PanGestureHandler>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  storyContainer: {
    flex: 1,
    position: 'relative',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    zIndex: 10,
  },
  progressBar: {
    flex: 1,
    height: 3,
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  storyContent: {
    flex: 1,
  },
  textStory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  storyText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: Layout.spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    zIndex: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorDetails: {
    gap: 2,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  storyTime: {
    fontSize: 12,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.lg,
    zIndex: 10,
  },
  controlsTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  controlsBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
  },
  whatsappButton: {
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: '#25D366',
  },
  pauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    zIndex: 20,
  },
  instructions: {
    position: 'absolute',
    bottom: Layout.spacing.xl * 2,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Layout.spacing.xs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});

