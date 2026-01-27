import React from 'react';
import {formatDistanceToNow} from 'date-fns';
import {useAuthStore} from '../../store';

const ThreadItem = ({thread, isSelected, onClick}) => {
    const {user} = useAuthStore();

    const getThreadTitle = () => {
        if (thread.title) return thread.title;

        if (thread.thread_type === 'direct') {
            const otherMember = thread.members?.find(m => m.user_id !== user?.id);

            return thread?.creator?.name || 'Direct Message';
        }

        return 'Untitled Thread';
    };

    const lastMessage = thread.messages?.[0];

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left ${
                isSelected ? 'bg-primary-50' : ''
            }`}
        >
            <div className="relative flex-shrink-0">
                <div
                    className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {getThreadTitle().charAt(0).toUpperCase()}
                </div>
                {thread.unread_count > 0 && (
                    <span
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            {thread.unread_count}
          </span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <h3 className={`font-semibold truncate ${thread.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                            {getThreadTitle()}
                        </h3>
                        {thread.thread_type !== 'direct' && (
                            <span
                                className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 flex-shrink-0">
                {thread.thread_type.replace('_', ' ')}
              </span>
                        )}
                    </div>
                    {thread.last_message_at && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatDistanceToNow(new Date(thread.last_message_at), {addSuffix: false})}
            </span>
                    )}
                </div>

                <p className={`text-sm truncate ${thread.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {lastMessage ? lastMessage.content : 'No messages yet'}
                </p>
            </div>
        </button>
    );
};

export default ThreadItem;
