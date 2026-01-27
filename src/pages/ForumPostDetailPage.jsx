import React, {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import {forumsService, forumPostsService, forumCommentsService} from '../services/api';
import {
    ArrowLeft,
    MessageSquare,
    User,
    Calendar,
    Eye,
    Pin,
    Lock,
    Loader2,
    MoreVertical,
    ThumbsUp,
    Share2
} from 'lucide-react';
import {formatDistanceToNow} from 'date-fns';
import {toast} from 'react-hot-toast';
import CommentSection from '../components/forums/CommentSection';

const ForumPostDetailPage = () => {
    const {id: forumId, postId} = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPostDetails();
    }, [forumId, postId]);

    const fetchPostDetails = async () => {
        try {
            setLoading(true);
            const response = await forumPostsService.getById(forumId, postId);
            setPost(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch post details:', error);
            toast.error('Failed to load discussion');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin"/>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Discussion not found</h2>
                <Link to={`/forums/${forumId}`} className="text-primary-600 hover:underline mt-4 inline-block">
                    Return to forum
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
                to={`/forums/${forumId}`}
                className="flex items-center text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1"/>
                Back to forum
            </Link>

            <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                {post.author?.avatar ? (
                                    <img src={post.author.avatar} alt=""
                                         className="w-full h-full rounded-full object-cover"/>
                                ) : (
                                    <User className="w-5 h-5 text-gray-400"/>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{post.author?.name || 'Anonymous'}</p>
                                <div className="flex items-center text-xs text-gray-500 gap-2">
                                    <span>{formatDistanceToNow(new Date(post.created_at), {addSuffix: true})}</span>
                                    {post.category && (
                                        <>
                                            <span>•</span>
                                            <span className="text-secondary-600 font-medium">{post.category}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical className="w-5 h-5 text-gray-400"/>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        {post.is_pinned && (
                            <span
                                className="flex items-center text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                <Pin className="w-3.5 h-3.5 mr-1"/>
                Pinned
              </span>
                        )}
                        {post.is_locked && (
                            <span
                                className="flex items-center text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                <Lock className="w-3.5 h-3.5 mr-1"/>
                Locked
              </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>

                    <div className="prose prose-primary max-w-none text-gray-700 mb-8 whitespace-pre-wrap">
                        {post.body}
                    </div>

                    {post.attachments && post.attachments.length > 0 && (
                        <div className="mb-8 flex flex-wrap gap-4">
                            {post.attachments.map((attachment, index) => (
                                <div key={index}
                                     className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div
                                        className="w-10 h-10 rounded bg-white flex items-center justify-center mr-3 shadow-sm">
                                        <Info className="w-5 h-5 text-gray-400"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{attachment.name}</p>
                                        <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-6">
                            <button
                                className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors">
                                <ThumbsUp className="w-5 h-5"/>
                                <span className="font-medium">{post.like_count || 0}</span>
                            </button>
                            <div className="flex items-center gap-2 text-gray-500">
                                <MessageSquare className="w-5 h-5"/>
                                <span className="font-medium">{post.comment_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Eye className="w-5 h-5"/>
                                <span className="font-medium">{post.view_count || 0}</span>
                            </div>
                        </div>

                        <button
                            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors">
                            <Share2 className="w-5 h-5"/>
                            <span className="font-medium">Share</span>
                        </button>
                    </div>
                </div>
            </article>

            <CommentSection forumId={forumId} postId={postId} isLocked={post.is_locked}/>
        </div>
    );
};

export default ForumPostDetailPage;
