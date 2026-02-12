import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {registrationsService} from '../services/api';
import {Calendar, CreditCard, Filter, Loader2, Mailbox, MapPin, Ticket as TicketIcon} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {formatImageUrl} from '../utils/format';
import {BiUser} from "react-icons/bi";

const MyRegistrationsPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = React.useState('');

    const {data, isLoading, isError} = useQuery({
        queryKey: ['my-registrations', status],
        queryFn: () => registrationsService.getMyRegistrations({status}),
    });

    const registrations = data?.data?.data || [];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return <span
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">Confirmed</span>;
            case 'pending':
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase">Pending Payment</span>;
            case 'cancelled':
                return <span
                    className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase">Cancelled</span>;
            default:
                return <span
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase">{status}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin"/>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Registrations</h1>
                    <p className="text-gray-600 mt-2">Manage your event registrations and tickets.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 appearance-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {registrations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-gray-300"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No registrations found</h3>
                    <p className="text-gray-500 mt-2">You haven't registered for any events yet.</p>
                    <button
                        onClick={() => navigate('/events')}
                        className="mt-8 px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                    >
                        Explore Events
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {registrations.map((reg) => (
                        <div
                            key={reg.id}
                            className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-100 transition-all group"
                        >
                            <div className="relative h-48">
                                <img
                                    src={formatImageUrl(reg.event?.img || reg.event?.banner) || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                    alt={reg.event?.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4">
                                    {getStatusBadge(reg.status)}
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-4">{reg.event?.name}</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <BiUser className="w-4 h-4 text-primary-500"/>
                                        <span className="line-clamp-1">{reg.attendee_name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Mailbox className="w-4 h-4 text-primary-500"/>
                                        <span className="line-clamp-1">{reg.attendee_email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 text-primary-500"/>
                                        <span>{new Date(reg.event?.start_date).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 text-primary-500"/>
                                        <span className="line-clamp-1">{reg.event?.venue}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {reg.status === 'confirmed' && reg.ticket && (
                                        <button
                                            onClick={() => navigate(`/tickets/${reg.ticket.id}`)}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
                                        >
                                            <TicketIcon className="w-4 h-4"/>
                                            View Ticket
                                        </button>
                                    )}

                                    {reg.status === 'pending' && (
                                        <button
                                            onClick={() => navigate(`/payments/initiate?registration_ids[]=${reg.id}`)}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all"
                                        >
                                            <CreditCard className="w-4 h-4"/>
                                            Complete Payment
                                        </button>
                                    )}

                                    <button
                                        onClick={() => navigate(`/events/${reg.event_id}`)}
                                        className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                                    >
                                        Event Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyRegistrationsPage;
