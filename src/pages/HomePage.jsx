import React from 'react';
import {motion} from 'framer-motion';
import {useQuery} from '@tanstack/react-query';
import {
    ArrowRight,
    Award,
    BookOpen,
    Calendar,
    Clock,
    Eye,
    Loader2,
    MapPin,
    MessageCircle,
    TrendingUp,
    User,
    Users,
    Zap
} from 'lucide-react';
import {useAuthStore} from '../store';
import {Link} from 'react-router-dom';
import {articlesService, eventsService, forumsService, statsService} from '../services/api';
import {formatImageUrl} from '../utils/format';

const HomePage = () => {
    const {user, isAuthenticated} = useAuthStore();

    // Animation variants
    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: {y: 20, opacity: 0},
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    const {data: upcomingEventsData, isLoading: isLoadingEvents} = useQuery({
        queryKey: ['upcomingEvents'],
        queryFn: () => eventsService.getUpcoming(),
    });

    const {data: trendingArticlesData, isLoading: isLoadingArticles} = useQuery({
        queryKey: ['trendingArticles'],
        queryFn: () => articlesService.getTrending({limit: 4}),
    });

    const {data: userStatsData} = useQuery({
        queryKey: ['userStats'],
        queryFn: () => statsService.getMe(),
        enabled: isAuthenticated,
    });

    const userStats = userStatsData?.data || {};

    const upcomingEvents = upcomingEventsData?.data?.data || [];
    const trendingArticles = trendingArticlesData?.data?.articles || trendingArticlesData?.data?.data || [];

    const {data: hotDiscussionsData, isLoading: isLoadingDiscussions} = useQuery({
        queryKey: ['hotDiscussions'],
        queryFn: () => forumsService.getHottestPosts(),
    });


    const hotDiscussions = hotDiscussionsData?.data?.data || hotDiscussionsData?.data || [];


    const stats = [
        {
            icon: Calendar,
            label: 'Events Registered',
            value: userStats.events_registered_count || 0,
            iconBg: 'var(--color-navy-deep)',
            iconColor: '#fff',
        },
        {
            icon: Users,
            label: 'Forum Posts',
            value: userStats.forum_posts_count || 0,
            iconBg: 'var(--color-gold)',
            iconColor: 'var(--color-navy-deep)',
        },
        {
            icon: MessageCircle,
            label: 'Messages',
            value: userStats.unread_messages_count || 0,
            iconBg: 'var(--color-navy-mid)',
            iconColor: '#fff',
        },
        {
            icon: Award,
            label: 'Reputation Points',
            value: userStats.reputation_points || 0,
            iconBg: 'var(--color-gold-dark)',
            iconColor: '#fff',
        },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Welcome, Header */}
            <motion.div variants={itemVariants}
                        className="rounded-2xl p-8 shadow-lg"
                        style={{background: 'linear-gradient(135deg, var(--color-navy-deep) 0%, var(--color-navy-mid) 60%, var(--color-navy-light) 100%)'}}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2"
                            style={{color: '#FFFFFF', fontFamily: 'var(--font-display, Playfair Display, serif)'}}>
                            {isAuthenticated ? `Welcome back, ${user?.name || 'User'}! 👋` : 'Empowering Careers in Fintech & APIs'}
                        </h1>
                        <p className="text-lg" style={{color: 'rgba(255,255,255,0.72)'}}>
                            {isAuthenticated
                                ? "Here's what's happening in your professional community today"
                                : "Join a community of professionals and students to learn, connect, and grow."}
                        </p>
                        {!isAuthenticated && (
                            <div className="mt-6 flex space-x-4">
                                <Link to="/register"
                                      className="px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm"
                                      style={{backgroundColor: 'var(--color-gold)', color: 'var(--color-navy-deep)'}}>
                                    Get Started
                                </Link>
                                <Link to="/login"
                                      className="bg-transparent border-2 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                                      style={{borderColor: 'rgba(255,255,255,0.4)'}}>
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                    {isAuthenticated && (
                        <div className="hidden md:block">
                            <div className="flex items-center space-x-3">
                                <Zap className="w-12 h-12 text-yellow-300"/>
                                <div>
                                    <p className="text-sm text-primary-100">{userStats.streak_days || 0}-day streak!</p>
                                    <p className="font-bold text-xl text-white">🔥 Keep it going</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Quick Stats - Only for Auth Users */}
            {isAuthenticated && (
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                whileHover={{scale: 1.03}}
                                className="bg-white rounded-xl overflow-hidden transition-shadow p-6"
                                style={{
                                    borderTop: '3px solid var(--color-gold)',
                                    boxShadow: '0 4px 12px rgba(13,27,94,0.08)'
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                                        <p className="text-3xl font-bold"
                                           style={{color: 'var(--color-navy-deep)'}}>{stat.value}</p>
                                    </div>
                                    <div className="p-3 rounded-xl" style={{backgroundColor: stat.iconBg}}>
                                        <Icon className="w-6 h-6" style={{color: stat.iconColor}}/>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Events & Articles */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Upcoming Events */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold flex items-center"
                                style={{color: 'var(--color-navy-deep)'}}>
                                <Calendar className="w-6 h-6 mr-2" style={{color: 'var(--color-gold-dark)'}}/>
                                Upcoming Events
                            </h2>
                            <Link to="/events"
                                  className="font-medium text-sm flex items-center transition-colors"
                                  style={{color: 'var(--color-gold-dark)'}}>
                                View All <ArrowRight className="w-4 h-4 ml-1"/>
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {isLoadingEvents ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin"/>
                                </div>
                            ) : upcomingEvents.length === 0 ? (
                                <div
                                    className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No upcoming events at the moment. Check
                                        back later!</p>
                                </div>
                            ) : (
                                upcomingEvents.map((event) => (
                                    <motion.div
                                        key={event.id}
                                        whileHover={{y: -4}}
                                        className="card overflow-hidden"
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            <div className="md:w-48 h-48 md:h-auto overflow-hidden">
                                                <img
                                                    src={formatImageUrl(event.img || event.banner) || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                                    alt={event.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                                />
                                            </div>
                                            <div className="flex-1 p-6">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <span
                                                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${(event.location_type === 'virtual' || event.venue?.toLowerCase() === 'virtual' || event.venue?.toLowerCase() === 'online')
                                                                ? 'bg-accent-100 text-accent-700'
                                                                : 'bg-primary-100 text-primary-700'
                                                            }`}>
                                                            {(event.location_type === 'virtual' || event.venue?.toLowerCase() === 'virtual' || event.venue?.toLowerCase() === 'online') ? 'Virtual' : 'In-Person'}
                                                        </span>
                                                        <h3 className="text-xl font-bold"
                                                            style={{color: 'var(--color-navy-deep)'}}>{event.name}</h3>
                                                    </div>
                                                </div>
                                                <div
                                                    className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                                    <span className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1"
                                                               style={{color: 'var(--color-gold-dark)'}}/>
                                                        {new Date(event.start_date).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <MapPin className="w-4 h-4 mr-1"
                                                                style={{color: 'var(--color-gold-dark)'}}/>
                                                        {event.venue}{event.location ? `, ${event.location}` : ''}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Users className="w-4 h-4 mr-1"
                                                               style={{color: 'var(--color-gold-dark)'}}/>
                                                        {event.registrations || 0} registered
                                                    </span>
                                                </div>
                                                <div className="flex space-x-3">
                                                    <Link to={`/events/${event.id}`} className="btn-primary">
                                                        View Details
                                                    </Link>
                                                    {/*{isAuthenticated && (*/}
                                                    {/*    <button className="btn-outline">*/}
                                                    {/*        Add to Calendar*/}
                                                    {/*    </button>*/}
                                                    {/*)}*/}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Articles */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold flex items-center"
                                style={{color: 'var(--color-navy-deep)'}}>
                                <BookOpen className="w-6 h-6 mr-2" style={{color: 'var(--color-gold-dark)'}}/>
                                Trending Articles
                            </h2>
                            <Link to="/articles"
                                  className="font-medium text-sm flex items-center transition-colors"
                                  style={{color: 'var(--color-gold-dark)'}}>
                                View All <ArrowRight className="w-4 h-4 ml-1"/>
                            </Link>
                        </div>

                        {isLoadingArticles ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary-600 animate-spin"/>
                            </div>
                        ) : trendingArticles.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200">
                                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                                <p className="text-gray-500 font-medium">No trending articles at the moment.</p>
                                <p className="text-sm text-gray-400">Check back later for fresh content!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {trendingArticles.slice(0, 4).map((article) => (
                                    <motion.div
                                        key={article.id}
                                        whileHover={{y: -4}}
                                    >
                                        <Link to={`/articles/${article.id}`}
                                              className="card cursor-pointer block overflow-hidden group">
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={formatImageUrl(article.cover_image) || `https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&sig=${article.id}`}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors"
                                                    style={{color: 'var(--color-navy-deep)'}}>
                                                    {article.title}
                                                </h3>
                                                <div
                                                    className="flex items-center justify-between text-sm text-gray-600">
                                                    <span className="flex items-center">
                                                        <User className="w-3.5 h-3.5 mr-1"
                                                              style={{color: 'var(--color-gold-dark)'}}/>
                                                        {article.author?.name || 'Anonymous'}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Clock className="w-3.5 h-3.5 mr-1"
                                                               style={{color: 'var(--color-gold-dark)'}}/>
                                                        {new Date(article.published_at || article.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right Column - Discussions & Quick Actions */}
                <div className="space-y-8">
                    {/* Trending Discussions */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center"
                                style={{color: 'var(--color-navy-deep)'}}>
                                <TrendingUp className="w-5 h-5 mr-2" style={{color: 'var(--color-gold)'}}/>
                                Hot Discussions
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {isLoadingDiscussions ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin" style={{color: 'var(--color-gold)'}}/>
                                </div>
                            ) : hotDiscussions && hotDiscussions.length > 0 ? (
                                hotDiscussions.map((discussion) => (
                                    <Link
                                        key={discussion.id}
                                        to={isAuthenticated ? `/forums/${discussion?.forum?.id}/posts/${discussion.id}` : '/login'}
                                        className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
                                        style={{borderColor: '#E5E7EB'}}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold-pale)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
                                                {discussion.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center">
                                                <MessageCircle className="w-3 h-3 mr-1"/>
                                                {discussion.comment_count || 0} replies
                                            </span>
                                            <span className="flex items-center">
                                                <Eye className="w-3 h-3 mr-1"/>
                                                {discussion.view_count || 0} views
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs font-medium"
                                                  style={{color: 'var(--color-gold-dark)'}}>
                                                #{discussion.category || 'General'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(discussion.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div
                                    className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-200">
                                    <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                                    <p className="text-sm text-gray-500 font-medium">No hot discussions yet.</p>
                                </div>
                            )}
                        </div>
                        <Link
                            to="/forums"
                            className="block mt-4 text-center py-2 font-medium text-sm transition-colors"
                            style={{color: 'var(--color-gold-dark)'}}
                        >
                            View All Discussions →
                        </Link>
                    </motion.div>


                    {/*/!* Connection Suggestions *!/*/}
                    {/*<motion.div variants={itemVariants}*/}
                    {/*            className="bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl p-6">*/}
                    {/*    <h3 className="font-bold text-gray-900 mb-4 flex items-center">*/}
                    {/*        <Users className="w-5 h-5 mr-2 text-accent-600"/>*/}
                    {/*        Connect & Grow*/}
                    {/*    </h3>*/}
                    {/*    <p className="text-sm text-gray-600 mb-4">*/}
                    {/*        Expand your network with professionals in your field*/}
                    {/*    </p>*/}
                    {/*    <Link to="/connect" className="btn-primary w-full">*/}
                    {/*        Find Connections*/}
                    {/*    </Link>*/}
                    {/*</motion.div>*/}

                    {/* Quick Actions - Only for Auth Users */}
                    {isAuthenticated && (
                        <motion.div variants={itemVariants}
                                    className="rounded-xl overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-navy-deep) 0%, var(--color-navy-light) 100%)',
                                        boxShadow: '0 4px 20px rgba(13,27,94,0.15)'
                                    }}
                        >
                            <div className="p-5">
                                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider"
                                    style={{color: 'var(--color-gold)'}}>Quick Actions</h3>
                                <div className="space-y-2">
                                    <Link
                                        to="/forums"
                                        className="flex items-center justify-between p-3 rounded-lg transition-all"
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                            color: 'rgba(255,255,255,0.85)'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                    >
                                        <span className="font-medium text-sm">Create Forum Post</span>
                                        <ArrowRight className="w-4 h-4" style={{color: 'var(--color-gold)'}}/>
                                    </Link>
                                    <Link
                                        to="/events"
                                        className="flex items-center justify-between p-3 rounded-lg transition-all"
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                            color: 'rgba(255,255,255,0.85)'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                    >
                                        <span className="font-medium text-sm">Browse Events</span>
                                        <ArrowRight className="w-4 h-4" style={{color: 'var(--color-gold)'}}/>
                                    </Link>
                                    <Link
                                        to="/messages"
                                        className="flex items-center justify-between p-3 rounded-lg transition-all"
                                        style={{backgroundColor: 'var(--color-gold)', color: 'var(--color-navy-deep)'}}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-gold-dark)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-gold)'}
                                    >
                                        <span className="font-bold text-sm">Send Message</span>
                                        <ArrowRight className="w-4 h-4"/>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default HomePage;
