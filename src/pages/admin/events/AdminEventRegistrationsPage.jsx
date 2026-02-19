import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Filter,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Search,
    Users,
    XCircle,
} from 'lucide-react';
import {eventsService, registrationsService} from '../../../services/api';

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */
const StatusBadge = ({status}) => {
    const map = {
        confirmed: {cls: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Confirmed'},
        pending: {cls: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending'},
        cancelled: {cls: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled'},
    };
    const cfg = map[status] || {cls: 'bg-gray-100 text-gray-700', icon: null, label: status};
    const Icon = cfg.icon;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${cfg.cls}`}>
            {Icon && <Icon className="w-3 h-3"/>}
            {cfg.label}
        </span>
    );
};

const StatCard = ({icon: Icon, label, value, color}) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 rounded-xl" style={{backgroundColor: color + '20'}}>
            <Icon className="w-5 h-5" style={{color}}/>
        </div>
        <div>
            <p className="text-2xl font-bold" style={{color: 'var(--color-navy-deep)'}}>{value}</p>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
        </div>
    </div>
);

/* ─── main component ────────────────────────────────────────────────────────── */
const AdminEventRegistrationsPage = () => {
    const {id: eventId} = useParams();
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    /* fetch event info */
    const {data: eventData} = useQuery({
        queryKey: ['admin-event', eventId],
        queryFn: () => eventsService.getById(eventId),
    });

    /* fetch registrations */
    const {data, isLoading, isError} = useQuery({
        queryKey: ['event-registrations', eventId, statusFilter, page],
        queryFn: () => registrationsService.getEventRegistrations(eventId, {
            status: statusFilter || undefined,
            page,
            per_page: 20,
        }),
    });

    const event = eventData?.data?.event || eventData?.data || null;
    const registrations = data?.data?.data || data?.data?.registrations || [];
    const meta = data?.data?.meta || {};
    const total = meta.total ?? registrations.length;
    const lastPage = meta.last_page ?? 1;

    /* client-side search on the current page */
    const filtered = search.trim()
        ? registrations.filter(r =>
            r.attendee_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.attendee_email?.toLowerCase().includes(search.toLowerCase()) ||
            r.attendee_phone?.includes(search)
        )
        : registrations;

    /* stats */
    const confirmed = registrations.filter(r => r.status === 'confirmed').length;
    const pending = registrations.filter(r => r.status === 'pending').length;
    const cancelled = registrations.filter(r => r.status === 'cancelled').length;

    /* CSV export */
    const handleExport = () => {
        const headers = ['Name', 'Email', 'Phone', 'Status', 'Registered At', 'Ticket #'];
        const rows = registrations.map(r => [
            r.attendee_name || '',
            r.attendee_email || '',
            r.attendee_phone || '',
            r.status || '',
            r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
            r.ticket?.code || r.ticket_number || '',
        ]);
        const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registrations-event-${eventId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

            {/* ── Back + Header ───────────────────────────────── */}
            <div>
                <button
                    onClick={() => navigate('/admin/events')}
                    className="inline-flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors"
                    style={{color: 'var(--color-gold-dark)'}}
                >
                    <ArrowLeft className="w-4 h-4"/>
                    Back to Events
                </button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold" style={{color: 'var(--color-navy-deep)'}}>
                            Event Registrations
                        </h1>
                        {event && (
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span className="font-semibold text-base" style={{color: 'var(--color-navy-mid)'}}>
                                    {event.name}
                                </span>
                                {event.start_date && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5"/>
                                        {new Date(event.start_date).toLocaleDateString(undefined, {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </span>
                                )}
                                {event.venue && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5"/>
                                        {event.venue}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={registrations.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{backgroundColor: 'var(--color-gold)', color: 'var(--color-navy-deep)'}}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-gold-dark)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-gold)'}
                    >
                        <Download className="w-4 h-4"/>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ── Stat cards ──────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total" value={total} color="var(--color-navy-deep)"/>
                <StatCard icon={CheckCircle} label="Confirmed" value={confirmed} color="#16a34a"/>
                <StatCard icon={Clock} label="Pending" value={pending} color="#d97706"/>
                <StatCard icon={XCircle} label="Cancelled" value={cancelled} color="#dc2626"/>
            </div>

            {/* ── Filters ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Search by name, email or phone…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                        style={{'--tw-ring-color': 'var(--color-gold-pale)'}}
                    />
                </div>

                {/* Status filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <select
                        value={statusFilter}
                        onChange={e => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white appearance-none focus:outline-none focus:ring-2"
                    >
                        <option value="">All Statuses</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* ── Table / content ─────────────────────────────── */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin" style={{color: 'var(--color-navy-mid)'}}/>
                </div>
            ) : isError ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-red-200">
                    <XCircle className="w-12 h-12 text-red-300 mx-auto mb-3"/>
                    <p className="text-red-500 font-medium">Failed to load registrations. Please try again.</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                    <p className="text-gray-500 font-medium">No registrations found.</p>
                    {(search || statusFilter) && (
                        <button
                            className="mt-3 text-sm font-medium"
                            style={{color: 'var(--color-gold-dark)'}}
                            onClick={() => {
                                setSearch('');
                                setStatusFilter('');
                            }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr style={{backgroundColor: 'var(--color-navy-deep)'}}>
                                {['#', 'Attendee', 'Contact', 'Status', 'Registered', 'Ticket'].map(h => (
                                    <th key={h}
                                        className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-white/80">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {filtered.map((reg, idx) => (
                                <tr key={reg.id}
                                    className="hover:bg-gray-50/60 transition-colors group">
                                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                                        {(page - 1) * 20 + idx + 1}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-gray-900">{reg.attendee_name || '—'}</p>
                                        {reg.role && (
                                            <p className="text-xs capitalize"
                                               style={{color: 'var(--color-gold-dark)'}}>{reg.role}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                                            <Mail className="w-3.5 h-3.5 flex-shrink-0"
                                                  style={{color: 'var(--color-gold-dark)'}}/>
                                            {reg.attendee_email || '—'}
                                        </div>
                                        {reg.attendee_phone && (
                                            <div className="flex items-center gap-1.5 text-gray-600 text-xs mt-0.5">
                                                <Phone className="w-3.5 h-3.5 flex-shrink-0"
                                                       style={{color: 'var(--color-gold-dark)'}}/>
                                                {reg.attendee_phone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={reg.status}/>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {reg.created_at
                                            ? new Date(reg.created_at).toLocaleDateString(undefined, {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                        {reg.ticket?.code || reg.ticket_number || '—'}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {filtered.map(reg => (
                            <div key={reg.id} className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-gray-900">{reg.attendee_name || '—'}</p>
                                        {reg.role && (
                                            <p className="text-xs capitalize mt-0.5"
                                               style={{color: 'var(--color-gold-dark)'}}>{reg.role}</p>
                                        )}
                                    </div>
                                    <StatusBadge status={reg.status}/>
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" style={{color: 'var(--color-gold-dark)'}}/>
                                        {reg.attendee_email}
                                    </div>
                                    {reg.attendee_phone && (
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5" style={{color: 'var(--color-gold-dark)'}}/>
                                            {reg.attendee_phone}
                                        </div>
                                    )}
                                    {reg.created_at && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5"
                                                      style={{color: 'var(--color-gold-dark)'}}/>
                                            {new Date(reg.created_at).toLocaleDateString()}
                                        </div>
                                    )}
                                    {(reg.ticket?.code || reg.ticket_number) && (
                                        <>
                                            <p className="font-mono">Ticket: {reg.ticket?.code || reg.ticket_number}</p>

                                        </>

                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Pagination ──────────────────────────────────── */}
            {lastPage > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-gray-500">
                        Page {page} of {lastPage} &bull; {total} total
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= lastPage}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                            style={{backgroundColor: 'var(--color-navy-deep)', color: '#fff'}}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventRegistrationsPage;
