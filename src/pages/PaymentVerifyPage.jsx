import React, {useEffect, useState} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {paymentsService} from '../services/api';
import {Loader2, CheckCircle2, XCircle} from 'lucide-react';
import {toast} from 'react-hot-toast';

const PaymentVerifyPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your payment...');

    const paymentId = searchParams.get('payment_id') || searchParams.get('id');

    useEffect(() => {
        const verify = async () => {
            if (!paymentId) {
                setStatus('error');
                setMessage('Missing payment information.');
                return;
            }

            try {
                const response = await paymentsService.verify(paymentId);
                if (response.data.payment?.status === 'completed') {
                    setStatus('success');
                    setMessage('Payment verified successfully!');
                    toast.success('Payment completed!');
                } else {
                    setStatus('error');
                    setMessage('Payment verification pending or failed.');
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed.');
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
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600"/>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Success!</h1>
                    <p className="text-gray-600 mb-8">{message}</p>
                    <button
                        onClick={() => navigate('/my-registrations')}
                        className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                    >
                        View My Registrations
                    </button>
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
                        <button
                            onClick={() => navigate(-1)}
                            className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PaymentVerifyPage;
