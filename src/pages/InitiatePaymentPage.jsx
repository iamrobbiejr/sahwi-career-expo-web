import React, {useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {paymentGatewaysService, paymentsService, registrationsService} from '../services/api';
import SmileAndPayCheckout from '../components/payment/SmileAndPayCheckout';
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    ExternalLink,
    Globe,
    Loader2,
    ShieldCheck,
    Smartphone,
    Wifi,
} from 'lucide-react';
import {toast} from 'react-hot-toast';

// ─── Paynow Checkout ──────────────────────────────────────────────────────────
const PaynowCheckout = ({registrationIds}) => {
    const navigate = useNavigate();
    const [mode, setMode] = useState(null); // 'redirect' | 'mobile_money'
    const [phone, setPhone] = useState('');
    const [network, setNetwork] = useState('ecocash');
    const [isLoading, setIsLoading] = useState(false);

    const networks = [
        {id: 'ecocash', label: 'EcoCash'},
        {id: 'onemoney', label: 'OneMoney'},
    ];

    const handlePay = async () => {
        if (!mode) {
            toast.error('Please select a payment method');
            return;
        }
        if (mode === 'mobile_money' && !phone.trim()) {
            toast.error('Please enter your mobile money phone number');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                registration_ids: registrationIds,
                payment_gateway: 'paynow',
                payment_method: mode,
                return_url: `${window.location.origin}/payments/verify`,
                cancel_url: `${window.location.origin}/payments/cancel`,
            };

            if (mode === 'mobile_money') {
                payload.phone = phone.trim();
                payload.network = network;
            }

            const response = await paymentsService.initiate(payload);
            const {payment, gateway_data} = response.data;

            // Store payment ID so the verify/return page can pick it up
            sessionStorage.setItem('pending_payment_id', payment.id);

            toast.success('Payment initiated!');

            if (mode === 'redirect') {
                // Standard: redirect to Paynow hosted page
                const redirectTo = gateway_data?.redirect_url;
                if (redirectTo) {
                    window.location.href = redirectTo;
                } else {
                    navigate(`/payments/${payment.id}`);
                }
            } else {
                // Express: navigate to payment details for polling
                if (gateway_data?.instructions) {
                    toast.success(gateway_data.instructions);
                }
                navigate(`/payments/${payment.id}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4"/>
                <h3 className="text-xl font-bold text-gray-900">
                    {mode === 'redirect' ? 'Redirecting to Paynow…' : 'Sending payment prompt…'}
                </h3>
                <p className="text-gray-500 mt-2 text-sm">Please wait…</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mode Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setMode('redirect')}
                    className={`flex items-center gap-3 p-4 border-2 rounded-2xl transition-all text-left ${mode === 'redirect'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                >
                    <div className={`p-2 rounded-xl ${mode === 'redirect' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                        <Globe className={`w-5 h-5 ${mode === 'redirect' ? 'text-primary-600' : 'text-gray-500'}`}/>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Standard</p>
                        <p className="text-xs text-gray-500">Card / InnBucks / O'mari</p>
                    </div>
                    {mode === 'redirect' && <CheckCircle2 className="w-5 h-5 text-primary-600 ml-auto shrink-0"/>}
                </button>

                <button
                    type="button"
                    onClick={() => setMode('mobile_money')}
                    className={`flex items-center gap-3 p-4 border-2 rounded-2xl transition-all text-left ${mode === 'mobile_money'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                >
                    <div className={`p-2 rounded-xl ${mode === 'mobile_money' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                        <Smartphone
                            className={`w-5 h-5 ${mode === 'mobile_money' ? 'text-primary-600' : 'text-gray-500'}`}/>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Mobile Money</p>
                        <p className="text-xs text-gray-500">EcoCash / OneMoney </p>
                    </div>
                    {mode === 'mobile_money' &&
                        <CheckCircle2 className="w-5 h-5 text-primary-600 ml-auto shrink-0"/>}
                </button>
            </div>

            {/* Mobile Money Fields */}
            {mode === 'mobile_money' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    {/* Network */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Mobile Network</label>
                        <div className="grid grid-cols-3 gap-2">
                            {networks.map((n) => (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => setNetwork(n.id)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${network === n.id
                                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    {n.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Phone Number</label>
                        <div className="relative">
                            <Smartphone className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
                            <input
                                type="tel"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                placeholder="e.g. 0771234567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-1">You will receive a USSD prompt on your
                            phone.</p>
                    </div>
                </div>
            )}

            {mode === 'redirect' && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <ExternalLink className="w-4 h-4 text-blue-500 shrink-0 mt-0.5"/>
                    <p className="text-xs text-blue-700">You will be redirected to Paynow's secure hosted
                        payment page to complete your payment.</p>
                </div>
            )}

            <button
                type="button"
                onClick={handlePay}
                disabled={!mode}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
                <span>Pay with Paynow</span>
                <ChevronRight className="w-5 h-5"/>
            </button>
        </div>
    );
};

// ─── Stripe Checkout ──────────────────────────────────────────────────────────
const StripeCheckout = ({registrationIds}) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handlePay = async () => {
        setIsLoading(true);
        try {
            const response = await paymentsService.initiate({
                registration_ids: registrationIds,
                payment_gateway: 'stripe',
                return_url: `${window.location.origin}/payments/verify`,
                cancel_url: `${window.location.origin}/payments/cancel`,
            });

            const {payment, gateway_data} = response.data;
            // Store for when Stripe redirects back
            sessionStorage.setItem('pending_payment_id', payment.id);
            toast.success('Redirecting to Stripe…');

            const redirectTo = gateway_data?.redirect_url || gateway_data?.authorization_url || gateway_data?.paymentUrl;
            if (redirectTo) {
                window.location.href = redirectTo;
            } else {
                navigate(`/payments/${payment.id}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initiate Stripe payment');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4"/>
                <h3 className="text-xl font-bold text-gray-900">Redirecting to Stripe…</h3>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5"/>
                <p className="text-xs text-indigo-700">
                    You will be redirected to Stripe's PCI-compliant hosted checkout page to securely enter your card
                    details.
                </p>
            </div>
            <button
                type="button"
                onClick={handlePay}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
                <CreditCard className="w-5 h-5"/>
                <span>Pay with Stripe</span>
                <ChevronRight className="w-5 h-5"/>
            </button>
        </div>
    );
};

// ─── SahwiPay Checkout ────────────────────────────────────────────────────────
const SahwiPayCheckout = ({registrationIds}) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handlePay = async () => {
        setIsLoading(true);
        try {
            const response = await paymentsService.initiate({
                registration_ids: registrationIds,
                payment_gateway: 'sahwipay',
                // SahwiPay appends ?reference=&serverId=&status= to the return URL
                return_url: `${window.location.origin}/payments/sahwipay-return`,
                cancel_url: `${window.location.origin}/payments/cancel`,
            });

            const {payment, gateway_data} = response.data;
            // Store so the SahwiPay return page can find it
            sessionStorage.setItem('pending_payment_id', payment.id);
            toast.success('Redirecting to SahwiPay…');

            const redirectTo = gateway_data?.redirect_url || gateway_data?.authorization_url || gateway_data?.paymentUrl;
            if (redirectTo) {
                window.location.href = redirectTo;
            } else {
                navigate(`/payments/${payment.id}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initiate SahwiPay payment');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4"/>
                <h3 className="text-xl font-bold text-gray-900">Redirecting to SahwiPay…</h3>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <Wifi className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"/>
                <p className="text-xs text-emerald-700">
                    You will be redirected to SahwiPay's Visa/Mastercard portal to complete your payment securely.
                </p>
            </div>
            <button
                type="button"
                onClick={handlePay}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
                <CreditCard className="w-5 h-5"/>
                <span>Pay with SahwiPay</span>
                <ChevronRight className="w-5 h-5"/>
            </button>
        </div>
    );
};

// ─── Gateway icon helpers ─────────────────────────────────────────────────────
const GATEWAY_BADGE_COLORS = {
    stripe: 'bg-indigo-100 text-indigo-600',
    sahwipay: 'bg-emerald-100 text-emerald-600',
    paynow: 'bg-amber-100 text-amber-700',
    'smile-and-pay': 'bg-primary-100 text-primary-600',
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const InitiatePaymentPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const registrationIds = searchParams.getAll('registration_ids[]');

    const [selectedGateway, setSelectedGateway] = useState(null);

    const {data: registrations, isLoading: isLoadingRegistrations} = useQuery({
        queryKey: ['registrations', registrationIds],
        queryFn: async () => {
            const responses = await Promise.all(
                registrationIds.map(id => registrationsService.getById(id))
            );
            return responses.map(res => res.data.registration || res.data.data || res.data);
        },
        enabled: registrationIds.length > 0,
    });

    const totalAmount = registrations?.reduce((sum, reg) => {
        return sum + (reg.event?.price_cents || 0) / 100;
    }, 0) || 0;

    const currency = registrations?.[0]?.event?.currency || 'USD';

    const {data: gatewaysData, isLoading: isLoadingGateways} = useQuery({
        queryKey: ['payment-gateways'],
        queryFn: () => paymentGatewaysService.getAll(),
        select: (data) => ({
            ...data,
            data: (data.data || []).filter(g =>
                ['stripe', 'sahwipay', 'paynow', 'smile-and-pay'].includes(g.slug) && g.is_active
            ),
        }),
    });

    const gateways = gatewaysData?.data || [];

    // ── Render gateway-specific checkout section ──────────────────────────────
    const renderGatewayCheckout = () => {
        if (!selectedGateway) return null;

        const slug = selectedGateway.slug;

        if (slug === 'smile-and-pay') {
            return (
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">2. Smile&amp;Pay Checkout</h3>
                    <SmileAndPayCheckout registrationIds={registrationIds}/>
                </section>
            );
        }

        if (slug === 'paynow') {
            return (
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">2. Paynow — Select Payment Method</h3>
                    <PaynowCheckout registrationIds={registrationIds}/>
                </section>
            );
        }

        if (slug === 'stripe') {
            return (
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">2. Stripe Checkout</h3>
                    <StripeCheckout registrationIds={registrationIds}/>
                </section>
            );
        }

        if (slug === 'sahwipay') {
            return (
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">2. SahwiPay Checkout</h3>
                    <SahwiPayCheckout registrationIds={registrationIds}/>
                </section>
            );
        }

        return null;
    };

    // ── Empty state: no registrations ─────────────────────────────────────────
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
                {/* Left column: gateway selector + checkout */}
                <div className="md:col-span-2 space-y-8">

                    {/* Step 1 — Gateway */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">1. Select Payment Gateway</h3>
                        {isLoadingGateways ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 text-primary-600 animate-spin"/>
                            </div>
                        ) : gateways.length === 0 ? (
                            <div className="p-6 text-center bg-amber-50 rounded-2xl border border-amber-100">
                                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2"/>
                                <p className="text-sm text-amber-700 font-semibold">No payment gateways are available
                                    right now.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {gateways.map((gateway) => {
                                    const isSelected = selectedGateway?.id === gateway.id;
                                    const badgeClass = GATEWAY_BADGE_COLORS[gateway.slug] || 'bg-gray-100 text-gray-600';
                                    return (
                                        <button
                                            key={gateway.id}
                                            onClick={() => setSelectedGateway(
                                                isSelected ? null : gateway
                                            )}
                                            className={`flex items-center justify-between p-4 border-2 rounded-2xl transition-all ${isSelected
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
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {gateway.description || getGatewayDescription(gateway.slug)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badgeClass}`}>
                                                    {getGatewayLabel(gateway.slug)}
                                                </span>
                                                {isSelected && (
                                                    <CheckCircle2 className="w-6 h-6 text-primary-600"/>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Step 2 — Gateway Checkout */}
                    {renderGatewayCheckout()}
                </div>

                {/* Right column: Order Summary */}
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
                                    {isLoadingRegistrations ? (
                                        <p className="text-2xl font-black text-primary-600 flex items-center justify-end gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin"/>
                                            <span>Calculating…</span>
                                        </p>
                                    ) : (
                                        <p className="text-2xl font-black text-primary-600">
                                            {currency} {totalAmount.toFixed(2)}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">Excl. tax</p>
                                </div>
                            </div>
                        </div>

                        {/* Registrant list */}
                        {registrations && registrations.length > 0 && (
                            <div className="mb-6 space-y-2">
                                {registrations.map((reg, i) => (
                                    <div key={reg.id ?? i}
                                         className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-xl">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/>
                                        <span className="text-gray-700 truncate">
                                            {reg.attendee_name || reg.user?.name || `Registration #${reg.id}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                            <div className="flex gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5"/>
                                <p className="text-[10px] text-gray-600">
                                    Your payment is secured with industry-standard encryption. We do not store your
                                    card details.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGatewayDescription(slug) {
    const map = {
        stripe: 'Visa, Mastercard & more',
        sahwipay: 'Visa / Mastercard Portal',
        paynow: 'Standard redirect or mobile money',
        'smile-and-pay': 'EcoCash, Innbucks, Cards & more',
    };
    return map[slug] || 'Secure payment gateway';
}

function getGatewayLabel(slug) {
    const map = {
        stripe: 'Card',
        sahwipay: 'Local',
        paynow: 'Local',
        'smile-and-pay': 'Multi',
    };
    return map[slug] || 'Pay';
}

export default InitiatePaymentPage;
