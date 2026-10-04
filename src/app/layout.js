import { Orbitron, Rajdhani } from 'next/font/google';

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
});

const rajdhani = Rajdhani({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
});

export const metadata = {
  title: 'Sarab Quest',
  description: 'Jeu Phygital / Chasse au Trésor',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'Sarab Quest',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
  icons: {
    icon: '/images/logo_games5-.png',
    apple: '/images/logo_games5-.png',
  },
};

export const viewport = {
  themeColor: '#00f0ff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
