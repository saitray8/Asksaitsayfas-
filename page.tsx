"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useUser, useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  doc, 
  serverTimestamp, 
  orderBy, 
  limit, 
  getDoc,
  setDoc,
  Timestamp,
  writeBatch,
  limitToLast,
  arrayUnion,
  deleteField
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Heart, 
  Camera, 
  Calendar, 
  MessageCircle, 
  Plus, 
  Search, 
  Clock, 
  Sparkles, 
  Menu,
  X,
  Send,
  Loader2,
  Trash2,
  Stars,
  UserMinus,
  ImageIcon,
  Pencil,
  CheckCheck,
  Check,
  Settings,
  Smile,
  ListTodo,
  CheckCircle2,
  Circle,
  Target,
  Image as GalleryIcon,
  XCircle,
  MessageSquare,
  Lock,
  Download,
  DownloadCloud,
  Music,
  Ticket,
  Utensils,
  Film,
  MapPin,
  Palmtree,
  ChevronLeft,
  ChevronRight,
  History,
  Archive,
  Gem,
  Inbox,
  Video,
  Play,
  UserCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { formatDistanceToNow, differenceInDays, format, isAfter, setYear, getYear } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLoveHoroscope, LoveHoroscopeOutput } from '@/ai/flows/get-love-horoscope';
import { banaSor } from '@/ai/flows/bana-sor';
import { cn } from '@/lib/utils';
import { useGame } from '@/context/GameContext';

const MOODS = [
  { emoji: '😊', label: 'Mutlu' },
  { emoji: '🥰', label: 'Aşık' },
  { emoji: '😴', label: 'Uykulu' },
  { emoji: '😔', label: 'Üzgün' },
  { emoji: '😋', label: 'Aç' },
  { emoji: '🤒', label: 'Hasta' },
  { emoji: '🤩', label: 'Heyecanlı' },
  { emoji: '🤔', label: 'Düşünceli' }
];

const getZodiacSign = (dateString?: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: "Koç", symbol: "Koç ♈" };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: "Boğa", symbol: "Boğa ♉" };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: "İkizler", symbol: "İkizler ♊" };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: "Yengeç", symbol: "Yengeç ♋" };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: "Aslan", symbol: "Aslan ♌" };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: "Başak", symbol: "Başak ♍" };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: "Terazi", symbol: "Terazi ♎" };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: "Akrep", symbol: "Akrep ♏" };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: "Yay", symbol: "Yay ♐" };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: "Oğlak", symbol: "Oğlak ♑" };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: "Kova", symbol: "Kova ♒" };
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { name: "Balık", symbol: "Balık ♓" };
  return null;
};

