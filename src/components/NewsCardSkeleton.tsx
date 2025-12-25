"use client";

export default function NewsCardSkeleton() {
    return (
        <div className="w-full bg-white dark:bg-white/[0.03] p-4 rounded-2xl shadow-card dark:shadow-none border border-transparent dark:border-white/5 overflow-hidden relative">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />

            {/* Top Row Skeleton */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {/* Category dot */}
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
                    {/* Category text */}
                    <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-1 bg-gray-100 dark:bg-gray-800 rounded" />
                    {/* Source */}
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-1 bg-gray-100 dark:bg-gray-800 rounded opacity-60" />
                    {/* Time */}
                    <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>

                {/* Star icon placeholder */}
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800" />
            </div>

            {/* Title Skeleton - Two lines */}
            <div className="space-y-2">
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
    );
}
