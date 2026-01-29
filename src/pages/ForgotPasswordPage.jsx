import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {FiChevronLeft, FiKey, FiMail} from 'react-icons/fi';
import toast from 'react-hot-toast';
import bgImage from '../assets/bg.jpg';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // API call to send reset link
        console.log('Resetting password for:', email);
        toast.success('Reset link sent to your email!');
        setIsSubmitted(true);
    };

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
                        <FiKey className="text-white text-3xl"/>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
                    <p className="text-gray-600">Enter your email to receive a reset link</p>
                </div>

                {isSubmitted ? (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                            A password reset link has been sent to <strong>{email}</strong>.
                        </div>
                        <Link to="/login" className="btn-primary w-full flex items-center justify-center py-3">
                            <FiChevronLeft className="mr-2"/> Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="h-5 w-5 text-gray-400"/>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full py-3">
                            Send Reset Link
                        </button>
                    </form>
                )}

                <p className="text-center mt-6 text-sm text-gray-600">
                    Remember your password?{' '}
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
