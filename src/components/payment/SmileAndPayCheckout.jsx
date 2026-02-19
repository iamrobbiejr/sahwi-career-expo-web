import React, {useState} from 'react';
import {CreditCard, Loader2, Smartphone, SmartphoneNfc, Wallet} from 'lucide-react';
import {toast} from 'react-hot-toast';
import {paymentsService} from '../../services/api';

const SmileAndPayCheckout = ({registrationIds}) => {
    const [isInitiating, setIsInitiating] = useState(false);

    const methods = [
        {id: 'ecocash', name: 'Ecocash', icon: <Smartphone className="w-6 h-6"/>},
        {id: 'innbucks', name: 'Innbucks', icon: <SmartphoneNfc className="w-6 h-6"/>},
        {id: 'omari', name: 'Omari', icon: <Smartphone className="w-6 h-6"/>},
        {id: 'card', name: 'Cards', icon: <CreditCard className="w-6 h-6"/>}
    ];

    const handlePayment = async () => {
        setIsInitiating(true);

        try {
            const payload = {
                registration_ids: registrationIds,
                payment_gateway: 'smile-and-pay',
                payment_method: 'redirect', // Use standard redirect for all options
                return_url: `${window.location.origin}/payments/verify`,
                cancel_url: `${window.location.origin}/payments/cancel`,
            };

            const response = await paymentsService.initiate(payload);
            const {payment, gateway_data} = response.data;

            // Store payment ID for verification
            sessionStorage.setItem('pending_payment_id', payment.id);

            const redirectTo = gateway_data?.redirect_url || gateway_data?.authorization_url || gateway_data?.paymentUrl;

            if (redirectTo) {
                window.location.href = redirectTo;
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
                <h3 className="text-xl font-bold text-gray-900">Redirecting to Smile & Pay</h3>
                <p className="text-gray-600 mt-2">Please wait while we redirect you to the secure payment page...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-80">
                {methods.map((m) => (
                    <div
                        key={m.id}
                        className="flex flex-col items-center gap-2 p-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-400"
                    >
                        {m.icon}
                        <span className="text-[10px] font-bold uppercase">{m.name}</span>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={handlePayment}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
            >
                <Wallet className="w-5 h-5"/>
                <span>Pay with Smile & Pay</span>
            </button>

            <p className="text-center text-xs text-gray-500">
                You will be able to choose between Ecocash, Innbucks, Omari or Card on the next page.
            </p>
        </div>
    );
};

export default SmileAndPayCheckout;
