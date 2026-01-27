import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {eventsService, fileService} from '../../../services/api';
import {toast} from 'react-hot-toast';
import {
    ChevronLeft,
    Upload,
    Image as ImageIcon,
    Calendar,
    MapPin,
    DollarSign,
    Users,
    Clock,
    Plus,
    Trash2
} from 'lucide-react';

const AdminEventCreate = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        venue: '',
        location: '',
        location_type: 'in-person',
        status: 'draft',
        is_paid: false,
        capacity: '',
        price: 25.00,
        currency: 'USD',
        registration_deadline: '',
        image: null,
    });

    const [panels, setPanels] = useState([]);
    const [activities, setActivities] = useState([]);

    const addPanel = () => {
        setPanels([...panels, {
            external_full_name: '',
            organization: '',
            panel_role: '',
            external_contact: '',
            display_order: panels.length
        }]);
    };

    const removePanel = (index) => {
        setPanels(panels.filter((_, i) => i !== index));
    };

    const updatePanel = (index, field, value) => {
        const newPanels = [...panels];
        newPanels[index][field] = value;
        setPanels(newPanels);
    };

    const addActivity = () => {
        setActivities([...activities, {type: '', title: '', description: ''}]);
    };

    const removeActivity = (index) => {
        setActivities(activities.filter((_, i) => i !== index));
    };

    const updateActivity = (index, field, value) => {
        const newActivities = [...activities];
        newActivities[index][field] = value;
        setActivities(newActivities);
    };

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setFormData(prev => ({...prev, image: file}));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let bannerUrl = null;
            if (formData.image) {
                const uploadRes = await fileService.uploadEventBanner(formData.image);
                bannerUrl = uploadRes.data.url;
            }

            const submitData = {
                ...formData,
                venue: formData.location_type === 'virtual' ? 'Virtual' : formData.venue,
                img: bannerUrl,
                banner: bannerUrl,
                panels,
                activities
            };

            // Filter out empty values and format numbers
            const cleanData = {};
            Object.keys(submitData).forEach(key => {
                if (submitData[key] !== null && submitData[key] !== '' && key !== 'image' && key !== 'location_type') {
                    cleanData[key] = submitData[key];
                }
            });

            // Convert price to price_cents if needed, but the model says price_cents
            // Let's check how the backend handles 'price' vs 'price_cents'
            // Based on model: 'price_cents' => 'integer'
            if (cleanData.is_paid && cleanData.price) {
                cleanData.price_cents = Math.round(parseFloat(cleanData.price) * 100);
                delete cleanData.price;
            }

            await eventsService.bulkStore(cleanData);
            toast.success('Event created successfully');
            navigate('/admin/events');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create event');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/events')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600"/>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
                    <p className="text-gray-600">Set up a new education fair or event</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Image Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ImageIcon className="w-5 h-5 text-purple-600"/>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Event Image</h2>
                            <p className="text-sm text-gray-600">Upload an attractive image to represent your event</p>
                        </div>
                    </div>

                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                        {imagePreview ? (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Event preview"
                                    className="max-h-64 mx-auto rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setFormData(prev => ({...prev, image: null}));
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto"/>
                                <div>
                                    <p className="text-gray-700 font-medium">Upload Event Image</p>
                                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <label
                        className="mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4"/>
                        <span className="text-sm font-medium">Choose Image</span>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Basic Information Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="border-l-4 border-blue-500 pl-4 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                        <p className="text-sm text-gray-600">Essential details about your event</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., Harare University Fair 2024"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                required
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                placeholder="Describe your event, its purpose, and what attendees can expect..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Published</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Date & Time Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="border-l-4 border-purple-500 pl-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600"/>
                            <h2 className="text-lg font-semibold text-gray-900">Date & Time</h2>
                        </div>
                        <p className="text-sm text-gray-600">When will your event take place?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date & Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="start_date"
                                required
                                value={formData.start_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date & Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="end_date"
                                required
                                value={formData.end_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Location & Capacity Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 pl-4 py-3 mb-6 rounded">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-yellow-600"/>
                            <h2 className="text-lg font-semibold text-gray-900">Location & Capacity</h2>
                        </div>
                        <p className="text-sm text-gray-700">How will your event be hosted?</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Location <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="location_type"
                                        value="in-person"
                                        checked={formData.location_type === 'in-person'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">In-Person Event</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="location_type"
                                        value="virtual"
                                        checked={formData.location_type === 'virtual'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Virtual Event</span>
                                </label>
                            </div>
                        </div>

                        {formData.location_type === 'virtual' && (
                            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200 flex items-start gap-3">
                                <svg className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" fill="none"
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                </svg>
                                <div>
                                    <p className="font-medium text-cyan-900">Virtual Event Setup</p>
                                    <p className="text-sm text-cyan-700">
                                        After creating this event, you can set up virtual meeting rooms on the <span
                                        className="font-semibold">Meetings Page</span>.
                                    </p>
                                </div>
                            </div>
                        )}

                        {formData.location_type === 'in-person' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Venue <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="venue"
                                    required
                                    value={formData.venue}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none"
                                    placeholder="e.g., Harare International Conference Centre"
                                />
                            </div>
                        )}


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximum Capacity <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Users
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                <input
                                    type="number"
                                    name="capacity"
                                    required
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none"
                                    placeholder="100"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Maximum number of students who can attend</p>
                        </div>
                    </div>
                </div>

                {/* Event Pricing Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="bg-purple-50 border-l-4 border-purple-500 pl-4 py-3 mb-6 rounded">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-purple-600"/>
                            <h2 className="text-lg font-semibold text-gray-900">Event Pricing</h2>
                        </div>
                        <p className="text-sm text-gray-700">Set whether this is a free or paid event</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Paid Event</p>
                                <p className="text-sm text-gray-600">Charge attendees a registration fee</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_paid"
                                    checked={formData.is_paid}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div
                                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        {formData.is_paid ? (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Currency <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="currency"
                                            value={formData.currency}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none bg-white"
                                        >
                                            <option value="USD">$ USD - US Dollar</option>
                                            <option value="ZWL">ZWL - Zimbabwe Dollar</option>
                                            <option value="ZAR">R ZAR - South African Rand</option>
                                            <option value="EUR">€ EUR - Euro</option>
                                            <option value="GBP">£ GBP - British Pound</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                            <input
                                                type="number"
                                                name="price"
                                                step="0.01"
                                                min="0"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                                                placeholder="25.00"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Registration fee per attendee</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3">
                                <div
                                    className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M5 13l4 4L19 7"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-green-900">Free Event</p>
                                    <p className="text-sm text-green-700">This event is free to attend. No registration
                                        fee will be charged.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Registration Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="bg-green-50 border-l-4 border-green-500 pl-4 py-3 mb-6 rounded">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-600"/>
                            <h2 className="text-lg font-semibold text-gray-900">Registration</h2>
                        </div>
                        <p className="text-sm text-gray-700">Set the registration deadline for your event</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Registration Deadline <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="registration_deadline"
                            required
                            value={formData.registration_deadline}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                        />
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none"
                                 stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <p className="text-sm text-blue-800">Students must register before this date to attend the
                                event</p>
                        </div>
                    </div>
                </div>

                {/* Panels Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600"/>
                            <h2 className="text-lg font-semibold text-gray-900">Event Panels</h2>
                        </div>
                        <button
                            type="button"
                            onClick={addPanel}
                            className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                        >
                            <Plus className="w-4 h-4"/>
                            Add Panelist
                        </button>
                    </div>

                    <div className="space-y-4">
                        {panels.map((panel, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                                <button
                                    type="button"
                                    onClick={() => removePanel(index)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full
                                            Name</label>
                                        <input
                                            type="text"
                                            value={panel.external_full_name}
                                            onChange={(e) => updatePanel(index, 'external_full_name', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-1">Role/Title</label>
                                        <input
                                            type="text"
                                            value={panel.panel_role}
                                            onChange={(e) => updatePanel(index, 'panel_role', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="e.g. Keynote Speaker"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                                        <input
                                            type="text"
                                            value={panel.organization}
                                            onChange={(e) => updatePanel(index, 'organization', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="e.g. University of Science"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact
                                            Info</label>
                                        <input
                                            type="text"
                                            value={panel.external_contact}
                                            onChange={(e) => updatePanel(index, 'external_contact', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="e.g. email or phone"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {panels.length === 0 && (
                            <p className="text-center text-gray-500 py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                No panelists added yet.
                            </p>
                        )}
                    </div>
                </div>

                {/* Activities Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600"/>
                            <h2 className="text-lg font-semibold text-gray-900">Event Activities</h2>
                        </div>
                        <button
                            type="button"
                            onClick={addActivity}
                            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            <Plus className="w-4 h-4"/>
                            Add Activity
                        </button>
                    </div>

                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                                <button
                                    type="button"
                                    onClick={() => removeActivity(index)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={activity.title}
                                                onChange={(e) => updateActivity(index, 'title', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="e.g. Opening Ceremony"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                            <select
                                                value={activity.type}
                                                onChange={(e) => updateActivity(index, 'type', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            >
                                                <option value="">Select Type</option>
                                                <option value="workshop">Workshop</option>
                                                <option value="seminar">Seminar</option>
                                                <option value="networking">Networking</option>
                                                <option value="presentation">Presentation</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={activity.description}
                                            onChange={(e) => updateActivity(index, 'description', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            rows="2"
                                            placeholder="Brief description of the activity"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <p className="text-center text-gray-500 py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                No activities added yet.
                            </p>
                        )}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/events')}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                     fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            'Create Event'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminEventCreate;