"use client";

import { useState, useEffect, useCallback } from "react";
import { NewsItem } from "@/components/NewsCard";

const STORAGE_KEY = "favorites";

export function useFavorites() {
    const [favorites, setFavorites] = useState<NewsItem[]>([]);

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setFavorites(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load favorites", e);
        }
    }, []);

    // Save to localStorage whenever favorites change
    const saveFavorites = useCallback((newFavorites: NewsItem[]) => {
        setFavorites(newFavorites);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    }, []);

    // Toggle favorite status for an item
    const toggleFavorite = useCallback((e: React.MouseEvent, item: NewsItem) => {
        e.stopPropagation();
        setFavorites(prev => {
            const exists = prev.some(f => f.link === item.link);
            const newFavorites = exists
                ? prev.filter(f => f.link !== item.link)
                : [item, ...prev];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
            return newFavorites;
        });
    }, []);

    // Remove a specific item from favorites
    const removeFavorite = useCallback((item: NewsItem) => {
        setFavorites(prev => {
            const newFavorites = prev.filter(f => f.link !== item.link);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
            return newFavorites;
        });
    }, []);

    // Clear all favorites with confirmation
    const clearFavorites = useCallback(() => {
        if (confirm("确定要清空所有收藏吗？")) {
            setFavorites([]);
            localStorage.setItem(STORAGE_KEY, "[]");
        }
    }, []);

    // Check if an item is favorited
    const isFavorite = useCallback((item: NewsItem) => {
        return favorites.some(f => f.link === item.link);
    }, [favorites]);

    return {
        favorites,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
        isFavorite,
        favoritesCount: favorites.length,
    };
}
