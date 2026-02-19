import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {AlertCircle, Loader2} from 'lucide-react';
import {FiLock, FiLogIn, FiMail} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {useAuthStore} from '../store';
import {authService} from '../services/api';
import bgImage from '../assets/bg.jpg';

/* ── Reusable flex-based icon input wrapper ── */
const IconInput = ({icon: Icon, children}) => (
    <div className="flex items-center w-full border border-gray-300 rounded-lg bg-white
                    transition-shadow overflow-hidden"
         style={{transition: 'box-shadow 0.2s, border-color 0.2s'}}
         onFocus={() => {
         }}
    >
        <span className="pl-3 pr-2 flex-shrink-0" style={{color: 'var(--color-gold-dark)'}}>
            <Icon className="h-5 w-5"/>
        </span>
        {children}
    </div>
);

const fieldCls =
    "flex-1 min-w-0 py-2 pr-3 bg-transparent text-sm text-gray-900 " +
    "placeholder-gray-400 outline-none border-none focus:ring-0";

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
            toast.success('Login successful! Redirecting...', {duration: 2000});
            setTimeout(() => navigate('/'), 2000);
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
            className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
            style={{backgroundImage: `url(${bgImage})`}}>
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
                         style={{background: 'linear-gradient(135deg, var(--color-navy-deep) 0%, var(--color-navy-mid) 100%)'}}>
                        <FiLogIn className="text-white text-3xl" style={{color: 'var(--color-gold)'}}/>
                    </div>
                    <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--color-navy-deep)'}}>Welcome Back</h1>
                    <p className="text-gray-500">Sign in to your Sahwira Expo account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div
                            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0"/>
                            {error}
                        </div>
                    )}

                    {/* ── Email ── */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <IconInput icon={FiMail}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={fieldCls}
                                placeholder="your.email@example.com"
                                required
                                disabled={isLoading}
                            />
                        </IconInput>
                    </div>

                    {/* ── Password ── */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium transition-colors"
                                style={{color: 'var(--color-gold-dark)'}}
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <IconInput icon={FiLock}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={fieldCls}
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                            />
                        </IconInput>
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
                        ) : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium transition-colors"
                          style={{color: 'var(--color-gold-dark)'}}>
                        Sign up
                    </Link>
                </p>
                <p className="text-center mt-3 text-sm text-gray-600">
                    Return to{' '}
                    <Link to="/" className="font-medium transition-colors" style={{color: 'var(--color-navy-deep)'}}>
                        Home
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;