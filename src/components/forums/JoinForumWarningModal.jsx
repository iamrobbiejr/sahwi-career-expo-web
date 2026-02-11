import React from 'react';
import {Lock, UserPlus} from 'lucide-react';

const JoinForumWarningModal = ({isOpen, onClose, onJoin, isJoining}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <div
                        className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary-600"/>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">Join Forum to View Posts</h2>
                    <p className="text-gray-600 mb-6">
                        You need to be a member of this forum to view its discussions and participate.
                        Join now to unlock full access!
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onJoin}
                            disabled={isJoining}
                            className="w-full py-3 px-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                        >
                            {isJoining ? (
                                <span
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5"/>
                                    Join Forum
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinForumWarningModal;
