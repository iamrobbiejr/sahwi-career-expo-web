import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {eventsService, reportsService} from '../../../services/api';
import {AlertCircle, ChevronLeft, ChevronRight, Loader2, Search} from 'lucide-react';

const AdminPendingCancelledReport = () => {
    const [selectedEventId, setSelectedEventId] = useState('');
    const [filters, setFilters] = useState({
        q: '',
        per_page: 20,
        page: 1
    });

    const {data: eventsData} = useQuery({
        queryKey: ['adminEventsMinimal'],
        queryFn: () => eventsService.adminGetAll({per_page: 100}),
    });

    const {data: reportData, isLoading: isLoadingReport} = useQuery({
        queryKey: ['pendingCancelledReport', selectedEventId, filters],
        queryFn: () => reportsService.getPendingCancelled({
            event_id: selectedEventId,
            ...filters
        }),
        enabled: !!selectedEventId,
    });

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilters(prev => ({...prev, [name]: value, page: 1}));
    };

    const events = eventsData?.data?.data || [];
    const registrations = reportData?.data?.data || [];
    const meta = reportData?.data?.meta || {};
    const pagination = meta.pagination || {};

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Pending & Cancelled Registrations</h1>
                <p className="text-gray-600">View registrations that are pending payment or have been cancelled.</p>
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
                        <div className="relative flex items-end">
                            <Search className="absolute left-3 bottom-3 text-gray-400 w-4 h-4"/>
                            <input
                                type="text"
                                name="q"
                                placeholder="Search registrations..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={filters.q}
                                onChange={handleFilterChange}
                            />
                        </div>
                    )}
                </div>
            </div>

            {selectedEventId && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Ticket #</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Attendee</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Registered At</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Cancelled At</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {isLoadingReport ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto"/>
                                    </td>
                                </tr>
                            ) : registrations.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No pending or cancelled registrations found.
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((reg) => (
                                    <tr key={reg.registration_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{reg.ticket_number}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{reg.attendee_name}</div>
                                            <div className="text-sm text-gray-500">{reg.attendee_email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                    reg.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {reg.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {reg.registered_at ? new Date(reg.registered_at).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {reg.cancelled_at ? new Date(reg.cancelled_at).toLocaleString() : '-'}
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
                                    onClick={() => setFilters(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
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
            )}

            {!selectedEventId && (
                <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900">No Event Selected</h3>
                    <p className="text-gray-500">Please select an event from the dropdown above to view
                        pending/cancelled registrations.</p>
                </div>
            )}
        </div>
    );
};

export default AdminPendingCancelledReport;
