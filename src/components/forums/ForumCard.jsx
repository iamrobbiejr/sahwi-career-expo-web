import React from 'react';
import {Link} from 'react-router-dom';
import {Users, MessageSquare, ArrowRight, Lock} from 'lucide-react';

const ForumCard = ({forum}) => {
    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-24 bg-gradient-to-r from-primary-500 to-secondary-500 relative">
                {forum.banner_image && (
                    <img
                        src={forum.banner_image}
                        alt={forum.title}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute -bottom-6 left-6">
                    <div className="w-12 h-12 rounded-lg bg-white shadow-md flex items-center justify-center text-2xl">
                        {forum.icon || '💬'}
                    </div>
                </div>
            </div>

            <div className="pt-8 p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                        {forum.title}
                    </h3>
                    {!forum.public && (
                        <Lock className="w-4 h-4 text-gray-400"/>
                    )}
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
                    {forum.description}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1"/>
                        <span>{forum.member_count || 0} members</span>
                    </div>
                    <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1"/>
                        <span>{forum.post_count || 0} posts</span>
                    </div>
                </div>

                <Link
                    to={`/forums/${forum.id}`}
                    className="w-full flex items-center justify-center space-x-2 bg-primary-50 text-primary-700 py-2 rounded-lg font-medium hover:bg-primary-100 transition-colors"
                >
                    <span>View Forum</span>
                    <ArrowRight className="w-4 h-4"/>
                </Link>
            </div>
        </div>
    );
};

export default ForumCard;