// 4K HD Image Processing (4096px)
async function compressImage(base64: string, maxWidth = 4096, maxHeight = 4096, quality = 0.95): Promise<string> {
  return new Promise((resolve) => {
    const img = new globalThis.Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } }
      else { if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
}

const processHighResImage = async (base64: string): Promise<string> => {
  // We keep the quality high for 4K.
  // Note: Firestore strictly limits document size to 1MB.
  // If the file exceeds this, Firestore will throw an error regardless of UI limits.
  return await compressImage(base64, 4096, 4096, 0.95);
};

const handleDownloadMedia = (dataUrl: string, filename: string = 'kalbimin-muzesi-ani') => {
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.href = dataUrl;
  const ext = dataUrl.startsWith('data:video') ? '.mp4' : '.jpg';
  link.download = filename + ext;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getEmbedUrl = (url: string) => {
  if (!url) return null;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${id}?enablejsapi=1&origin=${encodeURIComponent(origin)}`;
  } else if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}?enablejsapi=1&origin=${encodeURIComponent(origin)}`;
  } else if (url.includes('youtube.com/shorts/')) {
    const id = url.split('shorts/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}?enablejsapi=1&origin=${encodeURIComponent(origin)}`;
  } else if (url.includes('open.spotify.com/track/')) {
    const id = url.split('track/')[1]?.split('?')[0];
    return `https://open.spotify.com/embed/track/${id}`;
  } else if (url.includes('open.spotify.com/playlist/')) {
    const id = url.split('playlist/')[1]?.split('?')[0];
    return `https://open.spotify.com/embed/playlist/${id}`;
  } else if (url.includes('open.spotify.com/album/')) {
    const id = url.split('album/')[1]?.split('?')[0];
    return `https://open.spotify.com/embed/album/${id}`;
  }
  return null;
};

export default function LovePage() {
  const { user: authUser } = useUser();
  const { updateProfile: updateGameProfile } = useGame();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
  const [momentProgress, setMomentProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDatesDialogOpen, setIsDatesDialogOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isFavoritesDialogOpen, setIsFavoritesDialogOpen] = useState(false);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [horoscope, setHoroscope] = useState<LoveHoroscopeOutput | null>(null);
  const [isLoadingHoroscope, setIsLoadingHoroscope] = useState(false);
  const [newBucketItem, setNewBucketItem] = useState('');
  const [isAddingBucket, setIsAddingBucket] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState('belirtmek_istemiyorum');
  const [editShowAge, setEditShowAge] = useState(true);
  const [editShowGender, setEditShowGender] = useState(true);
  const [editShowOnlineStatus, setEditShowOnlineStatus] = useState(true);
  const [isSavingDates, setIsSavingDates] = useState(false);
  const [isSavingFavorites, setIsSavingFavorites] = useState(false);
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [selectedGalleryMedia, setSelectedGalleryMedia] = useState<{url: string, type: 'image' | 'video'} | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [dateInputs, setDateInputs] = useState({ 
    anniversary: '', 
    engagementDate: '', 
    saitBirthday: '', 
    helenBirthday: '', 
    valentinesDay: '',
    songUrls: ['']
  });
  const [favInputs, setFavInputs] = useState({ movie: '', food: '', place: '', activity: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const momentInputRef = useRef<HTMLInputElement>(null);
  const profileAvatarInputRef = useRef<HTMLInputElement>(null);

  const userRef = useMemoFirebase(() => authUser ? doc(db!, 'users', authUser.uid) : null, [db, authUser]);
  const { data: profile } = useDoc(userRef);
  const partnerRef = useMemoFirebase(() => (db && profile?.partnerUid) ? doc(db!, 'users', profile.partnerUid) : null, [db, profile?.partnerUid]);
  const { data: partner } = useDoc(partnerRef);
  const coupleId = useMemo(() => profile?.partnerUid && authUser ? [authUser.uid, profile.partnerUid].sort().join('_') : null, [profile?.partnerUid, authUser]);
  
  const settingsRef = useMemoFirebase(() => coupleId ? doc(db!, 'couples', coupleId, 'settings', 'dates') : null, [db, coupleId]);
  const { data: dates } = useDoc(settingsRef);

  const songUrlsList = useMemo(() => {
    const list = dates?.songUrls || (dates?.songUrl ? [dates.songUrl] : []);
    return list.map((url: string) => ({ url, embed: getEmbedUrl(url) })).filter((item: any) => item.embed !== null);
  }, [dates]);

  const handleNextSong = useCallback(() => {
    if (songUrlsList.length <= 1) return;
    setCurrentSongIndex((prev) => (prev + 1) % songUrlsList.length);
  }, [songUrlsList.length]);

  const handlePrevSong = useCallback(() => {
    if (songUrlsList.length <= 1) return;
    setCurrentSongIndex((prev) => (prev - 1 + songUrlsList.length) % songUrlsList.length);
  }, [songUrlsList.length]);

  useEffect(() => {
    setIsMounted(true);
    document.documentElement.classList.add('love-theme');
    return () => { document.documentElement.classList.remove('love-theme'); };
  }, []);

  const STORY_DURATION = 10000;
  const PROGRESS_UPDATE_INTERVAL = 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeMomentId && !isPaused) {
      interval = setInterval(() => {
        setMomentProgress((prev) => {
          if (prev >= 100) { setActiveMomentId(null); return 100; }
          return prev + (100 / (STORY_DURATION / PROGRESS_UPDATE_INTERVAL));
        });
      }, PROGRESS_UPDATE_INTERVAL);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeMomentId, isPaused]);

  useEffect(() => { if (activeMomentId) { setMomentProgress(0); setIsPaused(false); } }, [activeMomentId]);

  const wallQuery = useMemoFirebase(() => coupleId ? query(collection(db!, 'couples', coupleId, 'wall'), orderBy('timestamp', 'desc'), limit(100)) : null, [db, coupleId]);
  const { data: posts } = useCollection(wallQuery);
  const momentsQuery = useMemoFirebase(() => coupleId ? query(collection(db!, 'couples', coupleId, 'moments'), orderBy('timestamp', 'desc')) : null, [db, coupleId]);
  const { data: moments } = useCollection(momentsQuery);
  const bucketListQuery = useMemoFirebase(() => coupleId ? query(collection(db!, 'couples', coupleId, 'bucketList'), orderBy('timestamp', 'desc')) : null, [db, coupleId]);
  const { data: bucketList } = useCollection(bucketListQuery);
  const couponsQuery = useMemoFirebase(() => coupleId ? query(collection(db!, 'couples', coupleId, 'coupons'), orderBy('timestamp', 'desc')) : null, [db, coupleId]);
  const { data: coupons } = useCollection(couponsQuery);
  const favsRef = useMemoFirebase(() => coupleId ? doc(db!, 'couples', coupleId, 'settings', 'favorites') : null, [db, coupleId]);
  const { data: favorites } = useDoc(favsRef);
  const incomingRequestsQuery = useMemoFirebase(() => authUser ? query(collection(db!, 'loveRequests'), where('toUid', '==', authUser.uid), where('status', '==', 'pending')) : null, [db, authUser]);
  const { data: requests } = useCollection(incomingRequestsQuery);

  const galleryMedia = useMemo(() => {
    return posts?.filter(p => p.imageUrl || p.mediaUrl).map(p => ({ 
      id: p.id, 
      url: p.mediaUrl || p.imageUrl, 
      type: p.mediaType || 'image',
      date: p.timestamp 
    })) || [];
  }, [posts]);

  useEffect(() => {
    if (dates && isDatesDialogOpen) {
      const existingSongs = dates.songUrls || (dates.songUrl ? [dates.songUrl] : ['']);
      setDateInputs({
        anniversary: dates.anniversary ? format(dates.anniversary instanceof Timestamp ? dates.anniversary.toDate() : new Date(dates.anniversary), 'yyyy-MM-dd') : '',
        engagementDate: dates.engagementDate ? format(dates.engagementDate instanceof Timestamp ? dates.engagementDate.toDate() : new Date(dates.engagementDate), 'yyyy-MM-dd') : '',
        saitBirthday: dates.saitBirthday ? format(dates.saitBirthday instanceof Timestamp ? dates.saitBirthday.toDate() : new Date(dates.saitBirthday), 'yyyy-MM-dd') : '',
        helenBirthday: dates.helenBirthday ? format(dates.helenBirthday instanceof Timestamp ? dates.helenBirthday.toDate() : new Date(dates.helenBirthday), 'yyyy-MM-dd') : '',
        valentinesDay: dates.valentinesDay ? format(dates.valentinesDay instanceof Timestamp ? dates.valentinesDay.toDate() : new Date(dates.valentinesDay), 'yyyy-MM-dd') : '',
        songUrls: existingSongs.length > 0 ? existingSongs : ['']
      });
    }
  }, [dates, isDatesDialogOpen]);

  useEffect(() => {
    if (favorites && isFavoritesDialogOpen) {
      setFavInputs({ movie: favorites.movie || '', food: favorites.food || '', place: favorites.place || '', activity: favorites.activity || '' });
    }
  }, [favorites, isFavoritesDialogOpen]);

  useEffect(() => {
    if (profile && isProfileSettingsOpen) {
      setEditUsername(profile.username || ''); 
      setEditAvatar(profile.avatar || ''); 
      setEditBio(profile.bio || ''); 
      setEditBirthDate(profile.birthDate || ''); 
      setEditGender(profile.gender || 'belirtmek_istemiyorum');
      setEditShowAge(profile.showAge !== undefined ? profile.showAge : true); 
      setEditShowGender(profile.showGender !== undefined ? profile.showGender : true); 
      setEditShowOnlineStatus(profile.showOnlineStatus !== undefined ? profile.showOnlineStatus : true);
    }
  }, [profile, isProfileSettingsOpen]);

  const partnerStatus = useMemo(() => {
    if (!partner || !isMounted || partner.showOnlineStatus === false) return { text: 'Gizli', isOnline: false };
    const lastActive = partner.lastActive;
    if (!lastActive) return { text: 'Çevrimdışı', isOnline: false };
    const lastActiveDate = lastActive instanceof Timestamp ? lastActive.toDate() : new Date(lastActive);
    const diffInSeconds = Math.floor((new Date().getTime() - lastActiveDate.getTime()) / 1000);
    if (diffInSeconds < 90) return { text: 'Aktif', isOnline: true };
    return { text: formatDistanceToNow(lastActiveDate, { addSuffix: true, locale: tr }), isOnline: false };
  }, [partner, isMounted]);

  const anniversaryDate = dates?.anniversary ? (dates.anniversary instanceof Timestamp ? dates.anniversary.toDate() : new Date(dates.anniversary)) : null;
  const daysTogetherRaw = anniversaryDate ? differenceInDays(new Date(), anniversaryDate) : 0;
  const daysTogether = isNaN(daysTogetherRaw) ? 0 : daysTogetherRaw;
  const nextMilestone = (() => { const milestones = [100, 365, 500, 1000, 2000, 5000]; const next = milestones.find(m => m > daysTogether) || (daysTogether + 100); return { count: next, remaining: next - daysTogether }; })();
  const nextSpecial = (() => { if (!dates) return { name: 'Sevgililer Günü', date: new Date(getYear(new Date()), 1, 14) }; const now = new Date(); const currentYear = getYear(now); const specialDays = [ { name: 'Yıldönümü', date: anniversaryDate ? setYear(anniversaryDate, currentYear) : null }, { name: 'Nişan Tarihi', date: dates.engagementDate ? setYear(dates.engagementDate instanceof Timestamp ? dates.engagementDate.toDate() : new Date(dates.engagementDate), currentYear) : null }, { name: "Doğum Günü", date: dates.saitBirthday ? setYear(dates.saitBirthday instanceof Timestamp ? dates.saitBirthday.toDate() : new Date(dates.saitBirthday), currentYear) : null }, { name: "Doğum Günü", date: dates.helenBirthday ? setYear(dates.helenBirthday instanceof Timestamp ? dates.helenBirthday.toDate() : new Date(dates.helenBirthday), currentYear) : null }, { name: 'Sevgililer Günü', date: new Date(currentYear, 1, 14) } ].filter(d => d.date !== null) as { name: string, date: Date }[]; specialDays.forEach(d => { if (isAfter(now, d.date)) d.date = setYear(d.date, currentYear + 1); }); return specialDays.sort((a, b) => a.date.getTime() - b.date.getTime())[0]; })();

  const profileZodiac = useMemo(() => getZodiacSign(profile?.birthDate), [profile?.birthDate]);
  const partnerZodiac = useMemo(() => getZodiacSign(partner?.birthDate), [partner?.birthDate]);

  const handlePartnerSearch = async () => {
    if (!searchUsername.trim() || !db || !authUser) return;
    setIsSearching(true);
    try {
      const usernameDoc = await getDoc(doc(db, 'usernames', searchUsername.toLowerCase()));
      if (usernameDoc.exists()) {
        const targetUid = usernameDoc.data().uid;
        if (targetUid === authUser.uid) { toast({ variant: "destructive", title: "Hata", description: "Kendine istek gönderemezsin." }); }
        else {
          const reqId = `${authUser.uid}_${targetUid}`;
          setDocumentNonBlocking(doc(db, 'loveRequests', reqId), { fromUid: authUser.uid, fromUsername: profile?.username || 'Anonim', toUid: targetUid, status: 'pending', timestamp: serverTimestamp() }, { merge: true });
          toast({ title: "İstek Gönderildi", description: `${searchUsername} kullanıcısına davet iletildi.` });
        }
      } else { toast({ variant: "destructive", title: "Bulunamadı", description: "Kullanıcı mevcut değil." }); }
    } catch (e) { console.error(e); } finally { setIsSearching(false); }
  };

  const acceptRequest = async (req: any) => {
    if (!db || !authUser) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', authUser.uid), { partnerUid: req.fromUid });
    batch.update(doc(db, 'users', req.fromUid), { partnerUid: authUser.uid });
    batch.delete(doc(db, 'loveRequests', req.id));
    const cId = [authUser.uid, req.fromUid].sort().join('_');
    const participants = [authUser.uid, req.fromUid].sort();
    batch.set(doc(db, 'couples', cId, 'settings', 'dates'), { anniversary: serverTimestamp(), songUrls: [], participants });
    batch.set(doc(db, 'couples', cId, 'settings', 'favorites'), { movie: '', food: '', place: '', activity: '', participants });
    batch.set(doc(db, 'couples', cId), { createdAt: serverTimestamp(), participants });
    
    try { 
      await batch.commit(); 
      toast({ title: "Mutluluklar!", description: "Artık dijital aşk odanız hazır." }); 
    } catch (error: any) { 
      console.error("Accept request failed:", error);
      toast({ variant: "destructive", title: "İşlem Başarısız", description: "İstek onaylanırken bir sorun oluştu." });
    }
  };

  const rejectRequest = (reqId: string) => { if (db) deleteDocumentNonBlocking(doc(db, 'loveRequests', reqId)); toast({ title: "İstek Reddedildi" }); };
  
  const endRelationship = async () => {
    if (!db || !authUser || !profile?.partnerUid) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', authUser.uid), { partnerUid: deleteField() });
    batch.update(doc(db, 'users', profile.partnerUid), { partnerUid: deleteField() });
    try { await batch.commit(); toast({ title: "İlişki Sonlandırıldı" }); router.refresh(); } catch (e) { toast({ variant: "destructive", title: "Hata" }); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Limits removed as requested, but keeping 50MB UI threshold for stability.
    if (file.size > 50 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Dosya Çok Büyük", description: "Medya boyutu 50MB'dan küçük olmalıdır." });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => { 
      let processed = reader.result as string;
      if (file.type.startsWith('image/')) {
        processed = await processHighResImage(processed);
        setMediaType('image');
      } else {
        setMediaType('video');
      }
      setSelectedMedia(processed); 
      setIsUploading(false); 
    };
    reader.readAsDataURL(file);
  };

  const handleProfileAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => { const processed = await processHighResImage(reader.result as string); setEditAvatar(processed); };
      reader.readAsDataURL(file);
    }
  };

  const handleSharePost = async () => {
    if ((!newPostText.trim() && !selectedMedia) || !coupleId || !authUser || !db) return;
    
    setIsUploading(true);
    addDocumentNonBlocking(collection(db, 'couples', coupleId, 'wall'), { 
      senderId: authUser.uid, 
      text: newPostText.trim(), 
      mediaUrl: selectedMedia, 
      mediaType: mediaType || 'image',
      timestamp: serverTimestamp() 
    }).finally(() => {
      setNewPostText(''); setSelectedMedia(null); setMediaType(null); setIsUploading(false); toast({ title: "Arşive Eklendi" });
    });
  };

  const handleDeletePost = (postId: string) => {
    if (!coupleId || !db) return;
    deleteDocumentNonBlocking(doc(db, 'couples', coupleId, 'wall', postId)); 
    toast({ title: "Arşivden Silindi" });
  };

  const handleDeleteMoment = (momentId: string) => {
    if (!coupleId || !db) return;
    deleteDocumentNonBlocking(doc(db, 'couples', coupleId, 'moments', momentId)); 
    setActiveMomentId(null); 
    toast({ title: "Durum Silindi" });
  };

  const uploadMoment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !coupleId || !authUser || !db) return;
    setIsUploading(true); const reader = new FileReader();
    reader.onloadend = async () => {
      const processed = await processHighResImage(reader.result as string);
      addDocumentNonBlocking(collection(db, 'couples', coupleId, 'moments'), { senderId: authUser.uid, imageUrl: processed, timestamp: serverTimestamp(), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
      setIsUploading(false); toast({ title: "Durum Paylaşıldı" });
    }; reader.readAsDataURL(file);
  };

  const handleAddBucketItem = async () => {
    if (!newBucketItem.trim() || !coupleId || !db) return;
    setIsAddingBucket(true); addDocumentNonBlocking(collection(db, 'couples', coupleId, 'bucketList'), { text: newBucketItem.trim(), completed: false, timestamp: serverTimestamp() });
    setNewBucketItem(''); setIsAddingBucket(false); toast({ title: "Listeye Eklendi" });
  };

  const toggleBucketItem = (item: any) => { if (coupleId && db && authUser) { updateDocumentNonBlocking(doc(db, 'couples', coupleId, 'bucketList', item.id), { completed: !item.completed, completedBy: !item.completed ? authUser.uid : null }); } };
  const deleteBucketItem = (id: string) => { if (coupleId && db) deleteDocumentNonBlocking(doc(db, 'couples', coupleId, 'bucketList', id)); };
  const updateMood = async (emoji: string) => { if (db && authUser) updateDocumentNonBlocking(doc(db, 'users', authUser.uid), { mood: emoji, updatedAt: serverTimestamp() }); toast({ title: "Ruh Hali Güncellendi" }); };
  
  const fetchHoroscope = async () => { 
    if (!profile?.username || !partner?.username) return; 
    setIsLoadingHoroscope(true); 
    try { 
      const z1 = profileZodiac;
      const z2 = partnerZodiac;
      const result = await getLoveHoroscope({ 
        partnerNames: `${profile.username} & ${partner.username}`,
        zodiacSigns: z1 && z2 ? `${z1.name} & ${z2.name}` : undefined
      }); 
      setHoroscope(result); 
    } catch (e) { 
      toast({ variant: "destructive", title: "Hata" }); 
    } finally { 
      setIsLoadingHoroscope(false); 
    } 
  };
  
  const handleAskAI = async () => {
    if (!aiQuestion.trim() || isAskingAI) return;
    setIsAskingAI(true);
    try {
      const result = await banaSor({ 
        question: aiQuestion.trim(), 
        partnerNames: `${profile?.username || 'Sait'} & ${partner?.username || 'Helen'}` 
      });
      setAiAnswer(result.answer);
      setAiQuestion('');
    } catch (e) {
      toast({ variant: "destructive", title: "Hata", description: "Yapay zeka şu an meşgul." });
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleSaveDates = async () => {
    if (!settingsRef) return; 
    setIsSavingDates(true);
    try { 
      const cleanedSongs = dateInputs.songUrls.filter(u => u.trim() !== '');
      await setDoc(settingsRef, {
        anniversary: dateInputs.anniversary ? Timestamp.fromDate(new Date(dateInputs.anniversary)) : null, 
        engagementDate: dateInputs.engagementDate ? Timestamp.fromDate(new Date(dateInputs.engagementDate)) : null,
        saitBirthday: dateInputs.saitBirthday ? Timestamp.fromDate(new Date(dateInputs.saitBirthday)) : null, 
        helenBirthday: dateInputs.helenBirthday ? Timestamp.fromDate(new Date(dateInputs.helenBirthday)) : null,
        valentinesDay: dateInputs.valentinesDay ? Timestamp.fromDate(new Date(dateInputs.valentinesDay)) : null, 
        songUrls: cleanedSongs,
        updatedAt: serverTimestamp()
      }, { merge: true }); 
      toast({ title: "Ayarlar Kaydedildi" }); setIsDatesDialogOpen(false); 
    } catch (e: any) { toast({ variant: "destructive", title: "Hata", description: "Ayarlar kaydedilemedi." }); } finally { setIsSavingDates(false); }
  };

  const handleSaveFavorites = async () => {
    const favsRefLocal = coupleId ? doc(db!, 'couples', coupleId, 'settings', 'favorites') : null;
    if (!favsRefLocal) return;
    setIsSavingFavorites(true);
    try {
      await setDoc(favsRefLocal, { ...favInputs, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "Favoriler Kaydedildi" }); setIsFavoritesDialogOpen(false);
    } catch (e: any) { toast({ variant: "destructive", title: "Hata", description: "Favoriler kaydedilemedi." }); } finally { setIsSavingFavorites(false); }
  };

  const handleAddCoupon = async () => {
    if (!newCouponTitle.trim() || !coupleId || !db || !authUser) return;
    addDocumentNonBlocking(collection(db, 'couples', coupleId, 'coupons'), { title: newCouponTitle.trim(), senderId: authUser.uid, status: 'available', timestamp: serverTimestamp() });
    setNewCouponTitle(''); setIsCouponDialogOpen(false); toast({ title: "Kupon Hediye Edildi!" });
  };

  const redeemCoupon = (coupon: any) => {
    if (!db || !coupleId || !authUser) return;
    updateDocumentNonBlocking(doc(db, 'couples', coupleId, 'coupons', coupon.id), { status: 'redeemed', redeemedAt: serverTimestamp() });
    addDocumentNonBlocking(collection(db, 'couples', coupleId, 'wall'), { senderId: authUser.uid, text: `🎫 "${coupon.title}" kuponunu bozdurdum!`, timestamp: serverTimestamp() });
    toast({ title: "Kupon Bozduruldu!" });
  };

  const handleSaveProfile = async () => { 
    setIsSavingProfile(true); 
    const success = await updateGameProfile(editUsername, editAvatar, editBio, editBirthDate, editGender, editShowAge, editShowGender, editShowOnlineStatus); 
    setIsSavingProfile(false); if (success) setIsProfileSettingsOpen(false); 
  };

  if (!isMounted) return null;

  if (!profile?.partnerUid) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-8 animate-in fade-in duration-700 px-4">
        <div className="text-center space-y-4">
          <div className="bg-primary/10 p-6 rounded-full inline-block shadow-lg border border-primary/20"><Heart className="h-16 w-16 text-primary fill-primary animate-pulse" /></div>
          <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tight">Kalbimin Müzesi</h1>
          <p className="text-muted-foreground font-bold text-sm">Aşkınla sana özel dijital bir oda kurmak için onu davet et veya gelen istekleri yanıtla!</p>
        </div>
        {requests && requests.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-primary tracking-widest px-2">Gelen İstekler</h3>
            {requests.map((req) => (
              <Card key={req.id} className="border-primary/20 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden animate-in slide-in-from-left">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/10"><AvatarFallback className="bg-primary/5 text-primary font-black">{req.fromUsername?.[0]}</AvatarFallback></Avatar>
                    <p className="font-bold text-xs text-slate-700 truncate max-w-[120px]">{req.fromUsername} seni ekledi!</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => rejectRequest(req.id)} className="text-slate-400 hover:text-destructive p-2 transition-colors"><XCircle className="h-5 w-5" /></button>
                    <Button size="sm" onClick={() => acceptRequest(req)} className="bg-primary hover:bg-primary/90 font-black rounded-xl text-[10px] h-8 px-4 shadow-md shadow-primary/20">KABUL ET</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/90">
          <CardHeader className="bg-primary text-white text-center p-8">
            <CardTitle className="text-xl font-black uppercase tracking-wider">Aşkını Bul</CardTitle>
            <CardDescription className="text-primary-foreground/80 font-medium">Kullanıcı adını gir ve isteği gönder.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input placeholder="Kullanıcı adı..." value={searchUsername} onChange={(e) => setSearchUsername(e.target.value)} className="pl-10 h-12 rounded-2xl border-primary/10 font-bold" />
              </div>
              <Button onClick={handlePartnerSearch} disabled={isSearching} className="bg-primary hover:bg-primary/90 h-12 w-12 rounded-2xl shadow-lg shrink-0">{isSearching ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-1000 relative px-2">
      <div className="py-2 md:py-4">
        <div className="bg-white p-3 md:p-4 rounded-[2rem] md:rounded-[2.5rem] border border-primary/10 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative group cursor-pointer">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-primary/20 shadow-md transition-transform group-hover:scale-105">
                    <AvatarImage src={profile?.avatar} className="object-cover" />
                    <AvatarFallback className="font-black bg-primary/5 text-primary">{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {profile?.mood && <div className="absolute -bottom-1 -left-1 bg-white rounded-full p-0.5 shadow-sm text-[10px] border border-primary/5">{profile.mood}</div>}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 p-2 rounded-2xl grid grid-cols-4 gap-1 border-primary/10">
                {MOODS.map((m) => ( 
                  <button key={m.emoji} onClick={() => updateMood(m.emoji)} className="h-10 w-10 flex items-center justify-center text-xl hover:bg-primary/5 rounded-xl transition-colors" title={m.label}>{m.emoji}</button> 
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-1 md:gap-2">
              <div className="h-0.5 w-2 md:w-4 bg-primary/20" />
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-md">
                  <AvatarImage src={partner?.avatar} className="object-cover" />
                  <AvatarFallback className="font-black bg-primary/5 text-primary">{partner?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                {partner?.mood && <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm text-[10px] border border-primary/5 animate-bounce">{partner.mood}</div>}
              </div>
              <div className="hidden xs:block max-w-[80px] md:max-w-full">
                <p className="text-[10px] font-black text-slate-800 leading-none truncate">{partner?.username}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className={cn("text-[8px] font-bold uppercase tracking-tighter", partnerStatus.isOnline ? "text-emerald-500" : "text-slate-400")}>{partnerStatus.text}</p>
                  {partnerZodiac && <span className="text-[10px] opacity-60" title={partnerZodiac.name}>{partnerZodiac.symbol}</span>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center flex-1 px-2">
            <p className="text-[8px] md:text-[9px] font-black uppercase text-primary/60 tracking-widest leading-none mb-0.5">Birlikte</p>
            <p className="text-xs md:text-sm font-black text-primary leading-tight">{daysTogether} GÜN</p>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2">
            <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-primary/5 text-primary hover:bg-primary/10 h-9 w-9 md:h-11 md:w-11 shadow-sm border border-primary/10 transition-all">
                  <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-[100dvh] border-primary/10">
                <SheetHeader className="p-4 border-b bg-white flex flex-row items-center gap-3 space-y-0">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-md">
                      <AvatarImage src={partner?.avatar} className="object-cover" />
                      <AvatarFallback className="font-black bg-primary/5 text-primary">{partner?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white", partnerStatus.isOnline ? "bg-emerald-500" : "bg-slate-300")} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <SheetTitle className="text-sm font-black text-slate-800 leading-none mb-1 truncate">{partner?.username}</SheetTitle>
                    <p className={cn("text-[8px] font-black uppercase tracking-widest leading-none", partnerStatus.isOnline ? "text-emerald-500" : "text-slate-400")}>{partnerStatus.text}</p>
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                  {coupleId && <LoveChat chatId={coupleId} />}
                </div>
              </SheetContent>
            </Sheet>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-slate-50 text-slate-500 h-9 w-9 md:h-11 md:w-11 shadow-sm relative border border-slate-200">
                  <Menu className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="border-primary/10">
                <SheetHeader className="pb-6 border-b">
                  <SheetTitle className="text-2xl font-black text-primary flex items-center gap-2 font-headline"><Heart className="h-6 w-6 fill-primary" /> Seçenekler</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-4">
                  <Button variant="outline" onClick={fetchHoroscope} disabled={isLoadingHoroscope} className="w-full justify-start font-bold gap-3 rounded-xl border-primary/10 h-12 hover:bg-primary/5 transition-all text-xs uppercase tracking-wider">{isLoadingHoroscope ? <Loader2 className="animate-spin h-5 w-5" /> : <Stars className="h-5 w-5 text-primary" />} Günlük Aşk Falı</Button>
                  <Button variant="outline" onClick={() => setIsDatesDialogOpen(true)} className="w-full justify-start font-bold gap-3 rounded-xl border-primary/10 h-12 hover:bg-primary/5 transition-all text-xs uppercase tracking-wider"><Calendar className="h-5 w-5 text-primary" /> Ayarları Düzenle</Button>
                  <Button variant="outline" onClick={() => setIsProfileSettingsOpen(true)} className="w-full justify-start font-bold gap-3 rounded-xl border-primary/10 h-12 hover:bg-primary/5 transition-all text-xs uppercase tracking-wider"><Settings className="h-5 w-5 text-primary" /> Profil Ayarları</Button>
                  <Button variant="outline" onClick={() => setIsFavoritesDialogOpen(true)} className="w-full justify-start font-bold gap-3 rounded-xl border-primary/10 h-12 hover:bg-primary/5 transition-all text-xs uppercase tracking-wider"><Target className="h-5 w-5 text-primary" /> Favorilerimizi Düzenle</Button>
                  <Button variant="outline" onClick={() => setIsCouponDialogOpen(true)} className="w-full justify-start font-bold gap-3 rounded-xl border-primary/10 h-12 hover:bg-primary/5 transition-all text-xs uppercase tracking-wider"><Ticket className="h-5 w-5 text-primary" /> Kupon Hediye Et</Button>
                  <div className="pt-4 mt-4 border-t border-primary/5">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-bold gap-3 rounded-xl border-primary/10 h-12 text-destructive hover:bg-destructive/5 text-xs uppercase tracking-wider"><UserMinus className="h-5 w-5" /> İlişkiyi Bitir</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2rem] border-primary/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-headline font-black">İlişkiyi bitir?</AlertDialogTitle>
                          <AlertDialogDescription className="font-medium text-slate-600">Aşk bağlantınız kopacak ve anılarınıza erişiminiz kısıtlanacaktır. Bu işlem geri alınamaz.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl font-bold">Vazgeç</AlertDialogCancel>
                          <AlertDialogAction onClick={endRelationship} className="bg-destructive text-white rounded-xl font-black">Evet, Bitir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <Dialog open={isDatesDialogOpen} onOpenChange={setIsDatesDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[2rem] border-primary/10 shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary flex items-center gap-2 font-headline"><Calendar className="h-6 w-6" /> Ayarları Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-black text-[10px] uppercase tracking-widest text-primary flex items-center gap-1"><Music className="h-3 w-3" /> Şarkılarımız</Label>
                <Button variant="ghost" size="sm" className="h-6 text-[8px] font-black uppercase text-primary bg-primary/5 rounded-lg border border-primary/10" onClick={() => setDateInputs({...dateInputs, songUrls: [...dateInputs.songUrls, '']})}>
                  <Plus className="h-3 w-3 mr-1" /> EKLE
                </Button>
              </div>
              <div className="space-y-2">
                {dateInputs.songUrls.map((url, idx) => (
                  <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-right">
                    <Input placeholder="Spotify/YouTube linki..." value={url} onChange={(e) => { const newUrls = [...dateInputs.songUrls]; newUrls[idx] = e.target.value; setDateInputs({...dateInputs, songUrls: newUrls}); }} className="rounded-xl border-primary/10 font-bold text-[10px] h-10" />
                    {dateInputs.songUrls.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-destructive shrink-0" onClick={() => setDateInputs({...dateInputs, songUrls: dateInputs.songUrls.filter((_, i) => i !== idx)})}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Yıldönümü</Label><Input type="date" value={dateInputs.anniversary} onChange={(e) => setDateInputs({...dateInputs, anniversary: e.target.value})} className="rounded-xl border-primary/10 font-bold text-xs" /></div>
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Nişan Tarihi</Label><Input type="date" value={dateInputs.engagementDate} onChange={(e) => setDateInputs({...dateInputs, engagementDate: e.target.value})} className="rounded-xl border-primary/10 font-bold text-xs" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Partner 1 D. Günü</Label><Input type="date" value={dateInputs.saitBirthday} onChange={(e) => setDateInputs({...dateInputs, saitBirthday: e.target.value})} className="rounded-xl border-primary/10 font-bold text-[10px]" /></div>
              <div className="space-y-2"><Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Partner 2 D. Günü</Label><Input type="date" value={dateInputs.helenBirthday} onChange={(e) => setDateInputs({...dateInputs, helenBirthday: e.target.value})} className="rounded-xl border-primary/10 font-bold text-[10px]" /></div>
            </div>
            <Button onClick={handleSaveDates} disabled={isSavingDates} className="w-full bg-primary hover:bg-primary/90 font-black rounded-xl h-12 mt-4 shadow-lg shadow-primary/20 uppercase tracking-widest text-xs">{isSavingDates ? <Loader2 className="animate-spin h-5 w-5" /> : "KAYDET"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isFavoritesDialogOpen} onOpenChange={setIsFavoritesDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[2rem] border-primary/10 shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary flex items-center gap-2 font-headline"><Sparkles className="h-6 w-6" /> Favorilerimiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">En Sevdiğimiz Film</Label><Input value={favInputs.movie} onChange={(e) => setFavInputs({...favInputs, movie: e.target.value})} className="rounded-xl border-primary/10 font-bold text-xs" /></div>
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">En Sevdiğimiz Yemek</Label><Input value={favInputs.food} onChange={(e) => setFavInputs({...favInputs, food: e.target.value})} className="rounded-xl border-primary/10 font-bold text-xs" /></div>
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">En Sevdiğimiz Mekan</Label><Input value={favInputs.place} onChange={(e) => setFavInputs({...favInputs, place: e.target.value})} className="rounded-xl border-primary/10 font-bold text-xs" /></div>
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">En Sevdiğimiz Aktivite</Label><Input value={favInputs.activity} onChange={(e) => setFavInputs({...favInputs, activity: e.target.value})} className="rounded-xl border-primary/10 font-bold text-xs" /></div>
            <Button onClick={handleSaveFavorites} disabled={isSavingFavorites} className="w-full bg-primary hover:bg-primary/90 font-black rounded-xl h-12 mt-4 shadow-lg shadow-primary/20 uppercase tracking-widest text-xs">{isSavingFavorites ? <Loader2 className="animate-spin h-5 w-5" /> : "KAYDET"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileSettingsOpen} onOpenChange={setIsProfileSettingsOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[2rem] border-primary/10 shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary flex items-center gap-2 font-headline">
              <UserCircle className="h-6 w-6" /> Profil Ayarlarım
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => profileAvatarInputRef.current?.click()}>
                <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-xl transition-transform group-hover:scale-105">
                  <AvatarImage src={editAvatar} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-2xl font-black">{editUsername?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-[8px] font-black uppercase">Değiştir</span>
                </div>
              </div>
              <input type="file" ref={profileAvatarInputRef} className="hidden" accept="image/*" onChange={handleProfileAvatarSelect} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profil Fotoğrafını Güncelle</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-primary">Kullanıcı Adı</Label>
                <Input 
                  value={editUsername} 
                  onChange={(e) => setEditUsername(e.target.value)} 
                  className="rounded-xl border-primary/10 font-bold h-11" 
                  placeholder="Kullanıcı adın..."
                />
              </div>

              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-primary">Biyografi</Label>
                <Textarea 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)} 
                  className="rounded-xl border-primary/10 font-medium text-xs min-h-[80px] resize-none" 
                  placeholder="Kendinden bahset..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-primary">Doğum Tarihi</Label>
                  <Input 
                    type="date" 
                    value={editBirthDate} 
                    onChange={(e) => setEditBirthDate(e.target.value)} 
                    className="rounded-xl border-primary/10 font-bold text-xs h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-primary">Cinsiyet</Label>
                  <Select value={editGender} onValueChange={setEditGender}>
                    <SelectTrigger className="rounded-xl border-primary/10 h-11 font-bold text-xs">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="erkek">Erkek</SelectItem>
                      <SelectItem value="kadin">Kadın</SelectItem>
                      <SelectItem value="diger">Diğer</SelectItem>
                      <SelectItem value="belirtmek_istemiyorum">Belirtme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-primary/5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Gizlilik Ayarları</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-black text-slate-700">Yaşımı Göster</Label>
                    <p className="text-[9px] text-slate-400 font-medium">Profilinde yaşın görünür olur.</p>
                  </div>
                  <Switch checked={editShowAge} onCheckedChange={setEditShowAge} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-black text-slate-700">Cinsiyetimi Göster</Label>
                    <p className="text-[9px] text-slate-400 font-medium">Profilinde cinsiyet bilgin yer alır.</p>
                  </div>
                  <Switch checked={editShowGender} onCheckedChange={setEditShowGender} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-black text-slate-700">Çevrimiçi Durumu</Label>
                    <p className="text-[9px] text-slate-400 font-medium">Son görülme ve aktiflik durumun görünür.</p>
                  </div>
                  <Switch checked={editShowOnlineStatus} onCheckedChange={setEditShowOnlineStatus} />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={isSavingProfile} 
              className="w-full bg-primary hover:bg-primary/90 font-black rounded-xl h-12 mt-4 shadow-lg shadow-primary/20 uppercase tracking-widest text-xs"
            >
              {isSavingProfile ? <Loader2 className="animate-spin h-4 w-4" /> : "DEĞİŞİKLİKLERİ KAYDET"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <section className="space-y-3 px-2 overflow-hidden">
        <div className="flex items-center justify-between px-2"><h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Güncel Durumlar</h3></div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 p-1">
            <button onClick={() => momentInputRef.current?.click()} disabled={isUploading} className="w-16 md:w-20 h-24 md:h-28 rounded-3xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center bg-primary/5 text-primary/40 hover:border-primary/40 transition-all shrink-0 shadow-sm active:scale-95">
              {isUploading ? <Loader2 className="h-6 md:h-8 w-6 md:w-8 animate-spin" /> : <Plus className="h-6 md:h-8 w-6 md:w-8" />}
              <span className="text-[8px] md:text-[9px] font-black uppercase mt-1 tracking-widest">Ekle</span>
            </button>
            <input type="file" momentInputRef={momentInputRef} className="hidden" accept="image/*" onChange={uploadMoment} />
            {moments?.map((m) => ( 
              <div key={m.id} className="flex flex-col items-center gap-1 shrink-0 animate-in zoom-in">
                <div onClick={() => setActiveMomentId(m.id)} className="relative w-16 md:w-20 h-24 md:h-28 rounded-3xl overflow-hidden border-2 border-primary/40 p-0.5 cursor-zoom-in shadow-md hover:scale-105 transition-transform">
                  <div className="relative w-full h-full rounded-[1.25rem] overflow-hidden">
                    {m.imageUrl && <img src={m.imageUrl} alt="moment" className="w-full h-full object-cover" />}
                    <div className="absolute top-1.5 right-1.5"><div className="h-2 w-2 rounded-full bg-primary shadow-sm border border-white" /></div>
                  </div>
                </div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{m.timestamp ? formatDistanceToNow(m.timestamp.toDate(), { addSuffix: false, locale: tr }) : ""}</span>
              </div> 
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {activeMomentId && (
        <Dialog open={!!activeMomentId} onOpenChange={(open) => !open && setActiveMomentId(null)}>
          <DialogContent className="max-w-[450px] p-0 overflow-hidden bg-black border-none shadow-none flex flex-col items-center justify-center cursor-pointer select-none aspect-[9/16] h-[100dvh]" onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onMouseLeave={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
            <DialogHeader className="sr-only"><DialogTitle>Durum İzleyici</DialogTitle></DialogHeader>
            <div className="absolute top-4 left-4 right-4 z-50 flex gap-1"><div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${momentProgress}%` }} /></div></div>
            <div className="absolute top-8 left-4 right-4 z-[60] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-white/20"><AvatarImage src={moments?.find(m => m.id === activeMomentId)?.senderId === authUser?.uid ? profile?.avatar : partner?.avatar} className="object-cover" /><AvatarFallback>?</AvatarFallback></Avatar>
                <span className="text-white text-[10px] font-black uppercase tracking-widest shadow-black drop-shadow-md">{moments?.find(m => m.id === activeMomentId)?.senderId === authUser?.uid ? "Senin Durumun" : `${partner?.username} Durumu`}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); handleDownloadMedia(moments?.find(m => m.id === activeMomentId)!.imageUrl); }} className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all active:scale-90"><Download className="h-4 w-4" /></button>
                {moments?.find(m => m.id === activeMomentId)?.senderId === authUser?.uid && ( 
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button onClick={(e) => e.stopPropagation()} className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all active:scale-90"><Trash2 className="h-4 w-4" /></button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2rem] border-primary/10">
                      <AlertDialogHeader><AlertDialogTitle className="font-headline font-black">Durumu Sil?</AlertDialogTitle><AlertDialogDescription className="font-medium text-slate-600">Bu hikayeyi herkes için silmek istediğine emin misin?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel className="rounded-xl font-bold">Vazgeç</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteMoment(activeMomentId)} className="bg-destructive text-white rounded-xl font-black">Evet, Sil</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog> 
                )}
              </div>
            </div>
            <div className="relative w-full h-full flex items-center justify-center bg-black">{activeMomentId && moments?.find(m => m.id === activeMomentId)?.imageUrl && (<img src={moments?.find(m => m.id === activeMomentId)?.imageUrl} alt="moment full" className="w-full h-full object-contain animate-in zoom-in duration-300" draggable={false} />)}</div>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        <div className="md:col-span-2 space-y-4 order-2 md:order-1">
          <Tabs defaultValue="museum" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm p-1 rounded-2xl border border-primary/10 h-12 mb-4 shadow-sm">
              <TabsTrigger value="museum" className="rounded-xl font-black text-[9px] md:text-xs uppercase tracking-tighter md:tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Archive className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Dijital Arşiv</TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-xl font-black text-[9px] md:text-xs uppercase tracking-tighter md:tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><History className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Hikayemiz</TabsTrigger>
              <TabsTrigger value="vault" className="rounded-xl font-black text-[9px] md:text-xs uppercase tracking-tighter md:tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Gem className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Hazine Odası</TabsTrigger>
            </TabsList>

            <TabsContent value="museum" className="space-y-4 animate-in fade-in duration-500">
              <Card className="border-primary/10 shadow-xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-primary/5 border-b border-primary/10 p-6 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Archive className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm font-black uppercase text-primary tracking-widest font-headline">Yeni Arşiv Ekle</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-primary font-black text-[8px] uppercase tracking-tighter">HD KAYIT AKTİF</Badge>
                </CardHeader>
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-10 w-10 border-2 border-primary/10 shrink-0"><AvatarImage src={profile?.avatar} className="object-cover" /><AvatarFallback>{profile?.username?.[0]}</AvatarFallback></Avatar>
                    <div className="flex-1"><Textarea placeholder="Bu anıyı ölümsüzleştirmek için bir şeyler yaz..." value={newPostText} onChange={(e) => setNewPostText(e.target.value)} className="border-none bg-primary/5 rounded-2xl min-h-[80px] font-bold placeholder:text-primary/30 resize-none py-3 text-xs md:text-sm" /></div>
                  </div>
                  {selectedMedia && ( 
                    <div className="relative w-full mb-4 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md bg-slate-50 flex justify-center animate-in zoom-in">
                      {mediaType === 'video' ? (
                        <video src={selectedMedia} controls className="w-full h-auto block max-h-[300px]" />
                      ) : (
                        <img src={selectedMedia} alt="selected" className="w-full h-auto block object-contain max-h-[300px]" />
                      )}
                      <button onClick={() => { setSelectedMedia(null); setMediaType(null); }} className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-all"><X className="h-4 w-4" /></button>
                    </div> 
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-primary/5">
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-primary font-bold hover:bg-primary/5 rounded-xl text-[10px] uppercase tracking-wider h-9 px-3">
                        <Camera className="h-4 w-4 mr-1.5" /> Fotoğraf
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => videoInputRef.current?.click()} className="text-primary font-bold hover:bg-primary/5 rounded-xl text-[10px] uppercase tracking-wider h-9 px-3">
                        <Video className="h-4 w-4 mr-1.5" /> Video
                      </Button>
                      <input type="file" fileInputRef={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                      <input type="file" videoInputRef={videoInputRef} className="hidden" accept="video/*" onChange={handleFileSelect} />
                    </div>
                    <Button disabled={isUploading || (!newPostText.trim() && !selectedMedia)} onClick={handleSharePost} className="bg-primary hover:bg-primary/90 font-black rounded-xl h-10 px-5 shadow-md shadow-primary/20 text-[10px] uppercase tracking-widest min-w-[140px] flex-1 sm:flex-none">
                      {isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : "KOLEKSİYONA EKLE"}
                    </Button>
                  </div>
                </div>
              </Card>
              
              <div className="space-y-6">
                {posts && posts.length > 0 ? (
                  posts.map((post) => ( 
                    <Card key={post.id} className="border-primary/5 shadow-lg rounded-[2rem] overflow-hidden group bg-white/90 animate-in fade-in slide-in-from-bottom-4">
                      <CardContent className="p-0 relative">
                        <div className="p-4 flex items-center justify-between bg-primary/5 border-b border-primary/5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-primary/10 shadow-sm"><AvatarImage src={post.senderId === authUser?.uid ? profile?.avatar : partner?.avatar} className="object-cover" /><AvatarFallback>?</AvatarFallback></Avatar>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-slate-800 italic truncate max-w-[120px] md:max-w-full">Arşivci: {post.senderId === authUser?.uid ? "Sen" : partner?.username}</p>
                              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock className="h-2 w-2" /> {post.timestamp ? format(post.timestamp.toDate(), 'dd MMM yyyy, HH:mm', { locale: tr }) : "Şimdi"}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {(post.mediaUrl || post.imageUrl) && (
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary rounded-full transition-all h-8 w-8" onClick={() => handleDownloadMedia(post.mediaUrl || post.imageUrl)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {post.senderId === authUser?.uid && ( 
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive rounded-full transition-all h-8 w-8">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[2rem] border-primary/10">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-headline font-black">Arşivden Sil</AlertDialogTitle>
                                    <AlertDialogDescription className="font-medium text-slate-600">Bu parçayı müzeden kalıcı olarak çıkarmak istediğine emin misin?</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl font-bold">Vazgeç</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-destructive text-white rounded-xl font-black">Evet, Sil</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog> 
                            )}
                          </div>
                        </div>
                        {(post.mediaUrl || post.imageUrl) && ( 
                          <div className="w-full relative bg-primary/5 flex justify-center overflow-hidden cursor-zoom-in group" onClick={() => setSelectedGalleryMedia({url: post.mediaUrl || post.imageUrl, type: post.mediaType || 'image'})}>
                            {post.mediaType === 'video' ? (
                              <div className="relative w-full h-auto">
                                <video src={post.mediaUrl} className="w-full h-auto block object-contain transition-transform duration-700 group-hover:scale-[1.02]" style={{ maxHeight: '70vh' }} muted playsInline loop autoPlay />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                  <div className="bg-white/90 p-4 rounded-full shadow-2xl"><Play className="h-8 w-8 text-primary fill-primary" /></div>
                                </div>
                              </div>
                            ) : (
                              <img src={post.mediaUrl || post.imageUrl} alt="post" className="w-full h-auto block object-contain transition-transform duration-700 group-hover:scale-[1.02]" style={{ maxHeight: '70vh' }} />
                            )}
                          </div> 
                        )}
                        <div className="p-6 pt-4 space-y-4">
                          {post.text && <p className="text-xs md:text-sm font-medium text-slate-700 leading-relaxed italic border-l-4 border-primary/30 pl-4 bg-primary/5 py-3 rounded-r-xl break-words">"{post.text}"</p>}
                        </div>
                      </CardContent>
                    </Card> 
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-primary/10">
                    <Inbox className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Henüz bir anı arşivlenmedi.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="animate-in fade-in duration-500">
              <div className="relative pl-8 md:pl-12 space-y-8 before:absolute before:left-4 md:before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/20 before:to-primary/5">
                {posts && posts.length > 0 ? (
                  [...posts].reverse().map((post, idx) => (
                    <div key={post.id} className="relative animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="absolute -left-10 md:-left-14 top-1 h-4 w-4 rounded-full bg-primary border-4 border-white shadow-md z-10" />
                      <div className="space-y-3">
                        <Badge className="bg-primary/10 text-primary border-none font-black text-[8px] uppercase tracking-[0.2em] shadow-sm">
                          {post.timestamp ? format(post.timestamp.toDate(), 'dd MMMM yyyy', { locale: tr }) : 'TARİH BELİRSİZ'}
                        </Badge>
                        <Card className="border-primary/5 shadow-md rounded-2xl overflow-hidden bg-white/90 hover:shadow-lg transition-all">
                          <CardContent className="p-4">
                            <div className="flex gap-4 items-start">
                              {(post.mediaUrl || post.imageUrl) && (
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 shadow-sm cursor-zoom-in relative" onClick={() => setSelectedGalleryMedia({url: post.mediaUrl || post.imageUrl, type: post.mediaType || 'image'})}>
                                  {post.mediaType === 'video' ? (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                      <Play className="h-6 w-6 text-primary" />
                                    </div>
                                  ) : (
                                    <img src={post.mediaUrl || post.imageUrl} alt="Timeline" className="w-full h-full object-cover" />
                                  )}
                                </div>
                              )}
                              <div className="flex-1 space-y-1 min-w-0">
                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest truncate">{post.senderId === authUser?.uid ? "Sen" : partner?.username}</p>
                                <p className="text-[11px] md:text-xs font-medium text-slate-600 italic line-clamp-3 leading-relaxed break-words">{post.text || "Bir anı koleksiyona eklendi."}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-primary/10">
                    <History className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Tarih yazılmaya henüz başlanmadı.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="vault" className="animate-in fade-in duration-500">
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6 flex items-center justify-between shadow-sm">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-primary leading-none font-headline uppercase tracking-widest">Hazine Odası</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 truncate">Görsel ve video hazineleriniz en yüksek kalitede saklanır.</p>
                </div>
                <Gem className="h-8 w-8 text-primary/30 shrink-0" />
              </div>
              {galleryMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryMedia.map((media) => (
                    <div key={media.id} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-white shadow-md cursor-zoom-in hover:scale-[1.02] transition-transform group" onClick={() => setSelectedGalleryMedia({url: media.url, type: media.type})}>
                      {media.type === 'video' ? (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <Play className="h-10 w-10 text-primary opacity-40 group-hover:scale-110 transition-transform" />
                          <video src={media.url} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        </div>
                      ) : (
                        <img src={media.url} alt="Gallery" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-4"><p className="text-[7px] font-bold text-white/90 text-right drop-shadow-sm flex items-center justify-end gap-1 uppercase"><Clock className="h-2 w-2" />{media.date ? format(media.date instanceof Timestamp ? media.date.toDate() : new Date(media.date), 'dd MMM yy', { locale: tr }) : '...'}</p></div>
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <div className="bg-white/90 p-2 rounded-full text-primary shadow-lg"><DownloadCloud className="h-4 w-4" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-primary/10 rounded-[2.5rem] p-12 text-center bg-white/50 shadow-inner"><div className="bg-primary/5 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"><GalleryIcon className="h-8 w-8 text-primary/20" /></div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Hazine odası henüz boş.</p></Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6 order-1 md:order-2">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-rose-500 to-pink-600 text-white overflow-hidden relative group">
            <CardHeader className="p-6 pb-2 relative z-10">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 font-headline">
                <MessageSquare className="h-4 w-4 text-white" /> Bana Sor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 relative z-10">
              <div className="space-y-3">
                <p className="text-[9px] font-medium opacity-80 uppercase tracking-widest">Helen & Sait hakkında her şeyi sor...</p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Bir soru sor..." 
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-[10px] h-9 rounded-xl focus-visible:ring-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleAskAI} 
                    disabled={isAskingAI || !aiQuestion.trim()}
                    className="bg-white text-rose-600 hover:bg-rose-50 rounded-xl h-9 w-9 shrink-0"
                  >
                    {isAskingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                {aiAnswer && (
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 animate-in fade-in zoom-in-95">
                    <p className="text-[10px] font-medium italic leading-relaxed">"{aiAnswer}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-rose-900 to-slate-900 text-white overflow-hidden group">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 font-headline"><Music className="h-4 w-4 text-rose-400" /> Şarkılarımız</CardTitle>
              {songUrlsList.length > 1 && (
                <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full border border-white/5">
                  <button onClick={handlePrevSong} className="hover:text-rose-400 transition-colors p-0.5 active:scale-90"><ChevronLeft className="h-3 w-3" /></button>
                  <span className="text-[8px] font-black w-10 text-center tracking-tighter">{currentSongIndex + 1} / {songUrlsList.length}</span>
                  <button onClick={handleNextSong} className="hover:text-rose-400 transition-colors p-0.5 active:scale-90"><ChevronRight className="h-3 w-3" /></button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {songUrlsList.length > 0 ? (
                  <div className="rounded-2xl overflow-hidden shadow-2xl bg-black/20 animate-in zoom-in-95">
                    <iframe key={currentSongIndex} src={songUrlsList[currentSongIndex].embed || ''} width="100%" height={songUrlsList[currentSongIndex].url.includes('spotify') ? '80' : '180'} frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="block" />
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer active:scale-95" onClick={() => setIsDatesDialogOpen(true)}>
                    <Music className="h-8 w-8 text-white/20 mx-auto mb-2" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Şarkı Listesi Oluştur</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-pink-400 to-rose-500 text-white overflow-hidden group">
            <CardHeader className="p-6 pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 font-headline"><Sparkles className="h-4 w-4" /> Favorilerimiz</CardTitle></CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 backdrop-blur-sm"><div className="flex items-center gap-1.5 mb-1"><Film className="h-3 w-3 text-rose-100" /><span className="text-[7px] font-black uppercase tracking-wider text-rose-50">Film</span></div><p className="text-[9px] font-bold truncate">{favorites?.movie || '---'}</p></div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 backdrop-blur-sm"><div className="flex items-center gap-1.5 mb-1"><Utensils className="h-3 w-3 text-rose-100" /><span className="text-[7px] font-black uppercase tracking-wider text-rose-50">Yemek</span></div><p className="text-[9px] font-bold truncate">{favorites?.food || '---'}</p></div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 backdrop-blur-sm"><div className="flex items-center gap-1.5 mb-1"><MapPin className="h-3 w-3 text-rose-100" /><span className="text-[7px] font-black uppercase tracking-wider text-rose-50">Mekan</span></div><p className="text-[9px] font-bold truncate">{favorites?.place || '---'}</p></div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 backdrop-blur-sm"><div className="flex items-center gap-1.5 mb-1"><Palmtree className="h-3 w-3 text-rose-100" /><span className="text-[7px] font-black uppercase tracking-wider text-rose-50">Etkinlik</span></div><p className="text-[9px] font-bold truncate">{favorites?.activity || '---'}</p></div>
              </div>
              <Button variant="ghost" onClick={() => setIsFavoritesDialogOpen(true)} className="w-full text-[8px] font-black uppercase tracking-widest text-rose-100 hover:text-white hover:bg-white/10 rounded-lg h-7 transition-all">GÜNCELLE</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-rose-400 to-orange-400 text-white overflow-hidden">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between space-y-0"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 font-headline"><Ticket className="h-4 w-4" /> Aşk Kuponları</CardTitle><Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-white hover:bg-white/20 transition-all active:scale-90" onClick={() => setIsCouponDialogOpen(true)}><Plus className="h-4 w-4" /></Button></CardHeader>
            <CardContent className="p-6 pt-0">
              <ScrollArea className="h-[150px] pr-2">
                <div className="space-y-2">
                  {coupons?.filter(c => c.status === 'available').map((c) => (
                    <div key={c.id} className="bg-white/20 p-3 rounded-xl border border-white/10 flex items-center justify-between animate-in slide-in-from-right-2 backdrop-blur-sm">
                      <div className="flex-1 min-w-0 mr-2"><p className="text-[9px] font-black uppercase truncate tracking-tight">{c.title}</p><p className="text-[7px] font-bold opacity-70">Kimden: {c.senderId === authUser?.uid ? 'Sen' : partner?.username}</p></div>
                      {c.senderId !== authUser?.uid && ( <Button size="sm" onClick={() => redeemCoupon(c)} className="bg-white text-rose-600 hover:bg-rose-50 font-black text-[8px] h-7 rounded-lg transition-all shrink-0 shadow-sm">BOZDUR</Button> )}
                    </div>
                  ))}
                  {coupons?.filter(c => c.status === 'available').length === 0 && ( <div className="text-center py-8 opacity-40 italic text-[9px] font-bold uppercase tracking-widest">Aktif kupon bulunmuyor.</div> )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-purple-500 to-pink-500 text-white overflow-hidden relative group">
            <CardHeader className="p-6 pb-2 relative z-10"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 font-headline"><Stars className="h-4 w-4 text-yellow-300" /> Günlük Aşk Falı</CardTitle></CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 relative z-10">
              <div className="flex justify-center gap-4 mb-2 animate-in zoom-in duration-700">
                {profileZodiac && (
                  <div className="text-center">
                    <span className="text-2xl" title={profileZodiac.name}>{profileZodiac.symbol.split(' ')[1]}</span>
                    <p className="text-[7px] font-black uppercase opacity-60">SEN</p>
                    <p className="text-[8px] font-bold">{profileZodiac.name}</p>
                  </div>
                )}
                <Heart className="h-4 w-4 text-rose-300 fill-rose-300 self-center animate-pulse" />
                {partnerZodiac && (
                  <div className="text-center">
                    <span className="text-2xl" title={partnerZodiac.name}>{partnerZodiac.symbol.split(' ')[1]}</span>
                    <p className="text-[7px] font-black uppercase opacity-60">PARTNER</p>
                    <p className="text-[8px] font-bold">{partnerZodiac.name}</p>
                  </div>
                )}
              </div>

              {horoscope ? (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5"><p className="text-[11px] font-medium leading-relaxed italic break-words">"{horoscope.horoscope}"</p></div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-center flex-1"><p className="text-[8px] font-black uppercase text-pink-100 tracking-wider">Uyumluluk</p><p className="text-xl font-black text-yellow-300">%{horoscope.compatibilityScore}</p></div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-center flex-1"><p className="text-[8px] font-black uppercase text-pink-100 tracking-wider">Sembol</p><p className="text-xl">{horoscope.luckySymbol}</p></div>
                  </div>
                  <Button variant="ghost" onClick={fetchHoroscope} className="w-full text-[8px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 rounded-xl h-8 transition-all">YENİLE</Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[10px] font-medium text-pink-50 mb-4 tracking-wide">Burçlarınızın gökyüzü enerjisini öğrenin.</p>
                  <Button onClick={fetchHoroscope} disabled={isLoadingHoroscope} className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-black rounded-xl w-full h-12 shadow-lg transition-all uppercase tracking-widest text-xs active:scale-95">{isLoadingHoroscope ? <Loader2 className="h-5 w-5 animate-spin" /> : "FALI GÖSTER"}</Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-primary to-accent text-white overflow-hidden">
            <CardHeader className="p-6 pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 font-headline"><Calendar className="h-4 w-4" /> Özel Zamanlar</CardTitle></CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner"><p className="text-[8px] font-black text-primary-foreground/80 uppercase tracking-widest flex items-center gap-1"><Clock className="h-3 w-3" /> Toplam Süre</p><div className="flex items-end justify-between mt-1"><p className="text-2xl font-black">{daysTogether} Gün</p><p className="text-[8px] font-bold opacity-60 uppercase tracking-tighter">Birliktelik</p></div></div>
              <div className="bg-black/10 p-4 rounded-2xl border border-white/5"><p className="text-[8px] font-black uppercase text-primary-foreground/80 flex items-center gap-1 tracking-widest"><Target className="h-3 w-3" /> Hedef: {nextMilestone.count} Gün</p><div className="mt-2 space-y-1.5"><div className="flex justify-between text-[8px] font-black uppercase opacity-80"><span>{daysTogether}</span><span>{nextMilestone.count}</span></div><Progress value={(daysTogether / (nextMilestone.count || 1)) * 100} className="h-1.5 bg-white/10" /><p className="text-[7px] font-black uppercase text-right tracking-widest mt-1 opacity-80">{nextMilestone.remaining} GÜN KALDI</p></div></div>
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner"><p className="text-[8px] font-black text-primary-foreground/80 uppercase tracking-widest">Sıradaki Özel Gün</p><p className="text-sm font-bold mt-1 uppercase tracking-tight truncate">{nextSpecial.name}</p><div className="flex items-center justify-between mt-2"><Badge className="bg-white text-primary border-none font-black text-[8px] shadow-sm uppercase tracking-tighter">{Math.abs(differenceInDays(nextSpecial.date, new Date()))} GÜN KALDI</Badge><p className="text-[8px] font-bold opacity-60 uppercase">{format(nextSpecial.date, 'dd MMM')}</p></div></div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/10 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-6 pb-2"><CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 font-headline"><ListTodo className="h-4 w-4" /> Aşk Listesi</CardTitle></CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex gap-2"><Input placeholder="Ekle..." value={newBucketItem} onChange={(e) => setNewBucketItem(e.target.value)} className="rounded-xl border-primary/10 font-bold text-[10px] h-10" onKeyDown={(e) => e.key === 'Enter' && handleAddBucketItem()} /><Button size="icon" onClick={handleAddBucketItem} disabled={isAddingBucket} className="bg-primary hover:bg-primary/90 rounded-xl shrink-0 transition-all h-10 w-10 active:scale-90"><Plus className="h-4 w-4" /></Button></div>
              <ScrollArea className="h-[200px] pr-2"><div className="space-y-2">{bucketList && bucketList.length > 0 ? bucketList.map((item) => (<div key={item.id} className={cn("flex items-center gap-2 p-3 rounded-2xl border transition-all animate-in slide-in-from-left", item.completed ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100")}><button onClick={() => toggleBucketItem(item)} className={cn("shrink-0 transition-all active:scale-90", item.completed ? "text-emerald-500" : "text-slate-300")}>{item.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}</button><span className={cn("text-[10px] font-bold flex-1 break-words leading-tight", item.completed ? "text-emerald-700 line-through opacity-60" : "text-slate-700")}>{item.text}</span><AlertDialog><AlertDialogTrigger asChild><button className="text-slate-300 hover:text-destructive transition-all p-1"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger><AlertDialogContent className="rounded-[2rem] border-primary/10"><AlertDialogHeader><AlertDialogTitle className="font-headline font-black">Hedefi Sil?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-xl font-bold">Vazgeç</AlertDialogCancel><AlertDialogAction onClick={() => deleteBucketItem(item.id)} className="bg-destructive text-white rounded-xl font-black">Evet, Sil</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>)) : <div className="text-center py-10 opacity-20"><ListTodo className="h-8 w-8 mx-auto mb-2" /><p className="text-[8px] font-black uppercase tracking-widest">Liste Boş</p></div>}</div></ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedGalleryMedia} onOpenChange={(open) => !open && setSelectedGalleryMedia(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none shadow-none flex items-center justify-center h-[90dvh]">
          <DialogHeader className="sr-only"><DialogTitle>Medya Görüntüleyici</DialogTitle></DialogHeader>
          {selectedGalleryMedia?.type === 'video' ? (
            <video src={selectedGalleryMedia.url} controls autoPlay className="max-w-full max-h-full" />
          ) : (
            <img src={selectedGalleryMedia?.url} alt="Full screen" className="max-w-full max-h-full object-contain animate-in zoom-in duration-300" />
          )}
          <div className="absolute top-4 right-12 flex gap-2">
            {selectedGalleryMedia && (<button onClick={() => handleDownloadMedia(selectedGalleryMedia.url)} className="text-white bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-all active:scale-90"><Download className="h-6 w-6" /></button>)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoveChat({ chatId }: { chatId: string }) {
  const { user: authUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const currentUid = authUser?.uid;

  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingMessage, setReplyingMessage] = useState<any | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [msgToDelete, setMsgToDelete] = useState<any>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherUid = useMemo(() => chatId.split('_').find(id => id !== currentUid), [chatId, currentUid]);
  const otherUserRef = useMemoFirebase(() => db && otherUid ? doc(db, 'users', otherUid) : null, [db, otherUid]);
  const { data: otherUser } = useDoc(otherUserRef);

  const messagesQuery = useMemoFirebase(() => db && chatId ? query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'), limitToLast(100)) : null, [db, chatId]);
  const { data: allMessages } = useCollection(messagesQuery);
  const messages = useMemo(() => allMessages?.filter(m => !m.deletedBy?.includes(currentUid)) || [], [allMessages, currentUid]);

  useEffect(() => {
    if (!db || !chatId || !currentUid || !messages) return;
    const unread = messages.filter(m => m.senderId !== currentUid && !m.isRead && !m.isDeleted);
    if (unread.length > 0) {
      const batch = writeBatch(db);
      unread.forEach(msg => { batch.update(doc(db, 'chats', chatId, 'messages', msg.id), { isRead: true, readAt: serverTimestamp() }); });
      batch.commit().catch(e => console.debug("Mark read failed:", e));
    }
  }, [messages, chatId, currentUid, db]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
    }
  }, [messages]);

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setHighlightedMessageId(msgId); setTimeout(() => setHighlightedMessageId(null), 2000); }
  };

  const isWithinEditTime = (ts: any) => {
    if (!ts) return true;
    const d = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
    return (new Date().getTime() - d.getTime()) / (1000 * 60) < 5;
  };

  const handleSendMessage = async () => {
    if (!db || !chatId || !currentUid || (!messageText.trim() && !selectedImage)) return;
    setIsSending(true);
    if (editingMessageId) {
      updateDocumentNonBlocking(doc(db, 'chats', chatId, 'messages', editingMessageId), { text: messageText.trim(), isEdited: true, updatedAt: serverTimestamp() });
      setEditingMessageId(null);
    } else {
      const msgData: any = { senderId: currentUid, text: messageText.trim(), timestamp: serverTimestamp(), isRead: false, deletedBy: [] };
      if (selectedImage) msgData.imageUrl = selectedImage;
      if (replyingMessage) msgData.replyTo = { messageId: replyingMessage.id, text: replyingMessage.text || '', senderId: replyingMessage.senderId };
      addDocumentNonBlocking(collection(db, 'chats', chatId, 'messages'), msgData);
      setDocumentNonBlocking(doc(db, 'chats', chatId), { 
        lastMessage: selectedImage ? '📷 Görsel' : messageText, 
        lastSenderId: currentUid, 
        updatedAt: serverTimestamp(),
        participants: chatId.split('_')
      }, { merge: true });
    }
    setMessageText(''); setSelectedImage(null); setReplyingMessage(null); setIsSending(false);
  };

  const deleteForMe = (msgId: string) => { if (db && chatId && currentUid) updateDocumentNonBlocking(doc(db, 'chats', chatId, 'messages', msgId), { deletedBy: arrayUnion(currentUid) }); toast({ title: "Mesaj Silindi" }); };
  const deleteForEveryone = (msg: any) => { if (db && chatId && isWithinEditTime(msg.timestamp)) { updateDocumentNonBlocking(doc(db, 'chats', chatId, 'messages', msg.id), { isDeleted: true, text: '', imageUrl: null, updatedAt: serverTimestamp() }); setIsDeleteDialogOpen(false); setMsgToDelete(null); } };
  const handleReaction = (msgId: string, emoji: string) => { if (!db || !chatId || !currentUid) return; const msg = messages.find(m => m.id === msgId); const currentReaction = msg?.reactions?.[currentUid]; const updateData = { [`reactions.${currentUid}`]: currentReaction === emoji ? deleteField() : emoji }; updateDocumentNonBlocking(doc(db, 'chats', chatId, 'messages', msgId), updateData); setOpenMenuId(null); };

  return (
    <div className="flex flex-col h-full bg-primary/5">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.map((msg) => {
            const isOutgoing = msg.senderId === currentUid;
            const canEdit = isWithinEditTime(msg.timestamp);
            const isHighlighted = highlightedMessageId === msg.id;
            return (
              <div key={msg.id} id={`msg-${msg.id}`} className={cn("flex flex-col max-w-[85%] transition-all animate-in slide-in-from-bottom-2", isOutgoing ? "ml-auto items-end" : "mr-auto items-start", isHighlighted && "ring-4 ring-primary/20 bg-primary/5 rounded-2xl")}>
                <DropdownMenu open={openMenuId === msg.id} onOpenChange={(open) => !open && setOpenMenuId(null)}>
                  <DropdownMenuTrigger asChild>
                    <div onContextMenu={(e) => { e.preventDefault(); if (!msg.isDeleted) setOpenMenuId(msg.id); }} className={cn("px-4 py-2 rounded-2xl text-xs md:text-sm font-medium shadow-md break-words relative transition-all cursor-pointer select-none", isOutgoing ? "bg-gradient-to-br from-primary to-accent text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-primary/5", msg.isDeleted && "italic opacity-60 bg-primary/5 text-primary/40 shadow-none scale-95")}>
                      {msg.isDeleted ? ( <span className="flex items-center gap-1.5"><Trash2 className="h-3 w-3" /> Silindi</span> ) : (
                        <>
                          {msg.replyTo && ( <div onClick={(e) => { e.stopPropagation(); scrollToMessage(msg.replyTo.messageId); }} className="mb-2 p-2 rounded-lg border-l-4 border-primary/30 bg-black/5 text-[9px] opacity-80 cursor-pointer transition-colors hover:bg-black/10"><p className="font-black uppercase tracking-widest">{msg.replyTo.senderId === currentUid ? 'Sen' : (otherUser?.username || 'Partner')}</p><p className="italic truncate">{msg.replyTo.text || "📷 Görsel"}</p></div> )}
                          {msg.imageUrl && ( <div className="relative w-48 max-full rounded-lg overflow-hidden mb-2 shadow-sm group"><img src={msg.imageUrl} alt="Görsel" className="w-full h-auto" /><button onClick={(e) => { e.stopPropagation(); handleDownloadMedia(msg.imageUrl); }} className="absolute bottom-1 right-1 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Download className="h-3 w-3" /></button></div> )}
                          {msg.text && <p className="break-all whitespace-pre-wrap text-left leading-relaxed">{msg.text}</p>}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && ( <div className={cn("absolute -bottom-2 flex gap-0.5 z-10", isOutgoing ? "left-0" : "right-0")}>{Array.from(new Set(Object.values(msg.reactions) as string[])).map((emoji, i) => ( <span key={i} className="bg-white border border-primary/10 rounded-full px-1 py-0.5 text-[8px] shadow-sm animate-in zoom-in">{emoji}</span> ))}</div> )}
                          <div className="flex justify-end items-center gap-1 mt-1 opacity-60">
                            {msg.isEdited && <span className="text-[7px] font-black uppercase tracking-tighter">(Dzn)</span>}
                            <span className="text-[7px] font-bold">{msg.timestamp ? format(msg.timestamp.toDate(), 'HH:mm') : '...'}</span>
                            {isOutgoing && (msg.isRead ? <CheckCheck className="h-2.5 w-2.5 text-sky-200" /> : <Check className="h-2.5 w-2.5 opacity-50" />)}
                          </div>
                        </>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  {!msg.isDeleted && (
                    <DropdownMenuContent className="w-48 font-bold border-primary/10" align={isOutgoing ? "end" : "start"}>
                      <div className="flex items-center justify-around p-2 gap-1 border-b mb-1"><button onClick={() => handleReaction(msg.id, '❤️')} className="hover:scale-125 transition-transform text-lg">❤️</button><button onClick={() => handleReaction(msg.id, '😂')} className="hover:scale-125 transition-transform text-lg">😂</button><button onClick={() => handleReaction(msg.id, '🔥')} className="hover:scale-125 transition-transform text-lg">🔥</button><button onClick={() => handleReaction(msg.id, '👍')} className="hover:scale-125 transition-transform text-lg">👍</button></div>
                      <DropdownMenuItem onClick={() => setReplyingMessage(msg)} className="text-[10px] uppercase tracking-wider"><MessageSquare className="h-3 w-3 mr-2" /> Cevapla</DropdownMenuItem>
                      {msg.imageUrl && ( <DropdownMenuItem onClick={() => handleDownloadMedia(msg.imageUrl)} className="text-[10px] uppercase tracking-wider"><Download className="h-3 w-3 mr-2" /> İndir</DropdownMenuItem> )}
                      {isOutgoing && ( <><DropdownMenuItem disabled={!canEdit} onClick={() => { setEditingMessageId(msg.id); setMessageText(msg.text || ''); }} className="text-[10px] uppercase tracking-wider">{canEdit ? <><Pencil className="h-3 w-3 mr-2" /> Düzenle</> : <><Lock className="h-3 w-3 mr-2" /> Kilitli</>}</DropdownMenuItem><DropdownMenuItem className="text-destructive text-[10px] uppercase tracking-wider" disabled={!canEdit} onClick={() => { setMsgToDelete(msg); setIsDeleteDialogOpen(true); }}>{canEdit ? <><Trash2 className="h-3 w-3 mr-2" /> Herkesten Sil</> : <><Lock className="h-3 w-3 mr-2" /> Kilitli</>}</DropdownMenuItem></> )}
                      <DropdownMenuItem onClick={() => deleteForMe(msg.id)} className="text-[10px] uppercase tracking-wider"><XCircle className="h-3 w-3 mr-2" /> Benden Sil</DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-primary/10 bg-white">
        {editingMessageId && ( <div className="flex items-center justify-between p-2 mb-2 bg-primary/5 rounded-lg text-[8px] font-black uppercase text-primary tracking-widest animate-in slide-in-from-top"><span>Düzenleniyor...</span><button onClick={() => { setEditingMessageId(null); setMessageText(''); }} className="bg-primary/10 rounded-full p-0.5"><X className="h-2 w-2" /></button></div> )}
        {replyingMessage && ( <div className="flex items-center justify-between p-2 mb-2 bg-slate-50 rounded-lg text-[8px] font-black uppercase text-slate-600 tracking-widest animate-in slide-in-from-top"><span>{replyingMessage.senderId === currentUid ? 'Sen' : 'Partner'}: {replyingMessage.text?.substring(0, 15)}...</span><button onClick={() => setReplyingMessage(null)} className="bg-slate-200 rounded-full p-0.5"><X className="h-2 w-2" /></button></div> )}
        {selectedImage && ( <div className="relative w-16 h-16 mb-2 animate-in zoom-in"><img src={selectedImage} alt="preview" className="w-full h-full object-cover rounded-lg border border-primary/20" /><button className="absolute -top-1 -right-1 h-4 w-4 bg-black text-white rounded-full p-0.5" onClick={() => setSelectedImage(null)}><X className="h-3 w-3" /></button></div> )}
        <div className="flex items-end gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = async () => setSelectedImage(await processHighResImage(r.result as string)); r.readAsDataURL(f); } }} />
          {!editingMessageId && ( <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-primary hover:bg-primary/5 rounded-xl border border-primary/5" onClick={() => fileInputRef.current?.click()}><ImageIcon className="h-5 w-5" /></Button> )}
          <Textarea placeholder="Bir şeyler yaz..." value={messageText} onChange={(e) => setMessageText(e.target.value)} className="min-h-[40px] h-10 py-2.5 rounded-xl resize-none border-primary/10 text-xs font-bold focus-visible:ring-primary shadow-none" onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} />
          <Button size="icon" onClick={handleSendMessage} disabled={isSending || (!messageText.trim() && !selectedImage)} className="bg-primary h-10 w-10 shrink-0 rounded-xl shadow-lg shadow-primary/20 active:scale-90 transition-all">{isSending ? <Loader2 className="animate-spin h-4 w-4" /> : (editingMessageId ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />)}</Button>
        </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] border-primary/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-black">Mesajı Sil?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-600">Bu mesaj herkesten silinecek. Bu işlem geri alınamaz.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={() => msgToDelete && deleteForEveryone(msgToDelete)} className="bg-destructive text-white rounded-xl font-black">Evet, Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
