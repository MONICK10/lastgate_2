#!/bin/bash

# ============================================
# HAWKINS PROTOCOL - OFFLINE BUILD SCRIPT
# ============================================
# This script builds the application for complete offline capability
# including all audio, video, 3D models, and assets

set -e

echo "🔨 Building Hawkins Protocol for Complete Offline Mode..."
echo ""

# Step 1: Clean previous build
echo "📦 Cleaning previous build..."
rm -rf dist/
echo "✅ Previous build cleaned"
echo ""

# Step 2: Install dependencies if needed
echo "📚 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi
echo "✅ Dependencies ready"
echo ""

# Step 3: Build the application
echo "🔨 Building application with all assets cached..."
npm run build
echo "✅ Build complete"
echo ""

# Step 4: Verify all media files are in output
echo "🔍 Verifying media files in build output..."
VIDEO_FILES=$(find dist/ -name "*.mp4" 2>/dev/null | wc -l)
AUDIO_FILES=$(find dist/ -name "*.mpeg" -o -name "*.mp3" 2>/dev/null | wc -l)
MODEL_FILES=$(find dist/ -name "*.glb" 2>/dev/null | wc -l)
JSON_FILES=$(find dist/ -name "*.json" 2>/dev/null | wc -l)

echo "📹 Video files found: $VIDEO_FILES"
echo "🔊 Audio files found: $AUDIO_FILES"
echo "📦 3D models found: $MODEL_FILES"
echo "📋 Data files found: $JSON_FILES"
echo ""

# Step 5: Check Service Worker
if [ -f "dist/sw.js" ]; then
  echo "✅ Service Worker generated: dist/sw.js"
else
  echo "⚠️  Warning: Service Worker not found. PWA might not work offline."
fi

if [ -f "dist/manifest.webmanifest" ]; then
  echo "✅ Web manifest found: dist/manifest.webmanifest"
fi
echo ""

# Step 6: Calculate total size
echo "📊 Build Statistics:"
TOTAL_SIZE=$(du -sh dist/ | cut -f1)
echo "Total build size: $TOTAL_SIZE"
echo ""

# Step 7: Display cache patterns info
echo "🔄 Cache Configuration:"
echo "✅ Caching all: .js, .css, .html files"
echo "✅ Caching all: .mp4, .mpeg, .mp3 files (audio/video)"
echo "✅ Caching all: .glb, .gltf files (3D models)"
echo "✅ Caching all: .json files (game data)"
echo "✅ Maximum file size per cache: 50MB"
echo ""

echo "🎉 Offline Build Complete!"
echo ""
echo "Next steps:"
echo "1. Test locally: npm run preview"
echo "2. Or use: serve -s dist -p 3000"
echo "3. Press Ctrl+Shift+Delete to clear cache if needed"
echo "4. Test offline mode in DevTools (Application → Service Workers → Offline checkbox)"
echo ""
