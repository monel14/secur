





import React, { useState, useMemo, useEffect } from 'react';
import { PageComponentProps, Request, Json } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';
import { getBadgeClass } from '../../utils/uiHelpers';
import { supabase } from '../../supabaseClient';

export const SubmitRequestPage: React.FC<PageComponentProps> = ({ user, handleAction }) => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestType, setRequestType] = useState('probleme_technique');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('requests')
            .select('id, created_at, demandeur_id, type, sujet, description, attachment_url, status, assigned_to, reponse, resolved_by_id, resolution_date')
            .eq('demandeur_id', user.id)
            .order('created_at', { ascending: false });

        if(error) {
            console.error(error);
        } else {
            setRequests((data as unknown as Request[]) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, [user.id]);


    const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
    const paginatedRequests = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return requests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [requests, currentPage]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let attachment_url: string | null = null;
        if (attachment) {
            const { data, error } = await supabase.storage
                .from('attachments')
                .upload(`${user.id}/${Date.now()}-${attachment.name}`, attachment);
            if (error) {
                alert("Erreur lors de l'upload de la pièce jointe: " + error.message);
                return;
            }
            const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(data.path);
            attachment_url = urlData.publicUrl;
        }

        const { error: insertError } = await supabase.from('requests').insert([{
            demandeur_id: user.id,
            type: requestType,
            sujet: subject,
            description,
            attachment_url,
        }] as any);

        if (insertError) {
            alert("Erreur lors de la création de la requête: " + insertError.message);
        } else {
            alert("Requête envoyée avec succès !");
            // Reset form
            setSubject('');
            setDescription('');
            setAttachment(null);
            const fileInput = document.getElementById('requestAttachment') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            // Refresh list
            fetchRequests();
        }
    };
    
    const isFormInvalid = !subject || !description;

    const historyHeaders = ['ID Requête', 'Date', 'Sujet', 'Statut', 'Pièce Jointe', 'Réponse Admin'];
    const historyRows = paginatedRequests.map(req => [
        req.id,
        formatDate(req.created_at),
        req.sujet,
        `<span class="badge ${getBadgeClass(req.status)}">${req.status}</span>`,
        req.attachment_url ? `<button class="text-blue-500 hover:underline" data-action="viewAttachment" data-url="${req.attachment_url}"><i class="fas fa-paperclip pointer-events-none"></i></button>` : '-',
        req.reponse || '-'
    ]);

    const handleTableClick = (e: React.MouseEvent) => {
        const button = (e.target as HTMLElement).closest('button[data-action="viewAttachment"]');
        if (button && handleAction) {
            const url = button.getAttribute('data-url');
            if (url) {
                // The URL from storage is already a full public URL.
                handleAction('viewProof', url);
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card title="Créer une Nouvelle Requête" icon="fa-paper-plane">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label" htmlFor="requestType">Type de Requête</label>
                            <select id="requestType" className="form-select" value={requestType} onChange={e => setRequestType(e.target.value)}>
                                <option value="probleme_technique">Problème Technique</option>
                                <option value="erreur_transaction">Erreur sur Transaction</option>
                                <option value="suggestion">Suggestion d'Amélioration</option>
                                <option value="demande_infos">Demande d'informations</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="form-label" htmlFor="requestSubject">Sujet</label>
                            <input type="text" id="requestSubject" className="form-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Sujet concis de votre requête" required />
                        </div>
                        <div className="mb-4">
                            <label className="form-label" htmlFor="requestDescription">Description Détaillée</label>
                            <textarea id="requestDescription" className="form-textarea" rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez clairement votre problème ou suggestion..." required></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="form-label" htmlFor="requestAttachment">Pièce jointe (optionnel)</label>
                            <input type="file" id="requestAttachment" className="form-input" onChange={e => setAttachment(e.target.files ? e.target.files[0] : null)} />
                        </div>
                        <div className="text-right">
                            <button type="submit" className="btn btn-primary w-full" disabled={isFormInvalid}>
                                <i className="fas fa-paper-plane mr-2"></i>Envoyer la Requête
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card title="Historique de Mes Requêtes" icon="fa-history">
                    {loading ? (
                        <p>Chargement de l'historique...</p>
                    ) : (
                        <>
                            <div onClick={handleTableClick}>
                                <Table headers={historyHeaders} rows={historyRows} tableClasses="w-full table-sm" />
                            </div>
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};
