import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '从日本看中国 - 日媒新闻聚合',
    short_name: '从日本看中国',
    description: '汇集日本媒体关于中国的最新报道，实时更新',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#B91C1C',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo.png', // ✅ 统统用 logo.png
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png', // ✅ 统统用 logo.png
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}