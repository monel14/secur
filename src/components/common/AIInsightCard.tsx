
import React from 'react';

interface AIInsightCardProps {
    insight: string | null;
    loading: boolean;
    error: string | null;
}

const SkeletonLoader = () => (
    <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-slate-300 rounded w-3/4"></div>
        <div className="h-4 bg-slate-300 rounded w-full"></div>
        <div className="h-4 bg-slate-300 rounded w-5/6"></div>
    </div>
);

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight, loading, error }) => {
    return (
        <div className="card mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <i className={`fas fa-lightbulb mr-3 text-yellow-400`}></i>Perspectives IA
            </h3>
            <div className="text-gray-600 min-h-[60px]">
                {loading && <SkeletonLoader />}
                {error && !loading && <div className="text-red-600 flex items-center"><i className="fas fa-exclamation-triangle mr-2"></i>{error}</div>}
                {insight && !loading && <p className="text-gray-800" dangerouslySetInnerHTML={{ __html: insight }}></p>}
            </div>
        </div>
    );
};
