"use client";
import React, { useState } from "react";
import { PiFinnTheHuman } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { FaHandsHelping, FaWhatsapp, FaShare } from "react-icons/fa";
import { FaTelegram } from "react-icons/fa";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface Props {
    projectId?: string;
}

const ContactVA = ({ projectId }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const VA_TELEGRAM = "taolinicholas"; 

    const handleTelegramClick = () => {
        const telegramUrl = `https://t.me/${VA_TELEGRAM}`;
        window.open(telegramUrl, '_blank');
        setIsOpen(false);
        toast.success("Opening Telegram...");
    };

    const handleShare = async () => {
        if (!projectId || !session?.user?.email) {
            toast.error("Cannot share project at this time");
            return;
        }

        try {
            const response = await fetch('/api/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId,
                    userId: session.user.email,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // 复制分享链接到剪贴板
                await navigator.clipboard.writeText(data.shareLink);
                toast.success("Share link copied to clipboard!");
            } else {
                throw new Error(data.error || "Failed to share project");
            }
        } catch (error: any) {
            console.error("Error sharing project:", error);
            toast.error(error.message || "Failed to share project");
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
                <FaHandsHelping />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                            <IoMdClose size={24} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-4">Contact Virtual Assistant</h2>
                        
                        <div className="space-y-4">
                            <button
                                onClick={handleTelegramClick}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <FaTelegram size={24} />
                                Contact via Telegram
                            </button>

                            {projectId && (
                                <button
                                    onClick={handleShare}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    <FaShare size={20} />
                                    Share Project
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ContactVA;