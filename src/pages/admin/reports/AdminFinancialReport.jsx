import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {eventsService, reportsService} from '../../../services/api';
import {Calendar, ChevronLeft, ChevronRight, DollarSign, Download, Loader2, Search} from 'lucide-react';
import {toast} from 'react-hot-toast';

const AdminFinancialReport = () => {
    const [selectedEventId, setSelectedEventId] = useState('');
    const [filters, setFilters] = useState({
        q: '',
        from: '',
        to: '',
        gateway: '',
        method: '',
        per_page: 20,
        page: 1
    });

    const {data: eventsData} = useQuery({
        queryKey: ['adminEventsMinimal'],
        queryFn: () => eventsService.adminGetAll({per_page: 100}),
    });

    const {data: reportData, isLoading: isLoadingReport} = useQuery({
        queryKey: ['financialReport', selectedEventId, filters],
        queryFn: () => reportsService.getFinancial({
            event_id: selectedEventId,
            ...filters
        }),
        enabled: !!selectedEventId,
    });

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilters(prev => ({...prev, [name]: value, page: 1}));
    };

    const handleExport = async () => {
        if (!selectedEventId) return;
        try {
            const response = await reportsService.exportFinancial({
                event_id: selectedEventId,
                ...filters
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const eventName = events.find(e => e.id === parseInt(selectedEventId))?.name || 'event';
            link.setAttribute('download', `financial_report_${eventName.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Failed to export report');
        }
    };

    const events = eventsData?.data?.data || [];
    const registrations = reportData?.data?.data || [];
    const meta = reportData?.data?.meta || {};
    const pagination = meta.pagination || {};
    const totals = meta.totals || {};

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Financial Analysis</h1>
                <p className="text-gray-600">Paid registrations and revenue analysis.</p>
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
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="w-5 h-5"/>
                                <span>Export to Excel</span>
                            </button>
                        </div>
                    )}
                </div>

                {selectedEventId && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                            <input
                                type="text"
                                name="q"
                                placeholder="Search..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={filters.q}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <input
                            type="date"
                            name="from"
                            placeholder="From"
                            className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={filters.from}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="date"
                            name="to"
                            placeholder="To"
                            className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={filters.to}
                            onChange={handleFilterChange}
                        />
                        <select
                            name="gateway"
                            className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            value={filters.gateway}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Gateways</option>
                            <option value="paystack">Paystack</option>
                            <option value="flutterwave">Flutterwave</option>
                            <option value="stripe">Stripe</option>
                            <option value="manual">Manual</option>
                        </select>
                        <select
                            name="method"
                            className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            value={filters.method}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Methods</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="ussd">USSD</option>
                        </select>
                    </div>
                )}
            </div>

            {selectedEventId && (
                <>
                    {/* Totals Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary-50 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-primary-600"/>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {totals.currency || 'USD'} {totals.total_paid?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Ticket #</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Attendee</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Amount</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Gateway</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Method</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Paid At</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {isLoadingReport ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto"/>
                                        </td>
                                    </tr>
                                ) : registrations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No registrations found matching the filters.
                                        </td>
                                    </tr>
                                ) : (
                                    registrations.map((reg) => (
                                        <tr key={reg.registration_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{reg.ticket_number}</td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className="text-sm font-medium text-gray-900">{reg.attendee_name}</div>
                                                <div className="text-sm text-gray-500">{reg.attendee_email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {reg.currency} {reg.paid_amount}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                                    {reg.gateway}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 capitalize">{reg.payment_method?.replace('_', ' ')}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {reg.paid_at ? new Date(reg.paid_at).toLocaleString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {registrations.length} of {pagination.total} results
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilters(prev => ({
                                            ...prev,
                                            page: Math.max(1, prev.page - 1)
                                        }))}
                                        disabled={filters.page === 1}
                                        className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                                    >
                                        <ChevronLeft className="w-5 h-5"/>
                                    </button>
                                    <button
                                        onClick={() => setFilters(prev => ({
                                            ...prev,
                                            page: Math.min(pagination.last_page, prev.page + 1)
                                        }))}
                                        disabled={filters.page === pagination.last_page}
                                        className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                                    >
                                        <ChevronRight className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {!selectedEventId && (
                <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900">No Event Selected</h3>
                    <p className="text-gray-500">Please select an event from the dropdown above to view financial
                        analysis.</p>
                </div>
            )}
        </div>
    );
};

export default AdminFinancialReport;
