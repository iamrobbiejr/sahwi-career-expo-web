import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {adminUserService} from '../../../services/api';
import {formatImageUrl} from '../../../utils/format';
import {
    Briefcase,
    Building,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Eye,
    FileText,
    GraduationCap,
    Mail,
    Shield,
    User,
    X,
    XCircle
} from 'lucide-react';
import {toast} from 'react-hot-toast';
import {BiLogoWhatsapp} from 'react-icons/bi';

const VerificationDrawer = ({user, isOpen, onClose, onApprove, onReject}) => {
    if (!isOpen || !user) return null;

    const handleDownload = (docUrl) => {
        window.open(docUrl, '_blank');
    };

    const renderDocuments = (docs, title) => {
        if (!docs || docs.length === 0) return null;

        return (
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase">{title}</h4>
                <div className="space-y-2">
                    {docs.map((doc, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 bg-primary-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-primary-600"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        Document {index + 1}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {typeof doc === 'string' ? doc.split('/').pop() : 'Verification Document'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownload(typeof doc === 'string' ? doc : doc.url)}
                                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4"/>
                                </button>
                                <button
                                    onClick={() => handleDownload(typeof doc === 'string' ? doc : doc.url)}
                                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    title="View"
                                >
                                    <Eye className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 ${
                    isOpen ? 'opacity-30' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Verification Review</h2>
                            <p className="text-sm text-gray-500 mt-1">Review user's verification request</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500"/>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* User Profile Section */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {user.avatar_url ? (
                                        <img
                                            src={formatImageUrl(user.avatar_url)}
                                            alt=""
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-8 h-8 text-gray-400"/>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {user.title && `${user.title} `}
                                        {user.display_name || user.name}
                                    </h3>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="w-4 h-4"/>
                                            {user.email}
                                        </div>
                                        {user.whatsapp_number && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <BiLogoWhatsapp className="w-4 h-4"/>
                                                {user.whatsapp_number}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Role Badge */}
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-primary-600"/>
                                <span className="text-sm font-medium text-gray-700">Requested Role:</span>
                                <span
                                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium capitalize">
                                    {user.role?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200"/>

                        {/* User Information */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-700 uppercase">User Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {user.dob && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                                            <Calendar className="w-3 h-3"/>
                                            Date of Birth
                                        </p>
                                        <p className="text-sm text-gray-900">
                                            {new Date(user.dob).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {user.expert_field && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                                            <GraduationCap className="w-3 h-3"/>
                                            Expert Field
                                        </p>
                                        <p className="text-sm text-gray-900">{user.expert_field}</p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                                        <Clock className="w-3 h-3"/>
                                        Registered
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {user.bio && (
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Bio</p>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                        {user.bio}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Organization Section */}
                        {user.organization && (user.role === 'company_rep' || user.role === 'university') && (
                            <>
                                <div className="border-t border-gray-200"/>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700 uppercase flex items-center gap-2">
                                        <Building className="w-4 h-4 text-primary-600"/>
                                        Organization Details
                                    </h4>
                                    <div
                                        className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {user.organization.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                                                    <p className="text-sm text-gray-900 capitalize">
                                                        {user.organization.type}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                            user.organization.verified
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                    >
                                                        {user.organization.verified ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3"/>
                                                                Verified
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="w-3 h-3"/>
                                                                Pending
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Organization Documents */}
                                    {renderDocuments(user.organization.verification_docs, 'Organization Documents')}
                                </div>
                            </>
                        )}

                        {/* Professional Verification Documents */}
                        {user.professional_verification_docs && (
                            <>
                                <div className="border-t border-gray-200"/>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700 uppercase flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-primary-600"/>
                                        Professional Documents
                                    </h4>
                                    {renderDocuments(user.professional_verification_docs, 'Verification Documents')}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    onReject(user.id);
                                    onClose();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-red-200 text-red-700 rounded-xl hover:bg-red-50 transition-colors font-semibold"
                            >
                                <XCircle className="w-5 h-5"/>
                                Reject
                            </button>
                            <button
                                onClick={() => {
                                    onApprove(user.id);
                                    onClose();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 font-semibold"
                            >
                                <CheckCircle className="w-5 h-5"/>
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const AdminPendingVerifications = () => {
    const [params, setParams] = useState({
        page: 1,
        per_page: 10
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: ['adminPendingVerifications', params],
        queryFn: () => adminUserService.getPendingVerifications(params),
    });

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsDrawerOpen(true);
    };

    const handleApprove = async (id) => {
        if (window.confirm('Are you sure you want to approve this user?')) {
            try {
                await adminUserService.approveUser(id);
                toast.success('User approved successfully');
                refetch();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to approve user');
            }
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Please provide a reason for rejection:', 'Verification request denied.');
        if (reason !== null) {
            try {
                await adminUserService.rejectUser(id, {reason});
                toast.success('User rejected successfully');
                refetch();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to reject user');
            }
        }
    };

    const users = data?.data?.data || [];
    const pagination = data?.data?.pagination || {};

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Pending Verifications</h1>
                <p className="text-gray-600">Review and approve professional, company, and university accounts.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">User</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Organization</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Role</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Requested At</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                    Loading pending verifications...
                                </td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-red-500">
                                    Failed to load verifications.
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                    No pending verifications.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleViewDetails(user)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img
                                                        src={formatImageUrl(user.avatar_url)}
                                                        alt=""
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-5 h-5 text-gray-400"/>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">
                                                    {user.display_name || user.name}
                                                </span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Building className="w-4 h-4 text-gray-400"/>
                                            {user.organization?.name || user.organisation_name || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 capitalize">
                                            {user.role?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-gray-400"/>
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetails(user);
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            Showing page {pagination.current_page} of {pagination.total_pages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setParams(prev => ({...prev, page: prev.page - 1}))}
                                disabled={pagination.current_page === 1}
                                className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5"/>
                            </button>
                            <button
                                onClick={() => setParams(prev => ({...prev, page: prev.page + 1}))}
                                disabled={pagination.current_page === pagination.total_pages}
                                className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-white transition-colors"
                            >
                                <ChevronRight className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Verification Drawer */}
            <VerificationDrawer
                user={selectedUser}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
};

export default AdminPendingVerifications;