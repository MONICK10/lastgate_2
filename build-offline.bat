@echo off
REM ============================================
REM HAWKINS PROTOCOL - OFFLINE BUILD SCRIPT
REM ============================================
REM This script builds the application for complete offline capability
REM including all audio, video, 3D models, and assets

echo.
echo Building Hawkins Protocol for Complete Offline Mode...
echo.

REM Step 1: Clean previous build
echo Cleaning previous build...
if exist dist\ (
  rmdir /s /q dist
)
echo Cleaned previous build
echo.

REM Step 2: Install dependencies if needed
echo Checking dependencies...
if not exist node_modules\ (
  echo Installing dependencies...
  call npm install
)
echo Dependencies ready
echo.

REM Step 3: Build the application
echo Building application with all assets cached...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Build failed!
  pause
  exit /b 1
)
echo Build complete
echo.

REM Step 4: List media files
echo Verifying media files in build output...
echo.
echo Video files (*.mp4):
dir /s dist\*.mp4 2>nul | find /c ".mp4" || echo 0 found
echo.

echo Audio files (*.mpeg, *.mp3):
dir /s dist\*.mpeg 2>nul | find /c ".mpeg" || echo 0 found
dir /s dist\*.mp3 2>nul | find /c ".mp3" || echo 0 found
echo.

echo 3D Model files (*.glb):
dir /s dist\*.glb 2>nul | find /c ".glb" || echo 0 found
echo.

REM Step 5: Check Service Worker
if exist "dist\sw.js" (
  echo Service Worker found: dist\sw.js
) else (
  echo.
  echo WARNING: Service Worker not found. PWA might not work offline.
)

if exist "dist\manifest.webmanifest" (
  echo Web manifest found: dist\manifest.webmanifest
)
echo.

REM Step 6: Display cache info
echo Cache Configuration:
echo - Caching all: .js, .css, .html files
echo - Caching all: .mp4, .mpeg, .mp3 files (audio/video)
echo - Caching all: .glb, .gltf files (3D models)
echo - Caching all: .json files (game data)
echo - Maximum file size per cache: 50MB
echo.

echo Build complete!
echo.
echo Next steps:
echo 1. Test locally: npm run preview
echo 2. Or use: npx serve -s dist -p 3000
echo 3. Test offline mode in DevTools
echo.
pause
