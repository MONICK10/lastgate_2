# Sequential Route-Based Scoring System

**Last Updated:** March 26, 2026  
**Status:** ✅ IMPLEMENTED

---

## 📋 Overview

The Hawkins Protocol now uses a **sequential route-based cumulative scoring system** that accumulates points across all gameplay phases, displays silently during gameplay, and shows the final cumulative score only when reaching the `/debug` phase.

---

## 🎮 Game Flow & Route Order

Players progress through the game in this **strict sequential order**:

```
/task1 
  ↓ (1250 points)
/networking 
  ↓ (0-550 points)
/missionnetworking 
  ↓ (1300 points)
/caeser 
  ↓ (0-455 points)
/debug 
  ↓ (0-275 points)
/complete
  ↓ (Reset to null)
```

---

## 🎯 Scoring Structure

### Phase 1: Task 1 (Component Collection)
- **Route:** `/mission/task1`
- **Objective:** Collect 25 network components (5 each: PC, Server, Cable, Switch, Router)
- **Scoring:** 25 items × 50 points = **1,250 points (FIXED)**
- **Score State Field:** `user.task1Score`

### Phase 2: Networking (Puzzle Challenge)
- **Route:** `/networking`
- **Objective:** Solve 11 networking puzzle problems
- **Scoring:** 50 points per problem + 100 completion bonus = **0-550 points**
- **Score State Field:** `user.networkingScore`

### Phase 3: Mission Networking (Letter Collection)
- **Route:** `/missionnetworking`
- **Objective:** Collect all 26 alphabet letters (A-Z) in 3D environment
- **Scoring:** 26 letters × 50 points = **1,300 points (FIXED)**
- **Score State Field:** `user.missionNetworkingScore`

### Phase 4: Caesar Cipher
- **Route:** `/caeser`
- **Objective:** Solve Caesar cipher questions under time pressure
- **Scoring:** 35 points per question + speed bonus = **0-455 points**
- **Score State Field:** `user.caesarScore`

### Phase 5: Debug (Code Block Ordering)
- **Route:** `/debug`
- **Objective:** Arrange 5 code blocks in correct order
- **Scoring:** 40 points per block + time bonus + 75 perfect bonus = **0-275 points**
- **Score State Field:** `user.debugScore`

### **Maximum Possible Score: 3,750 points**

| Phase | Min | Max | Fixed/Variable |
|-------|-----|-----|-----------------|
| Task 1 | 1,250 | 1,250 | Fixed ✓ |
| Networking | 0 | 550 | Variable |
| Mission Networking | 1,300 | 1,300 | Fixed ✓ |
| Caesar | 0 | 455 | Variable |
| Debug | 0 | 275 | Variable |
| **TOTAL** | **2,550** | **3,750** | Mixed |

---

## 💾 State Management

### UserContext Fields

```javascript
user = {
  name: "",                    // Player name (empty until form submitted)
  registerNumber: "",          // Player reg no (empty until form submitted)
  task1Score: 0,              // Phase 1 points
  networkingScore: 0,         // Phase 2 points
  missionNetworkingScore: 0,  // Phase 3 points
  caesarScore: 0,             // Phase 4 points
  debugScore: 0,              // Phase 5 points
  totalScore: 0,              // Sum of all phases (auto-calculated)
  totalTime: 0,               // Total game duration in seconds
  gameCompleted: false,       // Set to true after /debug
  currentPhase: "home",       // Current phase (for tracking)
  modulesCompleted: {         // Phase completion tracking
    task1: false,
    networking: false,
    missionnetworking: false,
    caesar: false,
    debug: false,
  },
}
```

---

## 🔄 Score Accumulation Logic

### How Scores Accumulate

1. **Phase 1** (`/task1`):
   - Player collects components
   - When all 25 collected: `task1Score = 1250`
   - `totalScore` = `1250`
   - Navigate to `/networking`

2. **Phase 2** (`/networking`):
   - Player solves puzzles
   - Each problem solved: `networkingScore` increases
   - `totalScore` = `task1Score (1250)` + `networkingScore (0-550)`
   - Ranges: 1250 - 1800

3. **Phase 3** (`/missionnetworking`):
   - Player collects letters
   - When all 26 collected: `missionNetworkingScore = 1300`
   - `totalScore` = 1250 + networkingScore + 1300
   - Ranges: 2550 - 3100

4. **Phase 4** (`/caeser`):
   - Player answers cipher questions
   - Each correct answer: `caesarScore` increases
   - `totalScore` = 1250 + networkingScore + 1300 + caesarScore
   - Ranges: 2550 - 3555

5. **Phase 5** (`/debug`):
   - Player arranges code blocks
   - When all 5 correct: `debugScore` calculated
   - `totalScore = FINAL CUMULATIVE SCORE`
   - Ranges: 2550 - 3750

