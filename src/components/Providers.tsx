"use client";

import { ThemeProvider } from "./ThemeContext";
import ErrorBoundary from "./ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </ThemeProvider>
    );
}
