import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {eventsService, reportsService} from '../../../services/api';
import {Download, Loader2, PieChart} from 'lucide-react';
import {toast} from 'react-hot-toast';

const AdminPaymentsSummaryReport = () => {
    const [selectedEventId, setSelectedEventId] = useState('');
    const [filters, setFilters] = useState({
        group_by: 'gateway_method',
        from: '',
        to: ''
    });

    const {data: eventsData} = useQuery({
        queryKey: ['adminEventsMinimal'],
        queryFn: () => eventsService.adminGetAll({per_page: 100}),
    });

    const {data: reportData, isLoading: isLoadingReport} = useQuery({
        queryKey: ['paymentsSummary', selectedEventId, filters],
        queryFn: () => reportsService.getPaymentsSummary({
            event_id: selectedEventId,
            ...filters
        }),
        enabled: !!selectedEventId,
    });

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };

    const handleExport = async () => {
        if (!selectedEventId) return;
        try {
            const response = await reportsService.exportPaymentsSummary({
                event_id: selectedEventId,
                ...filters
            });
            const url = window.URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}));
            const link = document.createElement('a');
            link.href = url;
            const eventName = events.find(e => e.id === parseInt(selectedEventId))?.name || 'event';
            link.setAttribute('download', `payments_summary_${eventName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Failed to export report');
        }
    };

    const events = eventsData?.data?.data || [];
    const summaryData = reportData?.data?.data || [];
    const meta = reportData?.data?.meta || {};

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payments Summary</h1>
                <p className="text-gray-600">Revenue summary by gateway and payment method.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                        >
                            <option value="">Select an event...</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.name}</option>
                            ))}
                        </select>
                    </div>
                    {selectedEventId && (
                        <div className="flex items-end">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Download className="w-5 h-5"/>
                                <span>Export PDF</span>
                            </button>
                        </div>
                    )}
                </div>

                {selectedEventId && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                            <select
                                name="group_by"
                                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                value={filters.group_by}
                                onChange={handleFilterChange}
                            >
                                <option value="gateway_method">Gateway & Method</option>
                                <option value="gateway">Gateway Only</option>
                                <option value="method">Method Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                            <input
                                type="date"
                                name="from"
                                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={filters.from}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                            <input
                                type="date"
                                name="to"
                                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={filters.to}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                )}
            </div>

            {selectedEventId && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {filters.group_by !== 'method' &&
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Gateway</th>}
                                {filters.group_by !== 'gateway' &&
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Method</th>}
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Transaction
                                    Count
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Total Revenue
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {isLoadingReport ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto"/>
                                    </td>
                                </tr>
                            ) : summaryData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        No data available for the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                summaryData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        {filters.group_by !== 'method' && (
                                            <td className="px-6 py-4">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                                    {row.gateway || 'N/A'}
                                                </span>
                                            </td>
                                        )}
                                        {filters.group_by !== 'gateway' && (
                                            <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                                                {row.payment_method?.replace('_', ' ') || 'N/A'}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-sm text-gray-900 text-center">{row.count}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                            {meta.currency} {row.total?.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                            {!isLoadingReport && summaryData.length > 0 && (
                                <tfoot>
                                <tr className="bg-gray-50 font-bold">
                                    <td
                                        colSpan={filters.group_by === 'gateway_method' ? 2 : 1}
                                        className="px-6 py-4 text-sm text-gray-900"
                                    >
                                        Grand Total
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                                        {summaryData.reduce((acc, curr) => acc + curr.count, 0)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                        {meta.currency} {summaryData.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
                                    </td>
                                </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            )}

            {!selectedEventId && (
                <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900">No Event Selected</h3>
                    <p className="text-gray-500">Please select an event from the dropdown above to view payments
                        summary.</p>
                </div>
            )}
        </div>
    );
};

export default AdminPaymentsSummaryReport;
