import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {broadcastsService, universitiesService, eventsService} from '../../../services/api';
import {toast} from 'react-hot-toast';
import {
    ChevronLeft,
    Send,
    Users,
    Calendar,
    Building,
    Mail,
    Type,
    MessageSquare,
    Eye,
    Paperclip,
    X,
    Plus
} from 'lucide-react';

const AdminBroadcastCreate = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        audience_type: 'all_users',
        target_university_id: '',
        target_event_id: '',
        custom_user_ids: [],
        from_email: '',
        from_name: '',
        reply_to_email: '',
        scheduled_at: '',
        template: '',
        track_opens: true,
        track_clicks: true,
    });

    const [attachments, setAttachments] = useState([]);

    // Fetch universities for selection
    const {data: universitiesData} = useQuery({
        queryKey: ['universities'],
        queryFn: () => universitiesService.getAll(),
    });

    // Fetch events for selection
    const {data: eventsData} = useQuery({
        queryKey: ['adminEvents'],
        queryFn: () => eventsService.adminGetAll({per_page: 100}),
    });

    const universities = universitiesData?.data || [];
    const events = eventsData?.data?.data || [];

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handlePreviewRecipients = async () => {
        if (formData.audience_type === 'university_interested' && !formData.target_university_id) {
            toast.error('Please select a university');
            return;
        }
        if (formData.audience_type === 'event_registered' && !formData.target_event_id) {
            toast.error('Please select an event');
            return;
        }

        setIsPreviewLoading(true);
        try {
            const res = await broadcastsService.previewRecipients(formData);
            setPreviewData(res.data);
        } catch (err) {
            toast.error('Failed to preview recipients');
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    if (Array.isArray(formData[key])) {
                        formData[key].forEach((item, index) => {
                            data.append(`${key}[${index}]`, item);
                        });
                    } else {
                        data.append(key, formData[key]);
                    }
                }
            });

            attachments.forEach((file, index) => {
                data.append(`attachments[${index}]`, file);
            });

            await broadcastsService.create(data);
            toast.success('Broadcast created successfully');
            navigate('/admin/broadcasts');
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(err.response?.data?.error || 'Failed to create broadcast');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/broadcasts')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6"/>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Broadcast</h1>
                    <p className="text-gray-600">Compose and target your email campaign.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Content Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Type className="w-5 h-5 text-primary-600"/>
                            Content
                        </h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Email subject line"
                                value={formData.subject}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Message (HTML supported)</label>
                            <textarea
                                name="message"
                                required
                                rows="12"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                                placeholder="Write your message here..."
                                value={formData.message}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Attachments</label>
                            <div className="flex flex-wrap gap-2">
                                {attachments.map((file, index) => (
                                    <div key={index}
                                         className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                        <Paperclip className="w-4 h-4 text-gray-400"/>
                                        <span
                                            className="text-sm text-gray-600 truncate max-w-[150px]">{file.name}</span>
                                        <button type="button" onClick={() => removeAttachment(index)}
                                                className="text-gray-400 hover:text-red-500">
                                            <X className="w-4 h-4"/>
                                        </button>
                                    </div>
                                ))}
                                <label
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:text-primary-600 transition-colors">
                                    <Plus className="w-4 h-4"/>
                                    <span className="text-sm">Add File</span>
                                    <input type="file" multiple className="hidden" onChange={handleFileChange}/>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Sender Options */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary-600"/>
                            Sender Details (Optional)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">From Name</label>
                                <input
                                    type="text"
                                    name="from_name"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="e.g. Sahwi Team"
                                    value={formData.from_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">From Email</label>
                                <input
                                    type="email"
                                    name="from_email"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="e.g. no-reply@sahwi.com"
                                    value={formData.from_email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Reply-To Email</label>
                                <input
                                    type="email"
                                    name="reply_to_email"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="e.g. support@sahwi.com"
                                    value={formData.reply_to_email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Audience Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-600"/>
                            Audience
                        </h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Audience Type</label>
                            <select
                                name="audience_type"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                value={formData.audience_type}
                                onChange={handleChange}
                            >
                                <option value="all_users">All Users</option>
                                <option value="university_interested">University Interested</option>
                                <option value="event_registered">Event Registered</option>
                                <option value="custom">Custom (Select Users)</option>
                            </select>
                        </div>

                        {formData.audience_type === 'university_interested' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Select University</label>
                                <select
                                    name="target_university_id"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                    value={formData.target_university_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Select University</option>
                                    {universities.map(uni => (
                                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {formData.audience_type === 'event_registered' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Select Event</label>
                                <select
                                    name="target_event_id"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                    value={formData.target_event_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Event</option>
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.title || event.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handlePreviewRecipients}
                            disabled={isPreviewLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            {isPreviewLoading ? (
                                <div
                                    className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Eye className="w-4 h-4"/>
                            )}
                            Preview Recipients
                        </button>

                        {previewData && (
                            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                Estimated recipients: <strong>{previewData.recipient_count}</strong>
                            </div>
                        )}
                    </div>

                    {/* Scheduling & Tracking */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-600"/>
                            Options
                        </h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Schedule (Optional)</label>
                            <input
                                type="datetime-local"
                                name="scheduled_at"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.scheduled_at}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="track_opens"
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                    checked={formData.track_opens}
                                    onChange={handleChange}
                                />
                                <span className="text-sm text-gray-700">Track Email Opens</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="track_clicks"
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                    checked={formData.track_clicks}
                                    onChange={handleChange}
                                />
                                <span className="text-sm text-gray-700">Track Link Clicks</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Send className="w-5 h-5"/>
                            )}
                            Create Broadcast
                        </button>
                        <p className="text-xs text-center text-gray-500">
                            Broadcast will be saved as a draft. You can send it later.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminBroadcastCreate;
