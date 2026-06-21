import { Inter, Montserrat } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata = {
  title: 'Дойч',
  description: 'Монгол хэлээр герман хэл сурах хөгжилтэй апп',
  manifest: '/manifest.json',
  themeColor: '#ffcc00',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Дойч',
  },
  icons: {
    icon: [
      { url: '/favicon.png',  sizes: 'any',     type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/icon-192.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body className={`${inter.variable} ${montserrat.variable}`}>
        {children}
      </body>
    </html>
  );
}
