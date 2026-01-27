import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {articlesService} from '../../../services/api';
import {toast} from 'react-hot-toast';
import {ChevronLeft, Send, Tag} from 'lucide-react';

const AdminArticleCreate = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        published: false,
        allow_comments: true,
        tags: '',
    });

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const submitData = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
            };

            await articlesService.create(submitData);
            toast.success('Article created successfully');
            navigate('/admin/articles');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create article');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/admin/articles')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600"/>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Article</h1>
                    <p className="text-gray-600">Write and publish a new article or news item</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            placeholder="Enter article title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="body"
                            required
                            rows="15"
                            value={formData.body}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none font-serif"
                            placeholder="Write your article content here... (HTML supported)"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags (comma separated)
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                placeholder="career, education, fair"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <label
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                name="published"
                                checked={formData.published}
                                onChange={handleChange}
                                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div>
                                <p className="font-medium text-gray-900">Publish Immediately</p>
                                <p className="text-xs text-gray-500">Make this article visible to everyone</p>
                            </div>
                        </label>

                        <label
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                name="allow_comments"
                                checked={formData.allow_comments}
                                onChange={handleChange}
                                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div>
                                <p className="font-medium text-gray-900">Allow Comments</p>
                                <p className="text-xs text-gray-500">Enable readers to post comments</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/articles')}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <span className="animate-spin mr-2">◌</span> : <Send className="w-4 h-4"/>}
                        Create Article
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminArticleCreate;
