import React, {useEffect, useState} from 'react';
import JoinForumWarningModal from '../components/forums/JoinForumWarningModal';
import {Link, useNavigate, useParams} from 'react-router-dom';
import AttachmentPreviewModal from '../components/common/AttachmentPreviewModal';
import {forumPostsService, forumsService} from '../services/api';
import {
    ArrowLeft,
    Copy,
    Download,
    Eye,
    Eye as EyeIcon,
    Facebook,
    Info,
    Linkedin,
    Loader2,
    Lock,
    MessageSquare,
    MoreVertical,
    Pin,
    Share2,
    ThumbsUp,
    Twitter,
    User
} from 'lucide-react';
import {formatDistanceToNow} from 'date-fns';
import {toast} from 'react-hot-toast';
import CommentSection from '../components/forums/CommentSection';

const ForumPostDetailPage = () => {
    const {id: forumId, postId} = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);

    const [loading, setLoading] = useState(true);

    const [previewAttachment, setPreviewAttachment] = useState(null);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

    const [isMember, setIsMember] = useState(false);
    const [checkingMembership, setCheckingMembership] = useState(true);
    const [isJoinWarningModalOpen, setIsJoinWarningModalOpen] = useState(false);
    const [joining, setJoining] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const STORAGE_BASE_URL = API_URL.replace('/api/v1', '') + '/storage/app/public/';

    const getDownloadUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${STORAGE_BASE_URL}${path}`;
    };

    useEffect(() => {
        fetchPostDetails();
        checkMembershipStatus();
    }, [forumId, postId]);

    const fetchPostDetails = async () => {
        try {
            setLoading(true);
            const response = await forumPostsService.getById(forumId, postId);
            setPost(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch post details:', error);
            toast.error('Failed to load discussion');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = (platform) => {
        const url = window.location.href;
        const text = `Check out this discussion: ${post.title}`;

        switch (platform) {
            case 'copy':
                navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                break;
        }
        setIsShareMenuOpen(false);
    };

    const checkMembershipStatus = async () => {
        try {
            const response = await forumsService.checkMembership(forumId);
            const isMemberStatus = response.data.is_member || response.data.data?.is_member || false;
            setIsMember(isMemberStatus);
            if (!isMemberStatus) {
                setIsJoinWarningModalOpen(true);
            }
        } catch (error) {
            console.error('Failed to check membership:', error);
        } finally {
            setCheckingMembership(false);
        }
    };

    const handleJoin = async () => {
        try {
            setJoining(true);
            await forumsService.join(forumId);
            setIsMember(true);
            setIsJoinWarningModalOpen(false);
            toast.success('Joined forum successfully');
            // Optionally refresh post details if needed
        } catch (error) {
            console.error('Failed to join forum:', error);
            toast.error('Failed to join forum');
        } finally {
            setJoining(false);
        }
    };

    const handleCancelRedirect = () => {
        navigate(`/forums/${forumId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin"/>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Discussion not found</h2>
                <Link to={`/forums/${forumId}`} className="text-primary-600 hover:underline mt-4 inline-block">
                    Return to forum
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
                to={`/forums/${forumId}`}
                className="flex items-center text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1"/>
                Back to forum
            </Link>

            <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                {post.author?.avatar ? (
                                    <img src={post.author.avatar} alt=""
                                         className="w-full h-full rounded-full object-cover"/>
                                ) : (
                                    <User className="w-5 h-5 text-gray-400"/>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{post.author?.name || 'Anonymous'}</p>
                                <div className="flex items-center text-xs text-gray-500 gap-2">
                                    <span>{formatDistanceToNow(new Date(post.created_at), {addSuffix: true})}</span>
                                    {post.category && (
                                        <>
                                            <span>•</span>
                                            <span className="text-secondary-600 font-medium">{post.category}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical className="w-5 h-5 text-gray-400"/>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        {post.is_pinned && (
                            <span
                                className="flex items-center text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                                <Pin className="w-3.5 h-3.5 mr-1"/>
                                Pinned
                            </span>
                        )}
                        {post.is_locked && (
                            <span
                                className="flex items-center text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                <Lock className="w-3.5 h-3.5 mr-1"/>
                                Locked
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>

                    <div className="prose prose-primary max-w-none text-gray-700 mb-8 whitespace-pre-wrap">
                        {post.body}
                    </div>

                    {post.attachments && post.attachments.length > 0 && (
                        <div className="mb-8 flex flex-wrap gap-4">
                            {post.attachments.map((attachment, index) => {
                                const downloadUrl = getDownloadUrl(attachment.path);
                                const isViewable = attachment.mime_type?.startsWith('image/') ||
                                    attachment.mime_type === 'application/pdf' ||
                                    /\.(jpg|jpeg|png|gif|webp|pdf)$/i.test(attachment.path);

                                return (
                                    <div key={index}
                                         className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 w-full sm:w-auto min-w-[300px]">
                                        <div className="flex items-center">
                                            <div
                                                className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mr-3 shadow-sm text-primary-600">
                                                {isViewable && attachment.mime_type?.startsWith('image/') ? (
                                                    <img src={downloadUrl} alt=""
                                                         className="w-full h-full object-cover rounded-lg"/>
                                                ) : (
                                                    <Info className="w-5 h-5"/>
                                                )}
                                            </div>
                                            <div className="mr-4">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[150px]"
                                                   title={attachment.name || attachment.path}>
                                                    {attachment.name || attachment.path.split('/').pop()}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(attachment.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isViewable && (
                                                <button
                                                    onClick={() => setPreviewAttachment({
                                                        ...attachment,
                                                        url: downloadUrl
                                                    })}
                                                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <EyeIcon className="w-4 h-4"/>
                                                </button>
                                            )}
                                            <a
                                                href={downloadUrl}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4"/>
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-6">
                            <button
                                className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors">
                                <ThumbsUp className="w-5 h-5"/>
                                <span className="font-medium">{post.like_count || 0}</span>
                            </button>
                            <div className="flex items-center gap-2 text-gray-500">
                                <MessageSquare className="w-5 h-5"/>
                                <span className="font-medium">{post.comment_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Eye className="w-5 h-5"/>
                                <span className="font-medium">{post.view_count || 0}</span>
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                                className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors">
                                <Share2 className="w-5 h-5"/>
                                <span className="font-medium">Share</span>
                            </button>

                            {isShareMenuOpen && (
                                <div
                                    className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Copy className="w-4 h-4"/>
                                        Copy Link
                                    </button>
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Twitter className="w-4 h-4"/>
                                        Twitter
                                    </button>
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Facebook className="w-4 h-4"/>
                                        Facebook
                                    </button>
                                    <button
                                        onClick={() => handleShare('linkedin')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Linkedin className="w-4 h-4"/>
                                        LinkedIn
                                    </button>
                                    <button
                                        onClick={() => handleShare('whatsapp')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4"/>
                                        WhatsApp
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </article>


            <AttachmentPreviewModal
                isOpen={!!previewAttachment}
                onClose={() => setPreviewAttachment(null)}
                attachment={previewAttachment}
                downloadUrl={previewAttachment?.url}
            />

            <JoinForumWarningModal
                isOpen={isJoinWarningModalOpen}
                onClose={handleCancelRedirect}
                onJoin={handleJoin}
                isJoining={joining}
            />

            <CommentSection forumId={forumId} postId={postId} isLocked={post.is_locked}/>
        </div>
    );
};

export default ForumPostDetailPage;
