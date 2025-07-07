
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Agent } from '../../types';

interface CreateEditAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentToEdit: Agent | null;
    onSave: (agent: Agent) => void;
    agencyId: string;
}

export const CreateEditAgentModal: React.FC<CreateEditAgentModalProps> = ({ isOpen, onClose, agentToEdit, onSave, agencyId }) => {
    const [agentData, setAgentData] = useState<Partial<Agent>>({});

    useEffect(() => {
        if (isOpen) {
            if (agentToEdit) {
                setAgentData(agentToEdit);
            } else {
                // Default values for new agent
                setAgentData({
                    name: '',
                    email: '',
                    solde: 0,
                    status: 'active',
                });
            }
        }
    }, [isOpen, agentToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setAgentData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newAgent: Agent = {
            id: agentToEdit?.id || `agent_${Date.now()}`,
            name: agentData.name || '',
            email: agentData.email || '',
            role: 'agent',
            agency_id: agencyId,
            solde: agentData.solde || 0,
            status: agentData.status || 'active',
            avatar_seed: (agentData.name || 'N').charAt(0).toUpperCase(),
            creation_date: agentToEdit?.creation_date || new Date().toISOString().split('T')[0],
            transactions_this_month: agentToEdit?.transactions_this_month || 0,
            commissions_mois_estimees: agentToEdit?.commissions_mois_estimees || 0,
            commissions_dues: agentToEdit?.commissions_dues || 0,
            suspension_reason: agentToEdit?.suspension_reason || null
        };

        onSave(newAgent);
    };

    const title = agentToEdit ? `Modifier l'Agent: ${agentToEdit.name}` : "Créer un Nouveau Compte Agent";

    return (
        <Modal id="create-edit-agent-modal" title={title} isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="form-label">Nom complet</label>
                    <input type="text" id="name" name="name" className="form-input" value={agentData.name || ''} onChange={handleChange} required />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="form-label">Adresse Email</label>
                    <input type="email" id="email" name="email" className="form-input" value={agentData.email || ''} onChange={handleChange} required />
                </div>
                 <div className="mb-4">
                    <label htmlFor="solde" className="form-label">Solde initial</label>
                    <input type="number" id="solde" name="solde" className="form-input" value={agentData.solde || 0} onChange={handleChange} required />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="form-label">{agentToEdit ? "Nouveau Mot de passe (optionnel)" : "Mot de passe"}</label>
                    <input type="password" id="password" className="form-input" required={!agentToEdit} />
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button type="submit" className="btn btn-primary">
                        <i className="fas fa-save mr-2"></i> Enregistrer
                    </button>
                </div>
            </form>
        </Modal>
    );
};
