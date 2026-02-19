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

/* ─────────────────────────────────────────────────────────────────────────────
   IconInput  –  flex wrapper so the icon never overlaps the text
   ───────────────────────────────────────────────────────────────────────────── */
const IconInput = ({icon: Icon, children}) => (
    <div className="flex items-center w-full border border-gray-300 rounded-lg bg-white
                    transition-shadow overflow-hidden">
        <span className="pl-3 pr-2 flex-shrink-0" style={{color: 'var(--color-gold-dark)'}}>
            <Icon className="h-5 w-5"/>
        </span>
        {children}
    </div>
);

/* shared classes for every bare input / select inside IconInput */
const fieldCls =
    "flex-1 min-w-0 py-2 pr-3 bg-transparent text-sm text-gray-900 " +
    "placeholder-gray-400 outline-none border-none focus:ring-0";

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
        current_school_name: '',
        current_grade: '',
        interested_area: '',
        interested_course: '',
        interested_university_id: '',
        expert_field: '',
        organization_name: '',
        role_at_organization: '',
        organisation_id: '',
        verification_docs: [],
        professional_verification_docs: [],
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
            if (formData.role === 'professional') {
                setFormData((prev) => ({
                    ...prev,
                    professional_verification_docs: [...prev.professional_verification_docs, ...uploadedUrls],
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    verification_docs: [...prev.verification_docs, ...uploadedUrls],
                }));
            }
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
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB');
            return;
        }
        setFormData((prev) => ({...prev, avatar: file}));
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const rolesRequiringDocs = ['professional', 'company_rep', 'university'];
        if (rolesRequiringDocs.includes(formData.role) &&
            formData.verification_docs.length === 0 &&
            formData.professional_verification_docs.length === 0) {
            setError('Please upload at least one verification document.');
            setIsLoading(false);
            return;
        }

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value === null || value === undefined) return;
                if (key === 'verification_docs' && Array.isArray(value)) {
                    value.forEach(doc => submitData.append('verification_docs[]', doc));
                } else if (key === 'professional_verification_docs' && Array.isArray(value)) {
                    value.forEach(doc => submitData.append('professional_verification_docs[]', doc));
                } else if (key !== 'verification_docs' && key !== 'professional_verification_docs') {
                    submitData.append(key, value);
                }
            });

            const response = await authService.register(submitData);
            const successMessage = response.data.message || 'Registration successful. Please check your email.';
            toast.success(successMessage, {duration: 4000});
            setTimeout(() => navigate('/login'), 2000);
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
                    <div className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
                         style={{background: 'linear-gradient(135deg, var(--color-navy-deep) 0%, var(--color-navy-mid) 100%)'}}>
                        <FiUserPlus className="text-3xl" style={{color: 'var(--color-gold)'}}/>
                    </div>
                    <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--color-navy-deep)'}}>Create
                        Account</h1>
                    <p className="text-gray-500">Join the Sahwira Careers Expo community</p>
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
                                        className="p-4 border-2 border-gray-100 rounded-xl text-left transition-all group"
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'var(--color-gold)';
                                            e.currentTarget.style.backgroundColor = 'var(--color-secondary-50)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = '#F3F4F6';
                                            e.currentTarget.style.backgroundColor = '';
                                        }}
                                    >
                                        <div className="flex items-start">
                                            <div className="p-2 rounded-lg mr-3 transition-colors"
                                                 style={{backgroundColor: '#F9FAFB'}}
                                                 onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(200,160,100,0.12)'}
                                                 onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}>
                                                <role.icon className="w-6 h-6"
                                                           style={{color: 'var(--color-gold-dark)'}}/>
                                            </div>
                                            <div>
                                                <h3 className="font-bold"
                                                    style={{color: 'var(--color-navy-deep)'}}>{role.label}</h3>
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
                                className="text-sm mb-4 flex items-center font-medium transition-colors"
                                style={{color: 'var(--color-gold-dark)'}}
                            >
                                <FiChevronLeft className="mr-1"/> Back to role selection
                            </button>

                            <form onSubmit={handleSubmit}
                                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {error && (
                                    <div
                                        className="md:col-span-2 lg:col-span-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0"/>
                                        {error}
                                    </div>
                                )}

                                {/* Avatar Upload */}
                                <div className="md:col-span-2 lg:col-span-3 flex justify-center mb-2">
                                    <div className="relative group">
                                        <div
                                            className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center">
                                            {avatarPreview
                                                ? <img src={avatarPreview} alt="Avatar"
                                                       className="w-full h-full object-cover"/>
                                                : <FiUser className="w-12 h-12 text-gray-400"/>
                                            }
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

                                {/* ── Title ── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <IconInput icon={FiUser}>
                                        <select
                                            name="title"
                                            required
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className={fieldCls}
                                        >
                                            <option value="">Select Title</option>
                                            <option value="Mr">Mr</option>
                                            <option value="Ms">Ms</option>
                                            <option value="Mrs">Mrs</option>
                                            <option value="Dr">Dr</option>
                                            <option value="Prof">Prof</option>
                                        </select>
                                    </IconInput>
                                </div>

                                {/* ── Full Name ── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <IconInput icon={FiUser}>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={fieldCls}
                                            placeholder="John Doe"
                                        />
                                    </IconInput>
                                </div>

                                {/* ── Email ── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email
                                        Address</label>
                                    <IconInput icon={FiMail}>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={fieldCls}
                                            placeholder="john@example.com"
                                        />
                                    </IconInput>
                                </div>

                                {/* ── Password ── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <IconInput icon={FiLock}>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={fieldCls}
                                            placeholder="••••••••"
                                        />
                                    </IconInput>
                                </div>

                                {/* ── WhatsApp ── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp
                                        Number</label>
                                    <IconInput icon={FiPhone}>
                                        <input
                                            type="tel"
                                            name="whatsapp_number"
                                            required
                                            value={formData.whatsapp_number}
                                            onChange={handleInputChange}
                                            className={fieldCls}
                                            placeholder="+1234567890"
                                        />
                                    </IconInput>
                                </div>

                                {/* ── Date of Birth ── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of
                                        Birth</label>
                                    <IconInput icon={FiCalendar}>
                                        <input
                                            type="date"
                                            name="dob"
                                            required
                                            value={formData.dob}
                                            onChange={handleInputChange}
                                            className={fieldCls}
                                        />
                                    </IconInput>
                                </div>

                                {/* ══ STUDENT FIELDS ══ */}
                                {formData.role === 'student' && (<>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current
                                            School</label>
                                        <IconInput icon={FiBook}>
                                            <input
                                                type="text"
                                                name="current_school_name"
                                                required
                                                value={formData.current_school_name}
                                                onChange={handleInputChange}
                                                className={fieldCls}
                                                placeholder="EduGate High School"
                                            />
                                        </IconInput>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current
                                            Grade</label>
                                        <IconInput icon={FiAward}>
                                            <input
                                                type="text"
                                                name="current_grade"
                                                required
                                                value={formData.current_grade}
                                                onChange={handleInputChange}
                                                className={fieldCls}
                                                placeholder="Grade 12"
                                            />
                                        </IconInput>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Interested
                                            University</label>
                                        <IconInput icon={FiMapPin}>
                                            <select
                                                name="interested_university_id"
                                                required
                                                value={formData.interested_university_id}
                                                onChange={handleInputChange}
                                                className={fieldCls}
                                            >
                                                <option value="">Select a University</option>
                                                {universities.map((uni) => (
                                                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                                                ))}
                                            </select>
                                        </IconInput>
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
                                </>)}

                                {/* ══ PROFESSIONAL FIELDS ══ */}
                                {formData.role === 'professional' && (<>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of
                                            Expertise</label>
                                        <IconInput icon={FiBriefcase}>
                                            <input
                                                type="text"
                                                name="expert_field"
                                                required
                                                value={formData.expert_field}
                                                onChange={handleInputChange}
                                                className={fieldCls}
                                                placeholder="e.g. Software Engineering"
                                            />
                                        </IconInput>
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                        <textarea
                                            name="bio"
                                            required
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow resize-y"
                                            placeholder="Tell us about your professional background..."
                                        />
                                    </div>
                                </>)}

                                {/* ══ COMPANY REP FIELDS ══ */}
                                {formData.role === 'company_rep' && (<>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization
                                            Name</label>
                                        <Autocomplete
                                            name="organization_name"
                                            required
                                            value={formData.organization_name}
                                            onChange={handleInputChange}
                                            options={organizations}
                                            // icon={FiBriefcase}
                                            placeholder="Company Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Your
                                            Role</label>
                                        <IconInput icon={FiUser}>
                                            <input
                                                type="text"
                                                name="role_at_organization"
                                                required
                                                value={formData.role_at_organization}
                                                onChange={handleInputChange}
                                                className={fieldCls}
                                                placeholder="e.g. HR Manager"
                                            />
                                        </IconInput>
                                    </div>
                                </>)}

                                {/* ══ UNIVERSITY REP FIELDS ══ */}
                                {formData.role === 'university' && (<>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select
                                            University</label>
                                        <IconInput icon={FiGlobe}>
                                            <select
                                                name="organisation_id"
                                                required
                                                value={formData.organisation_id}
                                                onChange={handleInputChange}
                                                className={fieldCls}
                                            >
                                                <option value="">Select a University</option>
                                                {universities.map((uni) => (
                                                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                                                ))}
                                            </select>
                                        </IconInput>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Your
                                            Role</label>
                                        <IconInput icon={FiUser}>
                                            <input
                                                type="text"
                                                name="role_at_organization"
                                                required
                                                value={formData.role_at_organization}
                                                onChange={handleInputChange}
                                                className={fieldCls}
                                                placeholder="e.g. Admissions Officer"
                                            />
                                        </IconInput>
                                    </div>
                                </>)}

                                {/* ══ VERIFICATION DOCS ══ */}
                                {(formData.role === 'professional' || formData.role === 'company_rep' || formData.role === 'university') && (
                                    <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                        {isUploading
                                                            ?
                                                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin"/>
                                                            : <Upload className="w-8 h-8 text-gray-400 mb-2"/>
                                                        }
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
                                                            <button type="button" onClick={() => removeDoc(url)}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors">
                                                                <X className="w-4 h-4"/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {formData.professional_verification_docs.length > 0 && (
                                                <div className="space-y-2">
                                                    {formData.professional_verification_docs.map((url, index) => (
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
                                                            <button type="button" onClick={() => removeDoc(url)}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors">
                                                                <X className="w-4 h-4"/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Submit ── */}
                                <div className="md:col-span-2 lg:col-span-3 mt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading || isUploading}
                                        className="btn-primary w-full py-3 flex items-center justify-center disabled:opacity-70"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin"/>
                                                Creating Account...
                                            </>
                                        ) : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="text-center mt-6 text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium transition-colors"
                          style={{color: 'var(--color-gold-dark)'}}>
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;