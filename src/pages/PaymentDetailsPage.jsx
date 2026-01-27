import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {paymentsService} from '../services/api';
import {
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    RefreshCw,
    Ticket,
    ExternalLink
} from 'lucide-react';
import {toast} from 'react-hot-toast';

const PaymentDetailsPage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);

    const {data, isLoading, refetch} = useQuery({
        queryKey: ['payment', id],
        queryFn: () => paymentsService.getById(id),
    });

    const payment = data?.data?.payment;

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            const response = await paymentsService.verify(id);
            toast.success(response.data.message);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    useEffect(() => {
        // If payment is processing, poll for status every 5 seconds
        let interval;
        if (payment?.status === 'processing') {
            interval = setInterval(() => {
                refetch();
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [payment?.status, refetch]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin"/>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Payment not found</h2>
                <button
                    onClick={() => navigate('/my-payments')}
                    className="mt-6 inline-flex items-center text-primary-600 font-semibold"
                >
                    <ChevronLeft className="w-5 h-5 mr-1"/>
                    Back to My Payments
                </button>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            case 'cancelled':
                return 'text-gray-600 bg-gray-100';
            case 'processing':
                return 'text-blue-600 bg-blue-100';
            default:
                return 'text-amber-600 bg-amber-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-8 h-8 text-green-600"/>;
            case 'failed':
                return <XCircle className="w-8 h-8 text-red-600"/>;
            case 'processing':
                return <Loader2 className="w-8 h-8 text-blue-600 animate-spin"/>;
            default:
                return <Clock className="w-8 h-8 text-amber-600"/>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <button
                onClick={() => navigate(-1)}
                className="mb-8 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 mr-1"/>
                Back
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Status Header */}
                <div className="p-8 border-b border-gray-100 text-center">
                    <div className="flex justify-center mb-4">
                        {getStatusIcon(payment.status)}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Payment {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </h1>
                    <p className="text-gray-500">Transaction ID: {payment.id}</p>
                    <div className="mt-4 flex justify-center">
            <span
                className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusColor(payment.status)}`}>
              {payment.status}
            </span>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Details */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Details</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Event</span>
                                <span className="font-semibold text-gray-900">{payment.event?.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-bold text-primary-600">
                  {payment.currency} {(payment.amount_cents / 100).toFixed(2)}
                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Gateway</span>
                                <span className="font-semibold text-gray-900">{payment.gateway?.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Method</span>
                                <span
                                    className="font-semibold text-gray-900 capitalize">{payment.payment_method?.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Date</span>
                                <span className="font-semibold text-gray-900">
                  {new Date(payment.created_at).toLocaleString()}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions & Items */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Registrations</h3>
                        <div className="space-y-3 mb-8">
                            {payment.items?.map((item) => (
                                <div key={item.id}
                                     className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{item.registration?.attendee_name}</p>
                                        <p className="text-xs text-gray-500">{item.registration?.attendee_email}</p>
                                    </div>
                                    {payment.status === 'completed' && item.registration?.ticket && (
                                        <button
                                            onClick={() => navigate(`/tickets/${item.registration.ticket.id}`)}
                                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            title="View Ticket"
                                        >
                                            <Ticket className="w-5 h-5"/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {payment.status === 'processing' && (
                                <button
                                    onClick={handleVerify}
                                    disabled={isVerifying}
                                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin"/> :
                                        <RefreshCw className="w-5 h-5"/>}
                                    Verify Payment Status
                                </button>
                            )}

                            {payment.status === 'completed' && (
                                <button
                                    onClick={() => navigate('/my-registrations')}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                >
                                    View My Registrations
                                </button>
                            )}

                            {(payment.status === 'failed' || payment.status === 'cancelled') && (
                                <button
                                    onClick={() => navigate(`/events/${payment.event_id}`)}
                                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailsPage;
