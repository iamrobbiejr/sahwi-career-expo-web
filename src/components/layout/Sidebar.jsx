import React, {useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {
    AlertCircle,
    Award,
    BarChart2,
    BookOpen,
    Calendar,
    ChevronDown,
    ChevronRight,
    CreditCard,
    Home,
    MessageCircle,
    PieChart,
    Send,
    Shield,
    Ticket,
    TrendingUp,
    Users,
    Video
} from 'lucide-react';
import {useAuthStore} from '../../store';
import Can from '../auth/Can';

const Sidebar = () => {
    const location = useLocation();
    const {isAuthenticated, user, hasRole, hasPermission} = useAuthStore();
    const role = user?.role;
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const studentLinks = [
        {icon: Home, label: 'Dashboard', path: '/'},
        {icon: Calendar, label: 'Events', path: '/events'},
        {icon: Ticket, label: 'My Registrations', path: '/my-registrations'},
        {icon: Users, label: 'Forums', path: '/forums'},
        {icon: BookOpen, label: 'Articles', path: '/articles'},
        {icon: MessageCircle, label: 'Messages', path: '/messages'},
    ];

    const professionalLinks = [
        {icon: Home, label: 'Dashboard', path: '/'},
        {icon: Calendar, label: 'Events', path: '/events'},
        {icon: Ticket, label: 'My Registrations', path: '/my-registrations'},
        {icon: TrendingUp, label: 'My Talks', path: '/talks'},
        {icon: Users, label: 'Forums', path: '/forums'},
        {icon: BookOpen, label: 'Articles', path: '/articles'},
        {icon: MessageCircle, label: 'Messages', path: '/messages'},
        {icon: Award, label: 'Mentorship', path: '/mentorship'},
    ];

    const companyRepLinks = [
        {icon: Home, label: 'Dashboard', path: '/'},
        {icon: Calendar, label: 'Events', path: '/events'},
        {icon: Ticket, label: 'Manage Registrations', path: '/my-registrations'},
        {icon: Users, label: 'Forums', path: '/forums'},
        {icon: BookOpen, label: 'Articles', path: '/articles'},
        {icon: MessageCircle, label: 'Messages', path: '/messages'},
    ];

    const adminLinks = [
        {icon: Home, label: 'Dashboard', path: '/'},
        {icon: Calendar, label: 'Event Management', path: '/admin/events'},
        {icon: Ticket, label: 'All Registrations', path: '/my-registrations'},
        {icon: Video, label: 'Virtual Meetings', path: '/admin/meetings'},
        {icon: Send, label: 'Email Broadcasts', path: '/admin/broadcasts'},
        {icon: CreditCard, label: 'Payment Gateways', path: '/admin/payments/gateways'},
        {icon: BookOpen, label: 'Article Management', path: '/admin/articles'},
        {icon: Users, label: 'Forums', path: '/forums'},
        {
            icon: Users,
            label: 'IAM',
            children: [
                {icon: Users, label: 'All Users', path: '/admin/users'},
                {icon: Shield, label: 'Roles & Permissions', path: '/admin/roles'},
                {icon: Award, label: 'Verifications', path: '/admin/users/pending-verifications'},
            ]
        },
        {
            icon: BarChart2,
            label: 'Reports',
            children: [
                {icon: BarChart2, label: 'Financial Report', path: '/admin/reports/financial'},
                {icon: PieChart, label: 'Payments Summary', path: '/admin/reports/payments-summary'},
                {icon: AlertCircle, label: 'Pending & Cancelled', path: '/admin/reports/pending-cancelled'},
            ]
        },
    ];

    const publicLinks = [
        {icon: Home, label: 'Home', path: '/'},
        {icon: Calendar, label: 'Events', path: '/events'},
    ];

    const getLinks = () => {
        if (!isAuthenticated) return publicLinks;
        if (hasRole('admin')) return adminLinks;
        if (hasRole('company_rep')) return companyRepLinks;
        if (hasRole('professional')) return professionalLinks;
        return studentLinks;
    };

    const links = getLinks();
    const isActive = (path) => location.pathname === path;

    /* ── Style helpers ── */
    const activeLinkStyle = {
        backgroundColor: 'rgba(200,160,100,0.12)',
        color: 'var(--color-navy-deep)',
        borderLeft: '3px solid var(--color-gold)',
        paddingLeft: '13px',
    };
    const inactiveLinkStyle = {
        color: '#374151',
        borderLeft: '3px solid transparent',
        paddingLeft: '13px',
    };
    const activeIconStyle = {color: 'var(--color-gold-dark)'};
    const inactiveIconStyle = {color: '#9CA3AF'};

    return (
        <aside
            className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto"
            style={{backgroundColor: '#FFFFFF', borderRight: '1px solid #E8E7E1'}}
        >
            {/* Brand stripe at top */}
            <div className="h-1 w-full flex-shrink-0"
                 style={{background: 'linear-gradient(90deg, var(--color-navy-deep), var(--color-navy-mid), var(--color-gold))'}}/>

            <nav className="p-4 space-y-1 flex-1">
                {links.map((link) => {
                    const Icon = link.icon;

                    if (link.children) {
                        const isOpen = openMenus[link.label];
                        const isChildActive = link.children.some(child => isActive(child.path));

                        return (
                            <div key={link.label}>
                                <button
                                    onClick={() => toggleMenu(link.label)}
                                    className="w-full flex items-center justify-between py-2.5 rounded-lg transition-all duration-200 text-sm font-medium"
                                    style={
                                        isChildActive || isOpen
                                            ? {
                                                backgroundColor: 'rgba(200,160,100,0.10)',
                                                color: 'var(--color-navy-deep)',
                                                paddingLeft: '16px',
                                                paddingRight: '12px'
                                            }
                                            : {color: '#374151', paddingLeft: '16px', paddingRight: '12px'}
                                    }
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon
                                            className="w-4 h-4"
                                            style={isChildActive || isOpen ? activeIconStyle : inactiveIconStyle}
                                        />
                                        <span>{link.label}</span>
                                    </div>
                                    {isOpen
                                        ? <ChevronDown size={14}
                                                       style={{color: isChildActive ? 'var(--color-gold-dark)' : '#9CA3AF'}}/>
                                        : <ChevronRight size={14}
                                                        style={{color: isChildActive ? 'var(--color-gold-dark)' : '#9CA3AF'}}/>
                                    }
                                </button>

                                {isOpen && (
                                    <div className="ml-3 mt-1 space-y-0.5 pl-3"
                                         style={{borderLeft: '2px solid var(--color-gold-pale)'}}>
                                        {link.children.map((child) => {
                                            const ChildIcon = child.icon;
                                            return (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200"
                                                    style={isActive(child.path) ? activeLinkStyle : inactiveLinkStyle}
                                                >
                                                    <ChildIcon size={14}
                                                               style={isActive(child.path) ? activeIconStyle : inactiveIconStyle}/>
                                                    <span>{child.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="flex items-center space-x-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium"
                            style={isActive(link.path) ? activeLinkStyle : inactiveLinkStyle}
                        >
                            <Icon className="w-4 h-4"
                                  style={isActive(link.path) ? activeIconStyle : inactiveIconStyle}/>
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Quick Actions Widget */}
            {isAuthenticated && (
                <div className="p-4 flex-shrink-0">
                    <div
                        className="rounded-xl p-4"
                        style={{background: 'linear-gradient(135deg, var(--color-navy-deep) 0%, var(--color-navy-mid) 100%)'}}
                    >
                        <h3 className="font-semibold mb-3 text-sm" style={{color: 'var(--color-gold)'}}>Quick
                            Actions</h3>
                        <div className="space-y-2">
                            <Can perform="events.create">
                                <button
                                    className="w-full text-sm font-medium py-2 px-3 rounded-lg transition-all"
                                    style={{
                                        backgroundColor: 'var(--color-gold)',
                                        color: 'var(--color-navy-deep)',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-gold-dark)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-gold)'}
                                >
                                    Create Event
                                </button>
                            </Can>

                            <Link
                                to={'/messages'}
                                className="block w-full text-sm font-medium py-2 px-3 rounded-lg transition-all text-center"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.12)',
                                    color: 'rgba(255,255,255,0.85)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                }}
                            >
                                Start Message
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
