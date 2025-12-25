"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { NewsItem } from "@/components/NewsCard";

const R2_PUBLIC_URL = "https://r2.cn.saaaai.com";

interface UseNewsDataOptions {
    pollingInterval?: number; // milliseconds, default 5 minutes
}

export function useNewsData(options: UseNewsDataOptions = {}) {
    const { pollingInterval = 5 * 60 * 1000 } = options;

    // Raw data from data.json
    const [rawNewsData, setRawNewsData] = useState<NewsItem[]>([]);
    // All news data (merged with archive)
    const [allNewsData, setAllNewsData] = useState<NewsItem[]>([]);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
    const [lastUpdated, setLastUpdated] = useState("");

    // Archive
    const [archiveData, setArchiveData] = useState<Record<string, NewsItem[]>>({});
    const [archiveIndex, setArchiveIndex] = useState<Record<string, number>>({});

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSearchingAll, setIsSearchingAll] = useState(false);

    // New content notification
    const [newContentCount, setNewContentCount] = useState(0);
    const [pendingNewsData, setPendingNewsData] = useState<NewsItem[] | null>(null);
    const [pendingLastUpdated, setPendingLastUpdated] = useState("");

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load all archive data and merge with raw data
    const loadAllArchiveData = useCallback(async (
        indexData: Record<string, number>,
        currentRawData: NewsItem[]
    ) => {
        if (Object.keys(indexData).length === 0 || isHistoryLoaded) return;

        setIsSearchingAll(true);
        try {
            const allDates = Object.keys(indexData).sort().reverse();
            const allItems: NewsItem[] = [];
            const seenLinks = new Set<string>();

            // Add current raw data first
            currentRawData.forEach(item => {
                seenLinks.add(item.link);
                allItems.push(item);
            });

            // Load all archives in parallel
            const promises = allDates.map(async (dateStr) => {
                try {
                    const archiveUrl = `${R2_PUBLIC_URL}/archive/${dateStr}.json`;
                    const r = await fetch(archiveUrl);
                    if (r.ok) return await r.json();
                } catch (e) {
                    console.error(`Failed to load archive ${dateStr}`, e);
                }
                return [];
            });

            const results = await Promise.all(promises);

            // Merge archive data
            results.forEach((items: NewsItem[]) => {
                items.forEach(item => {
                    if (!seenLinks.has(item.link)) {
                        seenLinks.add(item.link);
                        allItems.push(item);
                    }
                });
            });

            // Sort by timestamp
            allItems.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            setAllNewsData(allItems);
            setIsHistoryLoaded(true);
            console.log(`📚 Loaded ${allItems.length} news items (history + latest)`);
        } catch (e) {
            console.error("Failed to load full history", e);
        } finally {
            setIsSearchingAll(false);
        }
    }, [isHistoryLoaded]);

    // Fetch main data
    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        let capturedRawData: NewsItem[] = [];

        try {
            // Fetch latest data.json
            const dataUrl = `${R2_PUBLIC_URL}/data.json?t=${Date.now()}`;
            let data;
            try {
                const r = await fetch(dataUrl);
                if (!r.ok) throw new Error("Network response was not ok");
                data = await r.json();
            } catch (e) {
                console.warn("Primary data fetch failed, trying local fallback...", e);
                const rFallback = await fetch(`/data.json?t=${Date.now()}`);
                data = await rFallback.json();
            }

            if (data && data.news) {
                setRawNewsData(data.news);
                capturedRawData = data.news;
                setLastUpdated(data.last_updated || "");
                setNewContentCount(0);
                setPendingNewsData(null);
                setPendingLastUpdated("");
            } else if (Array.isArray(data)) {
                setRawNewsData(data);
                capturedRawData = data;
            }

            // Fetch archive index
            try {
                const indexUrl = `${R2_PUBLIC_URL}/archive/index.json?t=${Date.now()}`;
                let indexData;
                try {
                    const rIndex = await fetch(indexUrl);
                    if (!rIndex.ok) throw new Error("Network response was not ok");
                    indexData = await rIndex.json();
                } catch (e) {
                    console.warn("Primary index fetch failed, trying local fallback...", e);
                    const rIndexFallback = await fetch(`/archive/index.json?t=${Date.now()}`);
                    if (rIndexFallback.ok) {
                        indexData = await rIndexFallback.json();
                    }
                }

                if (indexData) {
                    setArchiveIndex(indexData);
                    loadAllArchiveData(indexData, capturedRawData);
                }
            } catch (e) {
                console.error("Failed to fetch archive index", e);
            }
        } catch (e) {
            console.error("Fetch error", e);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [loadAllArchiveData]);

    // Check for new content (polling)
    const checkForNewContent = useCallback(async () => {
        try {
            const dataUrl = `${R2_PUBLIC_URL}/data.json?t=${Date.now()}`;
            const r = await fetch(dataUrl);
            const data = await r.json();

            if (data && data.news && data.last_updated !== lastUpdated) {
                const currentLinks = new Set(rawNewsData.map(item => item.link));
                const newItems = data.news.filter((item: NewsItem) => !currentLinks.has(item.link));

                if (newItems.length > 0) {
                    setNewContentCount(newItems.length);
                    setPendingNewsData(data.news);
                    setPendingLastUpdated(data.last_updated || "");
                }
            }
        } catch (e) {
            console.error("Check for new content failed", e);
        }
    }, [lastUpdated, rawNewsData]);

    // Load new content from pending
    const loadNewContent = useCallback(() => {
        if (pendingNewsData) {
            setRawNewsData(pendingNewsData);
            setLastUpdated(pendingLastUpdated);
            setNewContentCount(0);
            setPendingNewsData(null);
            setPendingLastUpdated("");
            window.scrollTo({ top: 0, behavior: "smooth" });

            // Merge with allNewsData if history is loaded
            if (isHistoryLoaded) {
                setAllNewsData(prev => {
                    const next = [...prev];
                    const seen = new Set(next.map(n => n.link));
                    pendingNewsData.forEach(item => {
                        if (!seen.has(item.link)) next.unshift(item);
                    });
                    return next.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                });
            }
        }
    }, [pendingNewsData, pendingLastUpdated, isHistoryLoaded]);

    // Refresh data
    const refresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchData(false);
        setIsRefreshing(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [fetchData]);

    // Load specific archive date
    const loadArchiveDate = useCallback(async (dateStr: string) => {
        if (archiveData[dateStr]) return archiveData[dateStr];

        try {
            const archiveUrl = `${R2_PUBLIC_URL}/archive/${dateStr}.json`;
            const r = await fetch(archiveUrl);
            if (r.ok) {
                const items = await r.json();
                setArchiveData(prev => ({ ...prev, [dateStr]: items }));
                return items;
            }
        } catch (e) {
            console.error(`Failed to load archive for ${dateStr}`, e);
        }
        return [];
    }, [archiveData]);

    // Initial fetch and polling setup
    useEffect(() => {
        fetchData();
        pollingIntervalRef.current = setInterval(checkForNewContent, pollingInterval);

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, []);

    // Update polling when dependencies change
    useEffect(() => {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = setInterval(checkForNewContent, pollingInterval);
        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [checkForNewContent, pollingInterval]);

    // Build archive data from raw news
    useEffect(() => {
        const newData: Record<string, NewsItem[]> = {};
        rawNewsData.forEach(item => {
            if (item.timestamp) {
                const d = new Date(item.timestamp * 1000);
                if (!isNaN(d.getTime())) {
                    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                    if (!newData[dateStr]) newData[dateStr] = [];
                    newData[dateStr].push(item);
                }
            }
        });
        setArchiveData(prev => ({ ...prev, ...newData }));
    }, [rawNewsData]);

    // Data source: use full history if loaded, otherwise raw data
    const dataSource = isHistoryLoaded && allNewsData.length > 0 ? allNewsData : rawNewsData;

    return {
        // Data
        dataSource,
        rawNewsData,
        allNewsData,
        archiveData,
        archiveIndex,
        lastUpdated,

        // Loading states
        isLoading,
        isRefreshing,
        isSearchingAll,
        isHistoryLoaded,

        // New content
        newContentCount,
        hasNewContent: newContentCount > 0,
        loadNewContent,

        // Actions
        refresh,
        fetchData,
        loadArchiveDate,
    };
}
