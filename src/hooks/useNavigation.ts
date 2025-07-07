import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = useCallback((pageKey: string, data?: any) => {
    const routePath = `/${pageKey.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Store additional data in state if provided
    if (data) {
      navigate(routePath, { state: data });
    } else {
      navigate(routePath);
    }
  }, [navigate]);

  const getCurrentPage = useCallback(() => {
    const path = location.pathname;
    // Convert path back to page key format
    return path.substring(1).replace(/-/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }, [location.pathname]);

  return {
    navigateTo,
    getCurrentPage,
    location,
    navigate
  };
};