
"use client";

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Zap, Coins, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ClickerGame() {
  const { addTokens, addExp } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(10);
    setIsPlaying(true);
  };

  const endGame = () => {
    setIsPlaying(false);
    const reward = Math.floor(score / 10);
    if (reward > 0) {
      addTokens(reward);
      addExp(reward);
    }
  };

  const handleClick = () => {
    if (isPlaying) setScore(s => s + 1);
  };

  return (
    <Card className="border-accent/40 shadow-lg overflow-hidden">
      <CardContent className="p-8 flex flex-col items-center space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-headline">Hızlı Tıklayıcı</h2>
          <p className="text-muted-foreground">10 saniyede ne kadar tıklayabilirsin? (Ücretsiz)</p>
        </div>

        <div className="flex gap-8">
          <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-bold">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
            <Zap className="h-4 w-4 text-accent" />
            <span className="font-bold">{score}</span>
          </div>
        </div>

        {!isPlaying ? (
          <Button size="lg" className="w-full h-16 text-xl bg-accent hover:bg-accent/90" onClick={startGame}>
            Hadi Başlayalım!
          </Button>
        ) : (
          <button
            onClick={handleClick}
            className="w-48 h-48 rounded-full bg-accent text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center space-y-2 border-8 border-white"
          >
            <Zap className="h-12 w-12 fill-white" />
            <span className="text-2xl font-black">TIKLA!</span>
          </button>
        )}

        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Coins className="h-3 w-3" /> Her 10 tıklama = 1 Jeton
        </div>
      </CardContent>
    </Card>
  );
}
