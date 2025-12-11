"use client";
import React, { useState, useEffect } from "react";
import { ChatDotsFill, X, Circle } from "react-bootstrap-icons";
import { supabase } from "@/lib/supabaseClient";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null); // For detail view

    // Fetch messages from Supabase
    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from("chat")
                .select(`
                    id,
                    subject,
                    user_id,
                    message,
                    created_at,
                    m_customers(nama)
                `)
                .order("created_at", { ascending: false });

            if (fetchError) {
                console.error("Error fetching chat:", fetchError);
                setError(fetchError.message);
                return;
            }

            // Transform data to match component structure
            const transformedMessages = (data || []).map((chat) => ({
                id: chat.id,
                user: chat.m_customers?.nama || `User #${chat.user_id}`,
                subject: chat.subject || "No Subject",
                message: chat.message || "",
                time: formatTime(chat.created_at),
                created_at: chat.created_at,
                unread: isUnread(chat.created_at), // Consider messages from last 30 minutes as unread
            }));

            setMessages(transformedMessages);
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("Terjadi kesalahan saat memuat pesan");
        } finally {
            setLoading(false);
        }
    };

    // Format timestamp to readable time
    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Check if message is "unread" (within last 30 minutes)
    const isUnread = (timestamp) => {
        if (!timestamp) return false;
        const messageTime = new Date(timestamp);
        const now = new Date();
        const diffMinutes = (now - messageTime) / (1000 * 60);
        return diffMinutes <= 30;
    };

    // Fetch on mount and set up refresh interval
    useEffect(() => {
        fetchMessages();

        // Refresh every 30 seconds
        const interval = setInterval(fetchMessages, 30000);

        return () => clearInterval(interval);
    }, []);

    const unreadCount = messages.filter((m) => m.unread).length;

    // Generate random color based on username
    const getAvatarColor = (name) => {
        const colors = [
            "from-pink-400 to-rose-500",
            "from-blue-400 to-indigo-500",
            "from-green-400 to-emerald-500",
            "from-yellow-400 to-orange-500",
            "from-purple-400 to-violet-500",
            "from-cyan-400 to-teal-500",
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${isOpen
                    ? "bg-red-500 hover:bg-red-600 rotate-90"
                    : "bg-gradient-to-br from-[#2D336B] to-[#4f5aa6] hover:from-[#3d4480] hover:to-[#5f6ab6]"
                    }`}
                aria-label={isOpen ? "Tutup chat" : "Buka chat"}
            >
                {isOpen ? (
                    <X size={24} className="text-white" />
                ) : (
                    <ChatDotsFill size={24} className="text-white" />
                )}
                {/* Unread Badge */}
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] transition-all duration-300 transform origin-bottom-right ${isOpen
                    ? "scale-100 opacity-100 translate-y-0"
                    : "scale-95 opacity-0 translate-y-4 pointer-events-none"
                    }`}
            >
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col h-[500px]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#2D336B] to-[#4f5aa6] px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Back button when viewing message detail */}
                            {selectedMessage && (
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="text-white/70 hover:text-white transition-colors p-1 -ml-1"
                                    aria-label="Kembali ke daftar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                                    </svg>
                                </button>
                            )}
                            <div>
                                <h3 className="text-white font-semibold text-sm">
                                    {selectedMessage ? "Detail Pesan" : "Pesan Masuk"}
                                </h3>
                                <p className="text-white/70 text-xs">
                                    {selectedMessage
                                        ? selectedMessage.user
                                        : loading
                                            ? "Memuat..."
                                            : `${unreadCount} pesan belum dibaca`
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Refresh Button - only show in list view */}
                            {!selectedMessage && (
                                <button
                                    onClick={fetchMessages}
                                    className="text-white/70 hover:text-white transition-colors p-1"
                                    aria-label="Refresh pesan"
                                    disabled={loading}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        className={`${loading ? "animate-spin" : ""}`}
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                                        <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setSelectedMessage(null);
                                }}
                                className="text-white/70 hover:text-white transition-colors p-1"
                                aria-label="Tutup chat"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        {/* === MESSAGE DETAIL VIEW === */}
                        {selectedMessage ? (
                            <div className="p-4 space-y-4">
                                {/* Subject */}
                                <div className="bg-gradient-to-r from-[#2D336B]/10 to-[#4f5aa6]/10 p-4 rounded-xl">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Subject</p>
                                    <h4 className="text-lg font-semibold text-[#2D336B]">{selectedMessage.subject}</h4>
                                </div>

                                {/* Sender & Time Info */}
                                <div className="flex items-center gap-3 px-1">
                                    <div
                                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                                            selectedMessage.user
                                        )} flex items-center justify-center flex-shrink-0`}
                                    >
                                        <span className="text-white text-xs font-semibold">
                                            {getInitials(selectedMessage.user)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{selectedMessage.user}</p>
                                        <p className="text-xs text-gray-500">
                                            {selectedMessage.created_at
                                                ? new Date(selectedMessage.created_at).toLocaleString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })
                                                : selectedMessage.time
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Pesan</p>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {selectedMessage.message || "Tidak ada isi pesan"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* === MESSAGE LIST VIEW === */
                            <>
                                {/* Loading State */}
                                {loading && messages.length === 0 && (
                                    <div className="flex items-center justify-center h-full py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D336B]"></div>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="p-4 text-center">
                                        <p className="text-red-500 text-sm mb-2">{error}</p>
                                        <button
                                            onClick={fetchMessages}
                                            className="text-sm text-[#2D336B] hover:underline"
                                        >
                                            Coba lagi
                                        </button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!loading && !error && messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                                        <ChatDotsFill size={40} className="mb-3 text-gray-300" />
                                        <p className="text-sm">Belum ada pesan masuk</p>
                                    </div>
                                )}

                                {/* Messages List - Shows SUBJECT only */}
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        onClick={() => setSelectedMessage(msg)}
                                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${msg.unread ? "bg-blue-50/50" : ""
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div
                                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                                                msg.user
                                            )} flex items-center justify-center flex-shrink-0`}
                                        >
                                            <span className="text-white text-xs font-semibold">
                                                {getInitials(msg.user)}
                                            </span>
                                        </div>

                                        {/* Message Preview - SUBJECT only */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={`text-sm truncate ${msg.unread
                                                        ? "font-semibold text-gray-900"
                                                        : "font-medium text-gray-700"
                                                        }`}
                                                >
                                                    {msg.user}
                                                </span>
                                                <span className="text-[10px] text-gray-400 flex-shrink-0">
                                                    {msg.time}
                                                </span>
                                            </div>
                                            {/* Show SUBJECT instead of message */}
                                            <p
                                                className={`text-sm truncate mt-0.5 ${msg.unread ? "text-gray-800" : "text-gray-500"
                                                    }`}
                                            >
                                                {msg.subject}
                                            </p>
                                        </div>

                                        {/* Unread Indicator & Arrow */}
                                        <div className="flex items-center gap-1 flex-shrink-0 mt-2">
                                            {msg.unread && (
                                                <Circle
                                                    size={8}
                                                    className="text-blue-500 fill-blue-500"
                                                />
                                            )}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="text-gray-400" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Footer - Only show in list view */}
                    {!selectedMessage && (
                        <div className="p-3 bg-gray-50 border-t border-gray-100">
                            <button className="w-full py-2.5 text-sm font-medium text-[#2D336B] bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors">
                                Lihat Semua Pesan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
