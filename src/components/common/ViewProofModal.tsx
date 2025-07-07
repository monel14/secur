

import React from 'react';
import { Modal } from './Modal';

interface ViewProofModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
}

export const ViewProofModal: React.FC<ViewProofModalProps> = ({ isOpen, onClose, imageUrl }) => {
    return (
        <Modal id="view-proof-modal" title="Preuve de Transaction" isOpen={isOpen} onClose={onClose} size="modal-lg">
            <img 
                src={imageUrl || 'https://placehold.co/600x400/cccccc/969696?text=Preuve+Indisponible'} 
                alt="Preuve de transaction" 
                className="w-full h-auto rounded-md max-h-[70vh] object-contain" 
            />
            <div className="mt-4 text-right">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Fermer</button>
            </div>
        </Modal>
    );
};
