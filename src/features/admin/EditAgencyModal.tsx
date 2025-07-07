
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Agency, ChefAgence, User } from '../../types';
import { mockAgencies } from '../../data';

interface EditAgencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    agencyId: string | null;
    onSave: (agency: Agency) => void;
    users: { [id: string]: User };
}

const EditAgencyModal: React.FC<EditAgencyModalProps> = ({ isOpen, onClose, agencyId, onSave, users }) => {
    const [name, setName] = useState('');
    const [chef_id, setChefId] = useState<string | null>('');

    const availableChefs = Object.values(users).filter((u): u is ChefAgence => 
        u.role === 'chef_agence' && (!u.agency_id || u.agency_id === agencyId)
    );

    useEffect(() => {
        if (isOpen) {
            if (agencyId) {
                const agency = mockAgencies.find(a => a.id === agencyId);
                if (agency) {
                    setName(agency.name);
                    setChefId(agency.chef_id);
                }
            } else {
                // Reset for creation
                setName('');
                setChefId('');
            }
        }
    }, [isOpen, agencyId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalAgencyData: Agency = {
            id: agencyId || `AG${Date.now().toString().slice(-3)}`,
            name,
            chef_id: chef_id,
        };
        onSave(finalAgencyData);
        onClose();
    };

    return (
        <Modal 
            id="edit-agency-modal" 
            title={agencyId ? "Modifier l'Agence" : "Créer une Nouvelle Agence"} 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="agencyName" className="form-label">Nom de l'agence</label>
                    <input
                        type="text"
                        id="agencyName"
                        className="form-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="chef_id" className="form-label">Chef d'agence</label>
                    <select
                        id="chef_id"
                        className="form-select"
                        value={chef_id || ''}
                        onChange={e => setChefId(e.target.value)}
                    >
                        <option value="" disabled>-- Sélectionner un chef d'agence --</option>
                        {availableChefs.map(chef => (
                            <option key={chef.id} value={chef.id}>{chef.name}</option>
                        ))}
                         {chef_id && !availableChefs.some(c => c.id === chef_id) && users[chef_id] && (
                            <option key={chef_id} value={chef_id}>{users[chef_id].name}</option>
                         )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">La liste contient les chefs d'agences disponibles ou celui déjà assigné.</p>
                </div>
                 <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button type="submit" className="btn btn-primary">
                        <i className="fas fa-save mr-2"></i>
                        {agencyId ? 'Enregistrer les modifications' : 'Créer l\'agence'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditAgencyModal;
