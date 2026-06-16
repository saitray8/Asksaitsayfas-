
"use client";

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Star, Zap, Crown, RotateCw, Coins } from 'lucide-react';

const SYMBOLS = [
  { icon: Star, color: 'text-yellow-500', value: 10 },
  { icon: Zap, color: 'text-blue-500', value: 20 },
  { icon: Crown, color: 'text-purple-500', value: 50 },
  { icon: Sparkles, color: 'text-pink-500', value: 5 },
];

export function SlotMachine() {
  const { spendTokens, addTokens, addExp } = useGame();
  const [reels, setReels] = useState([0, 1, 2]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const spin = () => {
    if (isSpinning || !spendTokens(10)) return;

    setIsSpinning(true);
    setResult(null);

    const spinInterval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      const finalReels = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ];
      setReels(finalReels);
      setIsSpinning(false);
      calculateWin(finalReels);
    }, 2000);
  };

  const calculateWin = (finalReels: number[]) => {
    const [r1, r2, r3] = finalReels;
    
    if (r1 === r2 && r2 === r3) {
      const win = SYMBOLS[r1].value * 5;
      addTokens(win);
      addExp(win);
      setResult(`BÜYÜK İKRAMİYE! ${win} Jeton kazandın!`);
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      const matchIdx = r1 === r2 ? r1 : r3;
      const win = SYMBOLS[matchIdx].value;
      addTokens(win);
      addExp(Math.floor(win / 2));
      setResult(`Küçük Kazanç! ${win} Jeton kazandın!`);
    } else {
      setResult('Maalesef, tekrar dene!');
    }
  };

  return (
    <Card className="border-primary/20 shadow-xl max-w-md mx-auto overflow-hidden">
      <CardContent className="p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-black font-headline text-primary">Şans Slotu</h2>
          <p className="text-muted-foreground text-sm">Giriş: 10 Jeton</p>
        </div>

        <div className="flex justify-center gap-4 bg-secondary/50 p-6 rounded-2xl border-4 border-primary/10">
          {reels.map((symbolIdx, i) => {
            const SymbolIcon = SYMBOLS[symbolIdx].icon;
            return (
              <div key={i} className={`bg-white h-24 w-20 rounded-xl flex items-center justify-center shadow-inner border-b-4 border-muted transition-all ${isSpinning ? 'animate-bounce' : ''}`}>
                <SymbolIcon className={`h-12 w-12 ${SYMBOLS[symbolIdx].color}`} />
              </div>
            );
          })}
        </div>

        <div className="text-center h-8">
          {result && <p className="font-bold text-primary animate-in fade-in zoom-in">{result}</p>}
        </div>

        <Button 
          size="lg" 
          className="w-full h-16 text-xl font-black gap-2" 
          onClick={spin}
          disabled={isSpinning}
        >
          {isSpinning ? <RotateCw className="animate-spin h-6 w-6" /> : <Coins className="h-6 w-6" />}
          {isSpinning ? 'Çevriliyor...' : 'ÇEVİR!'}
        </Button>

        <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground font-bold">
          <div className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> 3x Star = 50 Jeton</div>
          <div className="flex items-center gap-1"><Zap className="h-3 w-3 text-blue-500" /> 3x Zap = 100 Jeton</div>
          <div className="flex items-center gap-1"><Crown className="h-3 w-3 text-purple-500" /> 3x Crown = 250 Jeton</div>
          <div className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-pink-500" /> 3x Spark = 25 Jeton</div>
        </div>
      </CardContent>
    </Card>
  );
}
