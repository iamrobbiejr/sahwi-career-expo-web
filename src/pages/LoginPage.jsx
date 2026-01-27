import React from 'react';
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {AlertCircle, Loader2} from 'lucide-react';
import {FiMail, FiLock, FiLogIn} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {useAuthStore} from '../store';
import {authService} from '../services/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await authService.login({email, password});
            const {user, token} = response.data;

            setAuth(user, token);
            toast.success('Login successful! Redirecting...', {
                duration: 2000,
            });

            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            console.error('Login failed:', err);
            const errorMessage = err.response?.data?.message ||
                'Login failed. Please check your credentials and try again.';

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center p-4">
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div
                        className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <FiLogIn className="text-white text-3xl"/>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div
                            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2"/>
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="h-5 w-5 mr-5 text-gray-400"/>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-10"
                                placeholder="your.email@example.com"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <Link to="/forgot-password" size="sm"
                                  className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                Forgot Password?
                            </Link>
                        </div>
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
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full flex items-center justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                        Sign up
                    </Link>
                </p>
                <p className="text-center mt-6 text-sm text-gray-600">
                    Return to{' '}
                    <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
                        Home
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
