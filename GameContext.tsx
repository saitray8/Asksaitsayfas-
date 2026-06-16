
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp, collection, getDocs, writeBatch } from 'firebase/firestore';
import { signInAnonymously, signOut, deleteUser } from 'firebase/auth';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: any;
}

interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  birthDate?: string;
  gender?: string;
  showGender: boolean;
  showAge: boolean;
  showOnlineStatus: boolean;
  tokens: number;
  totalEarned: number;
  level: number;
  lastActive?: any;
  achievements?: Achievement[];
  createdAt?: any;
  updatedAt?: any;
  receivedBonus?: boolean;
  partnerUid?: string;
}

interface GameContextType {
  user: UserProfile;
  isLoading: boolean;
  isAnonymous: boolean;
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean;
  addExp: (amount: number) => void;
  updateProfile: (username: string, avatar: string, bio: string, birthDate?: string, gender?: string, showAge?: boolean, showGender?: boolean, showOnlineStatus?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  cleanupStaleUsernames: () => Promise<void>;
  systemReset: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  id: '',
  username: 'Misafir',
  avatar: 'https://picsum.photos/seed/avatar/100/100',
  bio: 'Oyun Diyarı\'na hoş geldiniz!',
  showAge: true,
  showGender: true,
  showOnlineStatus: true,
  tokens: 0,
  totalEarned: 0,
  level: 1,
  achievements: [],
  receivedBonus: false,
};

const STARTER_USER_TEMPLATE: UserProfile = {
  ...DEFAULT_USER,
  tokens: 100,
  totalEarned: 100,
  receivedBonus: false,
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (userDocRef && profileData && profileData.receivedBonus === false) {
      updateDocumentNonBlocking(userDocRef, {
        tokens: (profileData.tokens || 0) + 1000,
        totalEarned: (profileData.totalEarned || 0) + 1000,
        receivedBonus: true,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Hoş Geldin Hediyesi!", description: "Hesabına 1000 başlangıç jetonu eklendi." });
    }
  }, [userDocRef, profileData, toast]);

  useEffect(() => {
    if (!userDocRef || isAuthLoading || !authUser) return;
    setDocumentNonBlocking(userDocRef, { lastActive: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && userDocRef) {
        setDocumentNonBlocking(userDocRef, { lastActive: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [userDocRef, isAuthLoading, authUser]);

  useEffect(() => {
    const createInitialProfile = async () => {
      if (!isProfileLoading && authUser && !profileData && userDocRef && db) {
        const initialUsername = `oyuncu_${authUser.uid.substring(0, 5)}`.toLowerCase();
        const nameRef = doc(db, 'usernames', initialUsername);
        const nameDoc = await getDoc(nameRef);
        if (!nameDoc.exists()) {
          await setDoc(nameRef, { uid: authUser.uid });
        }
        const newUser: UserProfile = {
          ...STARTER_USER_TEMPLATE,
          id: authUser.uid,
          username: initialUsername,
          gender: 'belirtmek_istemiyorum',
          showGender: true,
          receivedBonus: false,
          lastActive: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newUser, { merge: true });
      }
    };
    createInitialProfile();
  }, [isProfileLoading, authUser, profileData, userDocRef, db]);

  const user = useMemo(() => {
    if (!profileData) return DEFAULT_USER;
    return { ...DEFAULT_USER, ...profileData };
  }, [profileData]);

  const addTokens = (amount: number) => {
    if (!userDocRef) return;
    const newTotal = user.totalEarned + amount;
    const newLevel = Math.floor(newTotal / 100) + 1;
    const updates: any = { tokens: user.tokens + amount, totalEarned: newTotal, updatedAt: serverTimestamp() };
    if (newLevel > user.level) {
      updates.level = newLevel;
      toast({ title: "Seviye Atladınız!", description: `Artık ${newLevel}. seviyesiniz!` });
    }
    updateDocumentNonBlocking(userDocRef, updates);
  };

  const spendTokens = (amount: number): boolean => {
    if (!userDocRef || user.tokens < amount) {
      toast({ variant: "destructive", title: "Yetersiz Jeton", description: "Bu işlem için yeterli jetonunuz yok." });
      return false;
    }
    updateDocumentNonBlocking(userDocRef, { tokens: user.tokens - amount, updatedAt: serverTimestamp() });
    return true;
  };

  const loginAsGuest = async () => {
    if (!auth) return;
    try {
      await signInAnonymously(auth);
      toast({ title: "Misafir Girişi", description: "Hoş geldiniz!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Hata", description: "Misafir girişi yapılamadı." });
    }
  };

  const updateProfile = async (username: string, avatar: string, bio: string, birthDate?: string, gender?: string, showAge?: boolean, showGender?: boolean, showOnlineStatus?: boolean): Promise<boolean> => {
    if (!userDocRef || !db || !authUser) return false;
    const normalizedNewName = username.trim().toLowerCase();
    const normalizedOldName = user.username?.trim().toLowerCase();

    if (normalizedNewName !== normalizedOldName) {
      const nameRef = doc(db, 'usernames', normalizedNewName);
      const nameDoc = await getDoc(nameRef);
      if (nameDoc.exists()) {
        toast({ variant: "destructive", title: "Hata", description: "Bu kullanıcı adı zaten alınmış." });
        return false;
      }
      await setDoc(nameRef, { uid: authUser.uid });
      if (normalizedOldName) {
        await deleteDoc(doc(db, 'usernames', normalizedOldName));
      }
    }

    updateDocumentNonBlocking(userDocRef, {
      username: normalizedNewName, 
      avatar, 
      bio,
      birthDate: birthDate || '',
      gender: gender || user.gender || 'belirtmek_istemiyorum',
      showAge: showAge !== undefined ? showAge : user.showAge,
      showGender: showGender !== undefined ? showGender : user.showGender,
      showOnlineStatus: showOnlineStatus !== undefined ? showOnlineStatus : user.showOnlineStatus,
      updatedAt: serverTimestamp()
    });
    return true;
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const deleteAccount = async () => {
    if (!auth || !authUser || !db) return;
    const confirmed = confirm("Hesabınızı sildiğinizde tüm anılarınız, jetonlarınız ve kullanıcı adınız kalıcı olarak silinir. Emin misiniz?");
    if (!confirmed) return;

    try {
      if (user.username) {
        const normalizedUsername = user.username.trim().toLowerCase();
        await deleteDoc(doc(db, 'usernames', normalizedUsername));
      }
      await deleteDoc(doc(db, 'users', authUser.uid));
      await deleteUser(authUser);
      toast({ title: "Hesap Silindi", description: "İsminiz ve verileriniz temizlendi." });
      router.push('/login');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast({ variant: "destructive", title: "Güvenlik", description: "Bu işlem için tekrar giriş yapmalısınız." });
      } else {
        toast({ variant: "destructive", title: "Hata", description: "Hesap silinemedi." });
      }
    }
  };

  const cleanupStaleUsernames = async () => {
    if (!db) return;
    try {
      toast({ title: "Temizlik Başladı", description: "Sahipsiz kullanıcı adları aranıyor..." });
      const usernamesSnap = await getDocs(collection(db, 'usernames'));
      let deletedCount = 0;
      for (const nameDoc of usernamesSnap.docs) {
        const uid = nameDoc.data().uid;
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (!userSnap.exists()) {
          await deleteDoc(nameDoc.ref);
          deletedCount++;
        }
      }
      toast({ title: "Temizlik Bitti", description: `${deletedCount} adet sahipsiz isim temizlendi.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Hata", description: "Temizlik yapılamadı." });
    }
  };

  const systemReset = async () => {
    if (!db) return;
    const confirmed = confirm("DİKKAT: Sistemdeki TÜM kullanıcı adlarını ve kullanıcı profillerini (Sait ve Helen dahil) sileceksiniz. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?");
    if (!confirmed) return;

    try {
      toast({ title: "Sıfırlama Başladı", description: "Tüm veritabanı temizleniyor..." });
      
      const usernamesSnap = await getDocs(collection(db, 'usernames'));
      const usersSnap = await getDocs(collection(db, 'users'));
      
      const batch = writeBatch(db);
      usernamesSnap.docs.forEach(d => batch.delete(d.ref));
      usersSnap.docs.forEach(d => batch.delete(d.ref));
      
      await batch.commit();
      
      toast({ title: "Sıfırlama Tamamlandı", description: "Veritabanı tamamen temizlendi. İsimler boşa çıktı." });
      await logout();
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Hata", description: "Sıfırlama sırasında bir sorun oluştu." });
    }
  };

  return (
    <GameContext.Provider value={{ 
      user, isLoading: isAuthLoading || isProfileLoading, isAnonymous: !!authUser?.isAnonymous,
      addTokens, spendTokens, addExp: (amount) => addTokens(Math.floor(amount/2)), updateProfile, logout, deleteAccount, loginAsGuest,
      cleanupStaleUsernames, systemReset
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
