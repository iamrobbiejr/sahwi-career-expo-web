import React, {useRef} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {ticketsService} from '../services/api';
import {formatImageUrl} from '../utils/format';
import {
    Loader2,
    Download,
    ChevronLeft,
    Calendar,
    MapPin,
    User,
    Ticket as TicketIcon,
    Printer,
    Mail,
    Share2
} from 'lucide-react';
import {toast} from 'react-hot-toast';

const TicketDetailsPage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const ticketRef = useRef();

    const {data, isLoading, isError} = useQuery({
        queryKey: ['ticket', id],
        queryFn: () => ticketsService.getById(id),
    });

    const ticket = data?.data;

    // Handle both registration-rooted and ticket-rooted data structures
    const event = ticket?.ticket?.registration?.event;
    const attendee = ticket?.ticket?.registration;
    const ticketData = ticket?.ticket || ticket;

    const handleDownload = () => {
        if (ticketData?.pdf_path) {
            const url = formatImageUrl(ticketData.pdf_path);
            window.open(url, '_blank');
        } else {
            toast.error('Ticket PDF not available');
        }
    };

    const handlePrint = () => {
        if (ticketData?.pdf_path) {
            const url = formatImageUrl(ticketData.pdf_path);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);

            iframe.onload = () => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                }
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            };
        } else {
            toast.error('Ticket PDF not available');
        }
    };

    const handleResend = async () => {
        try {
            await ticketsService.resend(id);
            toast.success('Ticket has been resent to your email');
        } catch (err) {
            toast.error('Failed to resend ticket');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin"/>
            </div>
        );
    }

    if (isError || !ticket) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Ticket not found</h2>
                <button
                    onClick={() => navigate('/my-registrations')}
                    className="mt-6 inline-flex items-center text-primary-600 font-semibold"
                >
                    <ChevronLeft className="w-5 h-5 mr-1"/>
                    Back to My Registrations
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-1"/>
                    Back
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-600"
                        title="Download PDF"
                    >
                        <Download className="w-5 h-5"/>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-600"
                        title="Print Ticket"
                    >
                        <Printer className="w-5 h-5"/>
                    </button>
                    <button
                        onClick={handleResend}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-600"
                        title="Resend to Email"
                    >
                        <Mail className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            <div
                className="bg-white rounded-[2rem] shadow-xl shadow-gray-100 overflow-hidden border border-gray-100 print:shadow-none print:border-none">
                {/* Ticket Header */}
                <div className="bg-primary-600 px-8 py-10 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 opacity-80">
                            <TicketIcon className="w-5 h-5"/>
                            <span className="text-xs font-bold uppercase tracking-widest">Official Event Ticket</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2">{event?.name}</h1>
                        <p className="text-primary-100 font-medium">Ticket ID: {ticketData?.ticket_number}</p>
                    </div>

                    {/* Decorative circles */}
                    <div
                        className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
                    <div
                        className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2"/>
                </div>

                {/* Ticket Body */}
                <div className="p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Attendee
                                    Information</h3>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-400"/>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">{attendee?.attendee_name}</p>
                                        <p className="text-sm text-gray-500">{attendee?.attendee_email}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Date</h3>
                                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                                        <Calendar className="w-4 h-4 text-primary-500"/>
                                        <span>{event && new Date(event.start_date).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Time</h3>
                                    <p className="text-gray-900 font-bold">
                                        {event && new Date(event.start_date).toLocaleTimeString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Location</h3>
                                <div className="flex items-start gap-2 text-gray-900 font-bold">
                                    <MapPin className="w-4 h-4 text-primary-500 mt-1 shrink-0"/>
                                    <span>{event?.venue}<br/><span
                                        className="text-sm font-medium text-gray-500">{event?.location}</span></span>
                                </div>
                            </section>
                        </div>

                        <div
                            className="flex flex-col items-center justify-center bg-gray-50 rounded-3xl p-8 border border-gray-100 border-dashed">
                            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                                {ticketData?.qr_code_path ? (
                                    <img src={formatImageUrl(ticketData.qr_code_path)} alt="QR Code"
                                         className="w-48 h-48"/>
                                ) : (
                                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-xl">
                                        <p className="text-xs text-gray-400 font-bold text-center px-4 uppercase">QR
                                            Code will appear here</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Scan at
                                Entrance</p>
                            <p className="text-sm font-black text-gray-900">{ticketData?.ticket_number}</p>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 border-dashed">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Important
                            Instructions</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                'Please arrive at least 30 minutes before the event starts.',
                                'Have this ticket ready (digital or printed) at the entrance.',
                                'Valid government-issued ID may be required for verification.',
                                'This ticket is non-transferable unless permitted by organizers.'
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0"/>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Ticket Footer */}
                <div className="bg-gray-50 px-8 py-6 flex items-center justify-between border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Generated by Sahwi
                        Career Expo</p>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"/>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Valid Ticket</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    Need help? <a href="#" className="text-primary-600 font-bold">Contact Support</a>
                </p>
            </div>
        </div>
    );
};

export default TicketDetailsPage;
