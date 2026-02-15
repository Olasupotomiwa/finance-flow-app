// Global state outside React - persists across all re-renders
let globalShowSplash = true;
let globalSplashCallback: (() => void) | null = null;

export const SplashManager = {
  shouldShowSplash: () => globalShowSplash,
  
  setSplashFinished: (callback: () => void) => {
    globalSplashCallback = callback;
  },
  
  finishSplash: () => {
    if (globalShowSplash && globalSplashCallback) {
      globalShowSplash = false;
      globalSplashCallback();
    }
  },
  
  // Reset for dev/testing only
  reset: () => {
    globalShowSplash = true;
    globalSplashCallback = null;
  }
};