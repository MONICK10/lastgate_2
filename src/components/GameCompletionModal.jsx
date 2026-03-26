import React, { useEffect, useState } from 'react';
import './GameCompletionModal.css';

export function GameCompletionModal({ isVisible, userName, totalScore, onClose, onRestart }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (isVisible && totalScore > 0) {
      // Animate score counter
      let current = 0;
      const increment = Math.ceil(totalScore / 50);
      const interval = setInterval(() => {
        current += increment;
        if (current >= totalScore) {
          setDisplayScore(totalScore);
          clearInterval(interval);
        } else {
          setDisplayScore(current);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isVisible, totalScore]);

  if (!isVisible) return null;

  return (
    <div className="game-completion-overlay">
      <div className="game-completion-modal">
        <div className="completion-header">
          <h1 className="completion-title">🎮 GAME COMPLETED 🎮</h1>
        </div>

        <div className="completion-content">
          <div className="user-completion-info">
            <p className="completion-text">
              <span className="user-name">{userName || 'Player'}</span>
              <span className="has-completed"> has completed the game with</span>
            </p>
          </div>

          <div className="score-display">
            <div className="score-number">
              {displayScore}
              <span className="score-label">points</span>
            </div>
          </div>

          <div className="completion-message">
            <p>🌟 Excellent work! 🌟</p>
            <p>You've successfully resolved all network configuration issues!</p>
          </div>
        </div>

        <div className="completion-footer">
          <button className="btn-restart" onClick={onRestart}>
            🔄 Play Again
          </button>
          <button className="btn-close" onClick={onClose}>
            ✕ Exit
          </button>
        </div>
      </div>
    </div>
  );
}
