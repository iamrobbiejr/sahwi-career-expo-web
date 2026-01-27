import React from 'react';
import PaymentGatewayForm from './AdminPaymentGatewayForm';

const AdminPaymentGatewayCreate = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Add Payment Gateway</h1>
                <p className="text-gray-600">Configure a new payment provider.</p>
            </div>

            <PaymentGatewayForm/>
        </div>
    );
};

export default AdminPaymentGatewayCreate;
