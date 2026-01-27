import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {paymentGatewaysService} from '../../../services/api';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    ToggleLeft,
    ToggleRight,
    CreditCard,
    Settings,
    Webhook,
    DollarSign
} from 'lucide-react';
import {Link} from 'react-router-dom';
import {toast} from 'react-hot-toast';

const AdminPaymentGatewayList = () => {
    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: ['adminPaymentGateways'],
        queryFn: () => paymentGatewaysService.getAll(),
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payment gateway?')) {
            try {
                await paymentGatewaysService.adminDelete(id);
                toast.success('Payment gateway deleted successfully');
                refetch();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete payment gateway');
            }
        }
    };

    const gateways = data?.data || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Gateways</h1>
                    <p className="text-gray-600">Manage payment providers and their credentials.</p>
                </div>
                <Link
                    to="/admin/payments/gateways/create"
                    className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5"/>
                    <span>Add Gateway</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gateways.length > 0 ? (
                    gateways.map((gateway) => (
                        <div key={gateway.id}
                             className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-primary-50 rounded-xl">
                                        <CreditCard className="w-6 h-6 text-primary-600"/>
                                    </div>
                                    <div className="flex items-center gap-2">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${gateway.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {gateway.is_active ? 'Active' : 'Inactive'}
                    </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900">{gateway.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{gateway.slug}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <DollarSign className="w-4 h-4"/>
                                        <span>{(gateway.supported_currencies || []).join(', ') || 'All Currencies'}</span>
                                    </div>
                                    {gateway.supports_webhooks && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Webhook className="w-4 h-4"/>
                                            <span>Webhooks Supported</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/admin/payments/gateways/${gateway.id}/edit`}
                                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            title="Edit Gateway"
                                        >
                                            <Edit2 className="w-5 h-5"/>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(gateway.id)}
                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Gateway"
                                        >
                                            <Trash2 className="w-5 h-5"/>
                                        </button>
                                    </div>
                                    <span
                                        className="text-xs text-gray-400 font-medium">Order: {gateway.display_order}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div
                        className="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
                        <h3 className="text-lg font-bold text-gray-900">No payment gateways found</h3>
                        <p className="text-gray-500 mb-6">Get started by adding your first payment gateway.</p>
                        <Link
                            to="/admin/payments/gateways/create"
                            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700"
                        >
                            <Plus className="w-5 h-5"/>
                            <span>Add Gateway</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPaymentGatewayList;
