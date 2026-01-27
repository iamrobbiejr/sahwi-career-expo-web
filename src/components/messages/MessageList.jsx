import React, {useEffect, useRef} from 'react';
import MessageItem from './MessageItem';

const MessageList = ({messages, isLoading, pendingMessages = [], onResend}) => {
    const bottomRef = useRef(null);

    const allMessages = [...messages, ...pendingMessages];

    useEffect(() => {
        // Only scroll if there are messages and we're not loading (though we might want to scroll on load too)
        if (allMessages.length > 0) {
            bottomRef.current?.scrollIntoView({behavior: 'smooth'});
        }
    }, [allMessages.length]);

    if (isLoading && messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (allMessages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                No messages yet. Say hello!
            </div>
        );
    }

    // Backend returns latest messages first, we want to display them chronologically
    const sortedMessages = [...messages].sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
    );

    return (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50">
            {sortedMessages.map((message) => (
                <MessageItem key={message.id} message={message}/>
            ))}
            {pendingMessages.map((message) => (
                <MessageItem
                    key={message.tempId}
                    message={message}
                    isPending={true}
                    onResend={() => onResend(message)}
                />
            ))}
            <div ref={bottomRef}/>
        </div>
    );
};

export default MessageList;
