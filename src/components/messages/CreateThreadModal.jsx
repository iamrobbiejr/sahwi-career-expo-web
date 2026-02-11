import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {eventsService, threadsService, usersService} from '../../services/api';
import {useAuthStore} from '../../store';
import {Calendar, Check, Loader2, Search, User, X} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateThreadModal = ({isOpen, onClose, onThreadCreated}) => {
    const {user: currentUser, hasRole} = useAuthStore();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [threadType, setThreadType] = useState('direct');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    // Event Channel State
    const [eventSearchQuery, setEventSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);

    const {data: usersData, isLoading: isLoadingUsers} = useQuery({
        queryKey: ['users', searchQuery],
        queryFn: () => usersService.searchUser({search: searchQuery}),
        enabled: isOpen && searchQuery.length > 2 && threadType !== 'event_channel',
    });

    const {data: eventsData, isLoading: isLoadingEvents} = useQuery({
        queryKey: ['events', eventSearchQuery],
        queryFn: () => eventsService.getAll({search: eventSearchQuery}),
        enabled: isOpen && threadType === 'event_channel',
    });

    const events = eventsData?.data?.data || eventsData?.data || [];
    const users = usersData?.data?.data || [];

    const createThreadMutation = useMutation({
        mutationFn: (data) => threadsService.create(data),
        onSuccess: (response) => {
            const threadId = response.data?.data?.id || response.data?.id;
            toast.success('Conversation created');
            queryClient.invalidateQueries({queryKey: ['threads']});
            onThreadCreated(threadId);
            onClose();
            // Reset form
            setTitle('');
            setThreadType('direct');
            setSelectedMembers([]);
            setSearchQuery('');
            setSelectedEvent(null);
            setEventSearchQuery('');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create conversation');
        }
    });

    if (!isOpen) return null;

    const handleToggleMember = (user) => {
        if (selectedMembers.find(m => m.id === user.id)) {
            setSelectedMembers(selectedMembers.filter(m => m.id !== user.id));
        } else {
            setSelectedMembers([...selectedMembers, user]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedMembers.length === 0 && threadType !== 'event_channel') {
            toast.error('Please select at least one member');
            return;
        }
        if (threadType === 'event_channel' && !selectedEvent) {
            toast.error('Please select an event');
            return;
        }
        if (threadType !== 'direct' && !title) {
            toast.error('Please enter a title');
            return;
        }

        createThreadMutation.mutate({
            title: threadType === 'direct' ? null : title,
            thread_type: threadType,
            member_ids: threadType === 'event_channel' ? [] : selectedMembers.map(m => m.id),
            event_id: threadType === 'event_channel' ? selectedEvent.id : null,
        });
    };

    // Role checks
    const canCreateGroup = !hasRole('student');
    const canCreateForum = hasRole('admin');
    const canCreateEventChannel = hasRole('admin') || hasRole('professional') || hasRole('university');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">New Conversation</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
                    {/* Thread Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Conversation Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setThreadType('direct')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${threadType === 'direct'
                                    ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200'
                                }`}
                            >
                                Direct Message
                            </button>
                            <button
                                type="button"
                                disabled={!canCreateGroup}
                                onClick={() => setThreadType('group')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${threadType === 'group'
                                    ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                                title={!canCreateGroup ? "Students cannot create groups" : ""}
                            >
                                Group Chat
                            </button>
                            <button
                                type="button"
                                disabled={!canCreateForum}
                                onClick={() => setThreadType('forum')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${threadType === 'forum'
                                    ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                                title={!canCreateForum ? "Students cannot create forums" : ""}
                            >
                                Forum
                            </button>
                            <button
                                type="button"
                                disabled={!canCreateEventChannel}
                                onClick={() => setThreadType('event_channel')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${threadType === 'event_channel'
                                    ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                                title={!canCreateEventChannel ? "Only admins and event creators can create event channels" : ""}
                            >
                                Event Channel
                            </button>
                        </div>
                    </div>

                    {/* Title (for non-direct) */}
                    {threadType !== 'direct' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={`Enter ${threadType.replace('_', ' ')} title...`}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>
                    )}

                    {/* Event Selection */}
                    {threadType === 'event_channel' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Select Event</label>

                            {selectedEvent ? (
                                <div
                                    className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary-600 shadow-sm">
                                            <Calendar className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{selectedEvent.name}</div>
                                            <div className="text-xs text-primary-700">
                                                {new Date(selectedEvent.start_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedEvent(null)}
                                        className="p-1 hover:bg-primary-100 rounded-full text-primary-600"
                                    >
                                        <X className="w-4 h-4"/>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Search
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                                        <input
                                            type="text"
                                            value={eventSearchQuery}
                                            onChange={(e) => setEventSearchQuery(e.target.value)}
                                            placeholder="Search events..."
                                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>

                                    <div className="mt-2 border border-gray-100 rounded-lg max-h-48 overflow-y-auto">
                                        {isLoadingEvents ? (
                                            <div className="p-4 text-center">
                                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary-500"/>
                                            </div>
                                        ) : events.length > 0 ? (
                                            events.map(event => (
                                                <button
                                                    key={event.id}
                                                    type="button"
                                                    onClick={() => setSelectedEvent(event)}
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                            {event.img ? (
                                                                <img src={event.img} alt=""
                                                                     className="w-full h-full object-cover rounded-lg"/>
                                                            ) : (
                                                                <Calendar className="w-4 h-4 text-gray-400"/>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div
                                                                className="text-sm font-medium text-gray-900 line-clamp-1">{event.name}</div>
                                                            <div
                                                                className="text-xs text-gray-500">{new Date(event.start_date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-gray-500">No events found</div>
                                        )}
                                    </div>
                                </>
                            )}

                            <p className="text-xs text-gray-500 flex items-start gap-1 mt-2">
                                <span className="text-primary-600 font-bold">*</span>
                                Note: All registered attendees for this event will be automatically added to this
                                channel.
                            </p>
                        </div>
                    )}

                    {/* Member Selection - Only for non-event channels */}
                    {threadType !== 'event_channel' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Add Members</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search users by name or email..."
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Selected Members Chips */}
                            {selectedMembers.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {selectedMembers.map(member => (
                                        <span key={member.id}
                                              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-medium">
                                            {member.name || member.display_name}
                                            <button type="button" onClick={() => handleToggleMember(member)}
                                                className="hover:text-primary-900">
                                                <X className="w-3 h-3"/>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Search Results */}
                            <div className="mt-2 border border-gray-100 rounded-lg max-h-48 overflow-y-auto">
                                {isLoadingUsers ? (
                                    <div className="p-4 text-center">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary-500"/>
                                    </div>
                                ) : users.length > 0 ? (
                                    users.filter(u => u.id !== currentUser?.id).map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => handleToggleMember(user)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt=""
                                                             className="w-full h-full object-cover"/>
                                                    ) : (
                                                        <User className="w-4 h-4 text-gray-400"/>
                                                    )}
                                                </div>
                                                <div>
                                                    <div
                                                        className="text-sm font-medium text-gray-900">{user.display_name || user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                            {selectedMembers.find(m => m.id === user.id) && (
                                                <Check className="w-4 h-4 text-primary-600"/>
                                            )}
                                        </button>
                                    ))
                                ) : searchQuery.length > 2 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">No users found</div>
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500 italic">Type at least 3
                                        characters
                                        to search</div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createThreadMutation.isPending || (threadType === 'direct' ? selectedMembers.length === 0 : (threadType === 'event_channel' ? (!selectedEvent || !title) : (selectedMembers.length === 0 || !title)))}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                        >
                            {createThreadMutation.isPending && <Loader2 className="w-4 h-4 animate-spin"/>}
                            Create {threadType !== 'direct' ? threadType.replace('_', ' ') : ''}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateThreadModal;
