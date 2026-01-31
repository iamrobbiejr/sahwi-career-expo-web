import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {
    AlertCircle,
    Award,
    BarChart2,
    BookOpen,
    Calendar,
    CreditCard,
    Home,
    MessageCircle,
    PieChart,
    Send,
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

    const studentLinks = [
        {icon: Home, label: 'Dashboard', path: '/'},
        {icon: Calendar, label: 'Events', path: '/events'},
        {icon: Ticket, label: 'My Registrations', path: '/my-registrations'},
        {icon: Users, label: 'Forums', path: '/forums'},
        {icon: BookOpen, label: 'Articles', path: '/articles'},
        {icon: MessageCircle, label: 'Messages', path: '/messages'},
        // {icon: Heart, label: 'Donations', path: '/donations'},
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
        {icon: Users, label: 'User Management', path: '/admin/users'},
        {icon: Award, label: 'Verifications', path: '/admin/users/pending-verifications'},
        {icon: Calendar, label: 'Event Management', path: '/admin/events'},
        {icon: Ticket, label: 'All Registrations', path: '/my-registrations'},
        {icon: Video, label: 'Virtual Meetings', path: '/admin/meetings'},
        {icon: Send, label: 'Email Broadcasts', path: '/admin/broadcasts'},
        {icon: CreditCard, label: 'Payment Gateways', path: '/admin/payments/gateways'},
        {icon: BookOpen, label: 'Article Management', path: '/admin/articles'},
        {icon: BarChart2, label: 'Financial Report', path: '/admin/reports/financial'},
        {icon: PieChart, label: 'Payments Summary', path: '/admin/reports/payments-summary'},
        {icon: AlertCircle, label: 'Pending & Cancelled', path: '/admin/reports/pending-cancelled'},
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

    return (
        <aside
            className="hidden lg:block w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
            <nav className="p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                isActive(link.path)
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive(link.path) ? 'text-primary-600' : 'text-gray-500'}`}/>
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Quick Actions Widget */}
            {isAuthenticated && (
                <div className="p-4 mt-6">
                    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Quick Actions</h3>
                        <div className="space-y-2">
                            <Can perform="forums.post">
                                <button
                                    className="w-full bg-white text-primary-600 text-sm font-medium py-2 px-3 rounded-lg hover:shadow-md transition-all">
                                    Create Post
                                </button>
                            </Can>

                            <Can perform="events.create">
                                <button
                                    className="w-full bg-white text-secondary-600 text-sm font-medium py-2 px-3 rounded-lg hover:shadow-md transition-all">
                                    Register Event
                                </button>
                            </Can>

                            <Link to={'/messages'}
                                  className="w-full bg-white text-accent-600 text-sm font-medium py-2 px-3 rounded-lg hover:shadow-md transition-all">
                                Start Message
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Trending Topics */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Trending Topics</h3>
                <div className="space-y-2">
                    {['#DataScience', '#CareerTips', '#AIinFinance', '#Networking'].map((tag) => (
                        <Link
                            key={tag}
                            to={`/forums?tag=${tag.slice(1)}`}
                            className="block text-sm text-primary-600 hover:text-primary-700 hover:underline"
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
