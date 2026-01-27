import React, {useState, useEffect} from 'react';
import {forumCommentsService} from '../../services/api';
import {Loader2, MessageSquare, Send, User, ThumbsUp, Reply, MoreHorizontal} from 'lucide-react';
import {formatDistanceToNow} from 'date-fns';
import {toast} from 'react-hot-toast';
import {useAuthStore} from '../../store';

const CommentItem = ({comment, forumId, postId, onReply}) => {
    const {user} = useAuthStore();

    const handleLike = async () => {
        try {
            await forumCommentsService.toggleLike(forumId, postId, comment.id);
            // Ideally refresh or update local state
        } catch (error) {
            toast.error('Failed to like comment');
        }
    };

    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {comment.author?.avatar ? (
                        <img src={comment.author.avatar} alt="" className="w-full h-full rounded-full object-cover"/>
                    ) : (
                        <User className="w-5 h-5 text-gray-400"/>
                    )}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-2xl px-4 py-3 relative">
                    <div className="flex items-center justify-between mb-1">
                        <span
                            className="font-semibold text-sm text-gray-900">{comment.author?.name || 'Anonymous'}</span>
                        <span
                            className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.created_at), {addSuffix: true})}</span>
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">
                        {comment.content}
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-2 ml-2">
                    <button
                        onClick={handleLike}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary-600 transition-colors"
                    >
                        <ThumbsUp className="w-3.5 h-3.5"/>
                        <span>{comment.like_count || 0}</span>
                    </button>
                    <button
                        onClick={() => onReply(comment)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary-600 transition-colors"
                    >
                        <Reply className="w-3.5 h-3.5"/>
                        <span>Reply</span>
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5 text-gray-400"/>
                    </button>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
                        {comment.replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                forumId={forumId}
                                postId={postId}
                                onReply={onReply}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CommentSection = ({forumId, postId, isLocked}) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState(null);

    useEffect(() => {
        fetchComments();
    }, [forumId, postId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await forumCommentsService.getAll(forumId, postId);
            setComments(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            const data = {
                content_message: newComment,
                parent_comment_id: replyTo?.id
            };
            await forumCommentsService.create(forumId, postId, data);
            setNewComment('');
            setReplyTo(null);
            fetchComments();
            toast.success('Comment added successfully');
        } catch (error) {
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-6 h-6 text-primary-600"/>
                <h2 className="text-xl font-bold text-gray-900">Comments</h2>
            </div>

            {!isLocked ? (
                <form onSubmit={handleSubmit} className="mb-10">
                    {replyTo && (
                        <div
                            className="flex items-center justify-between bg-primary-50 px-4 py-2 rounded-t-xl border-x border-t border-primary-100">
              <span className="text-sm text-primary-700">
                Replying to <span className="font-bold">{replyTo.author?.name}</span>
              </span>
                            <button
                                type="button"
                                onClick={() => setReplyTo(null)}
                                className="text-xs font-bold text-primary-600 hover:underline"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                    <div className="relative">
            <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className={`w-full p-4 border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none h-32 transition-all ${replyTo ? 'rounded-b-xl' : 'rounded-xl'}`}
            />
                        <div className="absolute bottom-3 right-3">
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                ) : (
                                    <Send className="w-4 h-4"/>
                                )}
                                <span>Post Comment</span>
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center mb-10 text-gray-600">
                    This discussion is locked and no new comments can be posted.
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 text-primary-600 animate-spin"/>
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-8">
                    {comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            forumId={forumId}
                            postId={postId}
                            onReply={setReplyTo}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    No comments yet. Start the conversation!
                </div>
            )}
        </div>
    );
};

export default CommentSection;
