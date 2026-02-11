import React from 'react';
import {Link} from 'react-router-dom';
import {Calendar, Eye, Lock, MessageSquare, Pin, User} from 'lucide-react';
import {formatDistanceToNow} from 'date-fns';

const ForumPostCard = ({forumId, post, onClick}) => {
    return (
        <div
            className={`bg-white rounded-xl shadow-sm border ${post.is_pinned ? 'border-primary-200 bg-primary-50/10' : 'border-gray-200'} p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        {post.is_pinned && (
                            <span
                                className="flex items-center text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                <Pin className="w-3 h-3 mr-1"/>
                                Pinned
                            </span>
                        )}
                        {post.is_locked && (
                            <span
                                className="flex items-center text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                <Lock className="w-3 h-3 mr-1"/>
                                Locked
                            </span>
                        )}
                        <span
                            className="text-xs font-medium text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full">
                            {post.category || 'General'}
                        </span>
                    </div>

                    <Link
                        to={`/forums/${forumId}/posts/${post.id}`}
                        onClick={onClick}
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-1">
                            {post.title}
                        </h3>
                    </Link>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {post.body}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                <User className="w-3 h-3 text-gray-500"/>
                            </div>
                            <span>{post.author?.name || 'Anonymous'}</span>
                        </div>

                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1"/>
                            <span>{formatDistanceToNow(new Date(post.created_at), {addSuffix: true})}</span>
                        </div>

                        <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1"/>
                            <span>{post.comment_count || 0} comments</span>
                        </div>

                        <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1"/>
                            <span>{post.view_count || 0} views</span>
                        </div>
                    </div>
                </div>

                {post.author?.avatar && (
                    <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-lg object-cover"
                    />
                )}
            </div>
        </div>
    );
};

export default ForumPostCard;
