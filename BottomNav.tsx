
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, User, MessageCircle, Trophy, Heart, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGame } from '@/context/GameContext';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export function BottomNav() {
  const pathname = usePathname();
  const { user, isAnonymous } = useGame();
  const db = useFirestore();

  const requestsQuery = useMemoFirebase(() => {
    if (!db || !user.id || isAnonymous) return null;
    return query(
      collection(db, 'friendRequests'), 
      where('toUid', '==', user.id), 
      where('status', '==', 'pending')
    );
  }, [db, user.id, isAnonymous]);

  const chatsQuery = useMemoFirebase(() => {
    if (!db || !user.id || isAnonymous) return null;
    return query(
      collection(db, 'chats'), 
      where('participants', 'array-contains', user.id)
    );
  }, [db, user.id, isAnonymous]);

  const { data: incomingRequests } = useCollection(requestsQuery);
  const { data: chats } = useCollection(chatsQuery);

  const unreadMessagesCount = useMemo(() => {
    if (!chats || !user.id) return 0;
    return chats.filter(chat => {
      const lastRead = chat.lastRead?.[user.id];
      const updatedAt = chat.updatedAt?.seconds || 0;
      const lastReadSeconds = lastRead?.seconds || 0;
      return chat.lastSenderId !== user.id && updatedAt > lastReadSeconds;
    }).length;
  }, [chats, user.id]);

  const links = [
    { href: '/', icon: Heart, label: 'Kalbim' },
    { href: '/games', icon: Gamepad2, label: 'Oyunlar' },
    { href: '/leaderboard', icon: Trophy, label: 'Sıralama' },
    { href: '/social', icon: Users, label: 'Sosyal', badge: incomingRequests?.length || 0 },
    { href: '/messages', icon: MessageCircle, label: 'Mesajlar', badge: unreadMessagesCount },
    { href: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-primary/10 px-4 py-2">
      <div className="flex items-center justify-between">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300 relative",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-colors",
                isActive ? "bg-primary/10" : "bg-transparent"
              )}>
                <Icon className={cn("h-5 w-5", isActive ? "fill-primary/10" : "")} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">{link.label}</span>
              
              {link.badge > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[8px] font-black text-white border-2 border-background">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
