import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {articlesService} from '../../../services/api';
import {formatImageUrl} from '../../../utils/format';
import {
    Plus, Search, ChevronLeft, ChevronRight, Eye, Edit2, Trash2,
    FileText, CheckCircle, XCircle
} from 'lucide-react';
import {Link} from 'react-router-dom';
import {toast} from 'react-hot-toast';

const AdminArticleList = () => {
    const [params, setParams] = useState({
        page: 1,
        search: '',
        published: '',
        per_page: 10
    });

    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: ['adminArticles', params],
        queryFn: () => articlesService.getAll({...params}),
    });

    const handleSearch = (e) => {
        setParams(prev => ({...prev, search: e.target.value, page: 1}));
    };

    const handlePublishedChange = (e) => {
        setParams(prev => ({...prev, published: e.target.value, page: 1}));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await articlesService.delete(id);
                toast.success('Article deleted successfully');
                refetch();
            } catch (err) {
                toast.error('Failed to delete article');
            }
        }
    };

    const handleTogglePublish = async (id) => {
        try {
            await articlesService.togglePublish(id);
            toast.success('Publish status updated');
            refetch();
        } catch (err) {
            toast.error('Failed to update publish status');
        }
    };

    const articles = data?.data?.data || [];
    const pagination = data?.data || {};

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Article Management</h1>
                    <p className="text-gray-600">View and manage all articles and news.</p>
                </div>
                <Link
                    to="/admin/articles/create"
                    className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5"/>
                    <span>Add Article</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder="Search articles..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={params.search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        value={params.published}
                        onChange={handlePublishedChange}
                    >
                        <option value="">All Status</option>
                        <option value="1">Published</option>
                        <option value="0">Draft</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Article</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Author</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Stats</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading articles...
                                </td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-red-500">Failed to load
                                    articles.
                                </td>
                            </tr>
                        ) : articles.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No articles found.</td>
                            </tr>
                        ) : (
                            articles.map((article) => (
                                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                {article.cover_image ? (
                                                    <img
                                                        src={formatImageUrl(article.cover_image)}
                                                        alt=""
                                                        className="w-full h-full rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <FileText className="w-5 h-5 text-gray-400"/>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span
                                                    className="font-medium text-gray-900 line-clamp-1">{article.title}</span>
                                                <span
                                                    className="text-xs text-gray-500">{new Date(article.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {article.author?.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleTogglePublish(article.id)}
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors
                          ${article.published ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                        >
                                            {article.published ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3"/>
                                                    <span>Published</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3"/>
                                                    <span>Draft</span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex flex-col text-xs">
                                            <span>Views: {article.views_count || 0}</span>
                                            <span>Likes: {article.likes_count || 0}</span>
                                            <span>Comments: {article.comments_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/articles/${article.id}`}
                                                target="_blank"
                                                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                                title="View on Site"
                                            >
                                                <Eye className="w-5 h-5"/>
                                            </Link>
                                            <Link
                                                to={`/admin/articles/${article.id}/edit`}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Edit Article"
                                            >
                                                <Edit2 className="w-5 h-5"/>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(article.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Article"
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing page {pagination.current_page} of {pagination.last_page}
            </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setParams(prev => ({...prev, page: prev.page - 1}))}
                                disabled={pagination.current_page === 1}
                                className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5"/>
                            </button>
                            <button
                                onClick={() => setParams(prev => ({...prev, page: prev.page + 1}))}
                                disabled={pagination.current_page === pagination.last_page}
                                className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-white transition-colors"
                            >
                                <ChevronRight className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminArticleList;
