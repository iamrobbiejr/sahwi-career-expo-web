import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {threadsService} from '../../services/api';
import ThreadItem from './ThreadItem';

const ThreadList = ({selectedThreadId, onSelectThread}) => {
    const {data: threadsData, isLoading, isError} = useQuery({
        queryKey: ['threads'],
        queryFn: () => threadsService.getAll(),
    });

    const threads = threadsData?.data?.data || [];

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 text-center text-red-500">
                Failed to load conversations
            </div>
        );
    }

    if (threads.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                No conversations yet
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {threads.map((thread) => (
                <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isSelected={selectedThreadId === thread.id}
                    onClick={() => onSelectThread(thread.id)}
                />
            ))}
        </div>
    );
};

export default ThreadList;
