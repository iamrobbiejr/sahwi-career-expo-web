import React, {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {eventsService, conferenceCallsService} from '../services/api';
import {useAuthStore} from '../store';
import {formatImageUrl} from '../utils/format';
import {
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Clock,
    ChevronLeft,
    Loader2,
    CheckCircle2,
    Info,
    Video,
    Lock,
    ExternalLink,
    Copy,
    Ticket
} from 'lucide-react';
import {toast} from 'react-hot-toast';
import RegistrationModal from '../components/events/RegistrationModal';

const EventDetailPage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const {isAuthenticated} = useAuthStore();
    const [isRegistering, setIsRegistering] = useState(false);
    const [showRegModal, setShowRegModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [recentRegistration, setRecentRegistration] = useState(null);

    const {data, isLoading, isError, refetch: refetchEvent} = useQuery({
        queryKey: ['event', id],
        queryFn: () => eventsService.getById(id),
    });

    const event = data?.data?.data;

    const {data: meetingData, isLoading: isLoadingMeeting} = useQuery({
        queryKey: ['eventMeeting', id],
        queryFn: () => conferenceCallsService.getAll({event_id: id}),
        enabled: !!event && (event.venue === 'Virtual' || event.location === 'Virtual'),
    });

    const meeting = meetingData?.data?.data?.[0];

    const handleRegister = () => {
        if (!isAuthenticated) {
            toast.error('Please login to register for this event');
            navigate('/login', {state: {from: `/events/${id}`}});
            return;
        }
        setShowRegModal(true);
    };

    const handleRegistrationSuccess = (registration) => {
        setRecentRegistration(registration);
        setShowSuccessModal(true);
        refetchEvent();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin"/>
            </div>
        );
    }

    if (isError || !event) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
                <p className="text-gray-600 mt-2">The event you are looking for does not exist or has been removed.</p>
                <button
                    onClick={() => navigate('/events')}
                    className="mt-6 inline-flex items-center text-primary-600 font-semibold hover:text-primary-700"
                >
                    <ChevronLeft className="w-5 h-5 mr-1"/>
                    Back to Events
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate('/events')}
                className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 mr-1"/>
                Back to Events
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header & Banner */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="relative h-64 md:h-96">
                            <img
                                src={formatImageUrl(event.img || event.banner) || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
                                alt={event.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-6 left-6">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg
                  ${event.is_paid ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {event.is_paid ? 'Paid Event' : 'Free Event'}
                </span>
                            </div>
                        </div>
                        <div className="p-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{event.name}</h1>
                            <div className="mt-6 prose max-w-none text-gray-600 leading-relaxed">
                                {event.description}
                            </div>
                        </div>
                    </div>

                    {/* Panels */}
                    {event.panels && event.panels.length > 0 && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Users className="w-6 h-6 text-primary-600"/>
                                Featured Panelists
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {event.panels.map((panel) => (
                                    <div key={panel.id}
                                         className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div
                                            className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                            {panel.external_full_name ? panel.external_full_name.charAt(0) : '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{panel.external_full_name}</h3>
                                            <p className="text-sm font-medium text-primary-600">{panel.panel_role}</p>
                                            <p className="text-sm text-gray-500 mt-1">{panel.organization}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Activities */}
                    {event.activities && event.activities.length > 0 && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-primary-600"/>
                                Event Schedule
                            </h2>
                            <div className="space-y-6">
                                {event.activities.map((activity) => (
                                    <div key={activity.id}
                                         className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100 last:before:hidden">
                                        <div
                                            className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary-50 border-2 border-primary-500 flex items-center justify-center z-10">
                                            <div className="w-2 h-2 rounded-full bg-primary-500"/>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                            className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-bold uppercase rounded">
                          {activity.type}
                        </span>
                                                <h3 className="font-bold text-gray-900">{activity.title}</h3>
                                            </div>
                                            <p className="text-gray-600 text-sm">{activity.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Virtual Meeting Details */}
                    {(event.venue === 'Virtual' || event.location === 'Virtual') && meeting && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Video className="w-6 h-6 text-accent-600"/>
                                Virtual Meeting Room
                            </h2>

                            {!event.is_registered ? (
                                <div className="bg-accent-50 rounded-2xl p-8 text-center border border-accent-100">
                                    <Lock className="w-12 h-12 text-accent-400 mx-auto mb-4"/>
                                    <h3 className="text-lg font-bold text-gray-900">Meeting details are locked</h3>
                                    <p className="text-gray-600 mt-2 max-w-sm mx-auto">
                                        Please register for this event to access the virtual meeting link and
                                        credentials.
                                    </p>
                                    <button
                                        onClick={handleRegister}
                                        className="mt-6 px-8 py-3 bg-accent-600 text-white rounded-xl font-bold hover:bg-accent-700 transition-all shadow-lg shadow-accent-100"
                                    >
                                        Register to Unlock
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                                        <div
                                            className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                              meeting.status === 'live' ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {meeting.status}
                          </span>
                                                    <span
                                                        className="text-sm font-medium text-gray-500 uppercase">{meeting.platform} Meeting</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">The meeting is
                                                    ready</h3>
                                            </div>
                                            <a
                                                href={meeting.meeting_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 bg-accent-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-accent-700 transition-all shadow-lg shadow-accent-100"
                                            >
                                                <ExternalLink className="w-5 h-5"/>
                                                Join Meeting Now
                                            </a>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Meeting
                                                ID</p>
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-gray-900">{meeting.meeting_id || 'N/A'}</p>
                                                {meeting.meeting_id && (
                                                    <button onClick={() => {
                                                        navigator.clipboard.writeText(meeting.meeting_id);
                                                        toast.success('ID copied');
                                                    }} className="text-accent-600 hover:text-accent-700">
                                                        <Copy className="w-4 h-4"/>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Passcode</p>
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-gray-900">{meeting.passcode || 'N/A'}</p>
                                                {meeting.passcode && (
                                                    <button onClick={() => {
                                                        navigator.clipboard.writeText(meeting.passcode);
                                                        toast.success('Passcode copied');
                                                    }} className="text-accent-600 hover:text-accent-700">
                                                        <Copy className="w-4 h-4"/>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {meeting.instructions && (
                                        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex gap-3">
                                            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"/>
                                            <div>
                                                <p className="text-sm font-bold text-blue-900 mb-1">Instructions</p>
                                                <p className="text-sm text-blue-800">{meeting.instructions}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Registration Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Event Information</h3>

                        <div className="space-y-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-blue-600"/>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date &
                                        Time</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                        {new Date(event.start_date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {new Date(event.start_date).toLocaleTimeString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} -
                                        {new Date(event.end_date).toLocaleTimeString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <MapPin className="w-5 h-5 text-purple-600"/>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Location</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.venue}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">{event.location}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Users className="w-5 h-5 text-green-600"/>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Capacity</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                        {event.capacity ? `${event.capacity} Spots Available` : 'Open to All'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-amber-600"/>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Registration
                                        Fee</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                        {event.is_paid ? `$${(event.price_cents || 0) / 100} ${event.currency || 'USD'}` : 'Free'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <Clock className="w-5 h-5 text-red-600"/>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Deadline</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5 text-red-600">
                                        {event.registration_deadline ? new Date(event.registration_deadline).toLocaleDateString(undefined, {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={isRegistering || event.is_registered}
                            className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                                event.is_registered
                                    ? 'bg-green-500 text-white cursor-default'
                                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200'
                            }`}
                        >
                            {isRegistering ? (
                                <Loader2 className="w-5 h-5 animate-spin"/>
                            ) : event.is_registered ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5"/>
                                    Registered
                                </>
                            ) : (
                                'Register for Event'
                            )}
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-4">
                            By registering, you agree to our terms and conditions.
                        </p>
                    </div>

                    <div className="bg-primary-50 rounded-3xl p-8 border border-primary-100">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="w-6 h-6 text-primary-600"/>
                            <h4 className="font-bold text-gray-900">Why Attend?</h4>
                        </div>
                        <ul className="space-y-3">
                            {[
                                'Network with industry professionals',
                                'Learn about career opportunities',
                                'Gain insights from expert panelists',
                                'Participate in hands-on workshops'
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0"/>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            {/* Registration Modal */}
            {showRegModal && (
                <RegistrationModal
                    event={event}
                    onClose={() => setShowRegModal(false)}
                    onShowSuccess={handleRegistrationSuccess}
                />
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
                        <div
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600"/>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                        <p className="text-gray-600 mb-8">
                            You have successfully registered for <strong>{event.name}</strong>.
                            {event.is_paid ? ' Your ticket will be issued once payment is confirmed.' : ' Your ticket is now available in your dashboard.'}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/my-registrations')}
                                className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
                            >
                                View My Registrations
                            </button>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetailPage;
