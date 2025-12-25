"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
    const { settings } = useTheme();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed as PWA
        const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches
            || (window.navigator as any).standalone === true;
        setIsStandalone(isInStandaloneMode);

        if (isInStandaloneMode) return;

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Check if already dismissed within 7 days
        const lastDismissed = localStorage.getItem("pwa-prompt-dismissed");
        if (lastDismissed) {
            const daysSinceDismiss = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismiss < 7) return;
        }

        // For iOS, show prompt after a short delay
        if (isIOSDevice) {
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        // For Android/Desktop, listen for beforeinstallprompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show custom prompt after a short delay
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("PWA installed successfully");
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
    };

    // Don't render if already in standalone mode
    if (isStandalone) return null;

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-4 left-4 right-4 z-[200] max-w-[400px] mx-auto"
                >
                    <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-elevated border border-gray-100 dark:border-white/10 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 pt-4 pb-2 flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0">
                                <Download className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                                    {settings.lang === "sc" ? "安装本站 APP" : "安裝本站 APP"}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                                    {settings.lang === "sc"
                                        ? "添加到桌面，第一时间获取重大新闻推送"
                                        : "添加到桌面，第一時間獲取重大新聞推送"}
                                </p>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors shrink-0 -mt-1 -mr-1"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="px-4 pb-4 pt-2">
                            {isIOS ? (
                                // iOS Instructions
                                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-sm">
                                    <Share className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span className="text-blue-700 dark:text-blue-300">
                                        {settings.lang === "sc"
                                            ? "请点击底部分享按钮 → 添加到主屏幕"
                                            : "請點擊底部分享按鈕 → 添加到主屏幕"}
                                    </span>
                                </div>
                            ) : (
                                // Android/Desktop Install Button
                                <button
                                    onClick={handleInstallClick}
                                    disabled={!deferredPrompt}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    {settings.lang === "sc" ? "立即安装" : "立即安裝"}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
