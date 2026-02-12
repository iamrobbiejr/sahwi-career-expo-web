import React, {useState} from 'react';
import {AlertCircle, Building, Loader2, Mail, Phone, Plus, Trash2, User, Users, X} from 'lucide-react';
import {registrationsService} from '../../services/api';
import {useAuthStore} from '../../store';
import {toast} from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';

const RegistrationModal = ({event, onClose, onShowSuccess}) => {
    const {user, hasRole} = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [regType, setRegType] = useState('individual'); // 'individual' or 'group'

    // Individual Form State
    const [individualForm, setIndividualForm] = useState({
        attendee_name: user?.name || '',
        attendee_email: user?.email || '',
        attendee_phone: user?.whatsapp_number || '',
        attendee_organization_id: '',
        special_requirements: '',
    });

    // Group Form State
    const [groupForm, setGroupForm] = useState({
        group_name: '',
        members: [
            {name: '', email: '', phone: '', title: '', special_requirements: ''}
        ]
    });

    const isCompanyRep = hasRole('company_rep');

    const handleIndividualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await registrationsService.registerIndividual(event.id, individualForm);
            toast.success('Registration successful!');

            if (response.data.next_step === 'payment') {
                navigate(`/payments/initiate?registration_ids[]=${response.data.registration.id}`);
            } else {
                onShowSuccess(response.data.registration);
                onClose();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        if (groupForm.members.length === 0) {
            toast.error('Please add at least one member');
            return;
        }
        setLoading(true);
        try {
            const response = await registrationsService.registerGroup(event.id, groupForm);
            toast.success('Group registration successful!');

            if (response.data.next_step === 'payment') {
                const registrationIds = response.data.group_registration.registrations.map(r => r.id);
                const queryParams = registrationIds.map(id => `registration_ids[]=${id}`).join('&');
                navigate(`/payments/initiate?${queryParams}`);
            } else {
                onShowSuccess(response.data.group_registration);
                onClose();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register group');
        } finally {
            setLoading(false);
        }
    };

    const addMember = () => {
        setGroupForm({
            ...groupForm,
            members: [...groupForm.members, {name: '', email: '', phone: '', title: '', special_requirements: ''}]
        });
    };

    const removeMember = (index) => {
        const newMembers = [...groupForm.members];
        newMembers.splice(index, 1);
        setGroupForm({...groupForm, members: newMembers});
    };

    const updateMember = (index, field, value) => {
        const newMembers = [...groupForm.members];
        newMembers[index][field] = value;
        setGroupForm({...groupForm, members: newMembers});
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div
                    className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Register for Event</h2>
                        <p className="text-sm text-gray-500 truncate max-w-md">{event.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400"/>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isCompanyRep && (
                        <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
                            <button
                                onClick={() => setRegType('individual')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    regType === 'individual' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <User className="w-4 h-4"/>
                                Individual
                            </button>
                            <button
                                onClick={() => setRegType('group')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    regType === 'group' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Users className="w-4 h-4"/>
                                Group Registration
                            </button>
                        </div>
                    )}

                    {regType === 'individual' ? (
                        <form onSubmit={handleIndividualSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Attendee Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="Enter full name"
                                            value={individualForm.attendee_name}
                                            onChange={(e) => setIndividualForm({
                                                ...individualForm,
                                                attendee_name: e.target.value
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="email@example.com"
                                            value={individualForm.attendee_email}
                                            onChange={(e) => setIndividualForm({
                                                ...individualForm,
                                                attendee_email: e.target.value
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
                                        <input
                                            type="tel"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="+263..."
                                            value={individualForm.attendee_phone}
                                            onChange={(e) => setIndividualForm({
                                                ...individualForm,
                                                attendee_phone: e.target.value
                                            })}
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Special Requirements</label>
                                <textarea
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    rows="3"
                                    placeholder="Dietary requirements, accessibility needs, etc."
                                    value={individualForm.special_requirements}
                                    onChange={(e) => setIndividualForm({
                                        ...individualForm,
                                        special_requirements: e.target.value
                                    })}
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0"/>
                                <p className="text-xs text-blue-800">
                                    {event.is_paid
                                        ? `This is a paid event. After clicking register, you will be redirected to the payment gateway to pay the registration fee of ${event.currency || 'USD'} ${(event.price_cents || 0) / 100}.`
                                        : 'This is a free event. Your registration will be confirmed immediately.'}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ?
                                    <Loader2 className="w-5 h-5 animate-spin"/> : 'Confirm Individual Registration'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleGroupSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Group / Organization
                                    Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        placeholder="e.g. Acme Corp Team"
                                        value={groupForm.group_name}
                                        onChange={(e) => setGroupForm({...groupForm, group_name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-md font-bold text-gray-900">Team Members</h3>
                                    <button
                                        type="button"
                                        onClick={addMember}
                                        className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700"
                                    >
                                        <Plus className="w-4 h-4"/>
                                        Add Member
                                    </button>
                                </div>

                                {groupForm.members.map((member, index) => (
                                    <div key={index}
                                         className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-4 relative">
                                        {groupForm.members.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMember(index)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        )}
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Member
                                            #{index + 1}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Full Name"
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                                value={member.name}
                                                onChange={(e) => updateMember(index, 'name', e.target.value)}
                                            />
                                            <input
                                                type="email"
                                                required
                                                placeholder="Email Address"
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                                value={member.email}
                                                onChange={(e) => updateMember(index, 'email', e.target.value)}
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone (Optional)"
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                                value={member.phone}
                                                onChange={(e) => updateMember(index, 'phone', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Job Title"
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                                value={member.title}
                                                onChange={(e) => updateMember(index, 'title', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0"/>
                                <p className="text-xs text-blue-800">
                                    Total spots: {groupForm.members.length} member(s).
                                    {event.is_paid && ` Total cost will be ${event.currency || 'USD'} ${(event.price_cents * groupForm.members.length) / 100}.`}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2
                                    className="w-5 h-5 animate-spin"/> : `Register Group (${groupForm.members.length})`}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationModal;
