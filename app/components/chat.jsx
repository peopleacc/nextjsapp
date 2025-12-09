"use client";
import React, { useState } from "react";
import { ChatDotsFill, X, Person, Circle } from "react-bootstrap-icons";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    // Daftar pesan dari berbagai user
    const [messages] = useState([
        {
            id: 1,
            user: "Ahmad Rizki",
            avatar: null,
            message: "Saya ingin melakukan service AC",
            time: "10:30",
            unread: true,
        },
        {
            id: 2,
            user: "Siti Nurhayati",
            avatar: null,
            message: "Kapan teknisi bisa datang ke rumah?",
            time: "10:25",
            unread: true,
        },
        {
            id: 3,
            user: "Budi Santoso",
            avatar: null,
            message: "Pesanan saya sudah sampai mana ya?",
            time: "10:15",
            unread: false,
        },
        {
            id: 4,
            user: "Dewi Lestari",
            avatar: null,
            message: "Terima kasih, service sudah selesai",
            time: "09:45",
            unread: false,
        },
        {
            id: 5,
            user: "Eko Prasetyo",
            avatar: null,
            message: "Bisa minta estimasi harga untuk cuci sofa?",
            time: "09:30",
            unread: false,
        },
        {
            id: 6,
            user: "Fitri Handayani",
            avatar: null,
            message: "Saya mau reschedule jadwal service",
            time: "09:00",
            unread: false,
        },
    ]);

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
                        <div>
                            <h3 className="text-white font-semibold text-sm">Pesan Masuk</h3>
                            <p className="text-white/70 text-xs">
                                {unreadCount} pesan belum dibaca
                            </p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/70 hover:text-white transition-colors p-1"
                            aria-label="Tutup chat"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
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

                                {/* Message Content */}
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
                                    <p
                                        className={`text-sm truncate mt-0.5 ${msg.unread ? "text-gray-800" : "text-gray-500"
                                            }`}
                                    >
                                        {msg.message}
                                    </p>
                                </div>

                                {/* Unread Indicator */}
                                {msg.unread && (
                                    <Circle
                                        size={8}
                                        className="text-blue-500 fill-blue-500 flex-shrink-0 mt-2"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-gray-50 border-t border-gray-100">
                        <button className="w-full py-2.5 text-sm font-medium text-[#2D336B] bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors">
                            Lihat Semua Pesan
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
