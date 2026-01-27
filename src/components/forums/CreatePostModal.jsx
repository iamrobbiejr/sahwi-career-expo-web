import React, {useState} from 'react';
import {forumPostsService} from '../../services/api';
import {X, Loader2, Image, Paperclip, Send} from 'lucide-react';
import {toast} from 'react-hot-toast';

const CreatePostModal = ({isOpen, onClose, forumId, onPostCreated}) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) {
            toast.error('Title and body are required');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('body', body);
            if (category) formData.append('category', category);

            attachments.forEach((file) => {
                formData.append('attachments[]', file);
            });

            await forumPostsService.create(forumId, formData);
            toast.success('Post created successfully!');
            onPostCreated();
            onClose();
            // Reset form
            setTitle('');
            setBody('');
            setCategory('');
            setAttachments([]);
        } catch (error) {
            console.error('Failed to create post:', error);
            toast.error(error.response?.data?.error || 'Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Create New Discussion</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What's on your mind?"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category
                                (Optional)</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all appearance-none bg-white"
                            >
                                <option value="">Select a category</option>
                                <option value="General">General</option>
                                <option value="Question">Question</option>
                                <option value="Discussion">Discussion</option>
                                <option value="Career Advice">Career Advice</option>
                                <option value="Technical">Technical</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Share more details..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all h-40 resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Attachments</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {attachments.map((file, index) => (
                                    <div key={index}
                                         className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium">
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="ml-2 text-gray-400 hover:text-red-500"
                                        >
                                            <X className="w-3 h-3"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <label
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600">
                                    <Paperclip className="w-4 h-4"/>
                                    <span>Add Files</span>
                                    <input type="file" multiple className="hidden" onChange={handleFileChange}/>
                                </label>
                                <label
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600">
                                    <Image className="w-4 h-4"/>
                                    <span>Add Images</span>
                                    <input type="file" multiple accept="image/*" className="hidden"
                                           onChange={handleFileChange}/>
                                </label>
                            </div>
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
                            className="flex items-center gap-2 bg-primary-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-200"
                        >
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin"/>
                            ) : (
                                <Send className="w-5 h-5"/>
                            )}
                            <span>Create Post</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
