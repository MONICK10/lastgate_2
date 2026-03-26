import React, { useEffect, useState } from 'react';
import './FloatingScore.css';

export function FloatingScore({ floatingScores, onAnimationComplete }) {
  const [activeScores, setActiveScores] = useState(floatingScores);

  useEffect(() => {
    setActiveScores(floatingScores);

    if (floatingScores.length > 0) {
      const timer = setTimeout(() => {
        const scoreId = floatingScores[floatingScores.length - 1].id;
        onAnimationComplete?.(scoreId);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [floatingScores, onAnimationComplete]);

  return (
    <div className="floating-scores-container">
      {activeScores.map((score) => (
        <div
          key={score.id}
          className={`floating-score ${score.type}`}
          style={{
            left: `${score.x}px`,
            top: `${score.y}px`,
          }}
        >
          <span className="score-text">
            {score.points > 0 ? '+' : ''}{score.points}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ScreenShake({ triggerShake }) {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (triggerShake) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [triggerShake]);

  return (
    <div className={`screen-shake-overlay ${isShaking ? 'active' : ''}`} />
  );
}
