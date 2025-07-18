
import React, { useState, useMemo, useEffect } from 'react';
import { PageComponentProps, OperationType, Agency } from '../../types';
import { Card } from '../../components/common/Card';
import { supabase } from '../../supabaseClient';

export const AdminAssignOpsToAgency: React.FC<PageComponentProps> = ({ refreshKey }) => {
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [opTypes, setOpTypes] = useState<OperationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [accessMap, setAccessMap] = useState<Record<string, string[]>>({});
    const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');
    const [agencySearch, setAgencySearch] = useState('');
    const [opTypeSearch, setOpTypeSearch] = useState('');
    const [changes, setChanges] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [agenciesRes, opTypesRes, accessRes] = await Promise.all([
                supabase.from('agencies').select('*'),
                supabase.from('operation_types').select('*'),
                supabase.from('agency_operation_access').select('agency_id, op_type_id')
            ]);

            if (agenciesRes.error || opTypesRes.error || accessRes.error) {
                console.error("Error fetching data:", { a: agenciesRes.error, o: opTypesRes.error, p: accessRes.error });
                setLoading(false);
                return;
            }

            const agenciesData = agenciesRes.data || [];
            const opTypesData = (opTypesRes.data || []).map((op: any) => ({
                ...op,
                fields: op.fields || [],
                commission_config: op.commission_config || { type: 'none' },
            })) as OperationType[];
            
            setAgencies(agenciesData);
            setOpTypes(opTypesData);

            const initialAccessMap = agenciesData.reduce((acc, agency) => {
                acc[agency.id] = [];
                return acc;
            }, {} as Record<string, string[]>);

            (accessRes.data || []).forEach(access => {
                if (initialAccessMap[access.agency_id]) {
                    initialAccessMap[access.agency_id].push(access.op_type_id);
                }
            });
            setAccessMap(initialAccessMap);

            if (agenciesData.length > 0 && !selectedAgencyId) {
                setSelectedAgencyId(agenciesData[0].id);
            }
            
            setLoading(false);
        };
        fetchData();
    }, [refreshKey]);


    useEffect(() => {
        setChanges(accessMap[selectedAgencyId] || []);
    }, [selectedAgencyId, accessMap]);

    const handleCheckChange = (opTypeId: string, checked: boolean) => {
        setChanges(prev => {
            const newChanges = new Set(prev);
            if (checked) {
                newChanges.add(opTypeId);
            } else {
                newChanges.delete(opTypeId);
            }
            return Array.from(newChanges);
        });
    };
    
    const handleSave = async () => {
        if (!selectedAgencyId) return;
        setIsSaving(true);
        const { error } = await supabase.rpc('update_agency_op_access', {
            p_agency_id: selectedAgencyId,
            p_op_type_ids: changes
        });

        if (error) {
            alert(`Erreur lors de la sauvegarde: ${error.message}`);
        } else {
            alert(`Permissions pour l'agence ${selectedAgencyName} sauvegardées !`);
            // Refresh local state to match DB
            setAccessMap(prev => ({
                ...prev,
                [selectedAgencyId]: changes,
            }));
        }
        setIsSaving(false);
    };

    const isSaveDisabled = useMemo(() => {
        if (isSaving) return true;
        const original = accessMap[selectedAgencyId]?.sort() || [];
        const current = changes.sort();
        return JSON.stringify(original) === JSON.stringify(current);
    }, [changes, accessMap, selectedAgencyId, isSaving]);

    const filteredAgencies = useMemo(() =>
        agencies.filter(a => a.name.toLowerCase().includes(agencySearch.toLowerCase())),
        [agencies, agencySearch]
    );

    const filteredOpTypes = useMemo(() =>
        opTypes.filter(o => o.name.toLowerCase().includes(opTypeSearch.toLowerCase())),
        [opTypes, opTypeSearch]
    );

    const selectedAgencyName = useMemo(() => agencies.find(a => a.id === selectedAgencyId)?.name, [agencies, selectedAgencyId]);

    if(loading) return <Card title="Attribution des Services aux Agences" icon="fa-store-alt-slash">Chargement...</Card>

    return (
        <Card title="Attribution des Services aux Agences" icon="fa-store-alt-slash">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[60vh]">
                {/* Agency List Panel */}
                <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg border flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Agences</h3>
                    <div className="relative mb-3">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="Rechercher une agence..."
                            className="form-input pl-10"
                            value={agencySearch}
                            onChange={e => setAgencySearch(e.target.value)}
                        />
                    </div>
                    <div className="flex-grow overflow-y-auto -mx-2">
                        <ul className="space-y-1 px-2">
                            {filteredAgencies.map(agency => (
                                <li key={agency.id}>
                                    <button
                                        onClick={() => setSelectedAgencyId(agency.id)}
                                        className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${selectedAgencyId === agency.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-200 text-gray-800'}`}
                                    >
                                        <p className="font-semibold">{agency.name}</p>
                                        <p className={`text-sm ${selectedAgencyId === agency.id ? 'text-blue-200' : 'text-gray-500'}`}>
                                            {(accessMap[agency.id] || []).length} service(s) activé(s)
                                        </p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Operations Panel */}
                <div className="lg:col-span-2 bg-white p-4 rounded-lg border flex flex-col">
                    {selectedAgencyId ? (
                        <>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                Services pour <span className="text-blue-600">{selectedAgencyName}</span>
                            </h3>
                             <div className="relative mb-3">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="text"
                                    placeholder="Rechercher un service..."
                                    className="form-input pl-10"
                                    value={opTypeSearch}
                                    onChange={e => setOpTypeSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex-grow overflow-y-auto space-y-3 -mx-2 px-2 py-1">
                                {filteredOpTypes.map(opType => (
                                    <div key={opType.id} className="p-3 bg-white border rounded-md hover:border-blue-400">
                                        <label htmlFor={`op_${opType.id}`} className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                id={`op_${opType.id}`}
                                                checked={changes.includes(opType.id)}
                                                onChange={e => handleCheckChange(opType.id, e.target.checked)}
                                                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4"
                                            />
                                            <div className="flex-grow">
                                                <span className="font-medium text-gray-800">{opType.name}</span>
                                                <p className="text-xs text-gray-500">{opType.description}</p>
                                            </div>
                                            <span className={`badge ${opType.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{opType.status}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t mt-4 flex justify-end">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={isSaveDisabled}
                                >
                                    <i className={`fas ${isSaving ? 'fa-spinner animate-spin' : 'fa-save'} mr-2`}></i>
                                    {isSaving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-center text-gray-500">
                            <div>
                                <i className="fas fa-mouse-pointer fa-3x mb-4 text-gray-400"></i>
                                <p>Veuillez sélectionner une agence pour voir ses services.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
