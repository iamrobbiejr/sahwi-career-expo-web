import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {conferenceCallsService} from '../../../services/api';
import {
    Plus,
    Search,
    Calendar,
    Video,
    Clock,
    ExternalLink,
    MoreVertical,
    Play,
    Square,
    XCircle,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle
} from 'lucide-react';
import {toast} from 'react-hot-toast';

const AdminMeetingList = () => {
    const [params, setParams] = useState({
        page: 1,
        search: '',
        status: '',
        platform: ''
    });

    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: ['adminMeetings', params],
        queryFn: () => conferenceCallsService.getAll(params),
    });

    const meetings = data?.data?.data || [];
    const pagination = data?.data || {}; // Adjust based on actual API response structure

    const handleStatusAction = async (id, action, reason = null) => {
        try {
            if (action === 'start') await conferenceCallsService.start(id);
            else if (action === 'end') await conferenceCallsService.end(id);
            else if (action === 'cancel') await conferenceCallsService.cancel(id, {reason});

            toast.success(`Meeting ${action}ed successfully`);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.error || `Failed to ${action} meeting`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this meeting configuration?')) {
            try {
                await conferenceCallsService.delete(id);
                toast.success('Meeting deleted successfully');
                refetch();
            } catch (err) {
                toast.error('Failed to delete meeting');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-700';
            case 'live':
                return 'bg-green-100 text-green-700 animate-pulse';
            case 'ended':
                return 'bg-gray-100 text-gray-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Virtual Meetings</h1>
                    <p className="text-gray-600">Manage conference calls for virtual events.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder="Search by event or host..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={params.search}
                        onChange={(e) => setParams(prev => ({...prev, search: e.target.value, page: 1}))}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        value={params.status}
                        onChange={(e) => setParams(prev => ({...prev, status: e.target.value, page: 1}))}
                    >
                        <option value="">All Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live</option>
                        <option value="ended">Ended</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        value={params.platform}
                        onChange={(e) => setParams(prev => ({...prev, platform: e.target.value, page: 1}))}
                    >
                        <option value="">All Platforms</option>
                        <option value="zoom">Zoom</option>
                        <option value="teams">Teams</option>
                        <option value="google_meet">Google Meet</option>
                        <option value="webex">Webex</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
            </div>

            {/* Meetings Grid/List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin"/>
                </div>
            ) : isError ? (
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2"/>
                    <p className="text-red-700 font-medium">Failed to load meetings. Please try again later.</p>
                </div>
            ) : meetings.length === 0 ? (
                <div className="bg-white py-12 rounded-xl border-2 border-dashed border-gray-200 text-center">
                    <Video className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                    <p className="text-gray-500 font-medium">No virtual meetings found.</p>
                    <p className="text-sm text-gray-400 mt-1">Create virtual events to set up meetings.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {meetings.map((meeting) => (
                        <div key={meeting.id}
                             className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(meeting.status)}`}>
                                        {meeting.status}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {meeting.platform === 'zoom' && <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Zoom_Video_Communications_logo.svg/512px-Zoom_Video_Communications_logo.svg.png"
                                            className="h-4 grayscale opacity-70" alt="Zoom"/>}
                                        <span
                                            className="text-xs font-medium text-gray-500 uppercase">{meeting.platform}</span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                                    {meeting.event?.name || 'Untitled Event'}
                                </h3>

                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2 text-primary-500"/>
                                        {new Date(meeting.scheduled_start).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-2 text-primary-500"/>
                                        {new Date(meeting.scheduled_start).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} -
                                        {new Date(meeting.scheduled_end).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Video className="w-4 h-4 mr-2 text-primary-500"/>
                                        ID: {meeting.meeting_id || 'N/A'}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {meeting.status === 'scheduled' && (
                                        <button
                                            onClick={() => handleStatusAction(meeting.id, 'start')}
                                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                                        >
                                            <Play className="w-4 h-4"/> Start
                                        </button>
                                    )}
                                    {meeting.status === 'live' && (
                                        <button
                                            onClick={() => handleStatusAction(meeting.id, 'end')}
                                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                                        >
                                            <Square className="w-4 h-4"/> End
                                        </button>
                                    )}
                                    {meeting.status === 'scheduled' && (
                                        <button
                                            onClick={() => {
                                                const reason = window.prompt('Reason for cancellation:');
                                                if (reason !== null) handleStatusAction(meeting.id, 'cancel', reason);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            <XCircle className="w-4 h-4"/> Cancel
                                        </button>
                                    )}

                                    <a
                                        href={meeting.meeting_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4"/> Join
                                    </a>
                                </div>
                            </div>

                            <div
                                className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700">
                                        {meeting.host_name ? meeting.host_name.charAt(0) : 'H'}
                                    </div>
                                    <span className="text-xs text-gray-600 truncate max-w-[150px]">
                    {meeting.host_name || meeting.host_email || 'No Host Info'}
                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Edit Meeting"
                                    >
                                        <Edit2 className="w-4 h-4"/>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(meeting.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete Meeting"
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminMeetingList;
