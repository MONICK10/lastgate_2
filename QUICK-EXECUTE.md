# 🚀 EXECUTE NOW - Quick Command Guide

> **Run these commands to build your complete offline package**

---

## 3-Minute Setup

### Windows (PowerShell):
```powershell
# Step 1: Verify assets
.\verify-assets.bat

# Step 2: Build for offline
.\build-offline.bat

# Step 3: Test locally
npm run preview
# Open http://localhost:4173 in browser
# Enable offline mode in DevTools to test
```

### Mac/Linux (Terminal):
```bash
# Step 1: Verify assets
chmod +x verify-assets.sh
./verify-assets.sh

# Step 2: Build for offline
chmod +x build-offline.sh
./build-offline.sh

# Step 3: Test locally
npm run preview
# Open http://localhost:4173 in browser
# Enable offline mode in DevTools to test
```

---

## Single Command (If everything is already set up)

```bash
# Windows
.\build-offline.bat

# Mac/Linux
./build-offline.sh
```

**Results in:** `dist/` folder with complete offline application

---

## Next: Create Distribution Package

### Windows:
```powershell
Compress-Archive -Path dist\ -DestinationPath hawkins-protocol-offline.zip
```

### Mac/Linux:
```bash
zip -r hawkins-protocol-offline.zip dist/
```

**Size:** ~100-150 MB (handles all videos, audio, models)

---

## What Each File Does

| File | Purpose |
|------|---------|
| `verify-assets.bat/.sh` | Checks all game files exist before build |
| `build-offline.bat/.sh` | Builds app with offline caching enabled |
| `vite.config.js` | Already updated ✓ Controls what gets cached |

---

## Troubleshooting Quick Fixes

**"Service Worker not registered?"**
```bash
# Hard refresh in browser
Ctrl+Shift+R  (Windows)
Cmd+Shift+R   (Mac)
```

**"Build failed"**
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**"Files missing"**
```bash
# Verify all assets first
./verify-assets.sh  (or .bat on Windows)
```

---

## Done! ✅

Your offline package is ready for:
- ✅ USB drive distribution
- ✅ Network deployment  
- ✅ Local offline play
- ✅ School lab setup
- ✅ Participant computers

**Participants just need to:**
1. Extract ZIP
2. Run: `python -m http.server 3000`
3. Open: `http://localhost:3000`
4. Play offline! 🎮

---

**See detailed guides:**
- `OFFLINE-DEPLOYMENT-GUIDE.md` - Complete setup
- `OFFLINE-QUICK-START.md` - Participant instructions
- `GAME-GUIDE.md` - Game rules
