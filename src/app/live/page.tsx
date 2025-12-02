'use client';

import { useEffect, useState } from 'react';

interface StreamData {
    id: string;
    displayName: string;
    channelName: string;
    isLive: boolean;
    videoId: string | null;
    title: string | null;
    matchScore: number;
}

interface LiveData {
    lastUpdated: string;
    streams: StreamData[];
}

export default function LivePage() {
    const [data, setData] = useState<LiveData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStreamId, setSelectedStreamId] = useState<string>('');

    useEffect(() => {
        fetch('/live_data.json')
            .then((res) => res.json())
            .then((data: LiveData) => {
                setData(data);
                // 默认选择第一个在线的直播源
                const firstLive = data.streams.find(s => s.isLive);
                if (firstLive) {
                    setSelectedStreamId(firstLive.id);
                } else if (data.streams.length > 0) {
                    setSelectedStreamId(data.streams[0].id);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch live data', err);
                setLoading(false);
            });
    }, []);

    const selectedStream = data?.streams.find(s => s.id === selectedStreamId);
    const liveStreams = data?.streams.filter(s => s.isLive) || [];
    const offlineStreams = data?.streams.filter(s => !s.isLive) || [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">实时直播</h1>

            {loading && <p className="text-center">加载中...</p>}

            {!loading && data && (
                <div className="flex flex-col items-center">
                    {/* 直播源选择器 */}
                    <div className="w-full max-w-4xl mb-4">
                        <label htmlFor="stream-select" className="block text-sm font-medium mb-2">
                            选择直播源：
                        </label>
                        <select
                            id="stream-select"
                            value={selectedStreamId}
                            onChange={(e) => setSelectedStreamId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {liveStreams.length > 0 && (
                                <optgroup label="🟢 正在直播">
                                    {liveStreams.map((stream) => (
                                        <option key={stream.id} value={stream.id}>
                                            {stream.displayName}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {offlineStreams.length > 0 && (
                                <optgroup label="🔴 暂无直播">
                                    {offlineStreams.map((stream) => (
                                        <option key={stream.id} value={stream.id}>
                                            {stream.displayName}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>

                    {/* 视频播放器 */}
                    {selectedStream && (
                        <div className="w-full max-w-4xl">
                            {selectedStream.isLive && selectedStream.videoId ? (
                                <div>
                                    <div className="aspect-video">
                                        <iframe
                                            className="w-full h-full rounded-lg shadow-lg"
                                            src={`https://www.youtube.com/embed/${selectedStream.videoId}?autoplay=1`}
                                            title={selectedStream.title || selectedStream.displayName}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                    <div className="mt-4">
                                        <h2 className="text-xl font-semibold">{selectedStream.displayName}</h2>
                                        <p className="text-gray-600 text-sm mt-1">{selectedStream.title}</p>
                                        <p className="text-gray-400 text-xs mt-2">
                                            频道: {selectedStream.channelName} | 最后更新: {new Date(data.lastUpdated).toLocaleString('zh-CN')}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-100 rounded-lg">
                                    <p className="text-xl text-gray-600">
                                        {selectedStream.displayName} 当前没有正在进行的直播
                                    </p>
                                    <p className="text-gray-500 mt-2">请稍后再来看看或选择其他直播源！</p>
                                    <p className="text-gray-400 text-xs mt-4">
                                        最后检查: {new Date(data.lastUpdated).toLocaleString('zh-CN')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 状态摘要 */}
                    <div className="w-full max-w-4xl mt-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">直播源状态</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                {data.streams.map((stream) => (
                                    <div key={stream.id} className="flex items-center gap-2">
                                        <span className={stream.isLive ? "text-green-500" : "text-red-500"}>
                                            {stream.isLive ? "🟢" : "🔴"}
                                        </span>
                                        <span className="text-gray-600">{stream.displayName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
