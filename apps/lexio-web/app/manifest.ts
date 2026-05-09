/**
 * Web App Manifest — Next.js MetadataRoute API.
 * Brand colors per design guidelines §12.4:
 *   theme_color: #4F46E5 (Indigo 600 / --primary)
 *   background_color: #09090B (Zinc 950 / dark --background)
 */
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lexio',
    short_name: 'Lexio',
    description: 'Master vocabulary, the smart way',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#09090B',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    categories: ['education', 'productivity'],
    lang: 'en',
  };
}
