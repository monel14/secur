import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ViewProofModal } from './components/common/ViewProofModal';
import { NewOperationModal } from './features/agent/NewOperationModal';
import { DevEditOperationTypeModal } from './features/developpeur/DevEditOperationTypeModal';
import { UserProfilePage } from './features/common/UserProfilePage';
import { SettingsPage } from './features/common/SettingsPage';
import { User, OperationType, Transaction, Request, Agency, ChefAgence, SousAdmin, Agent, AgentRechargeRequest, Notification, NavLink, PageComponentProps, Json } from './types';
import { navigationLinks } from './config/navigation';
import { useAuth } from './hooks/useAuth';
import { usePerformance } from './hooks/usePerformance';
import { supabase } from './supabaseClient';

type Theme = 'light' | 'dark';

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Chargement">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="sr-only">Chargement...</span>
  </div>
);

// Route wrapper for lazy loading
const RouteWrapper: React.FC<{ 
  Component: React.ComponentType<PageComponentProps>; 
  user: User; 
  onNavigate: (path: string) => void;
  onAction: (actionKey: string, data?: any) => void;
}> = ({ Component, user, onNavigate, onAction }) => {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <Component user={user} navigateTo={onNavigate} handleAction={onAction} />
    </React.Suspense>
  );
};

// Main App Router Component
const AppRouter: React.FC<{
  user: User;
  onNavigate: (path: string) => void;
  onAction: (actionKey: string, data?: any) => void;
}> = ({ user, onNavigate, onAction }) => {
  const userLinks = useMemo(() => navigationLinks[user.role] || [], [user.role]);
  const defaultRoute = useMemo(() => {
    const firstLink = userLinks.find(link => link.component);
    return firstLink ? `/${firstLink.key.toLowerCase().replace(/\s+/g, '-')}` : '/dashboard';
  }, [userLinks]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />
      
      {userLinks.map((link) => {
        if (link.component) {
          const routePath = `/${link.key.toLowerCase().replace(/\s+/g, '-')}`;
          return (
            <Route
              key={link.key}
              path={routePath}
              element={
                <RouteWrapper
                  Component={link.component}
                  user={user}
                  onNavigate={onNavigate}
                  onAction={onAction}
                />
              }
            />
          );
        }
        return null;
      })}
      
      <Route 
        path="/mon-profil" 
        element={
          <RouteWrapper
            Component={UserProfilePage}
            user={user}
            onNavigate={onNavigate}
            onAction={onAction}
          />
        } 
      />
      
      <Route 
        path="/parametres" 
        element={
          <RouteWrapper
            Component={SettingsPage as React.ComponentType<PageComponentProps>}
            user={user}
            onNavigate={onNavigate}
            onAction={onAction}
          />
        } 
      />
      
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Page non trouvée</p>
              <button 
                onClick={() => onNavigate(defaultRoute)}
                className="btn btn-primary"
              >
                Retour au tableau de bord
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

// Inner App Component (after authentication)
const InnerApp: React.FC<{
  user: User;
  onLogout: () => void;
}> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { throttle } = usePerformance();
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : { email: true, inApp: true };
  });

  const sidebarRef = useRef<HTMLElement>(null);
  
  const [isNewOpModalOpen, setNewOpModalOpen] = useState(false);
  const [isViewProofModalOpen, setViewProofModalOpen] = useState(false);
  const [isDevOpTypeModalOpen, setDevOpTypeModalOpen] = useState(false);
  const [editingOpTypeId, setEditingOpTypeId] = useState<string | null>(null);
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  
  // Theme management
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Get current page key from URL
  const getCurrentPageKey = useMemo(() => {
    const path = location.pathname.substring(1);
    return path.replace(/-/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }, [location.pathname]);

  // Navigation handler
  const handleNavigate = throttle((pageKey: string) => {
    const routePath = `/${pageKey.toLowerCase().replace(/\s+/g, '-')}`;
    navigate(routePath);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, 100);

  // Handle new operation save
  const handleSaveNewOperation = async (data: { opTypeId: string, formData: Record<string, any>, proofFile: File | null }) => {
    if (!user) return;
    
    let proof_url: string | null = null;
    if (data.proofFile) {
      const filePath = `${user.id}/${Date.now()}_${data.proofFile.name}`;
      const { error: uploadError } = await supabase.storage.from('proofs').upload(filePath, data.proofFile);
      if (uploadError) {
        alert(`Erreur de téléversement: ${uploadError.message}`);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(filePath);
      proof_url = publicUrl;
    }

    const montant_principal = Number(data.formData.montant_transfert) || 0;
    const frais = 250; 

    const { error } = await supabase.from('transactions').insert([{
      agent_id: user.id,
      op_type_id: data.opTypeId,
      data: data.formData as Json,
      montant_principal: montant_principal,
      frais: frais,
      montant_total: montant_principal + frais,
      commission_generee: 50,
      proof_url,
      status: 'En attente de validation',
    }] as any);

    if (error) alert(error.message);
    else alert('Opération soumise pour validation !');
    setNewOpModalOpen(false);
  };

  // Handle actions
  const handleAction = (actionKey: string, data?: any) => {
    if (actionKey === 'openNewOperationModal') setNewOpModalOpen(true);
    if (actionKey === 'viewProof') { setProofImageUrl(data); setViewProofModalOpen(true); }
    if (actionKey === 'openDevOpTypeModal') { setEditingOpTypeId(data); setDevOpTypeModalOpen(true); }
  };

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (window.innerWidth < 768) setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Settings page props
  const settingsPageProps = useMemo(() => ({
    user,
    navigateTo: handleNavigate,
    handleAction,
    theme,
    toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'),
    notificationSettings,
    onNotificationSettingsChange: setNotificationSettings
  }), [user, handleNavigate, theme, notificationSettings]);

  return (
    <div className="app-container-react">
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      
      <div className="flex flex-grow">
        <Sidebar 
          ref={sidebarRef} 
          isOpen={isSidebarOpen} 
          currentUser={user} 
          navigationLinks={navigationLinks} 
          currentPageKey={getCurrentPageKey} 
          handleNavigate={handleNavigate} 
          handleAction={handleAction} 
          handleLogout={onLogout} 
        />
        
        <main 
          id="main-content"
          className={`main-content-area flex-1 p-4 sm:p-6 overflow-y-auto ${isSidebarOpen ? 'md:ml-0' : 'md:ml-64'}`}
          role="main"
        >
          <Header 
            onMenuToggle={() => setSidebarOpen(!isSidebarOpen)} 
            currentPageKey={getCurrentPageKey} 
            currentUser={user} 
            notifications={allNotifications} 
            onMarkAsRead={() => {}} 
            onMarkAllAsRead={() => {}} 
            onLogout={onLogout} 
            handleNavigate={handleNavigate}
          />
          
          <div id="pageContent" className="mt-6">
            <AppRouter user={user} onNavigate={handleNavigate} onAction={handleAction} />
          </div>
        </main>
      </div>
      
      <Footer />
      
      {/* Modals */}
      <ViewProofModal 
        isOpen={isViewProofModalOpen} 
        onClose={() => setViewProofModalOpen(false)} 
        imageUrl={proofImageUrl} 
      />
      
      <NewOperationModal 
        isOpen={isNewOpModalOpen} 
        onClose={() => setNewOpModalOpen(false)} 
        user={user as Agent} 
        onSave={handleSaveNewOperation} 
      />
      
      {isDevOpTypeModalOpen && (
        <DevEditOperationTypeModal 
          isOpen={isDevOpTypeModalOpen} 
          onClose={() => setDevOpTypeModalOpen(false)} 
          opTypeId={editingOpTypeId} 
          onSave={() => setDevOpTypeModalOpen(false)} 
        />
      )}
    </div>
  );
};

// Main App Component
export const App: React.FC = () => {
  const { session, currentUser, loading, handleLogin, handleLogout } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session || !currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <InnerApp user={currentUser} onLogout={handleLogout} />
    </Router>
  );
};