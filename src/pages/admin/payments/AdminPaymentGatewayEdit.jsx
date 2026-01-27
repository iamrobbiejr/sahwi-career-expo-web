import React from 'react';
import {useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {paymentGatewaysService} from '../../../services/api';
import PaymentGatewayForm from './AdminPaymentGatewayForm';

const AdminPaymentGatewayEdit = () => {
    const {id} = useParams();

    const {data, isLoading, isError} = useQuery({
        queryKey: ['adminPaymentGateway', id],
        queryFn: () => paymentGatewaysService.adminGetById(id),
    });

    const gateway = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (isError || !gateway) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Gateway not found</h2>
                <p className="text-gray-600 mt-2">The payment gateway you are trying to edit does not exist.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Payment Gateway</h1>
                <p className="text-gray-600">Update configuration for {gateway.name}.</p>
            </div>

            <PaymentGatewayForm initialData={gateway} isEdit={true}/>
        </div>
    );
};

export default AdminPaymentGatewayEdit;
