# 🎮 HAWKINS PROTOCOL - OFFLINE DEPLOYMENT GUIDE

## Complete Setup for Offline Play

This guide ensures Hawkins Protocol runs completely offline without any internet dependency.

---

## ✅ STEP 1: Build for Offline

### Windows Users:
```bash
# Double-click to run
build-offline.bat

# OR manual command
npm run build
```

### Linux/Mac Users:
```bash
# Make executable
chmod +x build-offline.sh

# Run
./build-offline.sh

# OR manual command
npm run build
```

**Build Outputs:**
- ✅ All JS/CSS bundles (minified)
- ✅ All video files (loop.mp4, logo.mp4, intro.mp4, lastgate.mp4)
- ✅ All audio files (run.mpeg)
- ✅ All 3D models (hawk123.glb, character models, enemy models)
- ✅ All images and sprites
- ✅ All game data (JSON files)
- ✅ Service Worker (sw.js)
- ✅ PWA Manifest (manifest.webmanifest)

---

## 🚀 STEP 2: Test Offline Build Locally

### Option A: Using npm preview (Recommended)
```bash
npm run preview
```
Then open: http://localhost:4173

### Option B: Using serve package
```bash
# Install globally (one-time)
npm install -g serve

# Run
serve -s dist -p 3000
```
Then open: http://localhost:3000

### Option C: Using Python (if available)
```bash
# Python 3
python -m http.server 3000 --directory dist

# Python 2
cd dist && python -m SimpleHTTPServer 3000
```
Then open: http://localhost:3000

---

## 🔴 STEP 3: Test Offline Mode

In your browser:

1. **Open DevTools** (F12 or Right-click → Inspect)
2. **Go to Application tab**
3. **Left sidebar → Service Workers**
4. **Check the "Offline" checkbox**
5. **Refresh the page** (Ctrl+R or Cmd+R)
6. **Verify everything still works:**
   - ✅ Intro videos play
   - ✅ Background music plays
   - ✅ 3D environments load
   - ✅ All game phases work
   - ✅ No red errors in console

---

## 📦 STEP 4: Package for Distribution

### Create Compressed Archive

**Windows (PowerShell):**
```powershell
Compress-Archive -Path dist\ -DestinationPath hawkins-protocol-offline.zip
```

**Linux/Mac:**
```bash
# ZIP format
zip -r hawkins-protocol-offline.zip dist/

# TAR.GZ format (smaller)
tar -czf hawkins-protocol-offline.tar.gz dist/
```

### File Size Expectations
- HTML/CSS/JS: 2-3 MB
- Video files: 200-400 MB (compressed: ~50-100 MB)
- Audio files: 5-10 MB
- 3D Models: 30-50 MB
- Images/Data: 2-5 MB
- **Total uncompressed: ~250-500 MB**
- **Total compressed: ~100-150 MB**

---

## 💻 STEP 5: Installation on Target Systems

### For Participant Computers

#### Windows Installation:

1. **Extract Archive:**
   ```
   Right-click → Extract All → Choose Folder
   ```

2. **Start Server (Choose One):**

   **Option A: Using Node.js (Recommended)**
   ```bash
   # Install Node.js from nodejs.org first
   # Then navigate to extracted folder
   cd hawkins-protocol-offline
   npx serve -s dist -p 3000
   # Open http://localhost:3000
   ```

   **Option B: Using Python**
   ```bash
   cd hawkins-protocol-offline\dist
   python -m http.server 3000
   # Open http://localhost:3000
   ```

   **Option C: Direct File Access (Limited)**
   ```
   Navigate to: dist/index.html
   Drag to browser
   NOTE: Some features may not work with file:// protocol
   ```

#### Linux Installation:

1. **Extract Archive:**
   ```bash
   tar -xzf hawkins-protocol-offline.tar.gz
   cd hawkins-protocol-offline
   ```

2. **Start Server:**
   ```bash
   # Option A: Using serve (recommended)
   npx serve -s dist -p 3000

   # Option B: Using Python
   cd dist
   python3 -m http.server 3000

   # Option C: Using Node built-in
   node -e "require('http').createServer((req,res)=>require('fs').createReadStream('.' + (req.url === '/' ? '/index.html' : req.url)).pipe(res)).listen(3000); console.log('http://localhost:3000')"
   ```

3. **Open Browser:**
   ```
   http://localhost:3000
   ```

#### Mac Installation:

```bash
# Extract
tar -xzf hawkins-protocol-offline.tar.gz
cd hawkins-protocol-offline

# Install serve (one-time)
npm install -g serve

# Run
serve -s dist -p 3000

# Then open http://localhost:3000
```

---

## 🔧 STEP 6: Verify All Assets Cached

### Check Cached Files:

1. **Open DevTools** (F12)
2. **Go to Application tab**
3. **Left sidebar → Cache Storage**
4. **Click "offline-cache"**
5. **Scroll through and verify:**
   - ✅ `loop.mp4` (60KB+)
   - ✅ `logo.mp4` (thousands of bytes)
   - ✅ `intro.mp4` (larger file)
   - ✅ `lastgate.mp4` (larger file)
   - ✅ `run.mpeg` (audio file)
   - ✅ `hawk123.glb` (3D model - large)
   - ✅ Various `.js` and `.css` files
   - ✅ All `.json` game data files

