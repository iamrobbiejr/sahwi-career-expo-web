import React from 'react';
import {Link, useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {auditService} from '../../../services/api';
import {
    Activity,
    ArrowLeft,
    Calendar,
    ChevronRight,
    ClipboardList,
    Globe,
    Layers,
    Loader2,
    Monitor,
    PlusCircle,
    RefreshCw,
    Trash2,
    User,
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────── */
const EVENT_COLORS = {
    created: {bg: '#DCFCE7', text: '#166534', icon: PlusCircle, label: 'Created'},
    updated: {bg: '#FEF9C3', text: '#854D0E', icon: RefreshCw, label: 'Updated'},
    deleted: {bg: '#FEE2E2', text: '#991B1B', icon: Trash2, label: 'Deleted'},
    restored: {bg: '#E0F2FE', text: '#075985', icon: RefreshCw, label: 'Restored'},
};

const EventBadge = ({event}) => {
    const cfg = EVENT_COLORS[event] || {bg: '#F3F4F6', text: '#374151', icon: Activity, label: event};
    const Icon = cfg.icon;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold capitalize"
            style={{backgroundColor: cfg.bg, color: cfg.text}}
        >
            <Icon size={14}/>
            {cfg.label || event}
        </span>
    );
};

/** Renders a key-value pair nicely */
const InfoRow = ({icon: Icon, label, value}) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        <div className="mt-0.5 p-2 rounded-lg bg-gray-50 flex-shrink-0">
            <Icon className="w-4 h-4 text-gray-500"/>
        </div>
        <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm text-gray-800 break-words">{value ||
                <span className="text-gray-400 italic">—</span>}</p>
        </div>
    </div>
);

/** Renders old / new values diff table */
const DiffTable = ({title, values, color, emptyText}) => {
    if (!values || Object.keys(values).length === 0) {
        return (
            <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100" style={{backgroundColor: `${color}10`}}>
                    <h4 className="text-sm font-semibold" style={{color}}>{title}</h4>
                </div>
                <div className="px-5 py-8 text-center text-sm text-gray-400 italic">{emptyText}</div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100" style={{backgroundColor: `${color}10`}}>
                <h4 className="text-sm font-semibold" style={{color}}>{title}</h4>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                    <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 w-1/3">
                            Field
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            Value
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {Object.entries(values).map(([key, val]) => (
                        <tr key={key} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-4 py-2.5 font-mono text-xs text-gray-500 font-medium">{key}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-gray-700 break-all">
                                {val === null
                                    ? <span className="text-gray-300 italic">null</span>
                                    : typeof val === 'object'
                                        ? <pre
                                            className="whitespace-pre-wrap text-xs">{JSON.stringify(val, null, 2)}</pre>
                                        : String(val) || <span className="text-gray-300 italic">empty</span>
                                }
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ─── component ────────────────────────────────────────── */
const AdminAuditDetail = () => {
    const {id} = useParams();

    const {data, isLoading, isError} = useQuery({
        queryKey: ['auditDetail', id],
        queryFn: () => auditService.getById(id),
        enabled: !!id,
    });

    const log = data?.data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-9 h-9 animate-spin text-gray-400"/>
            </div>
        );
    }

    if (isError || !log) {
        return (
            <div className="text-center py-20">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Audit Log Not Found</h2>
                <p className="text-sm text-gray-500 mb-4">The requested audit entry could not be loaded.</p>
                <Link
                    to="/admin/audit"
                    className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg"
                    style={{backgroundColor: 'var(--color-navy-deep)', color: '#fff'}}
                >
                    <ArrowLeft className="w-4 h-4"/>
                    Back to Audit Logs
                </Link>
            </div>
        );
    }

    const modelShort = log.auditable_type
        ? log.auditable_type.split('\\').pop()
        : '—';

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link
                    to="/admin/audit"
                    className="inline-flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                    <ClipboardList className="w-4 h-4"/>
                    Audit Trail
                </Link>
                <ChevronRight className="w-3.5 h-3.5"/>
                <span className="text-gray-800 font-medium">Entry #{log.id}</span>
            </nav>

            {/* Header card */}
            <div
                className="rounded-2xl p-6 text-white"
                style={{background: 'linear-gradient(135deg, var(--color-navy-deep), var(--color-navy-mid))'}}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-xs opacity-60">Audit #{log.id}</span>
                            <EventBadge event={log.event}/>
                        </div>
                        <h1 className="text-2xl font-bold">
                            {modelShort}
                            <span className="text-white/50 mx-2">·</span>
                            <span className="text-white/70 text-lg font-normal">ID {log.auditable_id}</span>
                        </h1>
                        <p className="text-white/60 text-sm mt-1">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                        </p>
                    </div>
                    <Link
                        to="/admin/audit"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors self-start"
                        style={{backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff'}}
                    >
                        <ArrowLeft className="w-4 h-4"/>
                        Back to list
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: metadata */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Who */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400"/>
                            Actor
                        </h3>
                        {log.user ? (
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                    style={{background: 'linear-gradient(135deg, var(--color-navy-deep), var(--color-navy-mid))'}}
                                >
                                    {log.user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{log.user.name}</p>
                                    <p className="text-xs text-gray-500">{log.user.email}</p>
                                    <p className="text-xs text-gray-400 font-mono">ID: {log.user.id}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">System action (no user)</p>
                        )}
                    </div>

                    {/* Context */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400"/>
                            Request Context
                        </h3>
                        <InfoRow icon={Layers} label="Model" value={`${log.auditable_type} (ID: ${log.auditable_id})`}/>
                        <InfoRow icon={Globe} label="IP Address" value={log.ip_address}/>
                        <InfoRow icon={Calendar} label="Timestamp"
                                 value={log.created_at ? new Date(log.created_at).toLocaleString() : null}/>
                        <InfoRow icon={Monitor} label="User Agent" value={log.user_agent}/>
                        {log.url && (
                            <InfoRow
                                icon={Globe}
                                label="URL"
                                value={
                                    <a
                                        href={log.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline break-all"
                                    >
                                        {log.url}
                                    </a>
                                }
                            />
                        )}
                    </div>
                </div>

                {/* Right: diff */}
                <div className="lg:col-span-2 space-y-4">
                    <DiffTable
                        title="⊖ Old Values (before)"
                        values={log.old_values}
                        color="#DC2626"
                        emptyText="No previous values — this was a creation event."
                    />
                    <DiffTable
                        title="⊕ New Values (after)"
                        values={log.new_values}
                        color="#059669"
                        emptyText="No new values — this was a deletion event."
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminAuditDetail;
