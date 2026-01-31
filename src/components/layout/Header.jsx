import React, {useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {Bell, LogOut, Menu, User, X} from 'lucide-react';
import {AnimatePresence, motion} from 'framer-motion';
import {useAuthStore, useUIStore} from '../../store';
import {authService} from '../../services/api';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {user, logout, isAuthenticated} = useAuthStore();
    const {toggleSidebar, toggleMobileMenu, mobileMenuOpen} = useUIStore();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            logout();
            navigate('/login');
        }
    };

    const navItems = [
        {path: '/', label: 'Home'},
        ...(isAuthenticated ? [
            {path: '/forums', label: 'Forums'},
            {path: '/events', label: 'Events'},
            {path: '/articles', label: 'Articles'},
            {path: '/messages', label: 'Connect'},
        ] : []),
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo and Desktop Nav */}
                    <div className="flex items-center space-x-8">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700"/>
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700"/>
                            )}
                        </button>

                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <div
                                className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-3xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">SE</span>
                            </div>
                            <span className="hidden sm:block text-xl font-bold text-gray-900">
                SahwiCareerExpo
              </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        isActive(item.path)
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right: Notifications and Profile or Login */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                                    >
                                        <Bell className="w-6 h-6 text-gray-700"/>
                                        <span
                                            className="absolute top-1 right-1 w-2 h-2 bg-secondary-500 rounded-full"></span>
                                    </button>

                                    {/* Notifications Dropdown */}
                                    <AnimatePresence>
                                        {showNotifications && (
                                            <motion.div
                                                initial={{opacity: 0, y: 10}}
                                                animate={{opacity: 1, y: 0}}
                                                exit={{opacity: 0, y: 10}}
                                                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                                            >
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                                        <p className="text-sm text-gray-800">
                                                            New reply to your forum post
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                                    </div>
                                                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                                        <p className="text-sm text-gray-800">
                                                            Event registration confirmed
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-2 border-t border-gray-100">
                                                    <Link
                                                        to="/notifications"
                                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                                    >
                                                        View all notifications
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Profile Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div
                                            className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary-700"/>
                                        </div>
                                        <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.name || 'Guest'}
                    </span>
                                    </button>

                                    {/* Profile Dropdown */}
                                    <AnimatePresence>
                                        {showProfileMenu && (
                                            <motion.div
                                                initial={{opacity: 0, y: 10}}
                                                animate={{opacity: 1, y: 0}}
                                                exit={{opacity: 0, y: 10}}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                                            >
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {user?.name || 'Guest User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                                    <p className="text-xs text-primary-600 mt-1 capitalize">
                                                        {user?.role || 'student'}
                                                    </p>
                                                </div>
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                                                >
                                                    <User className="w-4 h-4 text-gray-600"/>
                                                    <span className="text-sm text-gray-700">My Profile</span>
                                                </Link>
                                                {/*<Link*/}
                                                {/*    to="/settings"*/}
                                                {/*    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors"*/}
                                                {/*>*/}
                                                {/*    <Settings className="w-4 h-4 text-gray-600"/>*/}
                                                {/*    <span className="text-sm text-gray-700">Settings</span>*/}
                                                {/*</Link>*/}
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left border-t border-gray-100 mt-2 pt-2"
                                                >
                                                    <LogOut className="w-4 h-4 text-red-600"/>
                                                    <span className="text-sm text-red-600">Logout</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{opacity: 0, height: 0}}
                        animate={{opacity: 1, height: 'auto'}}
                        exit={{opacity: 0, height: 0}}
                        className="lg:hidden border-t border-gray-200 bg-white"
                    >
                        <nav className="px-4 py-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={toggleMobileMenu}
                                    className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                                        isActive(item.path)
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
