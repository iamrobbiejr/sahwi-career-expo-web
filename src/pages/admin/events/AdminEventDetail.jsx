import React, {useState, useEffect} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';
import {eventsService, eventPanelsService, eventActivitiesService, conferenceCallsService} from '../../../services/api';
import {formatImageUrl} from '../../../utils/format';
import {toast} from 'react-hot-toast';
import {
    ChevronLeft,
    Edit2,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Clock,
    Info,
    Loader2,
    Plus,
    Trash2,
    X,
    Video,
    ExternalLink,
    Play,
    Square,
    XCircle
} from 'lucide-react';

const AdminEventDetail = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [meeting, setMeeting] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal States
    const [panelModal, setPanelModal] = useState({open: false, data: null});
    const [activityModal, setActivityModal] = useState({open: false, data: null});
    const [meetingModal, setMeetingModal] = useState({open: false, data: null});

    const fetchEvent = async () => {
        try {
            const response = await eventsService.adminGetById(id);
            setEvent(response.data.data);

            // Fetch meeting if virtual
            if (response.data.data.venue === 'Virtual' || response.data.data.location === 'Virtual') {
                const meetingRes = await conferenceCallsService.getAll({event_id: id});
                if (meetingRes.data.data && meetingRes.data.data.length > 0) {
                    setMeeting(meetingRes.data.data[0]);
                } else {
                    setMeeting(null);
                }
            }
        } catch (err) {
            toast.error('Failed to fetch event details');
            navigate('/admin/events');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id, navigate]);

    const handleMeetingSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.event_id = id;

        try {
            if (meeting?.id) {
                await conferenceCallsService.update(meeting.id, data);
                toast.success('Meeting updated successfully');
            } else {
                await conferenceCallsService.create(data);
                toast.success('Meeting created successfully');
            }
            setMeetingModal({open: false, data: null});
            fetchEvent();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save meeting');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMeetingAction = async (action, reason = null) => {
        try {
            if (action === 'start') await conferenceCallsService.start(meeting.id);
            else if (action === 'end') await conferenceCallsService.end(meeting.id);
            else if (action === 'cancel') await conferenceCallsService.cancel(meeting.id, {reason});

            toast.success(`Meeting ${action}ed successfully`);
            fetchEvent();
        } catch (err) {
            toast.error(err.response?.data?.error || `Failed to ${action} meeting`);
        }
    };

    const handlePanelSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.event_id = id;

        // Set display order for panels
        if (!panelModal.data) {
            data.display_order = event.panels?.length || 0;
        } else {
            data.display_order = panelModal.data.display_order;
        }

        try {
            if (panelModal.data?.id) {
                await eventPanelsService.update(panelModal.data.id, data);
                toast.success('Panelist updated successfully');
            } else {
                await eventPanelsService.create(data);
                toast.success('Panelist added successfully');
            }
            setPanelModal({open: false, data: null});
            fetchEvent();
        } catch (err) {
            toast.error('Failed to save panelist');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePanel = async (panelId) => {
        if (window.confirm('Are you sure you want to remove this panelist?')) {
            try {
                await eventPanelsService.delete(panelId);
                toast.success('Panelist removed');
                fetchEvent();
            } catch (err) {
                toast.error('Failed to remove panelist');
            }
        }
    };

    const handleActivitySubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.event_id = id;

        try {
            if (activityModal.data?.id) {
                await eventActivitiesService.update(activityModal.data.id, data);
                toast.success('Activity updated successfully');
            } else {
                await eventActivitiesService.create(data);
                toast.success('Activity created successfully');
            }
            setActivityModal({open: false, data: null});
            fetchEvent();
        } catch (err) {
            toast.error('Failed to save activity');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            try {
                await eventActivitiesService.delete(activityId);
                toast.success('Activity deleted');
                fetchEvent();
            } catch (err) {
                toast.error('Failed to delete activity');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin"/>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/events')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-600"/>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                ${event.status === 'published' ? 'bg-green-100 text-green-800' :
                  event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'}`}
              >
                {event.status}
              </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">Created by {event.creator?.name || 'System'}</span>
                        </div>
                    </div>
                </div>
                <Link
                    to={`/admin/events/${id}/edit`}
                    className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <Edit2 className="w-4 h-4"/>
                    <span>Edit Event</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {(event.img || event.banner) && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <img
                                src={formatImageUrl(event.img || event.banner)}
                                alt={event.name}
                                className="w-full h-64 object-cover"
                            />
                        </div>
                    )}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
                        <div className="prose max-w-none text-gray-600">
                            {event.description}
                        </div>
                    </div>

                    {/* Virtual Meeting Section */}
                    {(event.venue === 'Virtual' || event.location === 'Virtual') && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Video className="w-5 h-5 text-accent-600"/>
                                    Virtual Meeting Room
                                </h2>
                                {!meeting && (
                                    <button
                                        onClick={() => setMeetingModal({open: true, data: null})}
                                        className="text-sm font-medium text-accent-600 hover:text-accent-700 flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4"/>
                                        Setup Meeting
                                    </button>
                                )}
                            </div>

                            {meeting ? (
                                <div className="bg-accent-50 rounded-xl border border-accent-100 overflow-hidden">
                                    <div
                                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                meeting.status === 'live' ? 'bg-green-100 text-green-700 animate-pulse' :
                                    meeting.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {meeting.status}
                        </span>
                                                <span
                                                    className="text-xs font-medium text-gray-500 uppercase">{meeting.platform}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">ID: {meeting.meeting_id || 'N/A'}</p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {new Date(meeting.scheduled_start).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {meeting.status === 'scheduled' && (
                                                <button
                                                    onClick={() => handleMeetingAction('start')}
                                                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                                                >
                                                    <Play className="w-3.5 h-3.5"/> Start
                                                </button>
                                            )}
                                            {meeting.status === 'live' && (
                                                <button
                                                    onClick={() => handleMeetingAction('end')}
                                                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                                                >
                                                    <Square className="w-3.5 h-3.5"/> End
                                                </button>
                                            )}
                                            <a
                                                href={meeting.meeting_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5"/> Join
                                            </a>
                                            <button
                                                onClick={() => setMeetingModal({open: true, data: meeting})}
                                                className="p-1.5 text-gray-400 hover:text-blue-600"
                                            >
                                                <Edit2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-sm text-gray-500">No meeting room has been configured for this
                                        virtual event.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Panels & Activities */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-600"/>
                                Event Panels
                            </h2>
                            <button
                                onClick={() => setPanelModal({open: true, data: null})}
                                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4"/>
                                Add Panelist
                            </button>
                        </div>
                        {event.panels && event.panels.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {event.panels.map((panel) => (
                                    <div key={panel.id}
                                         className="p-4 bg-gray-50 rounded-lg border border-gray-200 group relative">
                                        <div
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            <button
                                                onClick={() => setPanelModal({open: true, data: panel})}
                                                className="p-1 text-gray-400 hover:text-blue-600"
                                            >
                                                <Edit2 className="w-3.5 h-3.5"/>
                                            </button>
                                            <button
                                                onClick={() => handleDeletePanel(panel.id)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-3.5 h-3.5"/>
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-gray-900">{panel.external_full_name}</h3>
                                        <p className="text-sm font-medium text-primary-600">{panel.panel_role}</p>
                                        <p className="text-sm text-gray-600 mt-1">{panel.organization}</p>
                                        {panel.external_contact && (
                                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                <Info className="w-3 h-3"/>
                                                {panel.external_contact}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-100 rounded-lg">
                                No panelists added yet.
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-600"/>
                                Event Activities
                            </h2>
                            <button
                                onClick={() => setActivityModal({open: true, data: null})}
                                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4"/>
                                Add Activity
                            </button>
                        </div>
                        {event.activities && event.activities.length > 0 ? (
                            <div className="space-y-4">
                                {event.activities.map((activity) => (
                                    <div key={activity.id}
                                         className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 group relative">
                                        <div
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            <button
                                                onClick={() => setActivityModal({open: true, data: activity})}
                                                className="p-1 text-gray-400 hover:text-blue-600"
                                            >
                                                <Edit2 className="w-3.5 h-3.5"/>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteActivity(activity.id)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-3.5 h-3.5"/>
                                            </button>
                                        </div>
                                        <div
                                            className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                                            <Clock className="w-6 h-6"/>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900">{activity.title}</h3>
                                                <span
                                                    className="px-2 py-0.5 bg-primary-200 text-primary-800 text-[10px] font-bold uppercase rounded">
                          {activity.type}
                        </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-100 rounded-lg">
                                No activities scheduled yet.
                            </p>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Event Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-primary-600 mt-0.5"/>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Date & Time</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(event.start_date).toLocaleString()} - <br/>
                                        {new Date(event.end_date).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary-600 mt-0.5"/>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Location</p>
                                    <p className="text-sm text-gray-600">{event.venue}</p>
                                    <p className="text-sm text-gray-500">{event.location}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-primary-600 mt-0.5"/>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Capacity</p>
                                    <p className="text-sm text-gray-600">{event.capacity || 'Unlimited'} seats</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <DollarSign className="w-5 h-5 text-primary-600 mt-0.5"/>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Pricing</p>
                                    <p className="text-sm text-gray-600">
                                        {event.is_paid ? `$${event.price_cents ? event.price_cents / 100 : event.price || 0} ${event.currency || 'USD'}` : 'Free'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary-50 rounded-xl p-6 border border-primary-100 text-primary-900">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-5 h-5"/>
                            <h3 className="font-semibold">Admin Note</h3>
                        </div>
                        <p className="text-sm">
                            This event is currently in <strong>{event.status}</strong> status.
                            {event.status === 'draft' && ' It is not visible to the public.'}
                            {event.status === 'published' && ' It is live and accepting registrations.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Panel Modal */}
            {panelModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {panelModal.data ? 'Edit Panelist' : 'Add Panelist'}
                            </h3>
                            <button onClick={() => setPanelModal({open: false, data: null})}
                                    className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        <form onSubmit={handlePanelSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="external_full_name"
                                    required
                                    defaultValue={panelModal.data?.external_full_name}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
                                <input
                                    type="text"
                                    name="panel_role"
                                    required
                                    defaultValue={panelModal.data?.panel_role}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. Keynote Speaker"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                                <input
                                    type="text"
                                    name="organization"
                                    required
                                    defaultValue={panelModal.data?.organization}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. Tech University"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info
                                    (Optional)</label>
                                <input
                                    type="text"
                                    name="external_contact"
                                    defaultValue={panelModal.data?.external_contact}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. email or linkedin"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setPanelModal({open: false, data: null})}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Panelist'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Activity Modal */}
            {activityModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {activityModal.data ? 'Edit Activity' : 'Add Activity'}
                            </h3>
                            <button onClick={() => setActivityModal({open: false, data: null})}
                                    className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        <form onSubmit={handleActivitySubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    defaultValue={activityModal.data?.title}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. Opening Keynote"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    name="type"
                                    required
                                    defaultValue={activityModal.data?.type || 'workshop'}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                >
                                    <option value="workshop">Workshop</option>
                                    <option value="seminar">Seminar</option>
                                    <option value="networking">Networking</option>
                                    <option value="presentation">Presentation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    defaultValue={activityModal.data?.description}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Briefly describe what happens during this activity..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setActivityModal({open: false, data: null})}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Activity'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Meeting Modal */}
            {meetingModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
                        <div
                            className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-accent-600 text-white">
                            <h3 className="font-bold">{meetingModal.data ? 'Edit Virtual Meeting' : 'Setup Virtual Meeting'}</h3>
                            <button onClick={() => setMeetingModal({open: false, data: null})}
                                    className="hover:bg-white/20 p-1 rounded-lg">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        <form onSubmit={handleMeetingSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                                    <select
                                        name="platform"
                                        defaultValue={meetingModal.data?.platform || 'zoom'}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                                    >
                                        <option value="zoom">Zoom</option>
                                        <option value="teams">Microsoft Teams</option>
                                        <option value="google_meet">Google Meet</option>
                                        <option value="webex">Cisco Webex</option>
                                        <option value="custom">Custom Platform</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting ID
                                        (Optional)</label>
                                    <input
                                        type="text"
                                        name="meeting_id"
                                        defaultValue={meetingModal.data?.meeting_id || ''}
                                        placeholder="e.g. 123 456 789"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting URL</label>
                                <input
                                    type="url"
                                    name="meeting_url"
                                    defaultValue={meetingModal.data?.meeting_url || ''}
                                    required
                                    placeholder="https://zoom.us/j/..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passcode
                                        (Optional)</label>
                                    <input
                                        type="text"
                                        name="passcode"
                                        defaultValue={meetingModal.data?.passcode || ''}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max
                                        Participants</label>
                                    <input
                                        type="number"
                                        name="max_participants"
                                        defaultValue={meetingModal.data?.max_participants || event.capacity || ''}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Host Name</label>
                                    <input
                                        type="text"
                                        name="host_name"
                                        defaultValue={meetingModal.data?.host_name || event.creator?.name || ''}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration
                                        (minutes)</label>
                                    <input
                                        type="number"
                                        name="duration_minutes"
                                        defaultValue={meetingModal.data?.duration_minutes || 60}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled
                                        Start</label>
                                    <input
                                        type="datetime-local"
                                        name="scheduled_start"
                                        defaultValue={meetingModal.data?.scheduled_start ? new Date(meetingModal.data.scheduled_start).toISOString().slice(0, 16) : event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : ''}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled
                                        End</label>
                                    <input
                                        type="datetime-local"
                                        name="scheduled_end"
                                        defaultValue={meetingModal.data?.scheduled_end ? new Date(meetingModal.data.scheduled_end).toISOString().slice(0, 16) : event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : ''}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions
                                    (Optional)</label>
                                <textarea
                                    name="instructions"
                                    defaultValue={meetingModal.data?.instructions || ''}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                                    placeholder="Additional instructions for participants..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setMeetingModal({open: false, data: null})}
                                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 font-bold disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Meeting'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventDetail;
