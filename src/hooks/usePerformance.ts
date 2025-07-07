import { useCallback, useMemo } from 'react';

export const usePerformance = () => {
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = performance.now();
      fn();
      const endTime = performance.now();
      console.log(`${name} took ${endTime - startTime} milliseconds`);
    } else {
      fn();
    }
  }, []);

  const memoizedCallback = useCallback((fn: Function, deps: any[]) => {
    return useMemo(() => fn, deps);
  }, []);

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return (...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  return {
    measurePerformance,
    memoizedCallback,
    debounce,
    throttle
  };
};