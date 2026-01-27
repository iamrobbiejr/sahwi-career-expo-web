import React, {useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {articlesService} from '../services/api';
import {formatImageUrl} from '../utils/format';
import {
    Calendar, Heart, MessageSquare, Share2, Bookmark,
    ArrowLeft, Loader2, Send, Reply,
    Twitter, Facebook, Linkedin, Link as LinkIcon
} from 'lucide-react';
import {useAuthStore} from '../store';
import toast from 'react-hot-toast';

const ArticleDetailPage = () => {
    const {id} = useParams();
    const queryClient = useQueryClient();
    const {user} = useAuthStore();
    const [comment, setComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    const {data, isLoading, isError} = useQuery({
        queryKey: ['article', id],
        queryFn: () => articlesService.getById(id),
    });

    const article = data?.data;

    const likeMutation = useMutation({
        mutationFn: () => articlesService.toggleLike(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['article', id]);
        }
    });

    const bookmarkMutation = useMutation({
        mutationFn: () => articlesService.toggleBookmark(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['article', id]);
        }
    });

    const shareMutation = useMutation({
        mutationFn: (platform) => articlesService.share(id, {platform}),
        onSuccess: () => {
            toast.success('Share recorded!');
            queryClient.invalidateQueries(['article', id]);
        }
    });

    const commentMutation = useMutation({
        mutationFn: (data) => articlesService.createComment(id, data),
        onSuccess: () => {
            setComment('');
            setReplyTo(null);
            setReplyContent('');
            toast.success('Comment added!');
            queryClient.invalidateQueries(['article', id]);
        }
    });

    const handleLike = () => {
        if (!user) return toast.error('Please login to like');
        likeMutation.mutate();
    };

    const handleBookmark = () => {
        if (!user) return toast.error('Please login to bookmark');
        bookmarkMutation.mutate();
    };

    const handleShare = (platform) => {
        if (platform === 'copy') {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
        shareMutation.mutate(platform);
    };

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (!user) return toast.error('Please login to comment');
        if (!comment.trim()) return;
        commentMutation.mutate({content_message: comment});
    };

    const handleSubmitReply = (e) => {
        e.preventDefault();
        if (!user) return toast.error('Please login to reply');
        if (!replyContent.trim()) return;
        commentMutation.mutate({
            content_message: replyContent,
            parent_comment_id: replyTo
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin"/>
            </div>
        );
    }

    if (isError || !article) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12 text-center">
                <p className="text-red-500 font-medium">Failed to load article details.</p>
                <Link to="/articles" className="mt-4 inline-flex items-center text-primary-600 hover:underline">
                    <ArrowLeft className="w-4 h-4 mr-2"/>
                    Back to Articles
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <Link to="/articles"
                  className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2"/>
                Back to Articles
            </Link>

            <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover Image */}
                <div className="relative h-[400px]">
                    <img
                        src={formatImageUrl(article.cover_image) || `https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=${article.id}`}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {article.tags?.map(tag => (
                                <span key={tag}
                                      className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                  {tag}
                </span>
                            ))}
                        </div>
                        <h1 className="text-4xl font-bold leading-tight">{article.title}</h1>
                    </div>
                </div>

                <div className="p-8 lg:p-12 space-y-8">
                    {/* Author & Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-lg">
                                {article.author?.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{article.author?.name}</p>
                                <div className="flex items-center text-sm text-gray-500 gap-4">
                                    <span className="flex items-center"><Calendar
                                        className="w-4 h-4 mr-1.5 text-primary-500"/> {new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                                    <span className="flex items-center"><Heart
                                        className="w-4 h-4 mr-1.5 text-primary-500"/> {article.likes_count} likes</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleLike}
                                className={`p-2.5 rounded-full transition-all ${article.has_liked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Heart className={`w-6 h-6 ${article.has_liked ? 'fill-current' : ''}`}/>
                            </button>
                            <button
                                onClick={handleBookmark}
                                className={`p-2.5 rounded-full transition-all ${article.has_bookmarked ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Bookmark className={`w-6 h-6 ${article.has_bookmarked ? 'fill-current' : ''}`}/>
                            </button>
                            <div className="relative group">
                                <button
                                    className="p-2.5 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all">
                                    <Share2 className="w-6 h-6"/>
                                </button>
                                <div
                                    className="absolute right-0 bottom-full mb-2 hidden group-hover:flex flex-col bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[150px] z-10">
                                    <button onClick={() => handleShare('twitter')}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm transition-colors text-gray-700">
                                        <Twitter className="w-4 h-4 text-[#1DA1F2]"/> Twitter
                                    </button>
                                    <button onClick={() => handleShare('facebook')}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm transition-colors text-gray-700">
                                        <Facebook className="w-4 h-4 text-[#4267B2]"/> Facebook
                                    </button>
                                    <button onClick={() => handleShare('linkedin')}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm transition-colors text-gray-700">
                                        <Linkedin className="w-4 h-4 text-[#0077B5]"/> LinkedIn
                                    </button>
                                    <button onClick={() => handleShare('copy')}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm transition-colors text-gray-700">
                                        <LinkIcon className="w-4 h-4 text-gray-500"/> Copy Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Article Body */}
                    <div
                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{__html: article.body}}
                    />

                    {/* Tags */}
                    <div className="pt-8 flex flex-wrap gap-2">
                        {article.tags?.map(tag => (
                            <span key={tag}
                                  className="px-3 py-1 rounded-lg bg-gray-50 text-gray-600 text-sm font-medium">
                #{tag}
              </span>
                        ))}
                    </div>
                </div>
            </article>

            {/* Comments Section */}
            <section className="space-y-8" id="comments">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary-500"/>
                        Comments ({article.comments_count})
                    </h2>
                </div>

                {/* Comment Input */}
                {user ? (
                    <form onSubmit={handleSubmitComment}
                          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <textarea
                placeholder="What are your thoughts?"
                className="w-full border-none focus:ring-0 text-gray-700 resize-none h-24 p-0"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
                        <div className="flex justify-end border-t pt-4">
                            <button
                                type="submit"
                                disabled={!comment.trim() || commentMutation.isPending}
                                className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                                {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> :
                                    <Send className="w-4 h-4 mr-2"/>}
                                Post Comment
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                        <p className="text-gray-600">Please <Link to="/login"
                                                                  className="text-primary-600 font-bold hover:underline">login</Link> to
                            join the conversation.</p>
                    </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                    {article.visible_comments?.map(comment => (
                        <div key={comment.id} className="space-y-4">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4">
                                <div
                                    className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                                    {comment.author?.name?.charAt(0)}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-bold text-gray-900">{comment.author?.name}</span>
                                            <span className="mx-2 text-gray-300">•</span>
                                            <span
                                                className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700">{comment.content}</p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <button
                                            onClick={() => {
                                                setReplyTo(replyTo === comment.id ? null : comment.id);
                                                setReplyContent('');
                                            }}
                                            className="text-sm font-semibold text-gray-500 hover:text-primary-600 flex items-center gap-1.5"
                                        >
                                            <Reply className="w-4 h-4"/> Reply
                                        </button>
                                    </div>

                                    {/* Reply Input */}
                                    {replyTo === comment.id && (
                                        <form onSubmit={handleSubmitReply} className="mt-4 space-y-3">
                      <textarea
                          autoFocus
                          placeholder="Write a reply..."
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                      />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setReplyTo(null)}
                                                    className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!replyContent.trim() || commentMutation.isPending}
                                                    className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center"
                                                >
                                                    {commentMutation.isPending &&
                                                        <Loader2 className="w-3 h-3 animate-spin mr-2"/>}
                                                    Reply
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Replies */}
                            {comment.visible_replies?.length > 0 && (
                                <div className="ml-12 space-y-4 border-l-2 border-gray-50 pl-6">
                                    {comment.visible_replies.map(reply => (
                                        <div key={reply.id}
                                             className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 flex gap-4">
                                            <div
                                                className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">
                                                {reply.author?.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm">
                                                        <span
                                                            className="font-bold text-gray-900">{reply.author?.name}</span>
                                                        <span className="mx-2 text-gray-300">•</span>
                                                        <span
                                                            className="text-gray-500">{new Date(reply.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {(!article.visible_comments || article.visible_comments.length === 0) && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ArticleDetailPage;
