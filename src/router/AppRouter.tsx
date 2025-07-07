import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from '@/types';
import { navigationLinks } from '@/config/navigation';

// Lazy load page components for better performance
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

interface AppRouterProps {
  user: User;
  navigateTo: (pageKey: string, data?: any) => void;
  handleAction: (actionKey: string, data?: any) => void;
}

interface RouteComponentProps {
  user: User;
  navigateTo: (pageKey: string, data?: any) => void;
  handleAction: (actionKey: string, data?: any) => void;
}

const RouteComponent: React.FC<{ 
  Component: React.ComponentType<RouteComponentProps>; 
  user: User; 
  navigateTo: (pageKey: string, data?: any) => void;
  handleAction: (actionKey: string, data?: any) => void;
}> = ({ Component, user, navigateTo, handleAction }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component user={user} navigateTo={navigateTo} handleAction={handleAction} />
  </Suspense>
);

export const AppRouter: React.FC<AppRouterProps> = ({ user, navigateTo, handleAction }) => {
  const userLinks = navigationLinks[user.role] || [];
  const defaultRoute = userLinks.length > 0 ? userLinks[0].key : '';

  return (
    <Router>
      <Routes>
        {/* Default route - redirect to first available page */}
        <Route 
          path="/" 
          element={<Navigate to={`/${defaultRoute.toLowerCase().replace(/\s+/g, '-')}`} replace />} 
        />
        
        {/* Dynamic routes based on user role */}
        {userLinks.map((link) => {
          if (link.component) {
            const routePath = `/${link.key.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <Route
                key={link.key}
                path={routePath}
                element={
                  <RouteComponent
                    Component={link.component}
                    user={user}
                    navigateTo={navigateTo}
                    handleAction={handleAction}
                  />
                }
              />
            );
          }
          return null;
        })}
        
        {/* Static routes available to all users */}
        <Route 
          path="/mon-profil" 
          element={
            <RouteComponent
              Component={React.lazy(() => import('@/features/common/UserProfilePage').then(module => ({ default: module.UserProfilePage })))}
              user={user}
              navigateTo={navigateTo}
              handleAction={handleAction}
            />
          } 
        />
        
        <Route 
          path="/parametres" 
          element={
            <RouteComponent
              Component={React.lazy(() => import('@/features/common/SettingsPage').then(module => ({ default: module.SettingsPage })))}
              user={user}
              navigateTo={navigateTo}
              handleAction={handleAction}
            />
          } 
        />
        
        {/* Catch all route */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Page non trouvée</p>
                <button 
                  onClick={() => navigateTo(defaultRoute)}
                  className="btn btn-primary"
                >
                  Retour au tableau de bord
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
};