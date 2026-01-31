import React, {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiAward, FiBook, FiBookOpen, FiBriefcase, FiCamera, FiGlobe, FiLock, FiSave, FiUser} from 'react-icons/fi';
import {Loader2} from 'lucide-react';
import toast from 'react-hot-toast';
import {useAuthStore} from '../store';
import {authService, organizationsService, universitiesService} from '../services/api';
import {INTERESTED_AREAS, INTERESTED_COURSES} from '../utils/registrationConstants';
import Autocomplete from '../components/common/Autocomplete';

const ProfilePage = () => {
    const {user, updateUser} = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [universities, setUniversities] = useState([]);
    const [organizations, setOrganizations] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        title: '',
        dob: '',
        whatsapp_number: '',
        bio: '',
        // Student
        current_school_name: '',
        current_grade: '',
        interested_area: '',
        interested_course: '',
        interested_university_id: '',
        // Professional
        expert_field: '',
        // Org
        organization_name: '',
        role_at_organization: '',
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        fetchProfile();
        fetchUniversities();
    }, []);

    useEffect(() => {
        if ((formData.role === 'company_rep' || user?.role === 'company_rep') && formData.organization_name && formData.organization_name.length > 2) {
            const delayDebounceFn = setTimeout(async () => {
                try {
                    const response = await organizationsService.search(formData.organization_name);
                    setOrganizations(response.data.map(org => org.name));
                } catch (err) {
                    console.error('Failed to fetch organizations:', err);
                }
            }, 500);

            return () => clearTimeout(delayDebounceFn);
        } else {
            setOrganizations([]);
        }
    }, [formData.organization_name, user?.role]);

    const fetchProfile = async () => {
        try {
            const response = await authService.getProfile();
            const profileData = response.data;
            setFormData({
                name: profileData.name || '',
                email: profileData.email || '',
                role: profileData.role || '',
                title: profileData.title || '',
                dob: profileData.dob || '',
                whatsapp_number: profileData.whatsapp_number || '',
                bio: profileData.bio || '',
                current_school_name: profileData.current_school_name || '',
                current_grade: profileData.current_grade || '',
                interested_area: profileData.interested_area || '',
                interested_course: profileData.interested_course || '',
                interested_university_id: profileData.interested_university_id || '',
                expert_field: profileData.expert_field || '',
                organization_name: profileData.organization_name || '',
                role_at_organization: profileData.role_at_organization || '',
            });
            if (profileData.avatar_url) {
                setAvatarPreview(profileData.avatar_url);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // Fallback to store user if API fails
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    name: user.name || '',
                    email: user.email || '',
                    role: user.role || '',
                }));
            }
            setIsLoading(false);
        }
    };

    const fetchUniversities = async () => {
        try {
            const response = await universitiesService.getAll();
            setUniversities(response.data);
        } catch (err) {
            console.error('Failed to fetch universities:', err);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handlePasswordChange = (e) => {
        const {name, value} = e.target;
        setPasswordData(prev => ({...prev, [name]: value}));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    dataToSend.append(key, formData[key]);
                }
            });
            if (avatarFile) {
                dataToSend.append('avatar', avatarFile);
            }

            const response = await authService.updateProfile(dataToSend);
            const updatedUser = response.data.user || response.data;
            updateUser(updatedUser);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            toast.error('Passwords do not match');
            return;
        }
        setIsSaving(true);
        try {
            await authService.changePassword(passwordData);
            toast.success('Password changed successfully');
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
        } catch (error) {
            console.error('Password change failed:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600"/>
            </div>
        );
    }

    const tabs = [
        {id: 'profile', label: 'Profile Information', icon: FiUser},
        {id: 'security', label: 'Security', icon: FiLock},
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col md:flex-row min-h-[600px]">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6">
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group mb-4">
                                <div
                                    className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200 flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover"/>
                                    ) : (
                                        <FiUser className="w-12 h-12 text-gray-400"/>
                                    )}
                                </div>
                                <label
                                    className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full text-white cursor-pointer hover:bg-primary-700 transition-colors shadow-sm">
                                    <FiCamera className="w-4 h-4"/>
                                    <input type="file" className="hidden" accept="image/*"
                                           onChange={handleAvatarChange}/>
                                </label>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 text-center">{formData.name || 'User'}</h2>
                            <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                        </div>

                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <tab.icon
                                        className={`mr-3 h-5 w-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`}/>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: -10}}
                                >
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
                                        <p className="text-sm text-gray-500">Update your account's profile information
                                            and
                                            bio.</p>
                                    </div>

                                    <form onSubmit={handleSubmitProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Common Fields */}
                                            <div className="md:col-span-2">
                                                <label
                                                    className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                                <textarea
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    className="input-field py-2"
                                                    placeholder="Tell us about yourself..."
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                <select
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    className="input-field"
                                                >
                                                    <option value="">Select Title</option>
                                                    <option value="Mr">Mr</option>
                                                    <option value="Ms">Ms</option>
                                                    <option value="Mrs">Mrs</option>
                                                    <option value="Dr">Dr</option>
                                                    <option value="Prof">Prof</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full
                                                    Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="input-field"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email
                                                    Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled
                                                    className="input-field bg-gray-50 cursor-not-allowed"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp
                                                    Number</label>
                                                <input
                                                    type="text"
                                                    name="whatsapp_number"
                                                    value={formData.whatsapp_number}
                                                    onChange={handleInputChange}
                                                    className="input-field"
                                                    placeholder="+263..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of
                                                    Birth</label>
                                                <input
                                                    type="date"
                                                    name="dob"
                                                    value={formData.dob}
                                                    onChange={handleInputChange}
                                                    className="input-field"
                                                />
                                            </div>

                                            {/* Role Specific Fields */}
                                            {user?.role === 'student' && (
                                                <>
                                                    <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                                            <FiBookOpen className="mr-2"/> Academic Information
                                                        </h4>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current
                                                            School/Institution</label>
                                                        <input
                                                            type="text"
                                                            name="current_school_name"
                                                            value={formData.current_school_name}
                                                            onChange={handleInputChange}
                                                            className="input-field"
                                                            placeholder="University or High School"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current
                                                            Grade/Level</label>
                                                        <input
                                                            type="text"
                                                            name="current_grade"
                                                            value={formData.current_grade}
                                                            onChange={handleInputChange}
                                                            className="input-field"
                                                            placeholder="e.g. Form 6, 2nd Year"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Interested
                                                            Career Area</label>
                                                        <Autocomplete
                                                            name="interested_area"
                                                            value={formData.interested_area}
                                                            onChange={handleInputChange}
                                                            options={INTERESTED_AREAS}
                                                            icon={FiBriefcase}
                                                            placeholder="e.g., Engineering, Business"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Interested
                                                            Course</label>
                                                        <Autocomplete
                                                            name="interested_course"
                                                            value={formData.interested_course}
                                                            onChange={handleInputChange}
                                                            options={INTERESTED_COURSES}
                                                            icon={FiBook}
                                                            placeholder="e.g., Computer Science"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Target
                                                            University</label>
                                                        <select
                                                            name="interested_university_id"
                                                            value={formData.interested_university_id}
                                                            onChange={handleInputChange}
                                                            className="input-field"
                                                        >
                                                            <option value="">Select University</option>
                                                            {universities.map(uni => (
                                                                <option key={uni.id} value={uni.id}>{uni.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </>
                                            )}

                                            {user?.role === 'professional' && (
                                                <>
                                                    <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                                            <FiAward className="mr-2"/> Professional Information
                                                        </h4>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Field
                                                            of Expertise</label>
                                                        <input
                                                            type="text"
                                                            name="expert_field"
                                                            value={formData.expert_field}
                                                            onChange={handleInputChange}
                                                            className="input-field"
                                                            placeholder="e.g. Software Engineering"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {(user?.role === 'company_rep' || user?.role === 'university') && (
                                                <>
                                                    <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                                            <FiGlobe className="mr-2"/> Organization Information
                                                        </h4>
                                                    </div>
                                                    <div>
                                                        <label
                                                            className="block text-sm font-medium text-gray-700 mb-1">Organization
                                                            Name</label>
                                                        {user?.role === 'company_rep' ? (
                                                            <Autocomplete
                                                                name="organization_name"
                                                                value={formData.organization_name}
                                                                onChange={handleInputChange}
                                                                options={organizations}
                                                                icon={FiBriefcase}
                                                                placeholder="Company Name"
                                                            />
                                                        ) : (
                                                            <select
                                                                name="organization_name"
                                                                value={formData.organization_name}
                                                                onChange={handleInputChange}
                                                                className="input-field"
                                                            >
                                                                <option value="">Select University</option>
                                                                {universities.map(uni => (
                                                                    <option key={uni.id}
                                                                            value={uni.name}>{uni.name}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Your
                                                            Role at Organization</label>
                                                        <input
                                                            type="text"
                                                            name="role_at_organization"
                                                            value={formData.role_at_organization}
                                                            onChange={handleInputChange}
                                                            className="input-field"
                                                            placeholder="e.g. HR Manager"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="btn-primary flex items-center px-8"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiSave className="mr-2 h-4 w-4"/>
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: -10}}
                                >
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Security</h3>
                                        <p className="text-sm text-gray-500">Ensure your account is using a long, random
                                            password to stay secure.</p>
                                    </div>

                                    <form onSubmit={handleSubmitPassword} className="max-w-md space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current
                                                Password</label>
                                            <input
                                                type="password"
                                                name="current_password"
                                                value={passwordData.current_password}
                                                onChange={handlePasswordChange}
                                                required
                                                className="input-field"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">New
                                                Password</label>
                                            <input
                                                type="password"
                                                name="new_password"
                                                value={passwordData.new_password}
                                                onChange={handlePasswordChange}
                                                required
                                                className="input-field"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New
                                                Password</label>
                                            <input
                                                type="password"
                                                name="new_password_confirmation"
                                                value={passwordData.new_password_confirmation}
                                                onChange={handlePasswordChange}
                                                required
                                                className="input-field"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="btn-primary flex items-center px-8"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                                        Changing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiLock className="mr-2 h-4 w-4"/>
                                                        Update Password
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
