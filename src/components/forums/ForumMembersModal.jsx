import React, {useEffect, useState} from 'react';
import {forumsService} from '../../services/api';
import {Loader2, Search, UserMinus, X} from 'lucide-react';
import {toast} from 'react-hot-toast';
import {useAuthStore} from '../../store';
import Can from '../auth/Can';

const ForumMembersModal = ({isOpen, onClose, forumId, forumTitle}) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const {user} = useAuthStore();

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen, forumId]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await forumsService.getMembers(forumId);

            setMembers(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch members:', error);
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;

        try {
            let res = await forumsService.remove(userId, forumId);

            if (res.data.status === 'success') {
                setMembers(members.filter(member => member.id !== userId));
                toast.success('Member removed successfully');
            } else {
                toast.error(res.data.message || 'Failed to remove member');
            }
        } catch (error) {
            console.error('Failed to remove member:', error);
            toast.error('Failed to remove member');
        }
    };

    const filteredMembers = members.filter(member =>
        member.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Forum Members</h2>
                        <p className="text-sm text-gray-500">{forumTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <input
                            type="text"
                            placeholder="Search members..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-8 h-8 text-primary-600 animate-spin"/>
                        </div>
                    ) : filteredMembers.length > 0 ? (
                        <div className="space-y-3">
                            {filteredMembers.map((member) => (
                                <div key={member.id}
                                     className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                                            {member.user.avatar ? (
                                                <img src={member.user.avatar} alt={member.user.name}
                                                     className="w-full h-full rounded-full object-cover"/>
                                            ) : (
                                                member.user.name?.charAt(0).toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{member.user.name}</h4>
                                            <p className="text-xs text-gray-500">{member.user.email}</p>
                                        </div>
                                    </div>

                                    <Can perform="forums.manage">
                                        {user?.id !== member.id && (
                                            <button
                                                onClick={() => handleRemoveMember(member.user.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove member"
                                            >
                                                <UserMinus className="w-4 h-4"/>
                                            </button>
                                        )}
                                    </Can>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>No members found</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-500">
                    {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
                </div>
            </div>
        </div>
    );
};

export default ForumMembersModal;
