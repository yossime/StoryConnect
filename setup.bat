@echo off
REM StoryConnect Setup Script for Windows
REM This script helps you set up the StoryConnect development environment

echo 🚀 Setting up StoryConnect...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm detected
npm --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Check if Expo CLI is installed globally
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📱 Installing Expo CLI globally...
    npm install -g @expo/cli
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Expo CLI
        pause
        exit /b 1
    )
)

echo ✅ Expo CLI installed

REM Create environment file if it doesn't exist
if not exist .env (
    echo 📝 Creating environment file...
    copy env.example .env
    echo ⚠️  Please edit .env file with your actual API keys and configuration
) else (
    echo ✅ Environment file already exists
)

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 🗄️  Supabase CLI not found. Installing...
    npm install -g supabase
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Supabase CLI
        pause
        exit /b 1
    )
)

echo ✅ Supabase CLI installed

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist supabase mkdir supabase
if not exist supabase\migrations mkdir supabase\migrations
if not exist supabase\functions mkdir supabase\functions

echo ✅ Directories created

REM Install additional dependencies for development
echo 🛠️  Installing development dependencies...
npm install --save-dev @types/react @types/react-native

echo ✅ Development dependencies installed

echo 🎉 StoryConnect setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your Supabase credentials
echo 2. Set up your Supabase project and run the schema
echo 3. Configure OneSignal for push notifications
echo 4. Set up AI moderation service (optional)
echo.
echo For more information, see the README.md file
echo Happy coding! 🚀

pause

