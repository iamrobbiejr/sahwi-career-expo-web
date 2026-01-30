import React, {useEffect, useRef, useState} from 'react';
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Loader2,
    RefreshCw,
    Smartphone,
    SmartphoneNfc,
    Timer
} from 'lucide-react';
import {toast} from 'react-hot-toast';
import {paymentsService} from '../../services/api';

const SmileAndPayCheckout = ({registrationIds, onComplete, onCancel}) => {
    const [step, setStep] = useState('method-selection'); // 'method-selection', 'processing', 'success', 'failed', 'pending'
    const [paymentMethod, setPaymentMethod] = useState(null); // 'innbucks', 'ecocash', 'omari', 'card'
    const [formData, setFormData] = useState({
        phone: '',
        otp: '',
        card_number: '',
        card_expiry: '',
        card_cvv: ''
    });
    const [paymentResult, setPaymentResult] = useState(null);
    const [pollingCount, setPollingCount] = useState(0);
    const [timer, setTimer] = useState(0);
    const pollingIntervalRef = useRef(null);
    const timerIntervalRef = useRef(null);

    const methods = [
        {id: 'ecocash', name: 'Ecocash', icon: <Smartphone className="w-6 h-6"/>},
        {id: 'innbucks', name: 'Innbucks', icon: <SmartphoneNfc className="w-6 h-6"/>},
        {id: 'omari', name: 'Omari', icon: <Smartphone className="w-6 h-6"/>},
        {id: 'card', name: 'Cards', icon: <CreditCard className="w-6 h-6"/>}
    ];

    useEffect(() => {
        return () => {
            stopPolling();
            stopTimer();
        };
    }, []);

    const startTimer = (seconds) => {
        setTimer(seconds);
        stopTimer();
        timerIntervalRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    stopTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startPolling = (paymentId) => {
        setPollingCount(0);
        stopPolling();
        pollingIntervalRef.current = setInterval(async () => {
            setPollingCount((prev) => {
                const next = prev + 1;
                if (next >= 24) { // 24 * 5s = 120s (2 mins)
                    stopPolling();
                    setStep('failed');
                    setPaymentResult({message: 'Payment verification timed out. Please check your transaction status later.'});
                }
                return next;
            });

            try {
                const response = await paymentsService.getStatus(paymentId);
                const {status} = response.data;

                if (status === 'completed' || status === 'paid') {
                    stopPolling();
                    setStep('success');
                    setPaymentResult(response.data);
                } else if (status === 'failed') {
                    stopPolling();
                    setStep('failed');
                    setPaymentResult(response.data);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 5000);
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    const handleMethodSelect = (method) => {
        setPaymentMethod(method);
        setFormData({
            phone: '',
            otp: '',
            card_number: '',
            card_expiry: '',
            card_cvv: ''
        });
    };

    const validateForm = () => {
        if (paymentMethod === 'ecocash' || paymentMethod === 'innbucks' || (paymentMethod === 'omari' && step !== 'otp-input')) {
            if (!formData.phone) {
                toast.error('Phone number is required');
                return false;
            }
        }

        if (paymentMethod === 'omari' && step === 'otp-input') {
            if (!formData.otp) {
                toast.error('OTP is required');
                return false;
            }
        }

        if (paymentMethod === 'card') {
            if (!formData.card_number || !formData.card_expiry || !formData.card_cvv) {
                toast.error('All card details are required');
                return false;
            }
        }

        return true;
    };

    const handlePayment = async (e) => {
        e?.preventDefault();
        if (!validateForm()) return;

        setStep('processing');

        try {
            const payload = {
                registration_ids: registrationIds,
                payment_gateway: 'smile-and-pay',
                payment_method: paymentMethod,
                payment_phone: formData.phone,
                return_url: `${window.location.origin}/payments/verify`,
                cancel_url: `${window.location.origin}/payments/cancel`,
            };

            if (paymentMethod === 'card') {
                payload.card_details = {
                    number: formData.card_number,
                    expiry: formData.card_expiry,
                    cvv: formData.card_cvv
                };
            }

            if (paymentMethod === 'omari' && formData.otp) {
                payload.otp = formData.otp;
            }

            const response = await paymentsService.initiate(payload);
            const {payment, gateway_data} = response.data;

            if (paymentMethod === 'omari' && gateway_data?.requires_otp && !formData.otp) {
                setStep('otp-input');
                startTimer(300); // 5 mins
                return;
            }

            if (gateway_data?.redirectHtml) {
                // Handle 3DS redirect HTML injection
                const div = document.createElement('div');
                div.innerHTML = gateway_data.redirectHtml;
                document.body.appendChild(div);
                const form = div.querySelector('form');
                if (form) {
                    form.submit();
                }
                return;
            }

            if (paymentMethod === 'innbucks' && gateway_data?.payment_code) {
                setStep('pending');
                setPaymentResult({
                    ...payment,
                    payment_code: gateway_data.payment_code
                });
                startPolling(payment.id);
                return;
            }

            if (paymentMethod === 'ecocash') {
                setStep('pending');
                setPaymentResult(payment);
                startPolling(payment.id);
                return;
            }

            if (payment.status === 'completed' || payment.status === 'paid') {
                setStep('success');
                setPaymentResult(payment);
            } else {
                setStep('pending');
                setPaymentResult(payment);
                startPolling(payment.id);
            }

        } catch (err) {
            setStep('failed');
            setPaymentResult({
                message: err.response?.data?.message || 'Payment initiation failed'
            });
        }
    };

    const handleRetry = () => {
        setStep('method-selection');
        setPaymentResult(null);
    };

    if (step === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4"/>
                <h3 className="text-xl font-bold text-gray-900">Processing Payment</h3>
                <p className="text-gray-600 mt-2">Please do not close this window...</p>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600"/>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
                <p className="text-gray-600 mt-2">Your transaction has been completed successfully.</p>
                {paymentResult?.reference && (
                    <p className="text-sm font-mono bg-gray-100 px-3 py-1 rounded mt-4">
                        Ref: {paymentResult.reference}
                    </p>
                )}
                <button
                    onClick={() => onComplete(paymentResult)}
                    className="mt-8 px-8 py-3 bg-primary-600 text-white rounded-xl font-bold"
                >
                    Continue
                </button>
            </div>
        );
    }

    if (step === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-10 h-10 text-red-600"/>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Payment Failed</h3>
                <p className="text-gray-600 mt-2">{paymentResult?.message || 'Something went wrong with your payment.'}</p>
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={handleRetry}
                        className="px-6 py-3 border border-gray-200 rounded-xl font-bold flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4"/> Retry
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4"/>
                <h3 className="text-xl font-bold text-gray-900">Awaiting Confirmation</h3>

                {paymentMethod === 'innbucks' && paymentResult?.payment_code && (
                    <div className="mt-6 p-6 bg-primary-50 rounded-2xl border-2 border-primary-100">
                        <p className="text-sm font-bold text-primary-800 uppercase tracking-wider">Innbucks Payment
                            Code</p>
                        <p className="text-4xl font-black text-primary-600 mt-2 tracking-widest">{paymentResult.payment_code}</p>
                        <p className="text-xs text-primary-700 mt-4">Enter this code in your Innbucks app to pay.</p>
                    </div>
                )}

                {paymentMethod === 'ecocash' && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-amber-800 font-medium">Please check your phone for the USSD prompt to
                            authorize the payment.</p>
                    </div>
                )}

                <p className="text-gray-500 mt-6 text-sm">Waiting for payment status update...</p>
                <div className="mt-8 flex items-center gap-2 text-gray-400">
                    <Timer className="w-4 h-4"/>
                    <span className="text-xs font-medium">Polling status every 5 seconds</span>
                </div>
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
                        onClick={() => handleMethodSelect(m.id)}
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

            {paymentMethod && (
                <form onSubmit={handlePayment}
                      className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {step === 'otp-input' ? (
                        <div className="space-y-4">
                            <div
                                className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                                <div>
                                    <p className="text-blue-800 font-bold">OTP Verification</p>
                                    <p className="text-blue-600 text-sm">Please enter the OTP sent to your phone.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-blue-500 font-medium">Expires in</p>
                                    <p className="text-lg font-black text-blue-800">{formatTime(timer)}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Enter OTP</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-center text-2xl font-bold tracking-widest"
                                    placeholder="••••••"
                                    value={formData.otp}
                                    onChange={(e) => setFormData({...formData, otp: e.target.value})}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {(paymentMethod === 'ecocash' || paymentMethod === 'innbucks' || paymentMethod === 'omari') && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        {paymentMethod === 'innbucks' ? 'Innbucks Phone Number' : 'Phone Number'}
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                        placeholder="e.g. 0771234567"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1 ml-1">
                                        {paymentMethod === 'ecocash' && 'A USSD prompt will be sent to this number.'}
                                        {paymentMethod === 'innbucks' && 'Enter your Innbucks registered number.'}
                                        {paymentMethod === 'omari' && 'You will receive an OTP for confirmation.'}
                                    </p>
                                </div>
                            )}

                            {paymentMethod === 'card' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Card
                                            Number</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                            placeholder="•••• •••• •••• ••••"
                                            value={formData.card_number}
                                            onChange={(e) => setFormData({...formData, card_number: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Expiry
                                                (MM/YY)</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                                placeholder="MM/YY"
                                                value={formData.card_expiry}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    card_expiry: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">CVV</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                                placeholder="123"
                                                value={formData.card_cvv}
                                                onChange={(e) => setFormData({...formData, card_cvv: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                    >
                        {step === 'otp-input' ? 'Confirm Payment' : 'Pay Now'}
                        <ChevronRight className="w-5 h-5"/>
                    </button>
                </form>
            )}
        </div>
    );
};

export default SmileAndPayCheckout;
