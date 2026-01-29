import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {AlertCircle, Camera, CheckCircle, Loader2, Upload, X} from 'lucide-react';
import {
    FiAward,
    FiBook,
    FiBookOpen,
    FiBriefcase,
    FiCalendar,
    FiChevronLeft,
    FiGlobe,
    FiLock,
    FiMail,
    FiMapPin,
    FiPhone,
    FiUser,
    FiUserPlus,
    FiUsers
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {useAuthStore} from '../store';
import {authService, fileService, organizationsService, universitiesService} from '../services/api';
import Autocomplete from '../components/common/Autocomplete';
import {INTERESTED_AREAS, INTERESTED_COURSES} from '../utils/registrationConstants';
import bgImage from '../assets/bg.jpg';

const RegisterPage = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [step, setStep] = useState(1);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [universities, setUniversities] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: '',
        title: '',
        dob: '',
        whatsapp_number: '',
        avatar: null,
        bio: '',
        // Student fields
        current_school_name: '',
        current_grade: '',
        interested_area: '',
        interested_course: '',
        interested_university_id: '',
        // Professional fields
        expert_field: '',
        // Company/University fields
        organization_name: '',
        role_at_organization: '',
        organisation_id: '',
        // Verification Docs
        verification_docs: [],
    });

    React.useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await universitiesService.getAll();
                setUniversities(response.data);
            } catch (err) {
                console.error('Failed to fetch universities:', err);
            }
        };
        fetchUniversities();
    }, []);

    React.useEffect(() => {
        if (formData.role === 'company_rep' && formData.organization_name && formData.organization_name.length > 2) {
            const delayDebounceFn = setTimeout(async () => {
                try {
                    const response = await organizationsService.search(formData.organization_name);
                    // Assuming response.data is an array of organization objects with a 'name' property
                    setOrganizations(response.data.map(org => org.name));
                } catch (err) {
                    console.error('Failed to fetch organizations:', err);
                }
            }, 500);

            return () => clearTimeout(delayDebounceFn);
        } else {
            setOrganizations([]);
        }
    }, [formData.organization_name, formData.role]);

    const roles = [
        {id: 'student', label: 'Student', description: 'Exploring career paths and universities', icon: FiBookOpen},
        {id: 'professional', label: 'Professional', description: 'Sharing expertise and mentoring', icon: FiBriefcase},
        {
            id: 'company_rep',
            label: 'Company Representative',
            description: 'Recruiting and representing an organization',
            icon: FiUsers
        },
        {
            id: 'university',
            label: 'University Representative',
            description: 'Promoting academic programs',
            icon: FiGlobe
        },
        // { id: 'single', label: 'Individual', description: 'General community member', icon: FiUser },
    ];

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        if (name === 'organisation_id' && formData.role === 'university') {
            const selectedUni = universities.find(u => String(u.id) === String(value));
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                organization_name: selectedUni ? selectedUni.name : ''
            }));
        } else {
            setFormData((prev) => ({...prev, [name]: value}));
        }
    };

    const handleRoleSelect = (roleId) => {
        setFormData((prev) => ({...prev, role: roleId}));
        setStep(2);
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const response = await fileService.uploadVerificationDocs(files);
            const uploadedUrls = response.data.urls;
            setFormData((prev) => ({
                ...prev,
                verification_docs: [...prev.verification_docs, ...uploadedUrls],
            }));
        } catch (err) {
            console.error('Upload failed:', err);
            setUploadError('Failed to upload files. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const removeDoc = (urlToRemove) => {
        setFormData((prev) => ({
            ...prev,
            verification_docs: prev.verification_docs.filter((url) => url !== urlToRemove),
        }));
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (e.g., 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB');
            return;
        }

        setFormData((prev) => ({...prev, avatar: file}));

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Validate that docs are uploaded for specific roles
        const rolesRequiringDocs = ['professional', 'company_rep', 'university'];
        if (rolesRequiringDocs.includes(formData.role) && formData.verification_docs.length === 0) {
            setError('Please upload at least one verification document.');
            setIsLoading(false);
            return;
        }

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'verification_docs') {
                    formData.verification_docs.forEach(doc => {
                        submitData.append('verification_docs[]', doc);
                    });
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    submitData.append(key, formData[key]);
                }
            });

            const response = await authService.register(submitData);

            const successMessage = response.data.message || 'Registration successful. Please check your email.';
            toast.success(successMessage, {
                duration: 4000,
            });

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Registration failed:', err);
            const errorMessage = err.response?.data?.message || 'Registration failed. Please check your inputs.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
            style={{backgroundImage: `url(${bgImage})`}}>
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className={`bg-white rounded-2xl shadow-2xl p-8 w-full ${step === 1 ? 'max-w-2xl' : 'max-w-4xl'}`}
            >
                <div className="text-center mb-8">
                    <div
                        className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <FiUserPlus className="text-white text-3xl"/>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join the SahwiCareerExpo community</p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            exit={{opacity: 0, x: 20}}
                        >
                            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Choose your role</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role.id)}
                                        className="p-4 border-2 border-gray-100 rounded-xl text-left hover:border-primary-500 hover:bg-primary-50 transition-all group"
                                    >
                                        <div className="flex items-start">
                                            <div
                                                className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary-100 transition-colors mr-3">
                                                <role.icon
                                                    className="w-6 h-6 text-gray-400 group-hover:text-primary-600"/>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-primary-700">{role.label}</h3>
                                                <p className="text-sm text-gray-500">{role.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{opacity: 0, x: 20}}
                            animate={{opacity: 1, x: 0}}
                            exit={{opacity: 0, x: -20}}
                        >
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm text-primary-600 mb-4 hover:underline flex items-center"
                            >
                                <FiChevronLeft className="mr-1"/> Back to role selection
                            </button>

                            <form onSubmit={handleSubmit}
                                  className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {error && (
                                    <div
                                        className="md:col-span-2 lg:col-span-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2"/>
                                        {error}
                                    </div>
                                )}

                                <div className="md:col-span-2 lg:col-span-3 flex justify-center mb-2">
                                    <div className="relative group">
                                        <div
                                            className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Avatar"
                                                     className="w-full h-full object-cover"/>
                                            ) : (
                                                <FiUser className="w-12 h-12 text-gray-400"/>
                                            )}
                                        </div>
                                        <label
                                            className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full text-white cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
                                            <Camera className="w-4 h-4"/>
                                            <input type="file" className="hidden" accept="image/*"
                                                   onChange={handleAvatarUpload}/>
                                        </label>
                                        <div
                                            className="absolute -top-1 -right-4 bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full border border-gray-200 font-medium">
                                            Optional
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <div className="relative">
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="h-5 w-5 text-gray-400"/>
                                        </div>
                                        <select
                                            name="title"
                                            required
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="input-field pl-10"
                                        >
                                            <option value="">Select Title</option>
                                            <option value="Mr">Mr</option>
                                            <option value="Ms">Ms</option>
                                            <option value="Mrs">Mrs</option>
                                            <option value="Dr">Dr</option>
                                            <option value="Prof">Prof</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="h-5 w-5 text-gray-400"/>
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="input-field pl-10"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email
                                        Address</label>
                                    <div className="relative">
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiMail className="h-5 w-5 text-gray-400"/>
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="input-field pl-10"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5 text-gray-400"/>
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="input-field pl-10"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp
                                        Number</label>
                                    <div className="relative">
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiPhone className="h-5 w-5 text-gray-400"/>
                                        </div>
                                        <input
                                            type="tel"
                                            name="whatsapp_number"
                                            required
                                            value={formData.whatsapp_number}
                                            onChange={handleInputChange}
                                            className="input-field pl-10"
                                            placeholder="+1234567890"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of
                                        Birth</label>
                                    <div className="relative">
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiCalendar className="h-5 w-5 text-gray-400"/>
                                        </div>
                                        <input
                                            type="date"
                                            name="dob"
                                            required
                                            value={formData.dob}
                                            onChange={handleInputChange}
                                            className="input-field pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Role Specific Fields */}
                                {formData.role === 'student' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current
                                                School</label>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FiBook className="h-5 w-5 text-gray-400"/>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="current_school_name"
                                                    required
                                                    value={formData.current_school_name}
                                                    onChange={handleInputChange}
                                                    className="input-field pl-10"
                                                    placeholder="Sahwi High School"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current
                                                Grade</label>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FiAward className="h-5 w-5 text-gray-400"/>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="current_grade"
                                                    required
                                                    value={formData.current_grade}
                                                    onChange={handleInputChange}
                                                    className="input-field pl-10"
                                                    placeholder="Grade 12"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Interested
                                                University</label>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FiMapPin className="h-5 w-5 text-gray-400"/>
                                                </div>
                                                <select
                                                    name="interested_university_id"
                                                    required
                                                    value={formData.interested_university_id}
                                                    onChange={handleInputChange}
                                                    className="input-field pl-10"
                                                >
                                                    <option value="">Select a University</option>
                                                    {universities.map((uni) => (
                                                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Interested
                                                Career Area</label>
                                            <Autocomplete
                                                name="interested_area"
                                                required
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
                                                required
                                                value={formData.interested_course}
                                                onChange={handleInputChange}
                                                options={INTERESTED_COURSES}
                                                icon={FiBook}
                                                placeholder="e.g., Computer Science"
                                            />
                                        </div>
                                    </>
                                )}

                                {formData.role === 'professional' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Field of
                                                Expertise</label>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FiBriefcase className="h-5 w-5 text-gray-400"/>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="expert_field"
                                                    required
                                                    value={formData.expert_field}
                                                    onChange={handleInputChange}
                                                    className="input-field pl-10"
                                                    placeholder="e.g. Software Engineering"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                            <textarea
                                                name="bio"
                                                required
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                className="input-field min-h-[100px] py-2"
                                                placeholder="Tell us about your professional background..."
                                            />
                                        </div>
                                    </>
                                )}

                                {formData.role === 'company_rep' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Organization
                                                Name</label>
                                            <Autocomplete
                                                name="organization_name"
                                                required
                                                value={formData.organization_name}
                                                onChange={handleInputChange}
                                                options={organizations}
                                                icon={FiBriefcase}
                                                placeholder="Company Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Your
                                                Role</label>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FiUser className="h-5 w-5 text-gray-400"/>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="role_at_organization"
                                                    required
                                                    value={formData.role_at_organization}
                                                    onChange={handleInputChange}
                                                    className="input-field pl-10"
                                                    placeholder="e.g. HR Manager"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {formData.role === 'university' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Select
                                                University</label>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FiGlobe className="h-5 w-5 text-gray-400"/>
                                                </div>
                                                <select
                                                    name="organisation_id"
                                                    required
                                                    value={formData.organisation_id}
                                                    onChange={handleInputChange}
                                                    className="input-field pl-10"
                                                >
                                                    <option value="">Select a University</option>
                                                    {universities.map((uni) => (
                                                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Your
                                                Role</label>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FiUser className="h-5 w-5 text-gray-400"/>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="role_at_organization"
                                                    required
                                                    value={formData.role_at_organization}
                                                    onChange={handleInputChange}
                                                    className="input-field pl-10"
                                                    placeholder="e.g. Admissions Officer"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Verification Documents Upload */}
                                {(formData.role === 'professional' || formData.role === 'company_rep' || formData.role === 'university') && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Verification Documents
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Please upload ID, business certificate, or professional accreditation (PDF,
                                            JPG, PNG).
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center w-full">
                                                <label
                                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                    <div
                                                        className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        {isUploading ? (
                                                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin"/>
                                                        ) : (
                                                            <Upload className="w-8 h-8 text-gray-400 mb-2"/>
                                                        )}
                                                        <p className="text-sm text-gray-500">
                                                            {isUploading ? 'Uploading...' : 'Click to upload files'}
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        multiple
                                                        onChange={handleFileUpload}
                                                        disabled={isUploading}
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                    />
                                                </label>
                                            </div>

                                            {uploadError && (
                                                <p className="text-xs text-red-600 flex items-center">
                                                    <AlertCircle className="w-3 h-3 mr-1"/>
                                                    {uploadError}
                                                </p>
                                            )}

                                            {/* Uploaded Files List */}
                                            {formData.verification_docs.length > 0 && (
                                                <div className="space-y-2">
                                                    {formData.verification_docs.map((url, index) => (
                                                        <div key={index}
                                                             className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                                                            <div className="flex items-center overflow-hidden">
                                                                <CheckCircle
                                                                    className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"/>
                                                                <span
                                                                    className="text-xs text-green-700 truncate max-w-[200px]">
                                  {url.split('/').pop()}
                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDoc(url)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="w-4 h-4"/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || isUploading}
                                    className="btn-primary w-full py-3 mt-4 flex items-center justify-center disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin"/>
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="text-center mt-6 text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
