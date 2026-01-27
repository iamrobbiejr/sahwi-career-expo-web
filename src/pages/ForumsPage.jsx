import React, {useState, useEffect} from 'react';
import {forumsService} from '../services/api';
import ForumCard from '../components/forums/ForumCard';
import CreateForumModal from '../components/forums/CreateForumModal';
import {Plus, Search, Loader2} from 'lucide-react';
import {toast} from 'react-hot-toast';
import {useAuthStore} from '../store';
import Can from '../components/auth/Can';

const ForumsPage = () => {
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {user} = useAuthStore();

    useEffect(() => {
        fetchForums();
    }, []);

    const fetchForums = async () => {
        try {
            setLoading(true);
            const response = await forumsService.getAll();
            setForums(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch forums:', error);
            toast.error('Failed to load forums');
        } finally {
            setLoading(false);
        }
    };

    const filteredForums = forums.filter(forum =>
        forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forum.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Community Forums</h1>
                    <p className="text-gray-600 mt-1">Join discussions, share knowledge, and connect with peers.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <input
                            type="text"
                            placeholder="Search forums..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Can perform="forums.create">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        >
                            <Plus className="w-4 h-4"/>
                            <span>Create Forum</span>
                        </button>
                    </Can>
                </div>
            </div>

            <CreateForumModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onForumCreated={fetchForums}
            />

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin"/>
                </div>
            ) : filteredForums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredForums.map((forum) => (
                        <ForumCard key={forum.id} forum={forum}/>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">No forums found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your search or check back later.</p>
                </div>
            )}
        </div>
    );
};

export default ForumsPage;
