
"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useGame } from '@/context/GameContext';
import { readCoffeeFortune, CoffeeFortuneOutput } from '@/ai/flows/read-coffee-fortune';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, Camera, Sparkles, Wand2, Loader2, X, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function CoffeeFortune() {
  const { spendTokens, addExp } = useGame();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [fortuneResult, setFortuneResult] = useState<CoffeeFortuneOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 3) {
      toast({
        variant: "destructive",
        title: "Sınır Aşıldı",
        description: "En fazla 3 fotoğraf yükleyebilirsiniz.",
      });
      return;
    }

    Array.from(files).forEach(file => {
      // 2MB limit per file, total will be around 6-8MB with base64 overhead
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Dosya Çok Büyük",
          description: `${file.name} 2MB'dan büyük olamaz. Lütfen daha küçük bir dosya seçin.`,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleReadFortune = async () => {
    if (images.length === 0) {
      toast({
        variant: "destructive",
        title: "Fotoğraf Eksik",
        description: "Lütfen en az bir fincan fotoğrafı yükle.",
      });
      return;
    }

    if (!spendTokens(20)) return;

    setIsReading(true);
    setFortuneResult(null);

    try {
      const result = await readCoffeeFortune({ photoDataUris: images });
      setFortuneResult(result);
      addExp(50);
      toast({
        title: "Falın Hazır!",
        description: "Gizemli falın yorumlandı, okumaya başlayabilirsin.",
      });
    } catch (error) {
      console.error("Coffee Fortune Error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Sezgilerim şu an kapalı. Lütfen internet bağlantını ve fotoğrafları kontrol edip tekrar dene.",
      });
    } finally {
      setIsReading(false);
    }
  };

  const resetFortune = () => {
    setImages([]);
    setFortuneResult(null);
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden animate-in fade-in duration-500">
      <div className="h-48 bg-gradient-to-br from-amber-900 to-amber-700 flex flex-col items-center justify-center text-white relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center" />
        <Coffee className="h-20 w-20 mb-2 relative z-10" />
        <h2 className="text-3xl font-black font-headline relative z-10">Mistik Kahve Falı</h2>
        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mt-2 relative z-10">AI Destekli Sezgiler</Badge>
      </div>

      <CardContent className="p-6 md:p-8 space-y-6">
        {!fortuneResult ? (
          <div className="space-y-6">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-800">
                Kahve içildikten sonra kapatılan fincanının içini ve tabağını net bir şekilde fotoğrafla. <strong>Her biri 2MB'dan küçük</strong> en fazla 3 görsel yükleyebilirsin.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-amber-200 group">
                  <Image src={img} alt={`Fincan ${idx + 1}`} fill className="object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-amber-200 flex flex-col items-center justify-center text-amber-400 hover:border-amber-400 hover:text-amber-600 transition-all bg-amber-50/30"
                >
                  <Camera className="h-8 w-8 mb-1" />
                  <span className="text-[10px] font-black uppercase">Ekle</span>
                </button>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
            />

            <Button
              onClick={handleReadFortune}
              disabled={isReading || images.length === 0}
              className="w-full h-16 text-xl font-black bg-amber-800 hover:bg-amber-900 rounded-2xl shadow-xl shadow-amber-900/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isReading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  TELVELER OKUNUYOR...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-6 w-6" />
                  FALIMA BAK (20 JETON)
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-amber-600" />
                <h3 className="text-xl font-black text-slate-800">Sezgisel Yorumun</h3>
              </div>
              <Badge className={cn("font-black uppercase tracking-widest", `bg-${fortuneResult.auraColor}-500 text-white border-none`)}>
                {fortuneResult.auraColor} Enerji
              </Badge>
            </div>

            <ScrollArea className="h-[400px] w-full rounded-2xl border border-amber-100 bg-amber-50/20 p-6">
              <div className="prose prose-amber max-w-none">
                <p className="text-slate-700 font-medium leading-relaxed italic whitespace-pre-wrap">
                  {fortuneResult.fortune}
                </p>
              </div>
            </ScrollArea>

            <div className="space-y-3">
              <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Beliren Semboller
              </h4>
              <div className="flex flex-wrap gap-2">
                {fortuneResult.symbols.map((symbol, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-amber-100 text-amber-800 font-bold border-amber-200">
                    {symbol}
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              onClick={resetFortune} 
              variant="outline" 
              className="w-full h-12 border-amber-200 text-amber-800 font-black hover:bg-amber-50"
            >
              YENİ FAL KAPAT
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
