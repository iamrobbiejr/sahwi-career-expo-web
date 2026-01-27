import React, {useState} from 'react';
import {format} from 'date-fns';
import {Paperclip, Loader2, AlertCircle, RefreshCw, Download} from 'lucide-react';
import {useAuthStore} from '../../store';
import {messagesService} from '../../services/api';
import toast from 'react-hot-toast';

const MessageItem = ({message, isPending, onResend}) => {
    const {user} = useAuthStore();
    const [downloadingIndex, setDownloadingIndex] = useState(null);
    const isMe = message.sender_id === user?.id;
    const isSending = isPending && message.status === 'sending';
    const isFailed = isPending && message.status === 'failed';

    const handleDownload = async (att, index) => {
        if (!message.id) {
            toast.error('Message ID not found');
            return;
        }

        setDownloadingIndex(index);
        try {
            const response = await messagesService.downloadAttachment(message.id, index);
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', att.name || 'attachment');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Download failed:', err);
            toast.error('Failed to download file');
        } finally {
            setDownloadingIndex(null);
        }
    };

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
            <div className={`max-w-[75%] ${isMe ? 'order-2' : ''} flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (
                    <span className="text-xs text-gray-500 ml-2 mb-1 block">
            {message.sender?.name || 'Unknown'}
          </span>
                )}
                <div className="flex items-center gap-2 max-w-full">
                    {isFailed && isMe && (
                        <button
                            onClick={onResend}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Resend message"
                        >
                            <RefreshCw size={16}/>
                        </button>
                    )}

                    <div
                        className={`px-4 py-2 rounded-2xl shadow-sm relative transition-all ${
                            isMe
                                ? `bg-primary-600 text-white rounded-tr-none ${isFailed ? 'border-2 border-red-500' : ''} ${isSending ? 'opacity-70' : ''}`
                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                        }`}
                    >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

                        {message.attachments && message.attachments.length > 0 && (
                            <div
                                className={`mt-2 space-y-1 pt-2 border-t ${isMe ? 'border-primary-500' : 'border-gray-100'}`}>
                                {message.attachments.map((att, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-between gap-4 text-xs ${isMe ? 'text-primary-100' : 'text-primary-600'}`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Paperclip size={12} className="flex-shrink-0"/>
                                            <span className="truncate">{att.name || 'Attachment'}</span>
                                        </div>
                                        {!isPending && (
                                            <button
                                                onClick={() => handleDownload(att, i)}
                                                disabled={downloadingIndex !== null}
                                                className={`p-1 rounded-full transition-colors ${
                                                    isMe ? 'hover:bg-primary-500 text-primary-100' : 'hover:bg-gray-100 text-primary-600'
                                                }`}
                                                title="Download"
                                            >
                                                {downloadingIndex === i ? (
                                                    <Loader2 size={12} className="animate-spin"/>
                                                ) : (
                                                    <Download size={12}/>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div
                            className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? 'text-primary-100 justify-end' : 'text-gray-400 justify-start'}`}>
                            {message.created_at ? format(new Date(message.created_at), 'HH:mm') : ''}
                            {message.status === 'edited' && <span className="ml-1">(edited)</span>}
                            {isSending && <Loader2 size={10} className="animate-spin"/>}
                            {isFailed && <AlertCircle size={10} className="text-red-200"/>}
                        </div>
                    </div>
                </div>
                {isFailed && (
                    <span className="text-[10px] text-red-500 mt-1">Failed to send</span>
                )}
            </div>
        </div>
    );
};

export default MessageItem;
