# 🎮 HAWKINS PROTOCOL - QUICK START (OFFLINE)

> **Run Hawkins Protocol completely offline on any computer!**

---

## 📦 Prerequisites

Choose ONE:
- ✅ **Python** (3.6+) - Built into most systems
- ✅ **Node.js** (12+) - Download from nodejs.org
- ✅ **Any modern browser** (Chrome, Firefox, Safari, Edge)

---

## ⚡ Quick Start (Easiest Method)

### Windows:

```batch
# 1. Extract the downloaded file
Right-click Hawkins.zip → Extract All

# 2. Open PowerShell in the extracted folder
Shift+Right-click → Open PowerShell here

# 3. Start the game server
python -m http.server 3000

# 4. Open your browser and go to:
http://localhost:3000
```

### Mac/Linux:

```bash
# 1. Extract
tar -xzf hawkins-protocol-offline.tar.gz
cd hawkins-protocol-offline

# 2. Start server
python3 -m http.server 3000

# 3. Open browser
http://localhost:3000
```

---

## 🎯 One-Line Alternative

**Windows (PowerShell):**
```powershell
python -m http.server 3000 -d dist
```

**Mac/Linux:**
```bash
cd dist && python3 -m http.server 3000
```

---

## 🔌 Running Offline

Game works **100% offline** after first load:

1. **Close internet connection** (or enable Airplane Mode)
2. **Game plays normally** - no network needed
3. **All videos load** - from cache
4. **All audio plays** - background music included
5. **All scores saved** - locally on your device

---

## 📱 What's Included

✅ 5 Complete Game Phases
✅ 3D Graphics & Animations
✅ Background Music & Audio
✅ All Videos (Intro, Logo, etc.)
✅ Network Simulation
✅ Scoring System
✅ Works Completely Offline

---

## 🚀 Port Already in Use?

If port 3000 is busy, use another:

```bash
# Use port 8080 instead
python -m http.server 8080

# Then open: http://localhost:8080
```

---

## ❌ Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port 3000 in use** | Use `http.server 8080` instead |
| **"Connection refused"** | Check if server is running (see terminal output) |
| **Videos don't play** | Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac) |
| **Game very slow** | Make sure offline mode is enabled in browser cache |
| **Can't find extracted folder** | Look in Downloads folder by default |

---

## 💾 System Requirements

- **Disk Space:** 300-500 MB
- **RAM:** 500 MB minimum
- **Browser:** Any modern browser (2020+)
- **Internet:** Only needed for initial download!

---

## ⏱️ Typical Times

- **First Run:** 2-5 seconds (loading cache)
- **Subsequent Runs:** <1 second (instant!)
- **Full Game:** 25-35 minutes to complete

---

## 🎓 Want to Learn More?

📖 **Full Guide:** See `OFFLINE-DEPLOYMENT-GUIDE.md`
🎮 **Game Guide:** See `GAME-GUIDE.md` for complete rules
🔧 **Technical Details:** See `README.md`

---

**That's it! Start playing! 🎮✨**

> **Need help?**
> 1. Make sure Python or Node.js is installed
> 2. Ensure you extracted the full folder
> 3. Check that port 3000 is free
> 4. Try hard refresh (Ctrl+Shift+R)
