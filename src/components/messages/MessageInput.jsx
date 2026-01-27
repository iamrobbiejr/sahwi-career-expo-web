import React, {useState, useRef} from 'react';
import {Send, Paperclip, X} from 'lucide-react';

const MessageInput = ({onSend, disabled}) => {
    const [content, setContent] = useState('');
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
        // Reset input so the same file can be selected again
        e.target.value = '';
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((content.trim() || attachments.length > 0) && !disabled) {
            if (attachments.length > 0) {
                const formData = new FormData();
                formData.append('content_message', content);
                attachments.forEach(file => formData.append('attachments[]', file));
                onSend(formData);
            } else {
                onSend(content);
            }
            setContent('');
            setAttachments([]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
    };

    return (
        <div className="p-4 bg-white border-t border-gray-200">
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 max-w-6xl mx-auto">
                    {attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="text-gray-500 hover:text-red-500"
                            >
                                <X size={14}/>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-6xl mx-auto">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                    title="Attach file"
                >
                    <Paperclip size={22}/>
                </button>

                <div className="flex-1 relative">
          <textarea
              rows="1"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="w-full border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none overflow-hidden min-h-[40px] max-h-[120px]"
              disabled={disabled}
              style={{height: 'auto'}}
              onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
              }}
          />
                </div>

                <button
                    type="submit"
                    disabled={(!content.trim() && attachments.length === 0) || disabled}
                    className="bg-primary-600 text-white p-2.5 rounded-full hover:bg-primary-700 disabled:opacity-50 transition-all shadow-md active:scale-95 flex-shrink-0"
                >
                    <Send size={20}/>
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
