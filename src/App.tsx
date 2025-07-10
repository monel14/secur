
import React, { useState, useRef, useEffect } from 'react';
import { LoginPage } from './features/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Common Components
import { ViewProofModal } from './components/common/ViewProofModal';
import { UserProfilePage } from './features/common/UserProfilePage';
import { SettingsPage } from './features/common/SettingsPage';
import { RejectTransactionModal } from "./features/admin/RejectTransactionModal";

// Modals
import { NewOperationModal as AgentNewOperationModal } from './features/agent/NewOperationModal';
import { NewOperationModal as ChefNewOperationModal } from './features/chef_agence/NewOperationModal';
import { RequestRechargeModal } from './features/agent/RequestRechargeModal';
import { CreateEditAgentModal } from './features/chef_agence/CreateEditAgentModal';
import { RechargeAgentModal } from './features/chef_agence/RechargeAgentModal';
import { SuspendAgentModal } from './features/chef_agence/SuspendAgentModal';
import { ApproveRechargeModal } from './features/chef_agence/ApproveRechargeModal';
import { RejectRechargeModal } from './features/chef_agence/RejectRechargeModal';
import { ChefSelfRechargeModal } from './features/chef_agence/ChefSelfRechargeModal';
import { TransferCommissionsModal } from './features/chef_agence/TransferCommissionsModal';
import EditAgencyModal from './features/admin/EditAgencyModal';
import { CreateChefModal } from './features/admin/CreateChefModal';
import { CreateSubAdminModal } from './features/admin/CreateSubAdminModal';
import { AssignTaskModal } from './features/admin/AssignTaskModal';
import { ProcessRequestModal } from './features/admin/ProcessRequestModal';
import { SubAdminPermissionsModal } from './features/admin/SubAdminPermissionsModal';
import { SuspendUserModal } from './features/admin/SuspendUserModal';
import { DevEditOperationTypeModal } from './features/developpeur/DevEditOperationTypeModal';

// Types
import { User, OperationType, Transaction, Request, Agency, ChefAgence, SousAdmin, Agent, AgentRechargeRequest, Notification, PageComponentProps } from './types';
import { navigationLinks } from './config/navigation';

