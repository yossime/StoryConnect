# StoryConnect 📱

A modern mobile app for sharing stories that disappear after 24 hours, built with React Native and Expo.

## Features ✨

- **📸 Story Creation**: Share text, images, and videos with 24-hour auto-deletion
- **👥 Social Features**: Follow users, view stories, react and comment
- **📱 WhatsApp Integration**: Allow followers to message you via WhatsApp
- **🤖 AI Moderation**: Automatic content moderation with manual review queue
- **📊 Analytics**: Track views, engagement, and performance metrics
- **🔒 Privacy First**: Granular privacy controls and data protection
- **🌍 Localization**: Support for Hebrew and English
- **⚡ Real-time**: Live updates and notifications

## Tech Stack 🛠️

- **Frontend**: React Native, Expo, TypeScript
- **State Management**: Zustand with MMKV storage
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Navigation**: Expo Router with file-based routing
- **Notifications**: OneSignal for push notifications
- **UI**: Custom design system with dark/light themes
- **Media**: Expo Camera, Image Picker, Video recording

## Prerequisites 📋

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android)
- Supabase account for backend services

## Quick Start 🚀

### 1. Clone and Install

```bash
git clone <repository-url>
cd storyconnect
npm install
```

### 2. Environment Setup

Copy the environment template and configure:

```bash
cp env.example .env
```

Fill in your Supabase credentials and other API keys in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Enable Row Level Security (RLS) policies
4. Set up storage buckets for media files

### 4. Start Development

```bash
# Start the development server
npx expo start

# For iOS simulator
npx expo start --ios

# For Android emulator
npx expo start --android
```

## Project Structure 📁

```
storyconnect/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── story-viewer.tsx   # Story viewer modal
├── components/            # Reusable UI components
├── constants/             # App constants and themes
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── i18n.ts           # Internationalization
│   ├── moderation.ts     # AI moderation service
│   └── notifications.ts  # Push notifications
├── locales/              # Translation files
├── store/                # Zustand state stores
├── supabase/             # Database schema
└── assets/               # Images and fonts
```

## Key Features Implementation 🔧

### Story Creation
- Camera integration for photos/videos
- Text overlay with custom fonts
- Privacy controls (followers vs public)
- Automatic 24-hour expiration

### Social Features
- Follow/unfollow system
- Story viewing with tap navigation
- Reactions and comments
- Real-time updates

### WhatsApp Integration
- Phone number verification
- Privacy controls (off/followers/everyone)
- Deep linking to WhatsApp
- Analytics tracking

### AI Moderation
- Pre-publish content screening
- Post-publish deep analysis
- Manual review queue for admins
- Risk scoring and tagging

### Analytics Dashboard
- Story performance metrics
- User engagement stats
- System-wide analytics for admins
- Real-time data visualization

## Database Schema 🗄️

The app uses PostgreSQL with the following main tables:

- `users` - User profiles and settings
- `stories` - Story content with moderation status
- `follows` - User relationships
- `story_views` - View tracking and analytics
- `reactions` - User reactions to stories
- `comments` - Story comments
- `reports` - Content reporting system
- `events` - Analytics event tracking

## API Endpoints 🔌

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout

### Stories
- `GET /stories` - Get user's feed
- `POST /stories` - Create new story
- `POST /stories/:id/view` - Record story view
- `POST /stories/:id/reaction` - Add reaction
- `POST /stories/:id/comment` - Add comment

### Social
- `POST /follow/:userId` - Follow user
- `DELETE /follow/:userId` - Unfollow user
- `POST /stories/:id/click-whatsapp` - Track WhatsApp clicks

### Admin
- `GET /admin/moderation-queue` - Get pending stories
- `POST /admin/stories/:id/moderate` - Moderate story
- `GET /admin/analytics` - System analytics

## Configuration ⚙️

### Feature Flags
Control app features via environment variables:

```env
ENABLE_AI_MODERATION=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_WHATSAPP_INTEGRATION=true
ENABLE_ANALYTICS=true
ENABLE_ADMIN_PANEL=true
```

### Rate Limiting
Configure rate limits for API protection:

```env
RATE_LIMIT_STORY_POSTS_PER_HOUR=10
RATE_LIMIT_WHATSAPP_CLICKS_PER_MINUTE=5
RATE_LIMIT_REPORTS_PER_MINUTE=3
```

### Content Limits
Set maximum content sizes:

```env
MAX_STORY_TEXT_LENGTH=280
MAX_STORY_IMAGE_SIZE_MB=10
MAX_STORY_VIDEO_SIZE_MB=30
MAX_STORY_VIDEO_DURATION_SECONDS=15
```

## Deployment 🚀

### Development Build
```bash
# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Build
```bash
# Create production build
eas build --profile production --platform all
```

### App Store Submission
```bash
# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security 🔒

- All user data is encrypted at rest
- API endpoints use Row Level Security (RLS)
- Content moderation prevents harmful material
- Privacy controls protect user information
- Rate limiting prevents abuse

## Performance 📈

- Optimized image loading and caching
- Efficient database queries with proper indexing
- Real-time updates with minimal battery impact
- Offline-first architecture with local storage

## Monitoring 📊

- Error tracking with Sentry integration
- Performance monitoring
- User analytics (privacy-compliant)
- System health checks

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

- 📧 Email: support@storyconnect.app
- 💬 Discord: [Join our community](https://discord.gg/storyconnect)
- 📖 Docs: [StoryConnect Documentation](https://docs.storyconnect.app)

## Roadmap 🗺️

- [ ] Video editing tools
- [ ] Story templates and effects
- [ ] Group stories
- [ ] Live streaming integration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Web app version

---

Made with ❤️ using React Native and Expo