### If Files Missing:

1. **Clear All Caches:**
   - DevTools → Application → Unregister Service Worker
   - DevTools → Application → Clear Site Data
   - Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

2. **Rebuild and Re-deploy:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🌐 STEP 7: Network Testing

### Simulate Different Network Conditions:

1. **Perfect Offline:**
   - DevTools → Network tab
   - Set "Throttling" to "Offline"
   - Refresh page (Ctrl+R)
   - Game should work perfectly

2. **Slow Connection (3G):**
   - DevTools → Network tab
   - Set "Throttling" to "Slow 3G"
   - Refresh and play first phase
   - Should still be responsive

3. **Regular 4G:**
   - Set "Throttling" to "4G"
   - All features should work smoothly

---

## 🎯 STEP 8: Deployment Scenarios

### Scenario A: School Lab Over Network

```bash
# On server computer
npm run build
serve -s dist -p 3000

# On student computers
# Open: http://[server-ip-address]:3000
# Example: http://192.168.1.100:3000
```

### Scenario B: USB Drive Installation

**Step 1: Copy to USB**
```bash
# On main computer
npm run build
copy dist\ "D:\Hawkins\"  # (or cp dist/ /Volumes/USB-Drive/Hawkins/ on Mac)
```

**Step 2: Run from USB**
```bash
# On participant computer
cd D:\Hawkins\dist
python -m http.server 3000
# Open http://localhost:3000
```

### Scenario C: Docker Container (Advanced)

```dockerfile
# Save as Dockerfile in dist folder
FROM node:22-slim
WORKDIR /app
COPY . .
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", ".", "-p", "3000"]
```

**Build and run:**
```bash
docker build -t hawkins-protocol .
docker run -p 3000:3000 hawkins-protocol
```

### Scenario D: Cloud Server (Hybrid)

```bash
# Deploy to server
npm run build
scp -r dist/ user@server.com:/var/www/hawkins

# On server
cd /var/www/hawkins
npm install -g serve
serve -s . -p 3000
```

---

## 🆘 TROUBLESHOOTING

### Problem: Videos not playing offline

**Solution:**
```bash
# Check if videos exist in dist/
ls dist/assets/*.mp4

# Rebuild if missing
npm run build

# Clear browser cache
# DevTools → Application → Clear Site Data
```

### Problem: "Offline" checkbox grayed out

**Solution:**
- Service Worker not registered
- Try: Clear site data + hard refresh (Ctrl+Shift+R)
- Wait 5 seconds, then try again

### Problem: Large file sizes

**Solution:**
```bash
# Compress videos before building
ffmpeg -i input.mp4 -crf 23 -preset medium output.mp4

# Then rebuild
npm run build
```

### Problem: Service Worker stuck in old version

**Solution:**
```bash
# Force unregister in DevTools
# Application → Service Workers → Unregister

# Clear storage
# Application → Clear Site Data (check all)

# Hard refresh
Ctrl+Shift+R
```

### Problem: Still using internet offline

**Solution:**
1. Check Console (F12) for errors
2. Ensure manifest.webmanifest exists: `dist/manifest.webmanifest`
3. Ensure sw.js exists: `dist/sw.js`
4. Check `vite.config.js` has correct globPatterns

---

## 📊 PERFORMANCE MONITORING

### First Load (With Internet)
- Check DevTools → Network tab
- Monitor: Time to Interactive (TTI)
- Typical: 2-5 seconds

### Subsequent Loads (Offline)
- All files served from cache
- Should be <1 second
- Instant gameplay

### Monitor Cache Usage:
```javascript
// In browser console:
navigator.storage.estimate().then(estimate => {
  console.log('Used:', estimate.usage, 'bytes');
  console.log('Available:', estimate.quota, 'bytes');
  console.log('Percent used:', (estimate.usage / estimate.quota * 100).toFixed(2), '%');
});
```

---

## ✨ FINAL VERIFICATION CHECKLIST

- [ ] Build completes without errors: `npm run build`
- [ ] Service Worker generated: `dist/sw.js` exists
- [ ] Manifest generated: `dist/manifest.webmanifest` exists
- [ ] Video files in output: `dist/assets/*.mp4` 
- [ ] Audio files in output: `dist/assets/*.mpeg`
- [ ] 3D models in output: `dist/assets/*.glb`
- [ ] Game data in output: `dist/assets/*.json`
- [ ] Local preview works: `npm run preview`
- [ ] Offline mode works: DevTools → Offline checkbox
- [ ] All phases playable offline
- [ ] No console errors
- [ ] Archive created successfully
- [ ] Archive tested on another system

---

## 🎉 SUCCESS!

Your Hawkins Protocol installation is now **100% offline capable**!

**Participants can now:**
✅ Download and extract the package
✅ Run locally without internet
✅ Play entire game completely offline
✅ Access from USB drive
✅ Run on school networks
✅ Compete without connectivity issues

---

**Questions?**
- Check browser DevTools Console for errors
- Verify vite.config.js globPatterns include media files
- Ensure all source files exist in public/assets/
- Run `npm run build` after any configuration changes
