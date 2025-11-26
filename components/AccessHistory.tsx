import React, { useState, useEffect } from 'react';
import { AccessLog, ProviderType } from '../types';
import { getAccessHistory } from '../services/mockApi';

const AccessHistory: React.FC = () => {
    const [history, setHistory] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const accessLogs = await getAccessHistory();
                setHistory(accessLogs);
            } catch (error) {
                console.error("Failed to fetch access history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const typeColors: { [key in ProviderType]: string } = {
        [ProviderType.PHYSICAL]: 'bg-sky-100 text-sky-800',
        [ProviderType.BEHAVIORAL]: 'bg-purple-100 text-purple-800',
        [ProviderType.SOCIAL]: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <section aria-labelledby="access-history-heading">
            <div className="bg-surface shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 id="access-history-heading" className="text-2xl font-bold text-on-surface">Data Access History</h2>
                    <p className="text-slate-600 mt-1">A log of when your data was shared and with whom.</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Provider</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data Shared</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-slate-500">Loading history...</td>
                                </tr>
                            ) : history.length > 0 ? (
                                history.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-on-surface">{log.providerName}</div>
                                            <div className={`text-xs px-2 inline-flex leading-5 font-semibold rounded-full ${typeColors[log.providerType]}`}>{log.providerType}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(log.date).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-2">
                                                {log.dataTypesShared.map((type, index) => (
                                                    <span key={index} className="px-3 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">{type}</span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-slate-500">No access history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default AccessHistory;