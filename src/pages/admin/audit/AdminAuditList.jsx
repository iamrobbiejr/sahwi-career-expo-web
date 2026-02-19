import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {auditService} from '../../../services/api';
import {
    Activity,
    AlertCircle,
    BarChart2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Eye,
    Filter,
    Loader2,
    PlusCircle,
    RefreshCw,
    Search,
    Shield,
    Trash2,
    Users,
    X,
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────── */
const EVENT_COLORS = {
    created: {bg: '#DCFCE7', text: '#166534', icon: PlusCircle},
    updated: {bg: '#FEF9C3', text: '#854D0E', icon: RefreshCw},
    deleted: {bg: '#FEE2E2', text: '#991B1B', icon: Trash2},
    restored: {bg: '#E0F2FE', text: '#075985', icon: RefreshCw},
};

const EventBadge = ({event}) => {
    const cfg = EVENT_COLORS[event] || {bg: '#F3F4F6', text: '#374151', icon: Activity};
    const Icon = cfg.icon;
    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
            style={{backgroundColor: cfg.bg, color: cfg.text}}
        >
            <Icon size={11}/>
            {event}
        </span>
    );
};

const StatCard = ({icon: Icon, label, value, color}) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        <div className="p-3 rounded-xl flex-shrink-0" style={{backgroundColor: `${color}15`}}>
            <Icon className="w-6 h-6" style={{color}}/>
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        </div>
    </div>
);

