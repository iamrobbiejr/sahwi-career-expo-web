import React, {useState, useEffect} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {
    paymentsService,
    paymentGatewaysService,
    registrationsService
} from '../services/api';
import {
    CreditCard,
    Smartphone,
    Building2,
    ChevronRight,
    Loader2,
    AlertCircle,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import {toast} from 'react-hot-toast';

const InitiatePaymentPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const registrationIds = searchParams.getAll('registration_ids[]');

    const [selectedGateway, setSelectedGateway] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [phone, setPhone] = useState('');
    const [isInitiating, setIsInitiating] = useState(false);

    const {data: gatewaysData, isLoading: isLoadingGateways} = useQuery({
        queryKey: ['payment-gateways'],
        queryFn: () => paymentGatewaysService.getAll(),
    });

    const gateways = gatewaysData?.data || [];

    const handleInitiate = async () => {
        if (!selectedGateway) {
            toast.error('Please select a payment gateway');
            return;
        }

        if (paymentMethod === 'mobile_money' && !phone) {
            toast.error('Please enter your mobile money phone number');
            return;
        }

        setIsInitiating(true);
        try {
            const response = await paymentsService.initiate({
                registration_ids: registrationIds,
                payment_gateway: selectedGateway.slug,
                payment_method: paymentMethod,
                payment_phone: phone,
                return_url: `${window.location.origin}/payments/verify`,
                cancel_url: `${window.location.origin}/payments/cancel`,
            });

            const {payment, gateway_data} = response.data;

            toast.success('Payment initiated!');

            // If gateway provides a redirect URL, go there
            if (gateway_data.authorization_url || gateway_data.redirect_url) {
                window.location.href = gateway_data.authorization_url || gateway_data.redirect_url;
            } else {
                // Otherwise go to payment details page for manual verification or status checking
                navigate(`/payments/${payment.id}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setIsInitiating(false);
        }
    };

    if (registrationIds.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4"/>
                <h2 className="text-2xl font-bold text-gray-900">No registrations selected</h2>
                <p className="text-gray-600 mt-2">Please select registrations to pay for from your dashboard.</p>
                <button
                    onClick={() => navigate('/my-registrations')}
                    className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold"
                >
                    Go to My Registrations
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
                <p className="text-gray-600 mt-2">Choose your preferred payment method to secure your spot.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Payment Gateways */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">1. Select Payment Gateway</h3>
                        {isLoadingGateways ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 text-primary-600 animate-spin"/>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {gateways.map((gateway) => (
                                    <button
                                        key={gateway.id}
                                        onClick={() => setSelectedGateway(gateway)}
                                        className={`flex items-center justify-between p-4 border-2 rounded-2xl transition-all ${
                                            selectedGateway?.id === gateway.id
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden p-2">
                                                {gateway.logo ? (
                                                    <img src={gateway.logo} alt={gateway.name}
                                                         className="max-w-full max-h-full object-contain"/>
                                                ) : (
                                                    <CreditCard className="w-6 h-6 text-gray-400"/>
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900">{gateway.name}</p>
                                                <p className="text-xs text-gray-500">{gateway.description || 'Secure payment gateway'}</p>
                                            </div>
                                        </div>
                                        {selectedGateway?.id === gateway.id && (
                                            <CheckCircle2 className="w-6 h-6 text-primary-600"/>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Payment Method */}
                    <section className={!selectedGateway ? 'opacity-50 pointer-events-none' : ''}>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">2. Payment Method</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all ${
                                    paymentMethod === 'card'
                                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                                        : 'border-gray-100 bg-white text-gray-500'
                                }`}
                            >
                                <CreditCard className="w-6 h-6"/>
                                <span className="text-xs font-bold">Card</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('mobile_money')}
                                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all ${
                                    paymentMethod === 'mobile_money'
                                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                                        : 'border-gray-100 bg-white text-gray-500'
                                }`}
                            >
                                <Smartphone className="w-6 h-6"/>
                                <span className="text-xs font-bold">Mobile Money</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('bank_transfer')}
                                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all ${
                                    paymentMethod === 'bank_transfer'
                                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                                        : 'border-gray-100 bg-white text-gray-500'
                                }`}
                            >
                                <Building2 className="w-6 h-6"/>
                                <span className="text-xs font-bold">Bank</span>
                            </button>
                        </div>

                        {paymentMethod === 'mobile_money' && (
                            <div className="mt-6 space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                        placeholder="e.g. 0771234567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 ml-1">You will receive a prompt on your phone to
                                    authorize the payment.</p>
                            </div>
                        )}
                    </section>

                    <button
                        onClick={handleInitiate}
                        disabled={!selectedGateway || isInitiating}
                        className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isInitiating ? (
                            <Loader2 className="w-5 h-5 animate-spin"/>
                        ) : (
                            <>
                                Confirm and Pay Now
                                <ChevronRight className="w-5 h-5"/>
                            </>
                        )}
                    </button>
                </div>

                {/* Order Summary Sidebar */}
                <div>
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-8">
                        <h3 className="font-bold text-gray-900 mb-6">Payment Summary</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Selected Registrations</span>
                                <span className="font-bold text-gray-900">{registrationIds.length}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-gray-900 font-bold">Total Amount</span>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-primary-600">Calculating...</p>
                                    <p className="text-xs text-gray-500">Incl. all taxes</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                            <div className="flex gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5"/>
                                <p className="text-[10px] text-gray-600">
                                    Your payment is secured with industry-standard encryption.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InitiatePaymentPage;
