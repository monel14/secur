
import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { ChefAgence } from '../../types';

interface CreateChefModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (chefData: { name: string; email: string; password: string; }) => void;
}

export const CreateChefModal: React.FC<CreateChefModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, email, password });
        onClose();
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <Modal 
            id="create-chef-modal" 
            title="Créer un Nouveau Chef d'Agence" 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="chefName" className="form-label">Nom complet</label>
                    <input type="text" id="chefName" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label htmlFor="chefEmail" className="form-label">Adresse Email</label>
                    <input type="email" id="chefEmail" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="mb-6">
                    <label htmlFor="chefPassword" className="form-label">Mot de passe</label>
                    <input type="password" id="chefPassword" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                 <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button type="submit" className="btn btn-primary">
                        <i className="fas fa-save mr-2"></i> Créer le Chef d'Agence
                    </button>
                </div>
            </form>
        </Modal>
    );
};