/* ─── component ────────────────────────────────────────── */
const AdminAuditList = () => {
    const [filters, setFilters] = useState({
        model_type: '',
        user_id: '',
        event: '',
        start_date: '',
        end_date: '',
        per_page: 10,
        page: 1,
    });
    const [showFilters, setShowFilters] = useState(false);

    /* ── data ── */
    const {data: statsData, isLoading: statsLoading} = useQuery({
        queryKey: ['auditStats'],
        queryFn: () => auditService.getStats(),
        staleTime: 60_000,
    });

    const {data: modelTypesData} = useQuery({
        queryKey: ['auditModelTypes'],
        queryFn: () => auditService.getModelTypes(),
    });

    const {data: logsData, isLoading: logsLoading, refetch} = useQuery({
        queryKey: ['auditLogs', filters],
        queryFn: () => auditService.getAll(filters),
        keepPreviousData: true,
    });

    /* ── derived ── */
    const stats = statsData?.data?.data || {};
    const modelTypes = modelTypesData?.data?.data || [];
    const logs = logsData?.data?.data || [];
    const pagination = logsData?.data?.meta?.pagination || {};

    const activeFilters = Object.entries(filters).filter(
        ([k, v]) => !['per_page', 'page'].includes(k) && v !== ''
    ).length;

    /* ── handlers ── */
    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilters(prev => ({...prev, [name]: value, page: 1}));
    };

    const clearFilters = () => {
        setFilters(prev => ({
            ...prev,
            model_type: '',
            user_id: '',
            event: '',
            start_date: '',
            end_date: '',
            page: 1,
        }));
    };

    const setPage = (p) => setFilters(prev => ({...prev, page: p}));

    /* ── render ─────────────────────────────────────────── */
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-6 h-6" style={{color: 'var(--color-gold)'}}/>
                        Audit Trail
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Track all auditable changes made across the
                        platform.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="w-4 h-4"/>
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {statsLoading ? (
                <div className="h-24 flex items-center justify-center">
                    <Loader2 className="w-7 h-7 animate-spin text-gray-400"/>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={Activity}
                        label="Activities (30d)"
                        value={stats.total_activities?.toLocaleString()}
                        color="#6366F1"
                    />
                    <StatCard
                        icon={BarChart2}
                        label="Today"
                        value={stats.today_activities?.toLocaleString()}
                        color="#059669"
                    />
                    <StatCard
                        icon={Users}
                        label="Active Users (30d)"
                        value={stats.active_users?.toLocaleString()}
                        color="#D97706"
                    />
                    <StatCard
                        icon={Shield}
                        label="Deletions (30d)"
                        value={stats.event_counts?.deleted?.toLocaleString() ?? 0}
                        color="#DC2626"
                    />
                </div>
            )}

            {/* Event type breakdown mini-chart */}
            {stats.event_counts && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-gray-400"/>
                        Event Breakdown (last 30 days)
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(stats.event_counts).map(([ev, count]) => {
                            const cfg = EVENT_COLORS[ev] || {bg: '#F3F4F6', text: '#374151'};
                            return (
                                <div
                                    key={ev}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                                    style={{backgroundColor: cfg.bg, color: cfg.text}}
                                >
                                    <span className="capitalize">{ev}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Most audited models */}
                    {stats.most_audited_models?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Most
                                Audited Models</p>
                            <div className="flex flex-wrap gap-2">
                                {stats.most_audited_models.map((m) => (
                                    <span
                                        key={m.model}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700"
                                    >
                                        {m.model}
                                        <span className="bg-white px-1.5 py-0.5 rounded text-gray-900 font-bold">
                                            {m.count}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowFilters(v => !v)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        <Filter className="w-4 h-4"/>
                        Filters
                        {activeFilters > 0 && (
                            <span
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold"
                                style={{backgroundColor: 'var(--color-gold)'}}
                            >
                                {activeFilters}
                            </span>
                        )}
                    </button>
                    {activeFilters > 0 && (
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                        >
                            <X className="w-3.5 h-3.5"/>
                            Clear all
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
                        {/* Model Type */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Model Type</label>
                            <select
                                name="model_type"
                                value={filters.model_type}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white"
                                style={{'--tw-ring-color': 'var(--color-gold)'}}
                            >
                                <option value="">All Models</option>
                                {modelTypes.map((m) => (
                                    <option key={m.full_name} value={m.name}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Event Type */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Event Type</label>
                            <select
                                name="event"
                                value={filters.event}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white"
                            >
                                <option value="">All Events</option>
                                <option value="created">Created</option>
                                <option value="updated">Updated</option>
                                <option value="deleted">Deleted</option>
                                <option value="restored">Restored</option>
                            </select>
                        </div>

                        {/* User ID */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">User ID</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
                                <input
                                    type="number"
                                    name="user_id"
                                    value={filters.user_id}
                                    onChange={handleFilterChange}
                                    placeholder="e.g. 42"
                                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                                />
                            </div>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                            <input
                                type="date"
                                name="start_date"
                                value={filters.start_date}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                            <input
                                type="date"
                                name="end_date"
                                value={filters.end_date}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                            />
                        </div>
                    </div>
                )}

                {/* Per page */}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {pagination.total !== undefined
                            ? `${pagination.total?.toLocaleString()} total records`
                            : ''}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Rows:</span>
                        <select
                            value={filters.per_page}
                            onChange={(e) => setFilters(prev => ({...prev, per_page: +e.target.value, page: 1}))}
                            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                        >
                            {[10, 25, 50, 100].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[720px]">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Record
                                ID
                            </th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP</th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {logsLoading ? (
                            <tr>
                                <td colSpan="8" className="px-5 py-16 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto"/>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-5 py-16 text-center">
                                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
                                    <p className="text-gray-500 text-sm">No audit logs found matching your filters.</p>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => {
                                const modelShort = log.auditable_type
                                    ? log.auditable_type.split('\\').pop()
                                    : '—';
                                return (
                                    <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="px-5 py-3.5 text-sm text-gray-400 font-mono">#{log.id}</td>
                                        <td className="px-5 py-3.5">
                                            <EventBadge event={log.event}/>
                                        </td>
                                        <td className="px-5 py-3.5">
                                                <span
                                                    className="text-sm font-medium px-2 py-1 rounded-md"
                                                    style={{backgroundColor: '#F5F3FF', color: '#6D28D9'}}
                                                >
                                                    {modelShort}
                                                </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600 font-mono">
                                            {log.auditable_id}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {log.user ? (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{log.user.name}</p>
                                                    <p className="text-xs text-gray-400">{log.user.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">System</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-500 font-mono">{log.ip_address || '—'}</td>
                                        <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                                            {log.created_at
                                                ? new Date(log.created_at).toLocaleString()
                                                : '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <Link
                                                to={`/admin/audit/${log.id}`}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                                style={{
                                                    color: 'var(--color-navy-deep)',
                                                    backgroundColor: 'rgba(200,160,100,0.10)',
                                                }}
                                            >
                                                <Eye className="w-3.5 h-3.5"/>
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Page {pagination.current_page} of {pagination.last_page}
                            {' '}·{' '}
                            {pagination.total?.toLocaleString()} records
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage(Math.max(1, filters.page - 1))}
                                disabled={filters.page === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4"/>
                            </button>

                            {/* Page numbers */}
                            {Array.from({length: Math.min(5, pagination.last_page)}, (_, i) => {
                                let page;
                                if (pagination.last_page <= 5) {
                                    page = i + 1;
                                } else if (filters.page <= 3) {
                                    page = i + 1;
                                } else if (filters.page >= pagination.last_page - 2) {
                                    page = pagination.last_page - 4 + i;
                                } else {
                                    page = filters.page - 2 + i;
                                }
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setPage(page)}
                                        className="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
                                        style={
                                            page === filters.page
                                                ? {
                                                    backgroundColor: 'var(--color-navy-deep)',
                                                    color: '#fff',
                                                }
                                                : {
                                                    border: '1px solid #E5E7EB',
                                                    color: '#374151',
                                                }
                                        }
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setPage(Math.min(pagination.last_page, filters.page + 1))}
                                disabled={filters.page === pagination.last_page}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAuditList;
