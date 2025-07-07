
import React from 'react';

interface ModalProps {
    id: string;
    title: string;
    children: React.ReactNode;
    size?: 'max-w-md' | 'modal-lg' | 'modal-xl';
    isOpen: boolean;
    onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ id, title, children, size = 'max-w-md', isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div id={id} className="modal" onClick={handleOverlayClick}>
            <div className={`modal-content ${size}`} onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">{title}</h3>
                {children}
            </div>
        </div>
    );
};
