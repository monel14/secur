
import React from 'react';

interface TableProps {
    headers: string[];
    rows: (string | number | null)[][];
    caption?: string;
    tableClasses?: string;
}

export const Table: React.FC<TableProps> = ({ headers, rows, caption = "", tableClasses = "w-full table" }) => (
    <>
        {caption && <p className="text-sm text-gray-600 mb-2">{caption}</p>}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className={tableClasses}>
                <thead>
                    <tr>
                        {headers.map((h, i) => <th key={i}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr><td colSpan={headers.length} className="text-center text-gray-500 py-4">Aucune donnée disponible.</td></tr>
                    ) : (
                        rows.map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => <td key={j} dangerouslySetInnerHTML={{ __html: cell?.toString() || '-' }}></td>)}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </>
);
