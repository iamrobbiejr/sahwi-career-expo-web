import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {articlesService} from '../services/api';
import {formatImageUrl} from '../utils/format';
import {Calendar, Search, ArrowRight, Loader2, User, Tag, TrendingUp, Heart, MessageSquare} from 'lucide-react';
import {Link} from 'react-router-dom';

const ArticlesPage = () => {
    const [params, setParams] = useState({
        page: 1,
        search: '',
        tag: '',
        per_page: 10,
        published: 1,
    });

    const {data, isLoading, isError} = useQuery({
        queryKey: ['articles', params],
        queryFn: () => articlesService.getAll(params),
    });

    const {data: trendingData} = useQuery({
        queryKey: ['articles', 'trending'],
        queryFn: () => articlesService.getTrending({limit: 5}),
    });

    const {data: topicsData} = useQuery({
        queryKey: ['articles', 'trending-topics'],
        queryFn: () => articlesService.getTrendingTopics({limit: 10}),
    });
    const articles = data?.data?.data || [];
    const trendingArticles = trendingData?.data?.articles || trendingData?.data?.data || [];
    const trendingTopics = topicsData?.data?.topics
        ? (Array.isArray(topicsData.data.topics) ? topicsData.data.topics : Object.keys(topicsData.data.topics))
        : [];
    const pagination = data?.data || {};

    const handleSearch = (e) => {
        setParams(prev => ({...prev, search: e.target.value, page: 1}));
    };

    const handleTagClick = (tag) => {
        setParams(prev => ({...prev, tag: prev.tag === tag ? '' : tag, page: 1}));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Articles & Insights</h1>
                            <p className="text-gray-600 mt-1">Stay updated with the latest news, stories, and career
                                advice.</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <input
                                type="text"
                                placeholder="Search articles..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-64"
                                value={params.search}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    {/* Active Tag Filter */}
                    {params.tag && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Filtering by tag:</span>
                            <button
                                onClick={() => setParams(prev => ({...prev, tag: '', page: 1}))}
                                className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider hover:bg-primary-200 transition-colors"
                            >
                                {params.tag}
                                <span className="ml-2">×</span>
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-primary-600 animate-spin"/>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-red-500 font-medium">Failed to load articles. Please try again later.</p>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">No articles found matching your criteria.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {articles.map((article) => (
                                    <Link
                                        key={article.id}
                                        to={`/articles/${article.id}`}
                                        className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
                                    >
                                        <div className="relative h-48 overflow-hidden bg-gray-100">
                                            <img
                                                src={formatImageUrl(article.cover_image) || `https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&sig=${article.id}`}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                                }}
                                            />
                                            {article.tags && article.tags.length > 0 && (
                                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                    {article.tags.slice(0, 2).map(tag => (
                                                        <span key={tag}
                                                              className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-primary-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              {tag}
                            </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                                                {article.title}
                                            </h3>

                                            <p className="mt-3 text-gray-600 text-sm line-clamp-3 flex-1">
                                                {article.body.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                                            </p>

                                            <div
                                                className="mt-6 flex items-center justify-between text-xs text-gray-500">
                                                <div className="flex items-center">
                                                    <User className="w-3.5 h-3.5 mr-1.5 text-primary-500"/>
                                                    {article.author?.name}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary-500"/>
                                                    {new Date(article.published_at || article.created_at).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div
                                                className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-gray-400">
                                                    <div className="flex items-center">
                                                        <Heart className="w-4 h-4 mr-1"/>
                                                        <span className="text-xs">{article.likes_count || 0}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MessageSquare className="w-4 h-4 mr-1"/>
                                                        <span className="text-xs">{article.comments_count || 0}</span>
                                                    </div>
                                                </div>
                                                <div
                                                    className="flex items-center text-sm font-semibold text-primary-600 group-hover:translate-x-1 transition-transform">
                                                    Read More
                                                    <ArrowRight className="w-4 h-4 ml-1"/>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="flex justify-center mt-8 gap-2">
                                    {Array.from({length: pagination.last_page}, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setParams(prev => ({...prev, page}))}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                                params.page === page
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Trending Topics */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-5 h-5 text-primary-500"/>
                            <h2 className="text-lg font-bold text-gray-900">Trending Topics</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trendingTopics && trendingTopics.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => handleTagClick(topic)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        params.tag === topic
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    #{topic}
                                </button>
                            ))}
                            {(!trendingTopics || trendingTopics.length === 0) && (
                                <p className="text-sm text-gray-500 italic">No topics found</p>
                            )}
                        </div>
                    </div>

                    {/* Trending Articles */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-primary-500"/>
                            <h2 className="text-lg font-bold text-gray-900">Trending Now</h2>
                        </div>
                        <div className="space-y-4">
                            {trendingArticles && trendingArticles.map((article, index) => (
                                <Link
                                    key={article.id}
                                    to={`/articles/${article.id}`}
                                    className="group flex gap-3"
                                >
                  <span className="text-2xl font-black text-gray-100 group-hover:text-primary-100 transition-colors">
                    {index + 1}
                  </span>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center mt-1 text-[10px] text-gray-500">
                                            <span>{article.author?.name}</span>
                                            <span className="mx-1.5">•</span>
                                            <span>{article.likes_count} likes</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {(!trendingArticles || trendingArticles.length === 0) && (
                                <p className="text-sm text-gray-500 italic">Nothing trending yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticlesPage;
