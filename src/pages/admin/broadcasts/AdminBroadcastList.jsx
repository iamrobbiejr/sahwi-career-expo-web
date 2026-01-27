import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {broadcastsService} from '../../../services/api';
import {
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Send,
    Eye,
    Edit2,
    Trash2,
    Calendar,
    Users,
    BarChart2
} from 'lucide-react';
import {Link} from 'react-router-dom';
import {toast} from 'react-hot-toast';
import {format} from 'date-fns';

const AdminBroadcastList = () => {
    const [params, setParams] = useState({
        page: 1,
        status: '',
        audience_type: '',
    });

    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: ['adminBroadcasts', params],
        queryFn: () => broadcastsService.getAll(params),
    });

    const handleStatusChange = (e) => {
        setParams(prev => ({...prev, status: e.target.value, page: 1}));
    };

    const handleAudienceChange = (e) => {
        setParams(prev => ({...prev, audience_type: e.target.value, page: 1}));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this broadcast?')) {
            try {
                await broadcastsService.delete(id);
                toast.success('Broadcast deleted successfully');
                refetch();
            } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to delete broadcast');
            }
        }
    };

    const broadcasts = data?.data?.data || [];
    const pagination = data?.data || {};

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-700';
            case 'queued':
                return 'bg-blue-100 text-blue-700';
            case 'processing':
                return 'bg-yellow-100 text-yellow-700';
            case 'sent':
                return 'bg-green-100 text-green-700';
            case 'failed':
                return 'bg-red-100 text-red-700';
            case 'cancelled':
                return 'bg-orange-100 text-orange-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Email Broadcasts</h1>
                    <p className="text-gray-600">Send and manage email campaigns to users.</p>
                </div>
                <Link
                    to="/admin/broadcasts/create"
                    className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5"/>
                    <span>New Broadcast</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex gap-4">
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        value={params.status}
                        onChange={handleStatusChange}
                    >
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="queued">Queued</option>
                        <option value="processing">Processing</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        value={params.audience_type}
                        onChange={handleAudienceChange}
                    >
                        <option value="">All Audiences</option>
                        <option value="all_users">All Users</option>
                        <option value="university_interested">University Interested</option>
                        <option value="event_registered">Event Registered</option>
                        <option value="custom">Custom List</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Broadcast</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Audience</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Stats</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center">
                                    <div className="flex justify-center">
                                        <div
                                            className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : broadcasts.length > 0 ? (
                            broadcasts.map((broadcast) => (
                                <tr key={broadcast.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary-50 rounded-lg">
                                                <Send className="w-5 h-5 text-primary-600"/>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{broadcast.subject}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <Calendar className="w-3 h-3"/>
                                                    {broadcast.created_at ? format(new Date(broadcast.created_at), 'MMM d, yyyy HH:mm') : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="capitalize">{broadcast.audience_type?.replace('_', ' ')}</div>
                                        {broadcast.target_university && (
                                            <div
                                                className="text-xs text-gray-400">{broadcast.target_university.name}</div>
                                        )}
                                        {broadcast.target_event && (
                                            <div className="text-xs text-gray-400">{broadcast.target_event.title}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                      <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(broadcast.status)}`}>
                        {broadcast.status}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-4">
                                            <div title="Sent">
                                                <span className="font-semibold">{broadcast.sent_count || 0}</span>
                                                <span className="text-xs text-gray-400 ml-1">Sent</span>
                                            </div>
                                            <div title="Opened">
                                                <span className="font-semibold">{broadcast.opened_count || 0}</span>
                                                <span className="text-xs text-gray-400 ml-1">Open</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/broadcasts/${broadcast.id}`}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5"/>
                                            </Link>
                                            {broadcast.status === 'draft' && (
                                                <Link
                                                    to={`/admin/broadcasts/${broadcast.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-5 h-5"/>
                                                </Link>
                                            )}
                                            {['draft', 'failed', 'cancelled'].includes(broadcast.status) && (
                                                <button
                                                    onClick={() => handleDelete(broadcast.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No broadcasts found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.total > pagination.per_page && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{pagination.from}</span> to <span
                            className="font-medium">{pagination.to}</span> of <span
                            className="font-medium">{pagination.total}</span> results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setParams(prev => ({...prev, page: prev.page - 1}))}
                                disabled={params.page === 1}
                                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5"/>
                            </button>
                            <button
                                onClick={() => setParams(prev => ({...prev, page: prev.page + 1}))}
                                disabled={params.page === pagination.last_page}
                                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBroadcastList;
