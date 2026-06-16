
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { GameProvider } from '@/context/GameContext';
import { Navigation } from '@/components/Navigation';
import { BottomNav } from '@/components/BottomNav';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Oyun Diyarı - Eğlence ve Jetonlar',
  description: 'En sevdiğiniz mini oyunlar burada!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <FirebaseClientProvider>
          <GameProvider>
            <div className="flex flex-col min-h-screen pb-16 md:pb-0">
              <Navigation />
              <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
                {children}
              </main>
              <BottomNav />
            </div>
            <Toaster />
          </GameProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