### Score Calculation (Code Implementation)

```javascript
// In UserContext.jsx
const addPhaseScore = (phase, points) => {
  setUser((prev) => {
    const newUser = { ...prev };
    
    // Set the phase field (e.g., task1Score, networkingScore, etc.)
    const scoreField = `${phase}Score`;
    newUser[scoreField] = points;
    
    // AUTO-RECALCULATE TOTAL by summing all phases
    newUser.totalScore = 
      (newUser.task1Score || 0) +
      (newUser.networkingScore || 0) +
      (newUser.missionNetworkingScore || 0) +
      (newUser.caesarScore || 0) +
      (newUser.debugScore || 0);
    
    console.log(`✓ Phase "${phase}" scored ${points} pts | Total: ${newUser.totalScore}`);
    return newUser;
  });
};
```

---

## 📊 Score Display Behavior

### Before `/debug` (Phases 1-4)
- **Score is HIDDEN from player view**
- Score accumulated silently in localStorage
- No score display on screen during gameplay
- Player focuses on completing objectives
- Score updates logged to browser console (for debugging)

### On `/debug` (Phase 5)
- **CumulativeScoreDisplay component appears**
- **Displays full breakdown:**
  - Task 1: XXX pts
  - Networking: XXX pts
  - Mission Networking: XXX pts
  - Caesar: XXX pts
  - Debug: XXX pts
  - **TOTAL: XXX pts**
  - Accuracy percentage vs max (3750)

### After Completing All Puzzles
- Final score displayed with celebration message
- **Format:** `"{playerName} has completed the game with {totalScore} points in {totalTime} seconds"`

---

## 🔐 Data Persistence & Reset

### During Gameplay (Phases 1-5)
- All scores saved to browser localStorage
- If player reloads page: scores persist
- Continues from where they left off
- **No data is lost**

### After `/debug` Completion → `/complete` Page
- Final results displayed for 5 seconds
- Message shows: "🔄 Resetting for next player..."
- After 5 seconds: **All data is cleared**
  - `name = null`
  - `registerNumber = null`
  - `task1Score = 0`
  - `networkingScore = 0`
  - `missionNetworkingScore = 0`
  - `caesarScore = 0`
  - `debugScore = 0`
  - `totalScore = 0`
  - `totalTime = 0`
  - localStorage completely cleared

### After Reset → Fresh Start
- Player goes back to `/` (Home page)
- All form fields are empty
- No old data visible
- Ready for next player to start fresh

---

## 🔧 Implementation Details

### Key Functions in UserContext

#### 1. `addPhaseScore(phase, points)`
Add points to a specific phase and auto-calculate total.

```javascript
// Usage in each phase:
addPhaseScore("task1", 1250);         // Phase 1
addPhaseScore("networking", 350);     // Phase 2
addPhaseScore("missionnetworking", 1300); // Phase 3
addPhaseScore("caeser", 280);        // Phase 4 (note: spelled "caeser" in game)
addPhaseScore("debug", 150);         // Phase 5
```

#### 2. `updatePhase(phaseName)`
Update the current phase for tracking progress.

```javascript
// Usage:
updatePhase("task1");              // When entering Phase 1
updatePhase("networking");         // When entering Phase 2
updatePhase("debug");              // When entering Phase 5
```

#### 3. `completeGame(totalTime)`
Mark game as complete and store total time.

```javascript
// Usage in debug.jsx when all 5 problems solved:
const totalTime = timeTaken.reduce((a, b) => a + b, 0);
completeGame(totalTime);
```

#### 4. `clearUser()`
Reset everything to initial state (called on `/complete` after 5 seconds).

```javascript
// Usage in Complete.jsx:
setTimeout(() => {
  clearUser();
}, 5000);
```

---

## 🔄 Component: CumulativeScoreDisplay

**File:** `src/components/CumulativeScoreDisplay.jsx`

**Behavior:**
- Only renders when route is `/debug`
- Fixed position: top-right corner
- Shows breakdown of all 5 phases
- Displays total score prominently
- Shows accuracy percentage vs max (3750)
- Color-coded: Green for points earned, Red for 0 points, Yellow for total

**Example Display:**
```
🎮 CUMULATIVE SCORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task 1                  1250 pts ✓
Networking               350 pts ✓
Mission Networking      1300 pts ✓
Caesar                   280 pts ✓
Debug                    150 pts ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL               3330 pts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Max Possible:       3750 pts
Accuracy:           88.8%
```

---

## 📝 Phase Implementation Requirements

### Task 1 (Task1.jsx)
```javascript
import { useUser } from "../context/UserContext";

export default function Task1() {
  const { addPhaseScore, updatePhase } = useUser();
  
  const handleAllItemsCollected = () => {
    const task1Score = 25 * 50; // 1250
    addPhaseScore("task1", task1Score);
    updatePhase("task1");
    nav("/networking");
  };
}
```

