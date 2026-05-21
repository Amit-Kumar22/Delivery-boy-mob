#!/bin/bash

# Build Release APK for DeliveryBoy App
# This script ensures the JS bundle is properly generated and packaged

set -e  # Exit on error

echo "🚀 Starting Release APK Build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Clean Metro bundler cache
echo "🧹 Cleaning Metro cache..."
rm -rf .expo
rm -rf node_modules/.cache

# Build the release APK (Expo will handle JS bundling automatically)
echo "🔨 Building release APK..."
cd android
./gradlew assembleRelease

# Check if APK was created
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ Release APK built successfully!"
    echo "📍 Location: android/$APK_PATH"
    
    # Copy to project root for easy access
    cp "$APK_PATH" ../deliveryboy-release.apk
    echo "📦 APK copied to: deliveryboy-release.apk"
else
    echo "❌ APK build failed! APK not found at expected location."
    exit 1
fi

cd ..
echo "🎉 Build complete!"
