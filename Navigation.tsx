
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Coins, Gamepad2, Trophy, LogOut, Users, MessageCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function Navigation() {
  const { user, isAnonymous, logout } = useGame();
  const db = useFirestore();
  const pathname = usePathname();

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

  const NavLinks = () => (
    <>
      <Button variant="ghost" asChild size="sm" className={cn("font-bold gap-2", pathname === '/' && "bg-primary/10 text-primary")}>
        <Link href="/">
          <Heart className="h-4 w-4" /> <span className="hidden lg:inline">Kalbim</span>
        </Link>
      </Button>
      <Button variant="ghost" asChild size="sm" className={cn("font-bold gap-2", pathname === '/games' && "bg-primary/10 text-primary")}>
        <Link href="/games">
          <Gamepad2 className="h-4 w-4" /> <span className="hidden lg:inline">Oyunlar</span>
        </Link>
      </Button>
      <Button variant="ghost" asChild size="sm" className={cn("font-bold gap-2", pathname === '/leaderboard' && "bg-primary/10 text-primary")}>
        <Link href="/leaderboard">
          <Trophy className="h-4 w-4" /> <span className="hidden lg:inline">Sıralama</span>
        </Link>
      </Button>
      <Button variant="ghost" asChild size="sm" className={cn("font-bold gap-2 relative", pathname === '/social' && "bg-primary/10 text-primary")}>
        <Link href="/social">
          <Users className="h-4 w-4" /> 
          <span className="hidden lg:inline">Sosyal</span>
          {incomingRequests && incomingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-black text-white border-2 border-background">
              {incomingRequests.length}
            </span>
          )}
        </Link>
      </Button>
      <Button variant="ghost" asChild size="sm" className={cn("font-bold gap-2 relative", pathname === '/messages' && "bg-primary/10 text-primary")}>
        <Link href="/messages">
          <MessageCircle className="h-4 w-4" /> 
          <span className="hidden lg:inline">Mesajlar</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-black text-white border-2 border-background">
              {unreadMessagesCount}
            </span>
          )}
        </Link>
      </Button>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <Gamepad2 className="text-white h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-base sm:text-xl font-bold tracking-tight text-primary font-headline">
              {pathname === '/' ? 'Kalbimin Müzesi' : 'Oyun Diyarı'}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden md:flex items-center gap-1 mr-4">
            <NavLinks />
          </nav>

          <TooltipProvider>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 bg-secondary px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-primary/20 cursor-help">
                    <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-primary fill-primary/20" />
                    <span className="text-xs sm:text-sm font-bold text-primary">{user.tokens}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Mevcut Bakiyeniz</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <div className="flex items-center gap-1 sm:gap-2">
            {isAnonymous ? (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild className="font-black h-8 sm:h-9 px-2 sm:px-4 text-[10px] sm:text-xs">
                  <Link href="/login">GİRİŞ</Link>
                </Button>
                <Button variant="default" size="sm" asChild className="font-black h-8 sm:h-9 px-2 sm:px-4 text-[10px] sm:text-xs shadow-lg shadow-primary/20">
                  <Link href="/register">KAYDOL</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/profile">
                  <div className="flex items-center gap-2 hover:bg-muted p-1 pr-1 sm:pr-3 rounded-full transition-colors border border-transparent hover:border-muted-foreground/20">
                    <Avatar className="h-8 w-8 border border-primary">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username ? user.username[0] : '?'}</AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-bold leading-none">{user.username}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Sv. {user.level}</p>
                    </div>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive h-8 w-8 sm:h-10 sm:w-10">
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
