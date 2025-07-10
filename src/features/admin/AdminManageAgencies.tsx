
import React, { useState, useMemo, useEffect } from 'react';
import { PageComponentProps, ChefAgence, Agency, User, Agent } from '../../types';
import { Card } from '../../components/common/Card';
import { formatAmount } from '../../utils/formatters';
import { Pagination } from '../../components/common/Pagination';
import { supabase } from '../../supabaseClient';
import { PageHeader } from '../../components/common/PageHeader';

const StatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg flex items-center">
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 mr-4">
            <i className={`fas ${icon} fa-lg`}></i>
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

const AgencyCard: React.FC<{ 
    agency: { id: string, name: string, chef_name: string | null, chef_avatar_seed: string | null, agent_count: number }; 
    onEdit: (id: string) => void;
}> = ({ agency, onEdit }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 h-full hover:scale-[1.02] group">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600">{agency.name}</h4>
                    <button onClick={() => onEdit(agency.id)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Modifier l'agence">
                        <i className="fas fa-edit"></i>
                    </button>
                </div>
                {agency.chef_name ? (
                    <div className="flex items-center my-3">
                        <img src={`https://placehold.co/32x32/E2E8F0/4A5568?text=${agency.chef_avatar_seed}`} alt={agency.chef_name} className="w-8 h-8 rounded-full mr-3"/>
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{agency.chef_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Chef d'Agence</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center my-3 text-sm text-gray-400 italic">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 mr-3"></div>
                        <p>Aucun chef assigné</p>
                    </div>
                )}
                <div className="my-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Agents:</span> <span className="font-semibold">{agency.agent_count}</span></div>
                </div>
            </div>
        </div>
    );
};


export const AdminManageAgencies: React.FC<PageComponentProps> = ({ handleAction, refreshKey }) => {
    const [agenciesWithStats, setAgenciesWithStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_agency_list_with_stats');
            
            if (error) {
                console.error("Error fetching agencies with stats:", error);
            } else {
                setAgenciesWithStats(data || []);
            }
            setLoading(false);
        };
        fetchData();
    }, [refreshKey]);


    const filteredAgencies = useMemo(() => {
        if (!searchTerm) return agenciesWithStats;
        return agenciesWithStats.filter((agency) => 
            agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (agency.chef_name && agency.chef_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, agenciesWithStats]);
    
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

    if (loading) return <div>Chargement des agences...</div>;

    return (
        <>
            <PageHeader
                title="Gestion des Agences"
                subtitle="Créez, modifiez et assignez des chefs à vos agences."
                icon="fa-building"
                gradient="from-blue-600 to-cyan-600"
            />
            <Card title="Toutes les Agences" icon="fa-building">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="relative flex-grow max-w-sm">
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
                        <button className="flex items-center justify-center h-10 px-4 text-sm font-medium text-white transition-colors duration-200 transform rounded-lg focus:outline-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:scale-[1.02]" onClick={() => handleAction('openCreateChefModal')}>
                            <i className="fas fa-user-plus mr-2"></i>Créer Chef d'Agence
                        </button>
                        <button className="flex items-center justify-center h-10 px-4 text-sm font-medium text-white transition-colors duration-200 transform rounded-lg focus:outline-none bg-green-600 hover:bg-green-700 shadow-lg hover:scale-[1.02]" onClick={() => onEdit(null)}>
                            <i className="fas fa-plus-circle mr-2"></i>Créer une Agence
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {paginatedAgencies.map((agency) => (
                         <AgencyCard
                            key={agency.id}
                            agency={agency}
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
