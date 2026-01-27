import React, {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {adminUserService, threadsService} from '../../../services/api';
import {formatImageUrl} from '../../../utils/format';
import {
    User,
    Mail,
    Shield,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Trash2,
    ArrowLeft,
    UserCheck,
    UserMinus,
    Building,
    MessageSquare
} from 'lucide-react';
import {toast} from 'react-hot-toast';

const AdminUserDetail = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);

    const {data: userData, isLoading, isError, refetch} = useQuery({
        queryKey: ['adminUser', id],
        queryFn: () => adminUserService.getUserById(id),
    });

    const user = userData?.data?.data;

    const handleUpdateRole = async (e) => {
        const newRole = e.target.value;
        if (!newRole) return;

        setIsUpdatingRole(true);
        try {
            await adminUserService.updateUserRole(id, {role: newRole});
            toast.success('User role updated successfully');
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update user role');
        } finally {
            setIsUpdatingRole(false);
        }
    };

    const handleToggleSuspension = async () => {
        try {
            const response = await adminUserService.toggleUserSuspension(id);
            toast.success(response.data.message);
            refetch();
        } catch (err) {
            toast.error('Failed to update user status');
        }
    };

    const handleMessageUser = async () => {
        try {
            const response = await threadsService.create({
                thread_type: 'direct',
                member_ids: [user.id]
            });
            // Handle different possible response structures
            const threadId = response.data?.data?.id || response.data?.id;
            if (threadId) {
                navigate('/messages', {state: {selectedThreadId: threadId}});
            } else {
                throw new Error('Invalid response');
            }
        } catch (err) {
            toast.error('Failed to start conversation');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
            try {
                await adminUserService.deleteUser(id);
                toast.success('User deleted successfully');
                navigate('/admin/users');
            } catch (err) {
                toast.error('Failed to delete user');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
                <button
                    onClick={() => navigate('/admin/users')}
                    className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                    Back to User Management
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-5 h-5"/>
                <span>Back to Users</span>
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header/Cover */}
                <div className="h-32 bg-gradient-to-r from-primary-500 to-blue-600"></div>

                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="p-1 bg-white rounded-full">
                            <div
                                className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white overflow-hidden">
                                {user.avatar_url ? (
                                    <img src={formatImageUrl(user.avatar_url)} alt=""
                                         className="w-full h-full rounded-full object-cover"/>
                                ) : (
                                    <User className="w-12 h-12 text-gray-400"/>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 mb-2">
                            <button
                                onClick={handleMessageUser}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                            >
                                <MessageSquare className="w-4 h-4"/>
                                <span>Message User</span>
                            </button>
                            <button
                                onClick={handleToggleSuspension}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                    user.deleted_at
                                        ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                        : 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                }`}
                            >
                                {user.deleted_at ? (
                                    <>
                                        <UserCheck className="w-4 h-4"/>
                                        <span>Unsuspend User</span>
                                    </>
                                ) : (
                                    <>
                                        <UserMinus className="w-4 h-4"/>
                                        <span>Suspend User</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 className="w-4 h-4"/>
                                <span>Delete Permanently</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* User Info */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{user.display_name || user.name}</h1>
                                <p className="text-gray-500">{user.email}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Mail className="w-5 h-5 text-gray-400"/>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Email Address</p>
                                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Shield className="w-5 h-5 text-gray-400"/>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Current Role</p>
                                        <p className="text-sm font-medium text-gray-900 capitalize">{user.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Calendar className="w-5 h-5 text-gray-400"/>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Joined On</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Clock className="w-5 h-5 text-gray-400"/>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Last Updated</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {user.organization && (
                                <div className="p-6 border border-gray-100 rounded-2xl space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Building className="w-5 h-5 text-primary-500"/>
                                        Organization Details
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Name</p>
                                            <p className="text-sm font-medium text-gray-900">{user.organization.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Type</p>
                                            <p className="text-sm font-medium text-gray-900 capitalize">{user.organization.type || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Verified</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {user.organization.verified ? (
                                                    <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4"/> Yes
                          </span>
                                                ) : (
                                                    <span className="text-red-600 flex items-center gap-1">
                            <XCircle className="w-4 h-4"/> No
                          </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Management Actions */}
                        <div className="space-y-6">
                            <div className="p-6 bg-gray-50 rounded-2xl space-y-4">
                                <h3 className="font-semibold text-gray-900">Quick Actions</h3>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-600">Update User Role</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                        value={user.role}
                                        onChange={handleUpdateRole}
                                        disabled={isUpdatingRole}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="professional">Professional</option>
                                        <option value="company_rep">Company Representative</option>
                                        <option value="university">University</option>
                                        <option value="student">Student</option>
                                    </select>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Verification Status</span>
                                        {user.verified ? (
                                            <span
                                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3"/>
                        Verified
                      </span>
                                        ) : (
                                            <span
                                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle className="w-3 h-3"/>
                        Unverified
                      </span>
                                        )}
                                    </div>
                                    {user.verification_reviewed_at && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            Reviewed on {new Date(user.verification_reviewed_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetail;
