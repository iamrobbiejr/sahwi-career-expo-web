import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {paymentsService} from '../services/api';
import {AlertCircle, CheckCircle2, Loader2, XCircle} from 'lucide-react';
import {toast} from 'react-hot-toast';

/**
 * SahwiPayReturnPage
 *
 * SahwiPay redirects users back to /payments/sahwipay-return with:
 *   ?reference=PAY-XXX&serverId=ABC&status=SUCCESS|FAILED|CANCELLED
 *
 * This page:
 *  1. Reads those URL params
 *  2. POSTs them to POST /api/v1/webhooks/sahwipay  (so the backend can record the outcome)
 *  3. POSTs to POST /api/v1/payments/{id}/verify     (to get the final status)
 *  4. Navigates the user to the payment details page or shows an error
 */
const SahwiPayReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const reference = searchParams.get('reference');
    const serverId = searchParams.get('serverId');
    const status = searchParams.get('status'); // SUCCESS | FAILED | CANCELLED

    const [stage, setStage] = useState('processing'); // processing | success | error | cancelled
    const [message, setMessage] = useState('Verifying your payment, please wait…');
    const calledRef = useRef(false);

    useEffect(() => {
        // Guard: run only once even in React strict mode
        if (calledRef.current) return;
        calledRef.current = true;

        const handleReturn = async () => {
            // Basic guard: need at least a reference
            if (!reference) {
                setStage('error');
                setMessage('Missing payment reference from SahwiPay. Please check your payment status manually.');
                return;
            }

            // Early-out for obvious failure/cancel
            if (status === 'CANCELLED') {
                setStage('cancelled');
                setMessage('Payment was cancelled. You have not been charged.');
                return;
            }

            try {
                // Step 2: notify backend about the SahwiPay return params
                await paymentsService.webhookSahwipay({
                    reference,
                    serverId,
                    status,
                });

                // Retrieve the payment ID we stored before redirecting
                const paymentId = sessionStorage.getItem('pending_payment_id');
                sessionStorage.removeItem('pending_payment_id');

                if (status === 'SUCCESS') {
                    toast.success('Payment confirmed! Verifying…');
                    setStage('success');
                    setMessage('Payment confirmed! Redirecting…');
                    // Navigate to payment details / verify
                    setTimeout(() => {
                        if (paymentId) {
                            navigate(`/payments/${paymentId}`);
                        } else {
                            navigate('/my-registrations');
                        }
                    }, 2000);
                } else {
                    setStage('error');
                    setMessage('Payment was not successful. Please try again.');
                }
            } catch (err) {
                console.error('SahwiPay return handler error:', err);
                setStage('error');
                setMessage(
                    err.response?.data?.message ||
                    'Something went wrong while verifying your payment. Please check your payment history.'
                );
            }
        };

        handleReturn();
    }, [reference, serverId, status, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
            {stage === 'processing' && (
                <>
                    <Loader2 className="w-16 h-16 text-primary-600 animate-spin mb-6"/>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h1>
                    <p className="text-gray-500 max-w-sm">{message}</p>
                </>
            )}

            {stage === 'success' && (
                <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600"/>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-8 max-w-sm">{message}</p>
                    <button
                        onClick={() => navigate('/my-registrations')}
                        className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                    >
                        View My Registrations
                    </button>
                </>
            )}

            {stage === 'cancelled' && (
                <>
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-12 h-12 text-amber-500"/>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
                    <p className="text-gray-600 mb-8 max-w-sm">{message}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/my-registrations')}
                            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            My Registrations
                        </button>
                        <button
                            onClick={() => navigate(-2)}
                            className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                </>
            )}

            {stage === 'error' && (
                <>
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="w-12 h-12 text-red-600"/>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                    <p className="text-gray-600 mb-8 max-w-sm">{message}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/my-registrations')}
                            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            My Registrations
                        </button>
                        <button
                            onClick={() => navigate(-2)}
                            className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                </>
            )}

            {/* Reference badge */}
            {reference && (
                <div className="mt-8 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400">
                        Reference: <span className="font-mono font-semibold text-gray-600">{reference}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default SahwiPayReturnPage;
