import type { Metadata, Viewport } from "next";
// Local font hosting via fontsource - better performance for CN users
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/500.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/noto-serif-sc/900.css";
import "@fontsource/noto-sans-tc/400.css";
import "@fontsource/noto-sans-tc/500.css";
import "@fontsource/noto-sans-tc/700.css";
import "@fontsource/noto-serif-tc/400.css";
import "@fontsource/noto-serif-tc/500.css";
import "@fontsource/noto-serif-tc/700.css";
import "@fontsource/noto-serif-tc/900.css";
import "./globals.css";
import { Providers } from "../components/Providers";

export const metadata: Metadata = {
  title: "从日本看中国 | China News From Japan",
  description: "汇集日本媒体关于中国的最新报道，实时更新100条日媒中国新闻",
  manifest: "/manifest.json",

  // Open Graph - for social sharing
  openGraph: {
    title: "从日本看中国",
    description: "汇集日本媒体关于中国的最新报道，实时更新",
    url: "https://cn.saaaai.com",
    siteName: "从日本看中国",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "从日本看中国",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary",
    title: "从日本看中国",
    description: "汇集日本媒体关于中国的最新报道，实时更新",
    images: ["/icon-512.png"],
  },

  // ✅ iOS 桌面标题配置
  appleWebApp: {
    capable: true,
    title: "从日本看中国 | China News From Japan",
    statusBarStyle: "black-translucent",
  },

  // ✅ iOS 图标配置
  icons: {
    icon: "/logo-192.png",
    shortcut: "/logo.png",
    apple: [
      { url: "/logo-192.png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050608",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
    >
      <head>
        {/* Umami Analytics - Privacy-friendly analytics */}
        {/* Replace YOUR_WEBSITE_ID with your actual Umami website ID */}
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="8690c5cf-acc5-4f08-8246-4dc3bf55e366"
        />
      </head>
      <body className="antialiased bg-background text-main">
        <Providers>
          {children}
        </Providers>
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('SW registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}