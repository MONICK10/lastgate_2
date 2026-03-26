#!/bin/bash

# ============================================
# HAWKINS PROTOCOL - ASSET VERIFICATION
# ============================================
# Verifies all required assets are present for offline play

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  HAWKINS PROTOCOL - ASSET VERIFICATION    ║"
echo "╚════════════════════════════════════════════╝"
echo ""

ASSET_DIR="public/assets"
DIST_ASSET_DIR="dist/assets"
ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check file and report
check_file() {
  local file=$1
  local description=$2
  local is_critical=${3:-1}
  
  if [ -f "$file" ]; then
    local size=$(du -h "$file" | cut -f1)
    echo -e "${GREEN}✓${NC} $description"
    echo "  Location: $file (Size: $size)"
  else
    if [ "$is_critical" = "1" ]; then
      echo -e "${RED}✗ MISSING (CRITICAL): $description${NC}"
      echo "  Expected: $file"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "${YELLOW}⚠ MISSING (Optional): $description${NC}"
      echo "  Expected: $file"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi
}

echo "📋 Checking Source Assets..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Video files (Critical)
echo "📹 Video Files (Required for offline intro):"
check_file "$ASSET_DIR/loop.mp4" "Intro loop video" 1
check_file "$ASSET_DIR/logo.mp4" "Logo animation" 1
check_file "$ASSET_DIR/intro.mp4" "Introduction video" 1
check_file "$ASSET_DIR/lastgate.mp4" "Final gate video" 1
echo ""

# Audio files (Critical)
echo "🔊 Audio Files (Required for background music):"
check_file "$ASSET_DIR/run.mpeg" "Background music - Phase 1 & 3" 1
check_file "$ASSET_DIR/gate-sound.mp3" "Gate sound effect" 0
echo ""

# 3D Models (Critical)
echo "📦 3D Models (Required for gameplay):"
check_file "$ASSET_DIR/hawk123.glb" "Main environment model" 1
check_file "$ASSET_DIR/elwalk1.glb" "Character walk animation" 1
check_file "$ASSET_DIR/elrun1.glb" "Character run animation" 1
check_file "$ASSET_DIR/jump.glb" "Character jump animation" 1
check_file "$ASSET_DIR/demowalk.glb" "Enemy walk animation" 1
check_file "$ASSET_DIR/demorun.glb" "Enemy run animation" 1
echo ""

# Images (Critical)
echo "🖼️  Image Assets:"
check_file "$ASSET_DIR/bg2.png" "Intro background" 1
check_file "$ASSET_DIR/pc.png" "PC component sprite" 1
check_file "$ASSET_DIR/server.png" "Server component sprite" 1
check_file "$ASSET_DIR/cable.png" "Cable component sprite" 1
check_file "$ASSET_DIR/router.png" "Router component sprite" 1
check_file "$ASSET_DIR/switch.png" "Switch component sprite" 1
echo ""

# Data files (Critical)
echo "📋 Game Data Files:"
check_file "$ASSET_DIR/networkLayout.json" "Network topology data" 1
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}✓ ALL ASSETS FOUND!${NC}"
  echo ""
  echo "Your Hawkins Protocol installation has all required assets."
  echo "Ready to build for offline deployment!"
  echo ""
  
  # Show total size
  if [ -d "$ASSET_DIR" ]; then
    total_size=$(du -sh "$ASSET_DIR" | cut -f1)
    echo "📊 Total asset size: $total_size"
  fi
  echo ""
  
  echo "Next steps:"
  echo "1. Run: npm run build"
  echo "2. Test: npm run preview"
  echo "3. Deploy: Copy dist/ folder"
  echo ""
  exit 0
  
elif [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}✗ CRITICAL ERRORS: $ERRORS files missing${NC}"
  echo -e "${YELLOW}⚠ WARNINGS: $WARNINGS optional files missing${NC}"
  echo ""
  echo "Cannot build for offline deployment!"
  echo "Please add missing critical files to: $ASSET_DIR/"
  echo ""
  exit 1
  
else
  echo -e "${GREEN}✓ All critical assets found${NC}"
  echo -e "${YELLOW}⚠ WARNINGS: $WARNINGS optional files missing${NC}"
  echo ""
  echo "Build will succeed, but some optional features may not work."
  echo ""
  exit 0
fi
