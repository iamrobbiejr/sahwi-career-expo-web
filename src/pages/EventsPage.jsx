import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {eventsService} from '../services/api';
import {formatImageUrl} from '../utils/format';
import {ArrowRight, Calendar, Loader2, MapPin, Search} from 'lucide-react';
import {Link} from 'react-router-dom';

const EventsPage = () => {


    const [params, setParams] = useState({
        page: 1,
        search: '',
    });

    const {data, isLoading, isError} = useQuery({
        queryKey: ['events', params],
        queryFn: () => eventsService.getAll(params),
    });

    const events = data?.data?.data || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
                    <p className="text-gray-600 mt-1">Discover and register for upcoming education fairs and
                        seminars.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-64"
                            value={params.search}
                            onChange={(e) => setParams(prev => ({...prev, search: e.target.value, page: 1}))}
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin"/>
                </div>
            ) : isError ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p className="text-red-500 font-medium">Failed to load events. Please try again later.</p>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium">No events found matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <Link
                            key={event.id}
                            to={`/events/${event.id}`}
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={formatImageUrl(event.img || event.banner) || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                    alt={event.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
                    ${event.is_paid ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                        {event.is_paid ? 'Paid' : 'Free'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                                    {event.name}
                                </h3>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center text-gray-600 text-sm">
                                        <Calendar className="w-4 h-4 mr-2 text-primary-500"/>
                                        {new Date(event.start_date).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex items-center text-gray-600 text-sm line-clamp-1">
                                        <MapPin className="w-4 h-4 mr-2 text-primary-500"/>
                                        {event.venue}, {event.location}
                                    </div>
                                </div>

                                <p className="mt-4 text-gray-600 text-sm line-clamp-2 flex-1">
                                    {event.description}
                                </p>

                                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-primary-600 font-bold">
                                        {event.is_paid ? `$${event.price_cents / 100}` : 'Register Free'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="flex items-center text-sm font-semibold text-gray-900 group-hover:translate-x-1 transition-transform">
                                            View Details
                                            <ArrowRight className="w-4 h-4 ml-1"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventsPage;
