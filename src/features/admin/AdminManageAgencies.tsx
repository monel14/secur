





import React, { useState, useMemo, useEffect } from 'react';
import { PageComponentProps, ChefAgence, Agency, User, Agent } from '../../types';
import { Card } from '../../components/common/Card';
import { formatAmount } from '../../utils/formatters';
import { Pagination } from '../../components/common/Pagination';
import { supabase } from '../../supabaseClient';

const StatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ title, value, icon }) => (
    <div className="card p-4">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <i className={`fas ${icon} fa-lg`}></i>
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const AgencyCard: React.FC<{ 
    agency: Agency; 
    chef?: ChefAgence; 
    agentCount: number; 
    volume: number; 
    onEdit: (id: string) => void;
}> = ({ agency, chef, agentCount, volume, onEdit }) => {
    return (
        <div className="card flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 h-full">
            <div>
                <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-gray-800">{agency.name}</h4>
                    <button onClick={() => onEdit(agency.id)} className="btn btn-xs btn-outline-secondary !p-1.5" title="Modifier l'agence">
                        <i className="fas fa-edit"></i>
                    </button>
                </div>
                {chef && (
                    <div className="flex items-center my-3">
                        <img src={`https://placehold.co/32x32/E2E8F0/4A5568?text=${chef.avatar_seed}`} alt={chef.name} className="w-8 h-8 rounded-full mr-2"/>
                        <div>
                            <p className="text-sm font-medium text-gray-700">{chef.name}</p>
                            <p className="text-xs text-gray-500">Chef d'Agence</p>
                        </div>
                    </div>
                )}
                <div className="my-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Agents:</span> <span className="font-semibold">{agentCount}</span></div>
                    <div className="flex justify-between"><span>Volume (mois):</span> <span className="font-semibold">{formatAmount(volume)}</span></div>
                </div>
            </div>
        </div>
    );
};


export const AdminManageAgencies: React.FC<PageComponentProps> = ({ handleAction }) => {
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [profiles, setProfiles] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: agencyData, error: aError } = await supabase.from('agencies').select('id, name, chef_id');
            const { data: profilesData, error: pError } = await supabase.from('profiles').select('id, name, email, role, agency_id, avatar_seed, solde, status, suspension_reason');
            
            if (aError || pError) {
                console.error(aError || pError);
            } else {
                setAgencies((agencyData as unknown as Agency[]) || []);
                setProfiles((profilesData as unknown as User[]) || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const agencyData = useMemo(() => {
        return agencies.map(agency => {
            const chef = profiles.find(u => u.id === agency.chef_id) as ChefAgence | undefined;
            const agentCount = profiles.filter(u => u.role === 'agent' && (u as Agent).agency_id === agency.id).length;
            const volume = chef?.volume_agence_mois || 0;
            return { agency, chef, agentCount, volume };
        });
    }, [agencies, profiles]);

    const filteredAgencies = useMemo(() => {
        if (!searchTerm) return agencyData;
        return agencyData.filter(({ agency, chef }) => 
            agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (chef && chef.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, agencyData]);
    
    const totalPages = Math.ceil(filteredAgencies.length / ITEMS_PER_PAGE);
    const paginatedAgencies = useMemo(() => {
        return filteredAgencies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [filteredAgencies, currentPage]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    }

    const onEdit = (id: string | null) => {
        handleAction('openEditAgencyModal', id);
    };

    if (loading) return <Card title="Gestion des Agences" icon="fa-building"><div>Chargement...</div></Card>;

    return (
        <>
            <Card title="Gestion des Agences" icon="fa-building">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="relative flex-grow max-w-xs">
                         <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                         <input
                            type="text"
                            placeholder="Rechercher une agence ou un chef..."
                            className="form-input pl-10"
                            value={searchTerm}
                            onChange={handleSearchChange}
                         />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn btn-primary" onClick={() => handleAction('openCreateChefModal')}>
                            <i className="fas fa-user-plus mr-2"></i>Créer Chef d'Agence
                        </button>
                        <button className="btn btn-success" onClick={() => onEdit(null)}>
                            <i className="fas fa-plus-circle mr-2"></i>Créer une Agence
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {paginatedAgencies.map(({ agency, chef, agentCount, volume }) => (
                         <AgencyCard
                            key={agency.id}
                            agency={agency}
                            chef={chef}
                            agentCount={agentCount}
                            volume={volume}
                            onEdit={() => onEdit(agency.id)}
                         />
                    ))}
                </div>
                {filteredAgencies.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>Aucune agence ne correspond à votre recherche.</p>
                    </div>
                )}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </Card>
        </>
    );
};
