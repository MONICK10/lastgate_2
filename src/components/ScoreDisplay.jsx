import React, { useEffect, useState } from 'react';
import './ScoreDisplay.css';

export function ScoreDisplay({ score = 0, onChange }) {
  const [displayScore, setDisplayScore] = useState(score);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (displayScore !== score) {
      setIsUpdating(true);
      // Animate the score change
      const timer = setTimeout(() => {
        setDisplayScore(score);
        setIsUpdating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [score, displayScore]);

  return (
    <div className={`score-display ${isUpdating ? 'updating' : ''}`}>
      <div className="score-label">⭐ SCORE</div>
      <div className="score-value">{displayScore.toLocaleString()}</div>
    </div>
  );
}
