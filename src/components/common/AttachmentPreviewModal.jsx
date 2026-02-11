import React from 'react';
import {Download, X} from 'lucide-react';

const AttachmentPreviewModal = ({isOpen, onClose, attachment, downloadUrl}) => {
    if (!isOpen || !attachment) return null;

    const isImage = attachment.mime_type?.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.path);

    const isPdf = attachment.mime_type === 'application/pdf' ||
        /\.pdf$/i.test(attachment.path);

    // If downloadUrl is provided, use it. Otherwise, try to construct one or use the path.
    // In this context, the parent component is expected to pass the full view/download URL.
    const fileUrl = downloadUrl || attachment.url || attachment.path;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 truncate max-w-xl">
                        {attachment.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={fileUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-primary-600"
                            title="Download"
                        >
                            <Download className="w-5 h-5"/>
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
                    {isImage ? (
                        <img
                            src={fileUrl}
                            alt={attachment.name}
                            className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                        />
                    ) : isPdf ? (
                        <iframe
                            src={fileUrl}
                            title={attachment.name}
                            className="w-full h-full rounded-lg shadow-lg bg-white"
                        />
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-500 mb-4">This file type cannot be previewed.</p>
                            <a
                                href={fileUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                            >
                                <Download className="w-5 h-5"/>
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttachmentPreviewModal;