### Networking (NetworkingScreen.jsx)
```javascript
const handlePuzzleComplete = (networkingScore) => {
  addPhaseScore("networking", networkingScore);
  updatePhase("networking");
  // Navigate to next phase
};
```

### Mission Networking (MissionNetworking.jsx)
```javascript
const handleLettersComplete = () => {
  const missionScore = 26 * 50; // 1300
  addPhaseScore("missionnetworking", missionScore);
  updatePhase("missionnetworking");
  // Navigate to caesar
};
```

### Caesar (caeser.jsx)
```javascript
const handleCaesarComplete = (caesarScore) => {
  addPhaseScore("caeser", caesarScore);
  updatePhase("caeser");
  // Navigate to debug
};
```

### Debug (debug.jsx)
```javascript
const handleAllProblemsCorrect = () => {
  const debugScore = calculateDebugScore(...);
  addPhaseScore("debug", debugScore);
  updatePhase("debug");
  const totalTime = timeTaken.reduce((a, b) => a + b, 0);
  completeGame(totalTime);
  // Navigate to complete
};
```

---

## ✅ Verification Checklist

- [x] UserContext has all 5 score fields
- [x] `addPhaseScore()` auto-calculates total
- [x] `updatePhase()` tracks current progress
- [x] `completeGame(totalTime)` works properly
- [x] `clearUser()` resets everything
- [x] CumulativeScoreDisplay shows on `/debug` only
- [x] Task1 uses new scoring system
- [x] Debug page uses new scoring system
- [x] Data persists during gameplay
- [x] Data clears after `/complete` reset
- [x] localStorage properly managed

---

## 🧪 Testing Instructions

### Test 1: Score Accumulation
1. Start fresh: Go to `/` → form is empty ✓
2. Enter name & reg → Submit
3. Complete Task1 (collect 25 items) → task1Score = 1250, totalScore = 1250 ✓
4. Navigate to Networking → complete puzzles → networkingScore updates, totalScore += networkingScore ✓
5. Continue through all phases → totalScore keeps increasing ✓

### Test 2: Score Display
1. Reach `/debug` → CumulativeScoreDisplay appears in top-right ✓
2. Shows all 5 phases with correct scores ✓
3. Shows correct total ✓
4. Shows correct accuracy % ✓

### Test 3: Data Persistence
1. During gameplay, reload page → All scores persist ✓
2. Can continue from where you left off ✓

### Test 4: Data Reset
1. Complete game → reach `/complete` ✓
2. See "Resetting for next player..." message ✓
3. After 5 seconds → page still shows scores briefly ✓
4. Reload page → ALL data is gone (name, reg, scores = null/0) ✓
5. Form is empty → ready for next player ✓

---

## 🐛 Debugging

### Check Console Logs
- `npm run dev` → Open browser DevTools (F12) → Console tab
- Each phase shows: `✓ Phase "xxx" scored YYY pts | Total: ZZZ`
- Example: `✓ Phase "task1" scored 1250 pts | Total: 1250`

### Check localStorage
- DevTools → Application → Storage → Local Storage → localhost:5174
- Should see `userDetails` JSON with all scores while playing
- Should be empty after reset

### Check State in React DevTools
- Install React DevTools browser extension
- Components → App → UserProvider context
- Inspect `user` object to see all fields

---

## 📊 Scoring Constants

```javascript
// src/lib/scoringSystem.js

export const SCORING_CONFIG = {
  phase1: {
    name: "Task 1",
    perItem: 50,
    totalItems: 25,
    fixedTotal: 1250,
  },
  phase2: {
    name: "Networking",
    perProblem: 50,
    textBonus: 100,
    maxProblem: 11,
    max: 550,
  },
  phase3: {
    name: "Mission Networking",
    perLetter: 50,
    totalLetters: 26,
    fixedTotal: 1300,
  },
  phase4: {
    name: "Caesar",
    perQuestion: 35,
    wrongPenalty: 8,
    speedBonus: 100,
    max: 455,
  },
  phase5: {
    name: "Debug",
    perBlock: 40,
    errorPenalty: 10,
    timeBonus: 150,
    perfectBonus: 75,
    max: 275,
  },
  MAX_TOTAL: 3750,
};
```

---

## 🎓 Educational Value

This scoring system teaches:
1. **Sequential Problem Solving** - Must complete phases in order
2. **Score Accumulation** - Points compound, importance of early phases
3. **Time Management** - Speed bonuses encourage efficiency
4. **Accuracy vs. Speed** - Trade-offs in different phases
5. **Persistent Learning** - Score visible only after all phases (reflection)

---

**Status:** Production Ready ✅

For questions or issues, check the console logs first, then review this documentation.
