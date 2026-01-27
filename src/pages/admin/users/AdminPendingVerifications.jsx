import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {adminUserService} from '../../../services/api';
import {formatImageUrl} from '../../../utils/format';
import {
    ChevronLeft,
    ChevronRight,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Building
} from 'lucide-react';
import {toast} from 'react-hot-toast';

const AdminPendingVerifications = () => {
    const [params, setParams] = useState({
        page: 1,
        per_page: 10
    });

    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: ['adminPendingVerifications', params],
        queryFn: () => adminUserService.getPendingVerifications(params),
    });

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
    console.log(data);
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
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading pending
                                    verifications...
                                </td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-red-500">Failed to load
                                    verifications.
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No pending
                                    verifications.
                                </td>
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
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                            >
                                                <CheckCircle className="w-4 h-4"/>
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(user.id)}
                                                className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                            >
                                                <XCircle className="w-4 h-4"/>
                                                Reject
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

export default AdminPendingVerifications;
