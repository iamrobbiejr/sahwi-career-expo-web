import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {Plus} from 'lucide-react';
import ThreadList from '../components/messages/ThreadList';
import MessageWindow from '../components/messages/MessageWindow';
import CreateThreadModal from '../components/messages/CreateThreadModal';

const MessagesPage = () => {
    const location = useLocation();
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if (location.state?.selectedThreadId) {
            setSelectedThreadId(location.state.selectedThreadId);
        }
    }, [location.state]);

    const handleBackToList = () => {
        setSelectedThreadId(null);
    };

    return (
        <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-4">
            <div
                className="flex h-full bg-white rounded-none sm:rounded-xl shadow-none sm:shadow-lg overflow-hidden border-0 sm:border border-gray-200">
                {/* Thread List Sidebar */}
                <div className={`
                    ${selectedThreadId ? 'hidden lg:flex' : 'flex'} 
                    w-full lg:w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/50
                `}>
                    <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                            title="New Conversation"
                        >
                            <Plus className="w-5 h-5"/>
                        </button>
                    </div>
                    <ThreadList
                        selectedThreadId={selectedThreadId}
                        onSelectThread={setSelectedThreadId}
                    />
                </div>

                {/* Message Window */}
                <div className={`
                    ${!selectedThreadId ? 'hidden lg:flex' : 'flex'} 
                    flex-1 flex flex-col min-w-0 bg-white
                `}>
                    {selectedThreadId ? (
                        <MessageWindow
                            threadId={selectedThreadId}
                            onBack={handleBackToList}
                        />
                    ) : (
                        <div
                            className="hidden lg:flex flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-8">
                            <div
                                className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Messages</h2>
                            <p className="text-gray-500 max-w-sm">
                                Select a conversation from the list or start a new one to chat with other members.
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            >
                                Start a New Conversation
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <CreateThreadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onThreadCreated={(threadId) => setSelectedThreadId(threadId)}
            />
        </div>
    );
};

export default MessagesPage;
