





import React, { useState, useEffect } from 'react';
import { PageComponentProps, Request } from '../../types';
import { AdminQueue } from './AdminQueue';
import { supabase } from '../../supabaseClient';

export const AdminManageRequests: React.FC<PageComponentProps> = (props) => {
    const [openRequests, setOpenRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOpenRequests = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('requests')
                .select('id, created_at, demandeur_id, type, sujet, description, attachment_url, status, assigned_to, reponse, resolved_by_id, resolution_date')
                .not('status', 'in', '("Traité", "Rejeté")');

            if (error) {
                console.error("Error fetching open requests:", error);
            } else {
                setOpenRequests((data as unknown as Request[]) || []);
            }
            setLoading(false);
        };

        fetchOpenRequests();
    }, []);

    if (loading) {
        return <div>Chargement des requêtes...</div>;
    }
    
    return (
        <AdminQueue
            {...props}
            title="Gestion des Requêtes Utilisateurs"
            icon="fa-envelope-open-text"
            items={openRequests}
            description="Assignez-vous une requête de la file d'attente 'Non Assignées', puis traitez-la depuis 'Mes Tâches' pour la résoudre."
        />
    );
};
