import { useState, useEffect } from 'react';

interface WindowDimensions {
  width: number;
  height: number;
}

interface DeviceType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const useWindowDimensions = (): WindowDimensions & DeviceType => {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowDimensions.width < 768;
  const isTablet = windowDimensions.width >= 768 && windowDimensions.width < 1024;
  const isDesktop = windowDimensions.width >= 1024;

  return {
    ...windowDimensions,
    isMobile,
    isTablet,
    isDesktop
  };
};