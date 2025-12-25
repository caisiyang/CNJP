"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { NewsItem } from "@/components/NewsCard";
import { CATEGORY_MAP } from "@/lib/constants";

interface UseSearchOptions {
    debounceMs?: number;
}

export function useSearch(
    dataSource: NewsItem[],
    options: UseSearchOptions = {}
) {
    const { debounceMs = 500 } = options;

    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentFilter, setCurrentFilter] = useState("all");
    const [sortMode, setSortMode] = useState<'publish' | 'fetch'>('publish');
    const [visibleCount, setVisibleCount] = useState(25);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle search input with debounce
    const handleSearchInput = useCallback((val: string) => {
        setSearchInput(val);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            setSearchQuery(val.trim());
            setVisibleCount(25);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, debounceMs);
    }, [debounceMs]);

    // Clear search
    const clearSearch = useCallback(() => {
        setSearchInput("");
        setSearchQuery("");
        setVisibleCount(25);
    }, []);

    // Handle suggestion click
    const handleSuggestionClick = useCallback((keyword: string) => {
        handleSearchInput(keyword);
        setShowSuggestions(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [handleSearchInput]);

    // Toggle sort mode
    const toggleSortMode = useCallback(() => {
        setSortMode(prev => prev === 'publish' ? 'fetch' : 'publish');
    }, []);

    // Change filter
    const handleFilterChange = useCallback((cat: string) => {
        setCurrentFilter(cat);
        setVisibleCount(25);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Load more items (for infinite scroll)
    const loadMore = useCallback(() => {
        setVisibleCount(prev => prev + 25);
    }, []);

    // Reset visible count
    const resetVisibleCount = useCallback(() => {
        setVisibleCount(25);
    }, []);

    // Sorted data
    const sortedData = useMemo(() => {
        return [...dataSource].sort((a, b) => {
            if (sortMode === 'fetch') {
                const fetchA = (a as any).fetched_at || a.timestamp || 0;
                const fetchB = (b as any).fetched_at || b.timestamp || 0;
                return fetchB - fetchA;
            }
            return (b.timestamp || 0) - (a.timestamp || 0);
        });
    }, [dataSource, sortMode]);

    // Filtered data
    const filteredData = useMemo(() => {
        let filtered = sortedData;

        // Category filter
        if (currentFilter !== "all") {
            filtered = filtered.filter(item => {
                const itemCategory = item.category || "其他";
                const itemCategoryKey = CATEGORY_MAP[itemCategory] || "other";
                return itemCategoryKey === currentFilter;
            });
        }

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
                const title = (item.title || "").toLowerCase();
                const titleTc = (item.title_tc || "").toLowerCase();
                const titleJa = (item.title_ja || "").toLowerCase();
                const origin = (item.origin || "").toLowerCase();
                return title.includes(q) || titleTc.includes(q) || titleJa.includes(q) || origin.includes(q);
            });
        }

        return filtered;
    }, [sortedData, currentFilter, searchQuery]);

    // Display items (limited by visibleCount)
    const displayItems = useMemo(() => {
        return filteredData.slice(0, visibleCount);
    }, [filteredData, visibleCount]);

    // Get category count
    const getCategoryCount = useCallback((category: string) => {
        return dataSource.filter(item => {
            const cat = item.category ? (CATEGORY_MAP[item.category] || item.category) : '';
            return cat === category;
        }).length;
    }, [dataSource]);

    // Has more items to load
    const hasMore = filteredData.length > visibleCount;

    return {
        // State
        searchInput,
        searchQuery,
        currentFilter,
        sortMode,
        visibleCount,
        showSuggestions,
        setShowSuggestions,

        // Data
        filteredData,
        displayItems,
        totalCount: filteredData.length,
        hasMore,

        // Actions
        handleSearchInput,
        clearSearch,
        handleSuggestionClick,
        toggleSortMode,
        handleFilterChange,
        loadMore,
        resetVisibleCount,
        getCategoryCount,
    };
}
