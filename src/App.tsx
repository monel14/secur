


import React, { useState, useRef, useEffect } from 'react';
import { LoginPage } from './features/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ViewProofModal } from './components/common/ViewProofModal';
import { NewOperationModal } from './features/agent/NewOperationModal';

import { UserProfilePage } from './features/common/UserProfilePage';
import { SettingsPage } from './features/common/SettingsPage';
import { User, OperationType, Transaction, Request, Agency, ChefAgence, SousAdmin, Agent, AgentRechargeRequest, Notification, NavLink, PageComponentProps, Json } from './types';
import { navigationLinks } from './config/navigation';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { DevEditOperationTypeModal } from './features/developpeur/DevEditOperationTypeModal';

type Theme = 'light' | 'dark';

export const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPageKey, setCurrentPageKey] = useState<string>('');
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
    
    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const fetchUserProfile = async (userId: string, retries = 3): Promise<void> => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, agency_id, avatar_seed, email, name, role, solde, status, suspension_reason')
            .eq('id', userId)
            .single();

        // Specific case for new sign-ups where the trigger might be slow.
        if (error && error.details.includes("0 rows")) {
            if (retries > 0) {
                console.log(`Profile not found for ${userId}, retrying... (${retries} left)`);
                await new Promise(res => setTimeout(res, 1000)); // Wait 1 second
                return fetchUserProfile(userId, retries - 1);
            } else {
                console.error("Error fetching profile after retries:", error);
                alert("Votre compte a été créé, mais nous n'avons pas pu charger votre profil. Veuillez réessayer de vous connecter ou contacter le support.");
                await supabase.auth.signOut(); // Log out to avoid inconsistent state
                setCurrentUser(null);
                return;
            }
        } else if (error) {
            console.error("Error fetching profile:", error);
            alert("Une erreur est survenue lors du chargement de votre profil. Veuillez réessayer.");
            setCurrentUser(null);
            return;
        }
        
        if (profile) {
            const user = profile as unknown as User;
            setCurrentUser(user);
            const firstPageKey = navigationLinks[user.role]?.[0]?.key;
            if (firstPageKey) {
                setCurrentPageKey(firstPageKey);
            }
        } else {
            setCurrentUser(null);
        }
    };


    useEffect(() => {
        const checkUser = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session?.user) {
                await fetchUserProfile(session.user.id);
            }
            setLoading(false);
        };
        
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                setLoading(true);
                await fetchUserProfile(session.user.id);
                setLoading(false);
            } else {
                setCurrentUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (email: string, password_not_used: string, role: User['role']) => {
        const password = 'password';
        setLoading(true);
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError && signInError.message.includes('Invalid login credentials')) {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: role
                    }
                }
            });
            if (signUpError) {
                alert(`Erreur d'inscription: ${signUpError.message}`);
                setLoading(false);
            }
            // onAuthStateChange will handle the rest
        } else if (signInError) {
            alert(`Erreur de connexion: ${signInError.message}`);
            setLoading(false);
        }
        // setLoading is managed by the onAuthStateChange listener
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setSession(null);
        setCurrentPageKey('');
    };
    
    const handleNavigate = (pageKey: string) => {
        setCurrentPageKey(pageKey);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const handleSaveNewOperation = async (data: { opTypeId: string, formData: Record<string, any>, proofFile: File | null }) => {
        if (!currentUser) return;
        setLoading(true);
        let proof_url: string | null = null;
        if (data.proofFile) {
            const filePath = `${currentUser.id}/${Date.now()}_${data.proofFile.name}`;
            const { error: uploadError } = await supabase.storage.from('proofs').upload(filePath, data.proofFile);
            if (uploadError) {
                alert(`Erreur de téléversement: ${uploadError.message}`);
                setLoading(false);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(filePath);
            proof_url = publicUrl;
        }

        const montant_principal = Number(data.formData.montant_transfert) || 0;
        const frais = 250; 

        const { error } = await supabase.from('transactions').insert([{
            agent_id: currentUser.id,
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
        setLoading(false);
        setNewOpModalOpen(false);
    };

    const handleAction = (actionKey: string, data?: any) => {
        if (actionKey === 'openNewOperationModal') setNewOpModalOpen(true);
        if (actionKey === 'viewProof') { setProofImageUrl(data); setViewProofModalOpen(true); }
        if (actionKey === 'openDevOpTypeModal') { setEditingOpTypeId(data); setDevOpTypeModalOpen(true); }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
    }

    if (!session || !currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }
    
    let CurrentPageComponent: React.FC<PageComponentProps> | undefined;
    if (currentPageKey === 'Mon Profil') CurrentPageComponent = UserProfilePage;
    else if (currentPageKey === 'Paramètres') CurrentPageComponent = SettingsPage as any;
    else CurrentPageComponent = navigationLinks[currentUser.role]?.find(l => l.key === currentPageKey)?.component;

    const pageProps = { user: currentUser, navigateTo: handleNavigate, handleAction };
    const settingsPageProps = { ...pageProps, theme, toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'), notificationSettings, onNotificationSettingsChange: setNotificationSettings };
    
    return (
        <div className="app-container-react">
            <div className="flex flex-grow">
                <Sidebar ref={sidebarRef} isOpen={isSidebarOpen} currentUser={currentUser} navigationLinks={navigationLinks} currentPageKey={currentPageKey} handleNavigate={handleNavigate} handleAction={handleAction} handleLogout={handleLogout} />
                <main className={`main-content-area flex-1 p-4 sm:p-6 overflow-y-auto ${isSidebarOpen ? 'md:ml-0' : 'md:ml-64'}`}>
                    <Header onMenuToggle={() => setSidebarOpen(!isSidebarOpen)} currentPageKey={currentPageKey} currentUser={currentUser} notifications={[]} onMarkAsRead={() => {}} onMarkAllAsRead={() => {}} onLogout={handleLogout} handleNavigate={handleNavigate}/>
                    <div id="pageContent">
                        {currentPageKey === 'Paramètres' ? <SettingsPage {...settingsPageProps} /> : (CurrentPageComponent ? <CurrentPageComponent {...pageProps} /> : <p>Page non trouvée</p>)}
                    </div>
                </main>
            </div>
            <Footer />
            <ViewProofModal isOpen={isViewProofModalOpen} onClose={() => setViewProofModalOpen(false)} imageUrl={proofImageUrl} />
            <NewOperationModal isOpen={isNewOpModalOpen} onClose={() => setNewOpModalOpen(false)} user={currentUser as Agent} onSave={handleSaveNewOperation} />
            {isDevOpTypeModalOpen && <DevEditOperationTypeModal isOpen={isDevOpTypeModalOpen} onClose={() => setDevOpTypeModalOpen(false)} opTypeId={editingOpTypeId} onSave={() => {}} />}
        </div>
    );
};
