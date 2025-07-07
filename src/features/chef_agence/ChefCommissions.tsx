





import React, { useState, useEffect } from 'react';
import { PageComponentProps, ChefAgence, Transaction, Agent } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { formatAmount, formatDate } from '../../utils/formatters';
import { supabase } from '../../supabaseClient';

const AgentCommissionLeaderboard: React.FC<{ agencyId: string }> = ({ agencyId }) => {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            const { data: agents, error: agentsError } = await supabase
                .from('profiles')
                .select('id, name, avatar_seed')
                .eq('role', 'agent')
                .eq('agency_id', agencyId);
            
            if (agentsError) {
                console.error(agentsError);
                setLoading(false);
                return;
            }

            const agentIds = (agents || []).map((a: any) => a.id);
            if (agentIds.length === 0) {
                setLeaderboard([]);
                setLoading(false);
                return;
            }

            const { data: transactions, error: txError } = await supabase
                .from('transactions')
                .select('agent_id, commission_generee')
                .in('agent_id', agentIds)
                .eq('status', 'Validé');

            if (txError) {
                console.error(txError);
                setLoading(false);
                return;
            }

            const commissionsByAgent = (transactions || []).reduce((acc, tx: any) => {
                if (tx.agent_id) {
                    acc[tx.agent_id] = (acc[tx.agent_id] || 0) + tx.commission_generee;
                }
                return acc;
            }, {} as Record<string, number>);

            const agentsWithCommissions = (agents || []).map((agent: any) => ({
                ...agent,
                commissionsGenerated: commissionsByAgent[agent.id] || 0
            })).sort((a,b) => b.commissionsGenerated - a.commissionsGenerated).slice(0, 5);

            setLeaderboard(agentsWithCommissions);
            setLoading(false);
        };
        fetchLeaderboard();
    }, [agencyId]);

    if (loading) return <div>Chargement du classement...</div>;

    return (
        <div className="space-y-3">
            {leaderboard.length > 0 ? leaderboard.map((agent, index) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                        <span className="font-bold text-gray-500 w-6 mr-2">#{index + 1}</span>
                        <img src={`https://placehold.co/40x40/E2E8F0/4A5568?text=${agent.avatar_seed}`} alt={agent.name} className="w-10 h-10 rounded-full mr-3"/>
                        <p className="font-semibold text-gray-800">{agent.name}</p>
                    </div>
                    <p className="font-bold text-green-600">{formatAmount(agent.commissionsGenerated)}</p>
                </div>
            )) : <p className="text-center text-gray-500 py-4">Aucune commission générée par les agents ce mois-ci.</p>}
        </div>
    );
};


export const ChefCommissions: React.FC<PageComponentProps> = ({ user, navigateTo, handleAction }) => {
    const chefUser = user as ChefAgence;
    const [personalTxs, setPersonalTxs] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPersonalTxs = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select('id, created_at, op_type_id, montant_principal, commission_generee')
                .eq('agent_id', chefUser.id)
                .eq('status', 'Validé')
                .gt('commission_generee', 0)
                .order('created_at', { ascending: false });

            if (error) {
                console.error(error);
            } else {
                setPersonalTxs((data as unknown as Transaction[]) || []);
            }
            setLoading(false);
        };
        fetchPersonalTxs();
    }, [chefUser.id]);

    const headers = ['Date Op.', 'ID Op.', 'Type Op.', 'Montant Op.', 'Commission Générée'];
    const rows = personalTxs.map(t => [
        formatDate(t.created_at).split(' ')[0],
        t.id,
        t.op_type_id, // This should be mapped to a name in a real app
        formatAmount(t.montant_principal),
        formatAmount(t.commission_generee)
    ]);
    
    if (loading) return <div>Chargement...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card title="Mes Commissions Personnelles" icon="fa-coins">
                    <p className="text-lg mb-4">Commissions Personnelles Dues : <span className="font-bold text-purple-600">{formatAmount(chefUser.commissions_perso_dues || 0)}</span></p>
                    <Table headers={headers} rows={rows} caption="Détail de vos commissions personnelles" tableClasses="w-full table table-sm" />
                </Card>
            </div>
            <div className="lg:col-span-1">
                 <Card title="Top Agents (Commissions)" icon="fa-trophy">
                    {chefUser.agency_id ? 
                        <AgentCommissionLeaderboard agencyId={chefUser.agency_id} /> :
                        <p>Vous n'êtes assigné à aucune agence.</p>
                    }
                </Card>
            </div>
        </div>
    );
};
