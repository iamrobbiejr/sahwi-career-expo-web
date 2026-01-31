import React, {useState} from 'react';
import {CreditCard, Loader2, Smartphone, SmartphoneNfc} from 'lucide-react';
import {toast} from 'react-hot-toast';
import {paymentsService} from '../../services/api';

const SmileAndPayCheckout = ({registrationIds}) => {
    const [isInitiating, setIsInitiating] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null); // 'innbucks', 'ecocash', 'omari', 'card'

    const methods = [
        {id: 'ecocash', name: 'Ecocash', icon: <Smartphone className="w-6 h-6"/>},
        {id: 'innbucks', name: 'Innbucks', icon: <SmartphoneNfc className="w-6 h-6"/>},
        {id: 'omari', name: 'Omari', icon: <Smartphone className="w-6 h-6"/>},
        {id: 'card', name: 'Cards', icon: <CreditCard className="w-6 h-6"/>}
    ];

    const handlePayment = async (method) => {
        setPaymentMethod(method);
        setIsInitiating(true);

        try {
            const payload = {
                registration_ids: registrationIds,
                payment_gateway: 'smile-and-pay',
                payment_method: method,
                return_url: `${window.location.origin}/payments/verify`,
                cancel_url: `${window.location.origin}/payments/cancel`,
            };

            const response = await paymentsService.initiate(payload);
            const {gateway_data} = response.data;

            console.log('payload: ', payload)
            console.log("res: ", response);

            if (gateway_data?.authorization_url || gateway_data?.paymentUrl) {
                window.location.href = gateway_data.authorization_url || gateway_data.paymentUrl;
            } else {
                toast.error('Payment gateway did not provide a redirect URL');
                setIsInitiating(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment initiation failed');
            setIsInitiating(false);
        }
    };

    if (isInitiating) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4"/>
                <h3 className="text-xl font-bold text-gray-900">Redirecting to Payment</h3>
                <p className="text-gray-600 mt-2">Please wait while we redirect you to the secure payment page...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {methods.map((m) => (
                    <button
                        key={m.id}
                        type="button"
                        onClick={() => handlePayment(m.id)}
                        className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${
                            paymentMethod === m.id
                                ? 'border-primary-600 bg-primary-50 text-primary-600'
                                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                        }`}
                    >
                        {m.icon}
                        <span className="text-[10px] font-bold uppercase">{m.name}</span>
                    </button>
                ))}
            </div>
            <p className="text-center text-sm text-gray-500">
                Select a payment method to continue to the secure payment page.
            </p>
        </div>
    );
};

export default SmileAndPayCheckout;
