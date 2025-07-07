
import React from 'react';
import { PageComponentProps } from '../../types';
import { Card } from '../../components/common/Card';

export const DevSystemConfig: React.FC<PageComponentProps> = () => (
    <>
        <Card title="Paramètres Généraux" icon="fa-sliders-h">
            <div className="space-y-4">
                <div><label className="form-label">Nom de l'application</label><input type="text" className="form-input" defaultValue="SecureTrans" /></div>
                <div><label className="form-label">Devise par défaut</label><input type="text" className="form-input" defaultValue="XOF" /></div>
                <div><label className="form-label">Fuseau horaire par défaut</label><input type="text" className="form-input" defaultValue="GMT" /></div>
                <div><label className="form-label">Taille max. des fichiers uploadés (MB)</label><input type="number" className="form-input" defaultValue="2" /></div>
            </div>
        </Card>
        <Card title="Gestion des Notifications" icon="fa-envelope">
            <h4 className="text-lg font-semibold text-gray-600 mb-2">Serveur SMTP</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="form-label">Hôte SMTP</label><input type="text" className="form-input" defaultValue="smtp.example.com" /></div>
                <div><label className="form-label">Port SMTP</label><input type="number" className="form-input" defaultValue="587" /></div>
            </div>
        </Card>
        <Card title="Paramètres de Sécurité" icon="fa-user-shield">
             <div className="space-y-4">
                <div><label className="form-label">Complexité mot de passe (regex)</label><input type="text" className="form-input" defaultValue="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$" /></div>
                <div><label className="form-label">Durée d'inactivité avant déconnexion (minutes)</label><input type="number" className="form-input" defaultValue="15" /></div>
             </div>
        </Card>
    </>
);
