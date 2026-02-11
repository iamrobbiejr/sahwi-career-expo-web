import React, {useCallback, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {messagesService, threadsService} from '../../services/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import {useAuthStore} from '../../store';
import toast from 'react-hot-toast';

const MessageWindow = ({threadId}) => {
    const queryClient = useQueryClient();
    const {user} = useAuthStore();
    const [pendingMessages, setPendingMessages] = useState([]);

    const {data: threadData, isLoading: threadLoading} = useQuery({
        queryKey: ['thread', threadId],
        queryFn: () => threadsService.getById(threadId),
    });

    const {data: messagesData, isLoading: messagesLoading} = useQuery({
        queryKey: ['messages', threadId],
        queryFn: () => messagesService.getAll(threadId),
        refetchInterval: 5000, // Basic polling for new messages every 5 seconds
    });

    const thread = threadData?.data;


    const messages = messagesData?.data?.data || [];

    const sendMessageMutation = useMutation({
        mutationFn: (variables) => {
            // Remove our internal _tempId before sending to API
            const {_tempId, ...apiData} = variables instanceof FormData
                ? {_tempId: variables.get('_tempId'), ...Object.fromEntries(variables.entries())}
                : variables;

            // If it was FormData, we should probably stick to FormData
            if (variables instanceof FormData) {
                const formData = new FormData();
                for (let [key, value] of variables.entries()) {
                    if (key !== '_tempId') {
                        formData.append(key, value);
                    }
                }
                return messagesService.send(threadId, formData);
            }

            return messagesService.send(threadId, apiData);
        },
        onMutate: async (variables) => {
            const tempId = variables instanceof FormData
                ? (variables.get('_tempId') ? Number(variables.get('_tempId')) : null)
                : variables._tempId;
            return {tempId};
        },
        onSuccess: (response, variables, context) => {
            // Remove the message from pending
            const tempId = context?.tempId;
            if (tempId) {
                setPendingMessages(prev => prev.filter(msg => String(msg.tempId) !== String(tempId)));
            }

            queryClient.invalidateQueries(['messages', threadId]);
            queryClient.invalidateQueries(['threads']);
        },
        onError: (error, variables, context) => {
            // Mark the message as failed in pending
            const tempId = context?.tempId;
            if (tempId) {
                setPendingMessages(prev => prev.map(msg =>
                    String(msg.tempId) === String(tempId)
                        ? {...msg, status: 'failed'}
                        : msg
                ));
            }
            toast.error('Failed to send message');
        }
    });

    const handleSend = useCallback((content) => {
        const tempId = Date.now();
        const isFormData = content instanceof FormData;
        const messageContent = isFormData ? content.get('content_message') : content;

        const newPendingMessage = {
            tempId,
            content: messageContent,
            sender_id: user?.id,
            created_at: new Date().toISOString(),
            status: 'sending',
            attachments: isFormData ? Array.from(content.getAll('attachments[]')).map(f => ({name: f.name})) : []
        };

        setPendingMessages(prev => [...prev, newPendingMessage]);

        // To pass tempId to onMutate, we can wrap the content
        let mutationData = content;
        if (isFormData) {
            content.append('_tempId', tempId); // We can't easily add to FormData without affecting backend unless we handle it
        } else {
            mutationData = {content_message: content, _tempId: tempId};
        }

        sendMessageMutation.mutate(mutationData);
    }, [user?.id, sendMessageMutation, threadId]);

    const handleResend = useCallback((pendingMsg) => {
        // Set status back to sending
        setPendingMessages(prev => prev.map(msg =>
            msg.tempId === pendingMsg.tempId
                ? {...msg, status: 'sending'}
                : msg
        ));

        const data = {
            content_message: pendingMsg.content,
            _tempId: pendingMsg.tempId
        };

        sendMessageMutation.mutate(data);
    }, [sendMessageMutation]);

    if (threadLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Thread Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {(thread?.creator?.name || 'T').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">
                            {thread?.thread_type === 'direct' ? thread?.members[1]?.user?.name : thread?.title}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {thread?.member_count || 0} members
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <MessageList
                messages={messages}
                isLoading={messagesLoading}
                pendingMessages={pendingMessages}
                onResend={handleResend}
            />

            {/* Input */}
            <MessageInput
                onSend={handleSend}
                disabled={false} // Don't disable input while sending to allow multiple messages
            />
        </div>
    );
};

export default MessageWindow;
