// ============================================
// SCORING SYSTEM - Core Functions
// ============================================

export const SCORING_CONFIG = {
  NETWORKING: {
    CORRECT_PROBLEM: 50,
    WRONG_ACTION: -10,
    COMPLETION_BONUS: 100,
    MAX_TIME_MINS: 20,
  },
  DEBUG: {
    CORRECT_BLOCK: 50,
    INCORRECT_ATTEMPT: -10,
    PERFECT_SOLUTION_BONUS: 0,
    MAX_TIME_SECS: 600,
  },
  CAESAR: {
    CORRECT_ANSWER: 50,
    WRONG_ANSWER: -10,
    MAX_TIME_SECS: 300,
  },
};

// ============================================
// NETWORKING SCORE CALCULATION
// ============================================
export const calculateNetworkingScore = (solvedProblems, wrongAttempts, completionTime) => {
  const baseScore = solvedProblems * SCORING_CONFIG.NETWORKING.CORRECT_PROBLEM;
  const penalty = wrongAttempts * SCORING_CONFIG.NETWORKING.WRONG_ACTION;
  
  const completionBonus = solvedProblems === 9 ? SCORING_CONFIG.NETWORKING.COMPLETION_BONUS : 0;
  
  return Math.max(0, baseScore + penalty + completionBonus);
};

// ============================================
// DEBUG SCORE CALCULATION
// ============================================
export const calculateDebugScore = (correctBlocks, incorrectAttempts, completionTime, isPerfect) => {
  const baseScore = correctBlocks * SCORING_CONFIG.DEBUG.CORRECT_BLOCK;
  const penalty = incorrectAttempts * SCORING_CONFIG.DEBUG.INCORRECT_ATTEMPT;
  
  const perfectBonus = isPerfect ? SCORING_CONFIG.DEBUG.PERFECT_SOLUTION_BONUS : 0;
  
  return Math.max(0, baseScore + penalty + perfectBonus);
};

// ============================================
// CAESAR CIPHER SCORE CALCULATION
// ============================================
export const calculateCaesarScore = (correctAnswers, wrongAnswers, completionTime) => {
  const baseScore = correctAnswers * SCORING_CONFIG.CAESAR.CORRECT_ANSWER;
  const penalty = wrongAnswers * SCORING_CONFIG.CAESAR.WRONG_ANSWER;
  
  const speedBonus = Math.max(
    0,
    ((SCORING_CONFIG.CAESAR.MAX_TIME_SECS - completionTime) / SCORING_CONFIG.CAESAR.MAX_TIME_SECS) * 120
  );
  
  return Math.max(0, baseScore + penalty + speedBonus);
};

// ============================================
// TOTAL SCORE CALCULATION
// ============================================
export const calculateTotalScore = (networkingScore, debugScore, caesarScore) => {
  return Math.round(networkingScore + debugScore + caesarScore);
};

// ============================================
// FLOATING SCORE SPAWNER
// ============================================
export const createFloatingScore = (points, x, y) => {
  return {
    id: Math.random(),
    points,
    x,
    y,
    type: points > 0 ? 'positive' : 'negative',
    createdAt: Date.now(),
  };
};