// Data & Libs
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';


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
    const [refreshKey, setRefreshKey] = useState(0);

    const sidebarRef = useRef<HTMLElement>(null);
    
    // Centralized modal state
    const [modalState, setModalState] = useState<{ type: string; data?: any } | null>(null);

    const forceRefresh = () => setRefreshKey(k => k + 1);

    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const fetchUserProfile = async (userId: string, retries = 3): Promise<void> => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, agency_id, avatar_seed, email, name, role, solde, status, suspension_reason, permissions, commissions_dues')
            .eq('id', userId)
            .single();

        if (error && error.details.includes("0 rows")) {
            if (retries > 0) {
                console.log(`Profile not found for ${userId}, retrying... (${retries} left)`);
                await new Promise(res => setTimeout(res, 1000));
                return fetchUserProfile(userId, retries - 1);
            } else {
                console.error("Error fetching profile after retries:", error);
                alert("Votre compte a été créé, mais nous n'avons pas pu charger votre profil. Veuillez réessayer de vous connecter ou contacter le support.");
                await supabase.auth.signOut();
                setCurrentUser(null);
                return;
            }
        } else if (error) {
            console.error("Error fetching profile:", error);
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

    useEffect(() => {
        if (!currentUser) return;
    
        const channel = supabase
          .channel('public:notifications')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.id}` },
            (payload) => {
              console.log('New notification received:', payload.new);
              setAllNotifications(prev => [payload.new as Notification, ...prev]);
            }
          )
          .subscribe();
    
        const fetchInitialNotifications = async () => {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(10);
          if (error) console.error(error);
          else setAllNotifications(data as Notification[]);
        };
    
        fetchInitialNotifications();
    
        return () => {
          supabase.removeChannel(channel);
        };
      }, [currentUser]);

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
                        name: email.split('@')[0], // Default name
                        role: role
                    }
                }
            });
            if (signUpError) {
                alert(`Erreur d'inscription: ${signUpError.message}`);
                setLoading(false);
            }
        } else if (signInError) {
            alert(`Erreur de connexion: ${signInError.message}`);
            setLoading(false);
        }
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

    const handleMarkAsRead = async (notificationId: string) => {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId);
        if (error) console.error(error);
        else {
          setAllNotifications(prev =>
            prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
          );
        }
      };
    
    const handleMarkAllAsRead = async () => {
        if (!currentUser) return;
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', currentUser.id)
            .eq('read', false);
        if (error) console.error(error);
        else {
            setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    // --- Action and Logic Handlers ---

    const handleAction = (actionKey: string, data?: any) => {
        if (actionKey === 'validate') {
            const item = data as Transaction;
            if (window.confirm(`Êtes-vous sûr de vouloir valider la transaction ${item.id.substring(0, 8)}...?`)) {
                handleUpdateTransactionStatus(item.id, 'Validé');
            }
            return;
        }

        const modalTriggers = [
            'openNewOperationModal', 'viewProof', 'openDevOpTypeModal', 'openRechargeModal', 
            'openSelfRechargeModal', 'openCreateEditAgentModal', 'openRechargeAgentModal',
            'openSuspendAgentModal', 'openApproveRechargeModal', 'openRejectRechargeModal',
            'openTransferCommissionsModal', 'openEditAgencyModal', 'openCreateChefModal',
            'openCreateSubAdminModal', 'openSubAdminPermissionsModal', 'openSuspendUserModal',
            'openAssignModal', 'openProcessRequestModal', 'viewAttachment', 'openRejectTransactionModal'
        ];
        
        if (modalTriggers.includes(actionKey)) {
             setModalState({ type: actionKey, data });
        } else {
             console.warn(`Action non-modale déclenchée, mais non gérée: ${actionKey}`, data);
        }
    };
    
    const handleSaveNewOperation = async (opData: { opTypeId: string, formData: Record<string, any>, proofFile: File | null }) => {
        if (!currentUser) return;
        setLoading(true);

        let proofUrl: string | null = null;
        if (opData.proofFile) {
            const filePath = `${currentUser.id}/${Date.now()}_${opData.proofFile.name}`;
            const { error: uploadError } = await supabase.storage.from('proofs').upload(filePath, opData.proofFile);
            if (uploadError) {
                alert(`Erreur lors du téléversement de la preuve: ${uploadError.message}`);
                setLoading(false);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(filePath);
            proofUrl = publicUrl;
        }

        const { error } = await supabase.rpc('create_secure_transaction', {
            p_agent_id: currentUser.id,
            p_op_type_id: opData.opTypeId,
            p_data: opData.formData,
            p_proof_url: proofUrl,
        });
        
        setLoading(false);

        if (error) {
            alert(`Erreur lors de la création: ${error.message}`);
        } else {
            alert('Transaction soumise pour validation !');
            setModalState(null);
            fetchUserProfile(currentUser.id); // Refresh user balance
            forceRefresh();
        }
    };
    
    const handleCreateChef = async (chefData: { name: string; email: string; password: string; }) => {
        setLoading(true);
        const { name, email, password } = chefData;
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'chef_agence',
                    avatar_seed: name.slice(0,2).toUpperCase(),
                }
            }
        });
        setLoading(false);
        if (error) {
            alert(`Erreur lors de la création du chef d'agence: ${error.message}`);
        } else {
            alert(`Chef d'agence ${name} créé avec succès.`);
            setModalState(null);
            forceRefresh();
        }
    };

    const handleCreateSubAdmin = async (subAdminData: { name: string; email: string; password: string; }) => {
        setLoading(true);
        const { name, email, password } = subAdminData;
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'sous_admin',
                    avatar_seed: name.slice(0,2).toUpperCase(),
                    permissions: {
                        can_validate_transactions: true,
                        can_manage_requests: true,
                    }
                }
            }
        });
        setLoading(false);
        if (error) {
            alert(`Erreur lors de la création du sous-administrateur: ${error.message}`);
        } else {
            alert(`Sous-administrateur ${name} créé avec succès.`);
            setModalState(null);
            forceRefresh();
        }
    };

    const handleSaveAgent = async (agentData: Partial<Agent>, password?: string) => {
        setLoading(true);
        if (agentData.id) { // Editing
            const { error } = await supabase.from('profiles').update({ name: agentData.name, solde: agentData.solde }).eq('id', agentData.id);
            if (error) {
                alert(`Erreur de mise à jour: ${error.message}`);
            } else {
                alert(`Agent ${agentData.name} mis à jour avec succès.`);
                if (password) {
                    // This requires admin privileges to update other users' passwords
                    const { error: passError } = await supabase.auth.admin.updateUserById(agentData.id, { password });
                    if(passError) alert("Erreur de mise à jour du mot de passe: " + passError.message);
                }
            }
        } else { // Creating
            if (!password || !agentData.email || !agentData.name) {
                alert("Nom, email et mot de passe sont requis pour créer un agent.");
                setLoading(false);
                return;
            }
            const { error } = await supabase.auth.signUp({ email: agentData.email, password, options: { data: { name: agentData.name, role: 'agent', agency_id: agentData.agency_id, avatar_seed: (agentData.name || 'AG').slice(0,2).toUpperCase(), solde: agentData.solde || 0 } } });
            if (error) {
                alert(`Erreur lors de la création de l'agent: ${error.message}`);
            } else {
                alert(`Agent ${agentData.name} créé avec succès.`);
            }
        }
        setLoading(false);
        setModalState(null);
        forceRefresh();
    };

    const handleRequestRecharge = async (data: { amount: number, reason: string | null }) => {
        if (!currentUser || currentUser.role !== 'agent') return;
        const agent = currentUser as Agent;
        if (!agent.agency_id) return alert("Vous n'êtes assigné à aucune agence.");
        const { data: agencyData, error: agencyError } = await supabase.from('agencies').select('chef_id').eq('id', agent.agency_id).single();
        if (agencyError || !agencyData?.chef_id) return alert("Impossible de trouver le chef de votre agence.");

        const { error } = await supabase.from('agent_recharge_requests').insert({
            agent_id: currentUser.id, chef_agence_id: agencyData.chef_id, amount: data.amount, motif: data.reason
        });
        if (error) alert(error.message);
        else {
            alert('Demande de recharge envoyée.');
            setModalState(null);
            forceRefresh();
        }
    };

    const handleSaveOpType = async (opTypeData: OperationType) => {
        const { error } = await supabase.from('operation_types').upsert(opTypeData as any);
        if (error) alert(error.message);
        else {
            alert('Type d\'opération sauvegardé.');
            setModalState(null);
            forceRefresh();
        }
    };

    const handleDuplicateOpType = async (opTypeId: string) => {
        const original = (await supabase.from('operation_types').select('*').eq('id', opTypeId).single()).data;
        if (original) {
            const newOpType = { ...original, id: `${original.id}_copy_${Date.now()}`, name: `${original.name} (Copie)` };
            delete (newOpType as any).created_at; 
            const { error } = await supabase.from('operation_types').insert(newOpType as any);
            if (error) alert(error.message); else alert('Opération dupliquée.');
            forceRefresh();
        }
    };

    const handleToggleOpTypeStatus = async (opTypeId: string) => {
        const opType = (await supabase.from('operation_types').select('status').eq('id', opTypeId).single()).data;
        if (opType) {
            const newStatus = opType.status === 'active' ? 'inactive' : 'active';
            const { error } = await supabase.from('operation_types').update({ status: newStatus }).eq('id', opTypeId);
            if (error) alert(error.message); else alert('Statut mis à jour.');
            forceRefresh();
        }
    };

    const handleRechargeAgent = async (agentId: string, amount: number) => {
        if (!currentUser) return;
        setLoading(true);
        const { error } = await supabase.rpc('direct_recharge_agent', {
            p_agent_id: agentId,
            p_chef_id: currentUser.id,
            p_recharge_amount: amount,
        });
        setLoading(false);
        if (error) {
            alert(`Erreur lors de la recharge: ${error.message}`);
        } else {
            alert("Recharge effectuée avec succès.");
            await fetchUserProfile(currentUser.id);
            setModalState(null);
            forceRefresh();
        }
    };

    const handleApproveRecharge = async (request: AgentRechargeRequest) => {
        if (!currentUser) return;
        setLoading(true);
        const { error } = await supabase.rpc('approve_agent_recharge', {
            p_request_id: request.id,
            p_approving_chef_id: currentUser.id,
        });
        setLoading(false);
        if (error) {
            alert(`Erreur d'approbation: ${error.message}`);
        } else {
            alert("Demande de recharge approuvée.");
            await fetchUserProfile(currentUser.id);
            setModalState(null);
            forceRefresh();
        }
    };
    
    const handleRejectRecharge = async (request: AgentRechargeRequest, reason: string) => {
        const { error } = await supabase.from('agent_recharge_requests').update({ status: 'Rejetée', rejection_reason: reason, processing_date: new Date().toISOString() }).eq('id', request.id);
        if (error) alert(error.message);
        else {
            alert("Demande rejetée.");
            setModalState(null);
            forceRefresh();
        }
    };

    const handleChefSelfRecharge = async (amount: number) => {
        if (!currentUser || currentUser.role !== 'chef_agence') return;
        const { error } = await supabase.rpc('transfer_commissions_to_balance', { p_user_id: currentUser.id, p_amount: amount });
        if (error) alert(error.message);
        else {
            alert("Solde rechargé.");
            fetchUserProfile(currentUser.id);
            setModalState(null);
        }
    };

    const handleSaveAgency = async (agency: Agency) => {
        const { error } = await supabase.from('agencies').upsert({ id: agency.id, name: agency.name, chef_id: agency.chef_id });
        if (error) alert(error.message);
        else {
            if (agency.chef_id) {
                await supabase.from('profiles').update({ agency_id: agency.id }).eq('id', agency.chef_id);
            }
            alert("Agence sauvegardée.");
            setModalState(null);
            forceRefresh();
        }
    };

    const handleAssignTask = async (taskData: { id: string; type: 'transactions' | 'requests', targetUserId: string | null }) => {
        const { id, type, targetUserId } = taskData;
        const { error } = await supabase.from(type).update({ assigned_to: targetUserId }).eq('id', id);
        if (error) alert(error.message);
        else {
            alert("Tâche assignée.");
            setModalState(null);
            forceRefresh();
        }
    };
    
    const handleProcessRequest = async (request: Request, response: string) => {
        const { error } = await supabase.from('requests').update({
            reponse: response,
            status: 'Traité',
            resolved_by_id: currentUser?.id,
            resolution_date: new Date().toISOString()
        }).eq('id', request.id);
        if (error) alert(error.message);
        else {
            alert("Requête traitée.");
            setModalState(null);
            forceRefresh();
        }
    };

    const handleSavePermissions = async (userId: string, permissions: SousAdmin['permissions']) => {
        const { error } = await supabase.from('profiles').update({ permissions }).eq('id', userId);
        if (error) alert(error.message);
        else {
            alert("Permissions mises à jour.");
            setModalState(null);
            forceRefresh();
        }
    };
    
    const handleSuspendUser = async (userToSuspend: User, reason: string | null) => {
        if (!('status' in userToSuspend)) {
            alert("Cet utilisateur ne peut pas être suspendu ou réactivé.");
            setModalState(null);
            return;
        }
        const isSuspending = userToSuspend.status === 'active';
        const newStatus = isSuspending ? 'suspended' : 'active';
        
        const { error } = await supabase.rpc('update_user_status', {
            p_target_user_id: userToSuspend.id,
            p_new_status: newStatus,
            p_reason: reason,
        });

        if (error) {
            alert(`Erreur: ${error.message}`);
        } else {
            alert(`Utilisateur ${isSuspending ? 'suspendu' : 'réactivé'}.`);
        }
        setModalState(null);
        forceRefresh();
    };

    const handleUpdateTransactionStatus = async (transactionId: string, newStatus: 'Validé' | 'Rejeté', reason: string | null = null) => {
        const { error } = await supabase.rpc('update_transaction_status', {
            p_transaction_id: transactionId,
            p_new_status: newStatus,
            p_rejection_reason: reason,
        });

        if (error) {
            alert(`Erreur lors de la mise à jour : ${error.message}`);
        } else {
            alert(`Transaction ${newStatus === 'Validé' ? 'validée' : 'rejetée'} avec succès.`);
            forceRefresh();
        }
        setModalState(null);
    };

    const handleTransferCommissions = async (amount: number) => {
        if (!currentUser) return;
        const { error } = await supabase.rpc('transfer_commissions_to_balance', {
            p_user_id: currentUser.id,
            p_amount: amount,
        });

        if (error) {
            alert(`Erreur de virement: ${error.message}`);
        } else {
            alert("Virement effectué avec succès!");
            fetchUserProfile(currentUser.id);
        }
        setModalState(null);
    }

    // --- Render Logic ---

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
    }

    if (!session || !currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }
    
    let CurrentPageComponent: React.FC<PageComponentProps> | undefined;
    if (currentPageKey === 'Mon Profil') CurrentPageComponent = UserProfilePage as any;
    else if (currentPageKey === 'Paramètres') CurrentPageComponent = SettingsPage as any;
    else CurrentPageComponent = navigationLinks[currentUser.role]?.find(l => l.key === currentPageKey)?.component;

    const pageProps = { user: currentUser, navigateTo: handleNavigate, handleAction, refreshKey };
    const settingsPageProps = { ...pageProps, theme, toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'), notificationSettings, onNotificationSettingsChange: setNotificationSettings };
    
    const renderModals = () => {
        if (!modalState) return null;
        const { type, data } = modalState;
        const onClose = () => setModalState(null);

        switch (type) {
            case 'viewProof':
            case 'viewAttachment':
                return <ViewProofModal isOpen={true} onClose={onClose} imageUrl={data} />;
            case 'openNewOperationModal':
                if (currentUser.role === 'agent') return <AgentNewOperationModal isOpen={true} onClose={onClose} user={currentUser as Agent} onSave={handleSaveNewOperation} />;
                if (currentUser.role === 'chef_agence') return <ChefNewOperationModal isOpen={true} onClose={onClose} user={currentUser as ChefAgence} onSave={handleSaveNewOperation} />;
                return null;
            case 'openRechargeModal':
                return <RequestRechargeModal isOpen={true} onClose={onClose} user={currentUser as Agent} onSave={handleRequestRecharge} rechargeHistory={[]} />;
            case 'openDevOpTypeModal':
                return <DevEditOperationTypeModal isOpen={true} onClose={onClose} opTypeId={data} onSave={handleSaveOpType} />;
            case 'openCreateEditAgentModal':
                return <CreateEditAgentModal isOpen={true} onClose={onClose} agentToEdit={data} onSave={handleSaveAgent} agencyId={(currentUser as ChefAgence).agency_id!} />;
            case 'openRechargeAgentModal':
                return <RechargeAgentModal isOpen={true} onClose={onClose} agent={data} chef={currentUser as ChefAgence} onConfirm={handleRechargeAgent} />;
            case 'openApproveRechargeModal':
                return <ApproveRechargeModal isOpen={true} onClose={onClose} request={data.request} agent={data.agent} chef={currentUser as ChefAgence} onConfirm={() => handleApproveRecharge(data.request)} />;
            case 'openRejectRechargeModal':
                return <RejectRechargeModal isOpen={true} onClose={onClose} request={data} onConfirm={(requestId, reason) => handleRejectRecharge(data, reason)} />;
            case 'openSelfRechargeModal':
                return <ChefSelfRechargeModal isOpen={true} onClose={onClose} currentUser={currentUser as ChefAgence} onSave={handleChefSelfRecharge} />;
            case 'openTransferCommissionsModal':
                 return <TransferCommissionsModal isOpen={true} onClose={onClose} chef={currentUser as ChefAgence} onConfirm={handleTransferCommissions} />;
            case 'openEditAgencyModal':
                return <EditAgencyModal isOpen={true} onClose={onClose} agencyId={data} onSave={handleSaveAgency} />;
            case 'openCreateChefModal':
                return <CreateChefModal isOpen={true} onClose={onClose} onSave={handleCreateChef} />;
            case 'openCreateSubAdminModal':
                return <CreateSubAdminModal isOpen={true} onClose={onClose} onSave={handleCreateSubAdmin} />;
            case 'openAssignModal':
                return <AssignTaskModal isOpen={true} onClose={onClose} taskData={data} onAssign={(targetUserId) => handleAssignTask({ ...data, targetUserId })} />;
            case 'openProcessRequestModal':
                return <ProcessRequestModal isOpen={true} onClose={onClose} request={data} onSave={(requestId, response) => handleProcessRequest(data, response)} />;
            case 'openSubAdminPermissionsModal':
                return <SubAdminPermissionsModal isOpen={true} onClose={onClose} subAdmin={data} onSave={handleSavePermissions} />;
            case 'openSuspendUserModal':
            case 'openSuspendAgentModal':
                return <SuspendUserModal isOpen={true} onClose={onClose} user={data} onConfirm={handleSuspendUser} />;
            case 'openRejectTransactionModal':
                return <RejectTransactionModal isOpen={true} onClose={onClose} transaction={data} onConfirm={(tx, reason) => handleUpdateTransactionStatus(tx.id, 'Rejeté', reason)} />;
            default:
                console.warn(`Unhandled modal type: ${type}`);
                return null;
        }
    }
    
    return (
        <div className="app-container-react">
            <div className="flex flex-grow">
                <Sidebar ref={sidebarRef} isOpen={isSidebarOpen} currentUser={currentUser} navigationLinks={navigationLinks} currentPageKey={currentPageKey} handleNavigate={handleNavigate} handleAction={handleAction} handleLogout={handleLogout} />
                <main className={`main-content-area flex-1 p-4 sm:p-6 overflow-y-auto ${isSidebarOpen ? 'md:ml-0' : 'md:ml-64'}`}>
                    <Header onMenuToggle={() => setSidebarOpen(!isSidebarOpen)} currentPageKey={currentPageKey} currentUser={currentUser} notifications={allNotifications} onMarkAsRead={handleMarkAsRead} onMarkAllAsRead={handleMarkAllAsRead} onLogout={handleLogout} handleNavigate={handleNavigate}/>
                    <div id="pageContent">
                        {currentPageKey === 'Paramètres' ? <SettingsPage {...settingsPageProps} /> : (CurrentPageComponent ? <CurrentPageComponent {...pageProps} handleAction={(action, data) => handleAction(action, data)} /> : <p>Page non trouvée</p>)}
                    </div>
                </main>
            </div>
            <Footer />
            {renderModals()}
        </div>
    );
};
