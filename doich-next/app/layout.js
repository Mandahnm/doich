import { Nunito, Lexend } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-lexend',
  display: 'swap',
});

export const metadata = {
  title: 'Дойч',
  description: 'Монгол хэлээр герман хэл сурах хөгжилтэй апп',
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body className={`${nunito.variable} ${lexend.variable}`}>
        {children}
      </body>
    </html>
  );
}
