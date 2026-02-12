import React, {useEffect, useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {rolesService} from '../../../services/api';
import {AlertCircle, Check, Save, Shield} from 'lucide-react';
import {toast} from 'react-hot-toast';

const AdminRolesPage = () => {
    const queryClient = useQueryClient();
    const [selectedRole, setSelectedRole] = useState(null);
    const [localPermissions, setLocalPermissions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Roles
    const {data: rolesData, isLoading: isLoadingRoles} = useQuery({
        queryKey: ['adminRoles'],
        queryFn: rolesService.getRoles,
    });

    // Fetch Permissions
    const {data: permissionsData, isLoading: isLoadingPermissions} = useQuery({
        queryKey: ['adminPermissions'],
        queryFn: rolesService.getPermissions,
    });

    const roles = rolesData?.data?.data || rolesData?.data || [];
    const allPermissions = permissionsData?.data?.data || permissionsData?.data || [];

    // Group permissions by resource/module
    const groupedPermissions = allPermissions.reduce((acc, permission) => {
        const [resource, action] = permission.name.split('.');
        if (!acc[resource]) acc[resource] = [];
        acc[resource].push(permission);
        return acc;
    }, {});

    useEffect(() => {
        if (selectedRole) {
            setLocalPermissions(selectedRole.permissions?.map(p => p.name) || []);
        } else if (roles.length > 0) {
            setSelectedRole(roles[0]);
        }
    }, [selectedRole, roles]);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setLocalPermissions(role.permissions?.map(p => p.name) || []);
    };

    const handlePermissionToggle = (permissionName) => {
        setLocalPermissions(prev => {
            if (prev.includes(permissionName)) {
                return prev.filter(p => p !== permissionName);
            } else {
                return [...prev, permissionName];
            }
        });
    };

    const handleSave = async () => {
        if (!selectedRole) return;
        setIsSaving(true);
        try {
            await rolesService.updateRolePermissions(selectedRole.id, localPermissions);
            toast.success('Permissions updated successfully');
            await queryClient.invalidateQueries(['adminRoles']);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update permissions');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingRoles || isLoadingPermissions) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                <p className="text-gray-600">Manage roles and their associated permissions.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Roles List */}
                <div
                    className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary-600"/>
                            Roles
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${selectedRole?.id === role.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                                }`}
                            >
                                <span className="capitalize">{role.name.replace('_', ' ')}</span>
                                {selectedRole?.id === role.id &&
                                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>}
                            </button>
                        ))}
                        {roles.length === 0 && (
                            <div className="p-4 text-center text-gray-500 text-sm">No roles found</div>
                        )}
                    </div>
                </div>

                {/* Permissions Matrix */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div
                        className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl sticky top-0 z-10">
                        <div>
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="capitalize">{selectedRole?.name.replace('_', ' ')}</span> Permissions
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                {localPermissions.length} permissions selected
                            </p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !selectedRole}
                            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {isSaving ? (
                                <div
                                    className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                                <Save className="w-4 h-4"/>
                            )}
                            Save Changes
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[calc(100vh-250px)]">
                        {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                            <div key={resource} className="mb-8 last:mb-0">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                    {resource}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {permissions.map(permission => {
                                        const isSelected = localPermissions.includes(permission.name);
                                        return (
                                            <div
                                                key={permission.id}
                                                onClick={() => handlePermissionToggle(permission.name)}
                                                className={`cursor-pointer rounded-lg border p-3 flex items-start gap-3 transition-all ${isSelected
                                                    ? 'border-primary-200 bg-primary-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div
                                                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'
                                                    }`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-white"/>}
                                                </div>
                                                <div>
                                                    <span
                                                        className={`text-sm font-medium ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>
                                                        {permission.name}
                                                    </span>
                                                    {/* Optional: Add description if available */}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {Object.keys(groupedPermissions).length === 0 && (
                            <div className="flex flex-col items-center justify-center text-center py-12 text-gray-500">
                                <AlertCircle className="w-12 h-12 mb-4 text-gray-300"/>
                                <p>No permissions found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRolesPage;
