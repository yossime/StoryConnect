#!/bin/bash

# StoryConnect Setup Script
# This script helps you set up the StoryConnect development environment

echo "🚀 Setting up StoryConnect..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is installed globally
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI globally..."
    npm install -g @expo/cli
fi

echo "✅ Expo CLI installed"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your actual API keys and configuration"
else
    echo "✅ Environment file already exists"
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "🗄️  Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "✅ Supabase CLI installed"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p supabase/migrations
mkdir -p supabase/functions

echo "✅ Directories created"

# Install additional dependencies for development
echo "🛠️  Installing development dependencies..."
npm install --save-dev @types/react @types/react-native

echo "✅ Development dependencies installed"

# Run initial setup
echo "🔧 Running initial setup..."

# Check if we can start the development server
echo "🚀 Testing development server startup..."
echo "Starting Expo development server..."
echo "Press Ctrl+C to stop the server"

# Start the development server
npx expo start

echo "🎉 StoryConnect setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Supabase credentials"
echo "2. Set up your Supabase project and run the schema"
echo "3. Configure OneSignal for push notifications"
echo "4. Set up AI moderation service (optional)"
echo ""
echo "For more information, see the README.md file"
echo "Happy coding! 🚀"

