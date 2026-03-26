/**
 * Device Detection Utilities
 * Detects device type and capabilities
 */

export const isMobileDevice = () => {
  // Check for touch capability as primary indicator
  const hasTouchSupport = () => {
    return (
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0)
    );
  };

  // Check user agent for mobile devices
  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Screen size check - if screen is smaller than typical tablet
  const smallScreen = window.innerWidth < 768;

  return hasTouchSupport() && (mobileUserAgent || smallScreen);
};

export const isTabletDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isTablet = /ipad|android(?!.*mobi)/i.test(userAgent);
  const screenSize = window.innerWidth >= 768 && window.innerWidth < 1024;
  return isTablet || screenSize;
};

export const isDesktopDevice = () => {
  return !isMobileDevice() && !isTabletDevice();
};

export const getDeviceType = () => {
  if (isMobileDevice()) return 'mobile';
  if (isTabletDevice()) return 'tablet';
  return 'desktop';
};

export const getCameraSettings = () => {
  const deviceType = getDeviceType();

  return {
    mobile: {
      fov: 80,
      distance: 7,
      height: 2.2,
      lookAheadDistance: 1.5,
    },
    tablet: {
      fov: 70,
      distance: 6.5,
      height: 2.1,
      lookAheadDistance: 1.3,
    },
    desktop: {
      fov: 60,
      distance: 6,
      height: 2,
      lookAheadDistance: 1.2,
    },
  }[deviceType];
};
