/**
 * Layout constants for StoryConnect
 */

export const Layout = {
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Story viewer dimensions
  storyViewer: {
    width: '100%',
    height: '100%',
    maxWidth: 400,
    maxHeight: 800,
  },
  
  // Bottom tab bar
  tabBar: {
    height: 80,
    iconSize: 24,
  },
  
  // Story creation
  createStory: {
    maxTextLength: 280,
    maxImageSize: 10 * 1024 * 1024, // 10MB
    maxVideoSize: 30 * 1024 * 1024, // 30MB
    maxVideoDuration: 15, // 15 seconds
  },
  
  // Profile
  profile: {
    avatarSize: 80,
    headerHeight: 120,
  },
  
  // Admin panel
  admin: {
    moderationQueueHeight: 200,
    analyticsCardHeight: 150,
  },
};

export const Animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const ZIndex = {
  modal: 1000,
  overlay: 900,
  header: 800,
  tabBar: 700,
  story: 600,
  floating: 500,
};

