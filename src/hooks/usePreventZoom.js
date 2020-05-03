import * as React from 'react';

export default function usePreventZoom() {
  // Prevent all multitouch gestures
  // This prevents iOS zooming
  React.useEffect(() => {
    function handleTouchMove(event) {
      // if we want to allow zooming, then allow touch moves for zooms !== 1
      // const zoom = window.innerWidth / window.document.documentElement.clientWidth;

      if (event.touches.length > 1) {
        return event.preventDefault();
      }
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return function cleanup() {
      document.removeEventListener('touchmove', handleTouchMove, { passive: false });
    };
  }, []);

  // Prevent double taps shorter than 300ms apart
  // This prevents double tap to zoom on iOS etc.
  React.useEffect(() => {
    let lastTouchEnd = 0;

    function handleTouchEnd(event) {
      var now = new Date().getTime();
      if (now - lastTouchEnd < 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }

    document.addEventListener('touchend', handleTouchEnd, false);

    return function cleanup() {
      document.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, []);
}
