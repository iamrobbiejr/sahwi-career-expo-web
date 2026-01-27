import React, {useState} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {broadcastsService} from '../../../services/api';
import {toast} from 'react-hot-toast';
import {
    ChevronLeft,
    Send,
    XCircle,
    BarChart2,
    Clock,
    CheckCircle,
    AlertCircle,
    Users,
    Mail,
    Calendar,
    ExternalLink
} from 'lucide-react';
import {format} from 'date-fns';

const AdminBroadcastDetail = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [isActionLoading, setIsActionLoading] = useState(false);

    const {data: broadcastData, isLoading, refetch} = useQuery({
        queryKey: ['adminBroadcast', id],
        queryFn: () => broadcastsService.getById(id),
    });

    const {data: statsData} = useQuery({
        queryKey: ['adminBroadcastStats', id],
        queryFn: () => broadcastsService.getStatistics(id),
        enabled: !!id,
    });

    const broadcast = broadcastData?.data?.broadcast;
    const stats = statsData?.data;
    const overview = broadcastData?.data?.statistics;

    const handleSend = async () => {
        if (!window.confirm('Are you sure you want to send this broadcast now?')) return;

        setIsActionLoading(true);
        try {
            await broadcastsService.send(id);
            toast.success('Broadcast queued for sending');
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send broadcast');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this broadcast?')) return;

        setIsActionLoading(true);
        try {
            await broadcastsService.cancel(id);
            toast.success('Broadcast cancelled');
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to cancel broadcast');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!broadcast) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-gray-900">Broadcast not found</h2>
                <Link to="/admin/broadcasts" className="text-primary-600 hover:underline mt-2 inline-block">
                    Back to list
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/broadcasts')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6"/>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{broadcast.subject}</h1>
                        <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                ${broadcast.status === 'sent' ? 'bg-green-100 text-green-700' :
                  broadcast.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'}`}>
                {broadcast.status}
              </span>
                            <span className="text-gray-400 text-xs">•</span>
                            <span className="text-gray-500 text-xs">
                Created on {broadcast.created_at ? format(new Date(broadcast.created_at), 'MMM d, yyyy HH:mm') : 'N/A'}
              </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {broadcast.status === 'draft' && (
                        <>
                            <Link
                                to={`/admin/broadcasts/${id}/edit`}
                                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Edit Draft
                            </Link>
                            <button
                                onClick={handleSend}
                                disabled={isActionLoading}
                                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50"
                            >
                                <Send className="w-4 h-4"/>
                                Send Now
                            </button>
                        </>
                    )}
                    {['queued', 'processing'].includes(broadcast.status) && (
                        <button
                            onClick={handleCancel}
                            disabled={isActionLoading}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
                        >
                            <XCircle className="w-4 h-4"/>
                            Cancel Sending
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                        <Users className="w-5 h-5"/>
                        <span className="text-sm font-medium">Total Recipients</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{overview?.total_recipients || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2 text-green-500">
                        <CheckCircle className="w-5 h-5"/>
                        <span className="text-sm font-medium">Delivered</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{overview?.sent_count || 0}</div>
                    <div className="text-xs text-gray-400 mt-1">{overview?.success_rate || 0}% Success Rate</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2 text-blue-500">
                        <Mail className="w-5 h-5"/>
                        <span className="text-sm font-medium">Opened</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{overview?.opened_count || 0}</div>
                    <div className="text-xs text-gray-400 mt-1">{overview?.open_rate || 0}% Open Rate</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2 text-purple-500">
                        <ExternalLink className="w-5 h-5"/>
                        <span className="text-sm font-medium">Clicked</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{overview?.clicked_count || 0}</div>
                    <div className="text-xs text-gray-400 mt-1">{overview?.click_rate || 0}% Click Rate</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
                            Message Preview
                        </h3>
                        <div
                            className="prose max-w-none text-gray-800 p-4 bg-gray-50 rounded-xl min-h-[200px]"
                            dangerouslySetInnerHTML={{__html: broadcast.message}}
                        />
                    </div>

                    {/* Recipient Status Breakdown */}
                    {stats && stats.status_breakdown && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Delivery Status Breakdown</h3>
                            <div className="space-y-4">
                                {stats.status_breakdown.map((item) => (
                                    <div key={item.status} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="capitalize text-gray-600">{item.status}</span>
                                            <span className="font-medium">{item.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    item.status === 'sent' ? 'bg-green-500' :
                                                        item.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                                                }`}
                                                style={{width: `${broadcast.total_recipients > 0 ? (item.count / broadcast.total_recipients) * 100 : 0}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-gray-900">Campaign Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-gray-400 mt-0.5"/>
                                <div>
                                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Audience
                                    </div>
                                    <div
                                        className="text-sm text-gray-700 capitalize">{broadcast.audience_type?.replace('_', ' ')}</div>
                                    {broadcast.target_university && (
                                        <div
                                            className="text-xs text-primary-600 font-medium">{broadcast.target_university.name}</div>
                                    )}
                                    {broadcast.target_event && (
                                        <div
                                            className="text-xs text-primary-600 font-medium">{broadcast.target_event.title}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5"/>
                                <div>
                                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Scheduled
                                        For
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        {broadcast.scheduled_at ? format(new Date(broadcast.scheduled_at), 'MMM d, yyyy HH:mm') : 'Immediate'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5"/>
                                <div>
                                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">From</div>
                                    <div
                                        className="text-sm text-gray-700">{broadcast.from_name || 'System Default'}</div>
                                    <div
                                        className="text-xs text-gray-500">{broadcast.from_email || 'no-reply@sahwi.com'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-gray-900">Timeline</h3>
                        <div
                            className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            <div className="relative pl-8">
                                <div
                                    className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                                <div className="text-xs text-gray-400">Created</div>
                                <div
                                    className="text-sm text-gray-700 font-medium">{broadcast.created_at ? format(new Date(broadcast.created_at), 'MMM d, HH:mm') : 'N/A'}</div>
                            </div>
                            {broadcast.started_at && (
                                <div className="relative pl-8">
                                    <div
                                        className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                                    <div className="text-xs text-gray-400">Started Sending</div>
                                    <div
                                        className="text-sm text-gray-700 font-medium">{format(new Date(broadcast.started_at), 'MMM d, HH:mm')}</div>
                                </div>
                            )}
                            {broadcast.completed_at && (
                                <div className="relative pl-8">
                                    <div
                                        className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary-600 border-4 border-white shadow-sm"></div>
                                    <div className="text-xs text-gray-400">Completed</div>
                                    <div
                                        className="text-sm text-gray-700 font-medium">{format(new Date(broadcast.completed_at), 'MMM d, HH:mm')}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBroadcastDetail;
