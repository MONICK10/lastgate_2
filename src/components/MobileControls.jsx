import React, { useEffect, useRef } from 'react';
import './MobileControls.css';

/**
 * Mobile Touch Controls
 * Left side: < and > for turning
 * Right side: ^ for forward movement
 */
export default function MobileControls({ onControlChange, isMobile }) {
  const controlsRef = useRef({
    forward: false,
    left: false,
    right: false,
    shift: false,
  });

  const handleTouchStart = (button) => {
    controlsRef.current[button] = true;
    updateControls();
  };

  const handleTouchEnd = (button) => {
    controlsRef.current[button] = false;
    updateControls();
  };

  const updateControls = () => {
    if (onControlChange) {
      onControlChange({
        forward: controlsRef.current.forward,
        left: controlsRef.current.left,
        right: controlsRef.current.right,
        shift: controlsRef.current.shift,
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controlsRef.current = {
        forward: false,
        left: false,
        right: false,
        shift: false,
      };
    };
  }, []);

  if (!isMobile) return null;

  return (
    <>
      {/* Left Side Controls: < > (horizontal alignment) */}
      <div className="mobile-controls-left">
        {/* Left Button < */}
        <button
          className="control-btn control-btn-left"
          onTouchStart={() => handleTouchStart('left')}
          onTouchEnd={() => handleTouchEnd('left')}
          onTouchCancel={() => handleTouchEnd('left')}
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={() => handleTouchEnd('left')}
          onMouseLeave={() => handleTouchEnd('left')}
        >
          &lt;
        </button>

        {/* Right Button > */}
        <button
          className="control-btn control-btn-right"
          onTouchStart={() => handleTouchStart('right')}
          onTouchEnd={() => handleTouchEnd('right')}
          onTouchCancel={() => handleTouchEnd('right')}
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={() => handleTouchEnd('right')}
          onMouseLeave={() => handleTouchEnd('right')}
        >
          &gt;
        </button>
      </div>

      {/* Right Side Controls: ^ (forward) and RUN (vertical stack) */}
      <div className="mobile-controls-right">
        {/* Forward Button ^ */}
        <button
          className="control-btn control-btn-forward"
          onTouchStart={() => handleTouchStart('forward')}
          onTouchEnd={() => handleTouchEnd('forward')}
          onTouchCancel={() => handleTouchEnd('forward')}
          onMouseDown={() => handleTouchStart('forward')}
          onMouseUp={() => handleTouchEnd('forward')}
          onMouseLeave={() => handleTouchEnd('forward')}
        >
          ^
        </button>

        {/* Run/Sprint Button (circular, below forward) */}
        <button
          className="control-btn control-btn-shift"
          onTouchStart={() => handleTouchStart('shift')}
          onTouchEnd={() => handleTouchEnd('shift')}
          onTouchCancel={() => handleTouchEnd('shift')}
          onMouseDown={() => handleTouchStart('shift')}
          onMouseUp={() => handleTouchEnd('shift')}
          onMouseLeave={() => handleTouchEnd('shift')}
          title="Run/Sprint"
        >
          RUN
        </button>
      </div>
    </>
  );
}
