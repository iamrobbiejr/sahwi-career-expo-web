import React, {useState} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {motion} from 'framer-motion';
import {FiAlertCircle, FiLock, FiRefreshCw} from 'react-icons/fi';
import toast from 'react-hot-toast';
import bgImage from '../assets/bg.jpg';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');

        // API call to reset password
        console.log('Resetting password for:', email, 'with token:', token);
        toast.success('Password reset successful!');
        setIsSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
    };

    if (!token || !email) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4"/>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h1>
                    <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" title="Try Again" className="btn-primary inline-block">Request new
                        link</Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
            style={{backgroundImage: `url(${bgImage})`}}>
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div
                        className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <FiRefreshCw className="text-white text-3xl"/>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                    <p className="text-gray-600">Enter your new password below</p>
                </div>

                {isSuccess ? (
                    <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center">
                        Password reset successful! Redirecting to login...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                                <FiAlertCircle className="mr-2"/>
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400"/>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400"/>
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full py-3">
                            Reset Password
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
