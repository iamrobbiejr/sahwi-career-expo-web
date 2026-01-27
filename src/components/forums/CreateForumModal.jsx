import React, {useState} from 'react';
import {forumsService} from '../../services/api';
import {X, Loader2, Send} from 'lucide-react';
import {toast} from 'react-hot-toast';

const CreateForumModal = ({isOpen, onClose, onForumCreated}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('💬');
    const [isPublic, setIsPublic] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        try {
            setSubmitting(true);
            await forumsService.create({
                title,
                description,
                icon,
                public: isPublic,
            });
            toast.success('Forum created successfully!');
            onForumCreated();
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setIcon('💬');
            setIsPublic(true);
        } catch (error) {
            console.error('Failed to create forum:', error);
            toast.error(error.response?.data?.error || 'Failed to create forum');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Create New Forum</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Forum Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Computer Science Hub"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Icon (Emoji)</label>
                            <input
                                type="text"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="💬"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this forum about?"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all h-32 resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                                Make forum public
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 bg-primary-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all"
                        >
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin"/>
                            ) : (
                                <Send className="w-5 h-5"/>
                            )}
                            <span>Create Forum</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateForumModal;
