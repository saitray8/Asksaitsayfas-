"use client";

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Target, Coins, CheckCircle2, Trophy, Settings2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOTAL_NUMBERS = 80;
const DRAW_COUNT = 22;

const REWARD_TABLES: Record<number, Record<number, number>> = {
  4: { 4: 150, 3: 50, 2: 15 },
  5: { 5: 300, 4: 100, 3: 25 },
  6: { 6: 600, 5: 200, 4: 75, 3: 20 },
  7: { 7: 1200, 6: 400, 5: 150, 4: 50, 3: 15 },
  8: { 8: 2500, 7: 800, 6: 300, 5: 100, 4: 40 },
  9: { 9: 5000, 8: 1500, 7: 600, 6: 250, 5: 100, 0: 50 },
  10: { 10: 10000, 9: 3000, 8: 1000, 7: 400, 6: 150, 5: 50, 0: 100 }
};

export function OnNumaraGame() {
  const { spendTokens, addTokens, addExp } = useGame();
  const [targetPickCount, setTargetPickCount] = useState<number>(10);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBall, setCurrentBall] = useState<number | null>(null);
  const [result, setResult] = useState<{ matches: number; reward: number } | null>(null);

  const toggleNumber = (num: number) => {
    if (isDrawing || result) return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else if (selectedNumbers.length < targetPickCount) {
      setSelectedNumbers(prev => [...prev, num]);
    }
  };

  const quickPick = () => {
    const randoms: number[] = [];
    while (randoms.length < targetPickCount) {
      const r = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
      if (!randoms.includes(r)) randoms.push(r);
    }
    setSelectedNumbers(randoms);
  };

  const startDraw = () => {
    if (selectedNumbers.length !== targetPickCount || !spendTokens(10)) return;

    setIsDrawing(true);
    setResult(null);
    setDrawnNumbers([]);
    setCurrentBall(null);

    const drawn: number[] = [];
    let count = 0;
    
    const interval = setInterval(() => {
      let r;
      do {
        r = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
      } while (drawn.includes(r));
      
      drawn.push(r);
      setDrawnNumbers([...drawn]);
      setCurrentBall(r);
      count++;

      if (count === DRAW_COUNT) {
        clearInterval(interval);
        setTimeout(() => {
          calculateResult(drawn);
          setCurrentBall(null);
        }, 500);
      }
    }, 120);
  };

  const calculateResult = (finalDrawn: number[]) => {
    const matchesCount = selectedNumbers.filter(n => finalDrawn.includes(n)).length;
    const table = REWARD_TABLES[targetPickCount];
    
    let reward = 0;
    if (matchesCount === 0 && (targetPickCount === 9 || targetPickCount === 10)) {
      reward = table[0];
    } else {
      reward = table[matchesCount] || 0;
    }

    if (reward > 0) {
      addTokens(reward);
      addExp(reward * 2);
    }

    setResult({ matches: matchesCount, reward });
    setIsDrawing(false);
  };

  const resetGame = () => {
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setResult(null);
  };

  const currentRewards = REWARD_TABLES[targetPickCount];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 md:space-y-6">
      <Card className="border-none shadow-2xl overflow-hidden bg-white/90 backdrop-blur-xl ring-1 ring-black/5 rounded-[1.5rem] md:rounded-[2.5rem]">
        <CardHeader className="text-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white pb-8 md:pb-10 pt-6 md:pt-10">
          <CardTitle className="text-2xl md:text-4xl font-black font-headline tracking-tight uppercase">
            On Numara
          </CardTitle>
          <p className="text-[10px] md:text-sm font-bold opacity-90 mt-1 uppercase tracking-widest">Seç ve Kazan!</p>
        </CardHeader>
        
        <CardContent className="p-3 md:p-10 space-y-6 md:space-y-10 -mt-4 rounded-[1.5rem] md:rounded-[2.5rem] bg-white">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
               <div className="flex items-center justify-between px-2">
                 <h4 className="font-black text-slate-700 text-sm md:text-base flex items-center gap-2">
                   {selectedNumbers.length} / {targetPickCount} Seçildi
                 </h4>
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={quickPick} disabled={isDrawing || !!result} className="h-8 md:h-10 text-[10px] md:text-xs font-black rounded-lg">OTO</Button>
                   <Button variant="ghost" size="sm" onClick={() => setSelectedNumbers([])} disabled={isDrawing || !!result} className="h-8 md:h-10 text-[10px] md:text-xs font-black rounded-lg text-destructive">SİL</Button>
                 </div>
               </div>
               
               <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 md:gap-2 p-2 md:p-4 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100">
                {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(num => {
                  const isSelected = selectedNumbers.includes(num);
                  const isDrawn = drawnNumbers.includes(num);
                  const isMatch = isSelected && isDrawn;

                  return (
                    <button
                      key={num}
                      disabled={isDrawing || result !== null}
                      onClick={() => toggleNumber(num)}
                      className={cn(
                        "h-8 sm:h-10 w-full rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all border relative",
                        isSelected 
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md z-10" 
                          : "bg-white border-slate-200 text-slate-400",
                        isDrawn && !isMatch && "ring-2 ring-amber-400 ring-offset-1",
                        isMatch && "bg-amber-500 border-amber-500 text-white animate-bounce",
                        isDrawing && isDrawn && "animate-pulse"
                      )}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-500">Adet Seçimi</span>
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs font-black">{targetPickCount}</span>
                </div>
                <Slider 
                  disabled={isDrawing || selectedNumbers.length > 0}
                  value={[targetPickCount]} 
                  onValueChange={(val) => setTargetPickCount(val[0])}
                  min={4} max={10} step={1}
                />
              </div>

              {result ? (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-4 md:p-6 rounded-2xl text-center animate-in zoom-in">
                  <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="text-xl md:text-2xl font-black text-emerald-800">{result.matches} İSABET</h3>
                  <p className="text-xs md:text-base text-emerald-600 font-bold mb-4">
                    {result.reward > 0 ? `+${result.reward} Jeton!` : "Bol şans!"}
                  </p>
                  <Button onClick={resetGame} className="w-full font-black bg-emerald-600 h-10 md:h-12 rounded-xl">TEKRAR</Button>
                </div>
              ) : isDrawing ? (
                <div className="bg-amber-500 text-white h-24 md:h-32 w-full rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-black shadow-lg animate-pulse border-4 border-white">
                  {currentBall || '...'}
                </div>
              ) : (
                <Button 
                  onClick={startDraw} 
                  disabled={selectedNumbers.length !== targetPickCount}
                  className="w-full h-14 md:h-16 text-lg md:text-xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl rounded-xl md:rounded-2xl"
                >
                  <Coins className="mr-2" /> OYNA
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
