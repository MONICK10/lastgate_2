@echo off
REM ============================================
REM HAWKINS PROTOCOL - ASSET VERIFICATION
REM ============================================
REM Verifies all required assets for offline build

setlocal enabledelayedexpansion

echo.
echo ====================================================================
echo    HAWKINS PROTOCOL - ASSET VERIFICATION
echo ====================================================================
echo.

set "ASSET_DIR=public\assets"
set "ERRORS=0"
set "WARNINGS=0"
set "FOUND=0"

echo Checking Source Assets in: %ASSET_DIR%
echo.

REM Function to check file existence
echo --------- VIDEO FILES ---------
echo.

if exist "%ASSET_DIR%\loop.mp4" (
  echo [OK] loop.mp4 - Intro loop video (required)
  set /a FOUND+=1
) else (
  echo [MISSING] loop.mp4 - Intro loop video (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\logo.mp4" (
  echo [OK] logo.mp4 - Logo animation (required)
  set /a FOUND+=1
) else (
  echo [MISSING] logo.mp4 - Logo animation (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\intro.mp4" (
  echo [OK] intro.mp4 - Introduction video (required)
  set /a FOUND+=1
) else (
  echo [MISSING] intro.mp4 - Introduction video (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\lastgate.mp4" (
  echo [OK] lastgate.mp4 - Final gate video (required)
  set /a FOUND+=1
) else (
  echo [MISSING] lastgate.mp4 - Final gate video (required)
  set /a ERRORS+=1
)

echo.
echo --------- AUDIO FILES ---------
echo.

if exist "%ASSET_DIR%\run.mpeg" (
  echo [OK] run.mpeg - Background music (required)
  set /a FOUND+=1
) else (
  echo [MISSING] run.mpeg - Background music (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\gate-sound.mp3" (
  echo [OK] gate-sound.mp3 - Sound effect (optional)
  set /a FOUND+=1
) else (
  echo [WARNING] gate-sound.mp3 - Sound effect (optional)
  set /a WARNINGS+=1
)

echo.
echo --------- 3D MODELS ---------
echo.

if exist "%ASSET_DIR%\hawk123.glb" (
  echo [OK] hawk123.glb - Main environment (required)
  set /a FOUND+=1
) else (
  echo [MISSING] hawk123.glb - Main environment (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\elwalk1.glb" (
  echo [OK] elwalk1.glb - Character walk (required)
  set /a FOUND+=1
) else (
  echo [MISSING] elwalk1.glb - Character walk (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\elrun1.glb" (
  echo [OK] elrun1.glb - Character run (required)
  set /a FOUND+=1
) else (
  echo [MISSING] elrun1.glb - Character run (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\jump.glb" (
  echo [OK] jump.glb - Jump animation (required)
  set /a FOUND+=1
) else (
  echo [MISSING] jump.glb - Jump animation (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\demowalk.glb" (
  echo [OK] demowalk.glb - Enemy walk (required)
  set /a FOUND+=1
) else (
  echo [MISSING] demowalk.glb - Enemy walk (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\demorun.glb" (
  echo [OK] demorun.glb - Enemy run (required)
  set /a FOUND+=1
) else (
  echo [MISSING] demorun.glb - Enemy run (required)
  set /a ERRORS+=1
)

echo.
echo --------- IMAGE ASSETS ---------
echo.

if exist "%ASSET_DIR%\bg2.png" (
  echo [OK] bg2.png - Intro background (required)
  set /a FOUND+=1
) else (
  echo [MISSING] bg2.png - Intro background (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\pc.png" (
  echo [OK] pc.png - PC sprite (required)
  set /a FOUND+=1
) else (
  echo [MISSING] pc.png - PC sprite (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\server.png" (
  echo [OK] server.png - Server sprite (required)
  set /a FOUND+=1
) else (
  echo [MISSING] server.png - Server sprite (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\cable.png" (
  echo [OK] cable.png - Cable sprite (required)
  set /a FOUND+=1
) else (
  echo [MISSING] cable.png - Cable sprite (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\router.png" (
  echo [OK] router.png - Router sprite (required)
  set /a FOUND+=1
) else (
  echo [MISSING] router.png - Router sprite (required)
  set /a ERRORS+=1
)

if exist "%ASSET_DIR%\switch.png" (
  echo [OK] switch.png - Switch sprite (required)
  set /a FOUND+=1
) else (
  echo [MISSING] switch.png - Switch sprite (required)
  set /a ERRORS+=1
)

echo.
echo --------- GAME DATA ---------
echo.

if exist "%ASSET_DIR%\networkLayout.json" (
  echo [OK] networkLayout.json - Network topology (required)
  set /a FOUND+=1
) else (
  echo [MISSING] networkLayout.json - Network topology (required)
  set /a ERRORS+=1
)

echo.
echo ====================================================================
echo SUMMARY
echo ====================================================================
echo.
echo Assets Found: %FOUND%
echo Critical Errors: %ERRORS%
echo Warnings: %WARNINGS%
echo.

if %ERRORS% EQU 0 (
  echo [SUCCESS] All critical assets found!
  echo.
  echo Next steps:
  echo 1. Run: npm run build
  echo 2. Test: npm run preview
  echo 3. Deploy: Copy dist/ folder
  echo.
  pause
  exit /b 0
) else (
  echo [FAILED] Missing %ERRORS% critical assets!
  echo.
  echo Please add the missing files to: %ASSET_DIR%\
  echo.
  pause
  exit /b 1
)
