"use client";

import { useState, useEffect } from "react";
import { Waves, Mountain, ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react";
import { useTheme } from "../ThemeContext";

interface TsunamiData {
    id: string;
    time: string;
    cancelled: boolean;
    areas?: any[];
    issue: {
        time: string;
        type: string;
    };
}

export default function OtherDisasterView() {
    const { settings } = useTheme();
    const [tsunamiData, setTsunamiData] = useState<TsunamiData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTsunami() {
            try {
                const res = await fetch("https://api.p2pquake.net/v2/history?codes=552&limit=1");
                const json = await res.json();
                if (json.length > 0) {
                    setTsunamiData(json[0]);
                }
            } catch (error) {
                console.error("Failed to fetch tsunami info:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTsunami();
    }, []);

    const isTsunamiActive = () => {
        if (!tsunamiData) return false;
        // Simple logic: if latest message is not 'cancelled' and is recent (< 24h)
        const isRecent = (new Date().getTime() - new Date(tsunamiData.time).getTime()) < 24 * 60 * 60 * 1000;
        return !tsunamiData.cancelled && isRecent;
    };

    const active = isTsunamiActive();

    return (
        <div className="flex flex-col gap-4">

            {/* Tsunami Card */}
            <div className={`
        relative p-6 rounded-3xl border shadow-sm backdrop-blur-md overflow-hidden transition-all
        ${active
                    ? "bg-red-500 text-white border-red-400"
                    : "bg-blue-50/50 dark:bg-blue-900/10 border-white/50 dark:border-white/5"
                }
      `}>
                <div className="flex items-start gap-4 relative z-10">
                    <div className={`p-3 rounded-2xl ${active ? "bg-white/20" : "bg-blue-100 dark:bg-blue-800/30 text-blue-500"}`}>
                        <Waves className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-1 ${active ? "text-white" : "text-gray-800 dark:text-white"}`}>
                            {settings.lang === "sc" ? "海啸情报" : "海嘯情報"}
                        </h3>
                        {loading ? (
                            <p className="text-sm opacity-60">Loading...</p>
                        ) : active ? (
                            <div className="space-y-1">
                                <p className="font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {settings.lang === "sc" ? "当前有海啸警报/注意报" : "當前有海嘯警報/注意報"}
                                </p>
                                <p className="text-sm opacity-90">{tsunamiData?.time}</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p className={`text-sm font-medium flex items-center gap-2 ${active ? "" : "text-green-600 dark:text-green-400"}`}>
                                    <ShieldCheck className="w-4 h-4" />
                                    {settings.lang === "sc" ? "当前无海啸警报" : "當前無海嘯警報"}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 ml-6">
                                    {settings.lang === "sc" ? "最后更新: " : "最後更新: "}
                                    {tsunamiData?.time || "--"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Background Decoration */}
                <Waves className={`absolute -bottom-4 -right-4 w-32 h-32 opacity-10 ${active ? "text-white" : "text-blue-500"}`} />
            </div>

            {/* Volcano / Other Card */}
            <div className="relative p-6 rounded-3xl bg-orange-50/50 dark:bg-orange-900/10 border border-white/50 dark:border-white/5 shadow-sm backdrop-blur-md overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                    <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-800/30 text-orange-500">
                        <Mountain className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                            {settings.lang === "sc" ? "火山情报 & 其他" : "火山情報 & 其他"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            {settings.lang === "sc"
                                ? "请关注日本气象厅 (JMA) 发布的最新火山喷发预警及台风路径信息。"
                                : "請關注日本氣象廳 (JMA) 發布的最新火山噴發預警及颱風路徑信息。"
                            }
                        </p>

                        <a
                            href="https://www.jma.go.jp/jma/index.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                            {settings.lang === "sc" ? "访问 JMA 官网" : "訪問 JMA 官網"}
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>

                <Mountain className="absolute -bottom-2 -right-2 w-28 h-28 opacity-5 text-orange-500" />
            </div>

        </div>
    );
}
