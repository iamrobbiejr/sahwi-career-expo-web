import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {adminUserService} from '../../../services/api';
import {formatImageUrl} from '../../../utils/format';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trash2,
    User,
    Shield,
    UserCheck,
    UserX,
    UserMinus
} from 'lucide-react';
import {Link} from 'react-router-dom';
import {toast} from 'react-hot-toast';

const AdminUserList = () => {
    const [params, setParams] = useState({
        page: 1,
        search: '',
        role: '',
        verified: '',
        per_page: 10
    });

    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: ['adminUsers', params],
        queryFn: () => adminUserService.getUsers(params),
    });

    const handleSearch = (e) => {
        setParams(prev => ({...prev, search: e.target.value, page: 1}));
    };

    const handleRoleChange = (e) => {
        setParams(prev => ({...prev, role: e.target.value, page: 1}));
    };

    const handleVerifiedChange = (e) => {
        setParams(prev => ({...prev, verified: e.target.value, page: 1}));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
            try {
                await adminUserService.deleteUser(id);
                toast.success('User deleted successfully');
                refetch();
            } catch (err) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleToggleSuspension = async (id) => {
        try {
            const response = await adminUserService.toggleUserSuspension(id);
            toast.success(response.data.message);
            refetch();
        } catch (err) {
            toast.error('Failed to update user status');
        }
    };

    const users = data?.data?.data || [];
    const pagination = data?.data?.pagination || {};

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600">View and manage all registered users.</p>
                </div>
                <Link
                    to="/admin/users/pending-verifications"
                    className="flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                    <Shield className="w-5 h-5"/>
                    <span>Pending Verifications</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={params.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex flex-wrap gap-4">
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        value={params.role}
                        onChange={handleRoleChange}
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="professional">Professional</option>
                        <option value="company_rep">Company Representative</option>
                        <option value="university">University</option>
                        <option value="student">Student</option>
                    </select>
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        value={params.verified}
                        onChange={handleVerifiedChange}
                    >
                        <option value="">Verification Status</option>
                        <option value="true">Verified</option>
                        <option value="false">Unverified</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">User</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Role</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Verification</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading users...</td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-red-500">Failed to load users.
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No users found.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={formatImageUrl(user.avatar_url)} alt=""
                                                         className="w-10 h-10 rounded-full object-cover"/>
                                                ) : (
                                                    <User className="w-5 h-5 text-gray-400"/>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span
                                                    className="font-medium text-gray-900">{user.display_name || user.name}</span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">
                        {user.role?.replace('_', ' ') || 'User'}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.verified ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                          <UserCheck className="w-4 h-4"/>
                          Verified
                        </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                          <UserX className="w-4 h-4"/>
                          Unverified
                        </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.deleted_at ? (
                                            <span
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Suspended
                        </span>
                                        ) : (
                                            <span
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/users/${user.id}`}
                                                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5"/>
                                            </Link>
                                            <button
                                                onClick={() => handleToggleSuspension(user.id)}
                                                className={`p-1 transition-colors ${user.deleted_at ? 'text-green-400 hover:text-green-600' : 'text-gray-400 hover:text-yellow-600'}`}
                                                title={user.deleted_at ? "Unsuspend User" : "Suspend User"}
                                            >
                                                {user.deleted_at ? <UserCheck className="w-5 h-5"/> :
                                                    <UserMinus className="w-5 h-5"/>}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete User Permanently"
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
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
        </div>
    );
};

export default AdminUserList;
