import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {paymentsService} from '../services/api';
import {CheckCircle2, Loader2, XCircle} from 'lucide-react';
import {toast} from 'react-hot-toast';

/**
 * PaymentVerifyPage
 *
 * Used as the return_url for:
 *  - Paynow Standard:  /payments/verify?payment_id={id}  (Paynow redirects back here)
 *  - Stripe:           /payments/verify?payment_id={id}  (Stripe appends it via return_url)
 *
 * Also reachable directly at /payments/verify/:id from any payment details page.
 */
const PaymentVerifyPage = () => {
    const {id: paramId} = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Accept payment id from path param, query param, or sessionStorage (set before external redirect)
    const paymentId = paramId || searchParams.get('payment_id') || sessionStorage.getItem('pending_payment_id');

    const [status, setStatus] = useState('verifying'); // verifying | success | error
    const [message, setMessage] = useState('Verifying your payment…');
    const calledRef = useRef(false);

    useEffect(() => {
        if (calledRef.current) return;
        calledRef.current = true;

        const verify = async () => {
            if (!paymentId) {
                setStatus('error');
                setMessage('Missing payment information. Please check your payment history.');
                return;
            }

            try {
                const response = await paymentsService.verify(paymentId);
                // Clear the stored id regardless of outcome
                sessionStorage.removeItem('pending_payment_id');

                if (response.data.payment?.status === 'completed') {
                    setStatus('success');
                    setMessage('Payment verified successfully!');
                    toast.success('Payment completed!');
                } else {
                    setStatus('error');
                    setMessage('Payment verification is pending or the payment failed.');
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. Please try again.');
            }
        };

        verify();
    }, [paymentId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            {status === 'verifying' && (
                <>
                    <Loader2 className="w-16 h-16 text-primary-600 animate-spin mb-6"/>
                    <h1 className="text-2xl font-bold text-gray-900">{message}</h1>
                    <p className="text-gray-500 mt-2 text-sm">Please wait, this should only take a moment…</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600"/>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Success!</h1>
                    <p className="text-gray-600 mb-8">{message}</p>
                    <div className="flex gap-4">
                        {paymentId && (
                            <button
                                onClick={() => navigate(`/payments/${paymentId}`)}
                                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                View Receipt
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/my-registrations')}
                            className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                        >
                            View My Registrations
                        </button>
                    </div>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="w-12 h-12 text-red-600"/>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops!</h1>
                    <p className="text-gray-600 mb-8">{message}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/my-registrations')}
                            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            My Registrations
                        </button>
                        {paymentId ? (
                            <button
                                onClick={() => navigate(`/payments/${paymentId}`)}
                                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
                            >
                                Check Payment Status
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(-1)}
                                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PaymentVerifyPage;
