import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {eventsService} from '../../../services/api';
import {formatImageUrl} from '../../../utils/format';
import {Calendar, ChevronLeft, ChevronRight, Edit2, Eye, MapPin, Plus, Search, Trash2, Users} from 'lucide-react';
import {Link} from 'react-router-dom';
import {toast} from 'react-hot-toast';
import {useAuthStore} from "../../../store/index.js";


const AdminEventList = () => {
    const [params, setParams] = useState({
        page: 1,
        search: '',
        status: '',
        per_page: 10
    });
    const {hasRole} = useAuthStore();



    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: ['adminEvents', params],
        queryFn: () => eventsService.adminGetAll(params),
    });

    const handleSearch = (e) => {
        setParams(prev => ({...prev, search: e.target.value, page: 1}));
    };

    const handleStatusChange = (e) => {
        setParams(prev => ({...prev, status: e.target.value, page: 1}));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await eventsService.adminDelete(id);
                toast.success('Event deleted successfully');
                refetch();
            } catch (err) {
                toast.error('Failed to delete event');
            }
        }
    };

    const events = data?.data?.data || [];
    const pagination = data?.data?.pagination || {};

    const isAdmin = hasRole('admin');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
                    <p className="text-gray-600">View and manage all events in the system.</p>
                </div>
                <Link
                    to="/admin/events/create"
                    className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5"/>
                    <span>Add Event</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder="Search events..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={params.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        value={params.status}
                        onChange={handleStatusChange}
                    >
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Event</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Date & Location</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Created By</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading events...</td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-red-500">Failed to load events.
                                </td>
                            </tr>
                        ) : events.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No events found.</td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {(event.img || event.banner) ? (
                                                <img
                                                    src={formatImageUrl(event.img || event.banner)}
                                                    alt=""
                                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div
                                                    className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <Calendar className="w-5 h-5 text-gray-400"/>
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{event.name}</span>
                                                <span
                                                    className="text-xs text-gray-500 line-clamp-1">{event.description}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5"/>
                                                <span>{new Date(event.start_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5"/>
                                                <span>{event.venue || event.location}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${event.status === 'published' ? 'bg-green-100 text-green-800' :
                          event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'}`}
                      >
                        {event.status}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {event.creator?.name || 'System'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {isAdmin && (
                                                <Link
                                                    to={`/admin/events/${event.id}/registrations`}
                                                    onClick={e => e.stopPropagation()}
                                                    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all"
                                                    style={{backgroundColor: 'var(--color-navy-deep)', color: '#fff'}}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-navy-mid)'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-navy-deep)'}
                                                >
                                                    <Users className="w-3.5 h-3.5"/>
                                                    Registrations
                                                </Link>
                                            )}
                                            <Link
                                                to={`/admin/events/${event.id}`}
                                                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5"/>
                                            </Link>
                                            <Link
                                                to={`/admin/events/${event.id}/edit`}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Edit Event"
                                            >
                                                <Edit2 className="w-5 h-5"/>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Event"
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing page {pagination.current_page} of {pagination.total_pages}
            </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setParams(prev => ({...prev, page: prev.page - 1}))}
                                disabled={pagination.current_page === 1}
                                className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5"/>
                            </button>
                            <button
                                onClick={() => setParams(prev => ({...prev, page: prev.page + 1}))}
                                disabled={pagination.current_page === pagination.total_pages}
                                className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-white transition-colors"
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

export default AdminEventList;
