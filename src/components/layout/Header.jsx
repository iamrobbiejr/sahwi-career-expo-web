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
            {path: '/messages', label: 'Messages'},
        ] : []),
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header style={{backgroundColor: 'var(--color-navy-deep)', borderBottom: '1px solid var(--color-navy-mid)'}}
                className="sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo and Desktop Nav */}
                    <div className="flex items-center space-x-8">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden p-2 rounded-lg transition-colors"
                            style={{color: 'rgba(255,255,255,0.75)'}}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-navy-mid)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6"/>
                            ) : (
                                <Menu className="w-6 h-6"/>
                            )}
                        </button>

                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2.5">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                                style={{
                                    background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                                    color: 'var(--color-navy-deep)',
                                }}
                            >
                                EG
                            </div>
                            <span className="hidden sm:block text-xl font-bold tracking-tight"
                                  style={{color: 'var(--color-gold)'}}>
                                Edu<span style={{color: '#FFFFFF'}}> Gate</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                                    style={
                                        isActive(item.path)
                                            ? {backgroundColor: 'rgba(200,160,100,0.15)', color: 'var(--color-gold)'}
                                            : {color: 'rgba(255,255,255,0.72)'}
                                    }
                                    onMouseEnter={e => {
                                        if (!isActive(item.path)) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                                            e.currentTarget.style.color = '#fff';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive(item.path)) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.72)';
                                        }
                                    }}
                                >
                                    {item.label}
                                    {isActive(item.path) && (
                                        <span className="block h-0.5 w-full mt-0.5 rounded-full"
                                              style={{backgroundColor: 'var(--color-gold)'}}/>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right: Notifications and Profile or Login/Register */}
                    <div className="flex items-center space-x-3">
                        {isAuthenticated ? (
                            <>
                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2 rounded-lg transition-colors relative"
                                        style={{color: 'rgba(255,255,255,0.75)'}}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Bell className="w-5 h-5"/>
                                        <span
                                            className="absolute top-1 right-1 w-2 h-2 rounded-full"
                                            style={{backgroundColor: 'var(--color-gold)'}}
                                        />
                                    </button>

                                    {/* Notifications Dropdown */}
                                    <AnimatePresence>
                                        {showNotifications && (
                                            <motion.div
                                                initial={{opacity: 0, y: 10}}
                                                animate={{opacity: 1, y: 0}}
                                                exit={{opacity: 0, y: 10}}
                                                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border py-2"
                                                style={{
                                                    borderColor: 'var(--color-gold-pale)',
                                                    boxShadow: '0 12px 40px rgba(13,27,94,0.18)'
                                                }}
                                            >
                                                <div className="px-4 py-2 border-b"
                                                     style={{borderColor: 'var(--color-gold-pale)'}}>
                                                    <h3 className="font-semibold text-sm"
                                                        style={{color: 'var(--color-navy-deep)'}}>Notifications</h3>
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                                        <p className="text-sm text-gray-800">New reply to your forum
                                                            post</p>
                                                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                                    </div>
                                                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                                        <p className="text-sm text-gray-800">Event registration
                                                            confirmed</p>
                                                        <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-2 border-t"
                                                     style={{borderColor: 'var(--color-gold-pale)'}}>
                                                    <Link
                                                        to="/notifications"
                                                        className="text-sm font-medium transition-colors"
                                                        style={{color: 'var(--color-gold-dark)'}}
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
                                        className="flex items-center space-x-2 p-1.5 rounded-lg transition-colors"
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                                            style={{
                                                backgroundColor: 'var(--color-gold)',
                                                color: 'var(--color-navy-deep)'
                                            }}
                                        >
                                            {user?.avatar_url ? (
                                                <img src={user?.avatar_url} alt="Avatar"
                                                     className="w-full h-full object-cover"/>
                                            ) : (
                                                <User className="w-4 h-4"/>
                                            )}
                                        </div>
                                        <span className="hidden md:block text-sm font-medium"
                                              style={{color: 'rgba(255,255,255,0.85)'}}>
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
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-2"
                                                style={{
                                                    borderColor: 'var(--color-gold-pale)',
                                                    boxShadow: '0 12px 40px rgba(13,27,94,0.18)'
                                                }}
                                            >
                                                <div className="px-4 py-3 border-b"
                                                     style={{borderColor: 'var(--color-gold-pale)'}}>
                                                    <p className="text-sm font-semibold"
                                                       style={{color: 'var(--color-navy-deep)'}}>
                                                        {user?.name || 'Guest User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                                    <p className="text-xs mt-1 capitalize font-medium"
                                                       style={{color: 'var(--color-gold-dark)'}}>
                                                        {user?.role || 'student'}
                                                    </p>
                                                </div>
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                                                >
                                                    <User className="w-4 h-4 text-gray-500"/>
                                                    <span className="text-sm text-gray-700">My Profile</span>
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center space-x-2 px-4 py-2 hover:bg-red-50 transition-colors w-full text-left border-t border-gray-100 mt-1 pt-2"
                                                >
                                                    <LogOut className="w-4 h-4 text-red-500"/>
                                                    <span className="text-sm text-red-500">Logout</span>
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
                                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                                    style={{color: 'rgba(255,255,255,0.80)'}}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.80)';
                                    }}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-bold rounded-lg transition-all shadow-sm"
                                    style={{backgroundColor: 'var(--color-gold)', color: 'var(--color-navy-deep)'}}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-gold-dark)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-gold)'}
                                >
                                    Get Started
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
                        style={{
                            borderTop: '1px solid var(--color-navy-mid)',
                            backgroundColor: 'var(--color-navy-deep)'
                        }}
                        className="lg:hidden"
                    >
                        <nav className="px-4 py-4 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={toggleMobileMenu}
                                    className="block px-4 py-3 rounded-lg font-medium transition-all text-sm"
                                    style={
                                        isActive(item.path)
                                            ? {backgroundColor: 'rgba(200,160,100,0.15)', color: 'var(--color-gold)'}
                                            : {color: 'rgba(255,255,255,0.72)'}
                                    }
                                >
                                    {item.label}
                                </Link>
                            ))}
                            {!isAuthenticated && (
                                <div className="pt-2 space-y-2 border-t" style={{borderColor: 'var(--color-navy-mid)'}}>
                                    <Link to="/login" onClick={toggleMobileMenu}
                                          className="block px-4 py-3 rounded-lg font-medium text-sm text-center"
                                          style={{
                                              color: 'rgba(255,255,255,0.80)',
                                              border: '1px solid rgba(255,255,255,0.2)'
                                          }}>
                                        Sign In
                                    </Link>
                                    <Link to="/register" onClick={toggleMobileMenu}
                                          className="block px-4 py-3 rounded-lg font-bold text-sm text-center"
                                          style={{
                                              backgroundColor: 'var(--color-gold)',
                                              color: 'var(--color-navy-deep)'
                                          }}>
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
