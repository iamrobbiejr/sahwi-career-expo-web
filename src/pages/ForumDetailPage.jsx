import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {forumPostsService, forumsService} from '../services/api';
import ForumPostCard from '../components/forums/ForumPostCard';
import CreatePostModal from '../components/forums/CreatePostModal';
import ForumMembersModal from '../components/forums/ForumMembersModal';
import JoinForumWarningModal from '../components/forums/JoinForumWarningModal';
import {ArrowLeft, Info, Loader2, LogOut, MessageSquare, Plus, Search, UserPlus, Users} from 'lucide-react';
import {toast} from 'react-hot-toast';
import Can from '../components/auth/Can';

const ForumDetailPage = () => {
    const {id} = useParams();
    const [forum, setForum] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [checkingMembership, setCheckingMembership] = useState(true);
    const [joining, setJoining] = useState(false);
    const [isJoinWarningModalOpen, setIsJoinWarningModalOpen] = useState(false);

    useEffect(() => {
        fetchForumDetails();
        checkMembershipStatus();
    }, [id]);

    useEffect(() => {
        fetchPosts();
    }, [id, sortBy]);

    const fetchForumDetails = async () => {
        try {
            const response = await forumsService.getById(id);
            setForum(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch forum details:', error);
            toast.error('Failed to load forum information');
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await forumPostsService.getAll(id, {sort: sortBy});
            setPosts(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const checkMembershipStatus = async () => {
        try {
            const response = await forumsService.checkMembership(id);
            // Assuming the API returns { is_member: boolean } or similar
            setIsMember(response.data.is_member || response.data.data?.is_member || false);
        } catch (error) {
            console.error('Failed to check membership:', error);
        } finally {
            setCheckingMembership(false);
        }
    };

    const handleJoin = async () => {
        try {
            setJoining(true);
            await forumsService.join(id);
            setIsMember(true);
            toast.success('Joined forum successfully');
            fetchForumDetails(); // Refresh member count
        } catch (error) {
            console.error('Failed to join forum:', error);
            toast.error('Failed to join forum');
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to leave this forum?')) return;

        try {
            setJoining(true);
            await forumsService.leave(id);
            setIsMember(false);
            toast.success('Left forum successfully');
            fetchForumDetails(); // Refresh member count
        } catch (error) {
            console.error('Failed to leave forum:', error);
            toast.error('Failed to leave forum');
        } finally {
            setJoining(false);
        }
    };

    const handleJoinFromModal = async () => {
        await handleJoin();
        setIsJoinWarningModalOpen(false);
    };

    const handlePostClick = (e) => {
        if (!isMember) {
            e.preventDefault();
            setIsJoinWarningModalOpen(true);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.body.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!forum && loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin"/>
            </div>
        );
    }

    if (!forum) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Forum not found</h2>
                <Link to="/forums" className="text-primary-600 hover:underline mt-4 inline-block">
                    Return to forums
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/forums"
                  className="flex items-center text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1"/>
                Back to all forums
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="h-32 md:h-48 bg-gradient-to-r from-primary-600 to-secondary-600 relative">
                    {forum.banner_image && (
                        <img src={forum.banner_image} alt="" className="w-full h-full object-cover opacity-50"/>
                    )}
                </div>
                <div className="p-6 md:p-8 relative">
                    <div className="absolute -top-12 left-6 md:left-8">
                        <div
                            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center text-4xl">
                            {forum.icon || '💬'}
                        </div>
                    </div>

                    <div
                        className="mt-8 md:mt-0 md:pl-32 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{forum.title}</h1>
                            <p className="text-gray-600 mt-2 max-w-2xl">{forum.description}</p>

                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <Users className="w-4 h-4 mr-1.5"/>
                                    {forum.member_count || 0} Members
                                </span>
                                <span className="flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-1.5"/>
                                    {forum.post_count || 0} Posts
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Can perform="forums.manage">
                                <button
                                    onClick={() => setIsMembersModalOpen(true)}
                                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Users className="w-4 h-4"/>
                                    Members
                                </button>
                            </Can>

                            {!checkingMembership && (
                                <button
                                    onClick={isMember ? handleLeave : handleJoin}
                                    disabled={joining}
                                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold border transition-colors flex items-center justify-center gap-2 ${isMember
                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                        : 'border-primary-600 text-primary-600 hover:bg-primary-50'
                                    }`}
                                >
                                    {joining ? (
                                        <Loader2 className="w-4 h-4 animate-spin"/>
                                    ) : isMember ? (
                                        <>
                                            <LogOut className="w-4 h-4"/>
                                            Leave
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4"/>
                                            Join
                                        </>
                                    )}
                                </button>
                            )}

                            <Can perform="forums.post">
                                {!checkingMembership && isMember && (
                                    <button
                                        onClick={() => setIsPostModalOpen(true)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5"/>
                                        New Post
                                    </button>
                                )}
                            </Can>
                        </div>
                    </div>
                </div>
            </div>

            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                forumId={id}
                onPostCreated={fetchPosts}
            />

            <ForumMembersModal
                isOpen={isMembersModalOpen}
                onClose={() => setIsMembersModalOpen(false)}
                forumId={id}
                forumTitle={forum?.title}
            />

            <JoinForumWarningModal
                isOpen={isJoinWarningModalOpen}
                onClose={() => setIsJoinWarningModalOpen(false)}
                onJoin={handleJoinFromModal}
                isJoining={joining}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Discussions</h2>
                    <div className="h-6 w-px bg-gray-200 hidden md:block"/>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSortBy('latest')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === 'latest' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            Latest
                        </button>
                        <button
                            onClick={() => setSortBy('popular')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === 'popular' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            Popular
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Search discussions..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin"/>
                </div>
            ) : filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredPosts.map((post) => (
                        <ForumPostCard
                            key={post.id}
                            forumId={id}
                            post={post}
                            onClick={handlePostClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Info className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900">No discussions yet</h3>
                    <p className="text-gray-500 mt-1">Be the first to start a conversation in this forum!</p>
                </div>
            )}
        </div>
    );
};

export default ForumDetailPage;
