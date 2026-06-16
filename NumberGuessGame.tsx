
"use client";

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash, HelpCircle, Trophy, AlertCircle } from 'lucide-react';

export function NumberGuessGame() {
  const { spendTokens, addTokens, addExp } = useGame();
  const [target, setTarget] = useState<number | null>(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const startGame = () => {
    if (!spendTokens(5)) return;
    setTarget(Math.floor(Math.random() * 100) + 1);
    setAttempts(0);
    setFeedback(null);
    setIsGameOver(false);
    setGuess('');
  };

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || isGameOver) return;

    const numGuess = parseInt(guess);
    if (isNaN(numGuess)) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (numGuess === target) {
      const reward = Math.max(5, 50 - newAttempts * 5);
      addTokens(reward);
      addExp(reward * 2);
      setFeedback(`TEBRİKLER! ${target} sayısını ${newAttempts} hamlede buldun!`);
      setIsGameOver(true);
    } else if (newAttempts >= 10) {
      setFeedback(`Oyun Bitti! Sayı ${target} idi.`);
      setIsGameOver(true);
    } else if (numGuess < target) {
      setFeedback('Daha YÜKSEK bir sayı dene! ⬆️');
    } else {
      setFeedback('Daha DÜŞÜK bir sayı dene! ⬇️');
    }
    setGuess('');
  };

  return (
    <Card className="border-accent/20 shadow-xl max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-black font-headline text-accent">
          <Hash className="h-6 w-6" />
          Sayı Tahmin
        </CardTitle>
        <p className="text-muted-foreground text-sm">1-100 arası sayıyı bul. (Giriş: 5 Jeton)</p>
      </CardHeader>
      <CardContent className="space-y-6 pb-8">
        {!target || isGameOver ? (
          <div className="text-center space-y-4">
            {isGameOver && (
              <div className="p-4 bg-secondary rounded-lg mb-4 animate-in fade-in slide-in-from-bottom-2">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-bold">{feedback}</p>
              </div>
            )}
            <Button size="lg" className="w-full font-bold bg-accent hover:bg-accent/90" onClick={startGame}>
              {isGameOver ? 'Tekrar Oyna' : 'Oyunu Başlat'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleGuess} className="space-y-4">
            <div className="flex justify-between text-sm font-bold text-muted-foreground">
              <span>Hamle: {attempts}/10</span>
              <span>1-100 Arası</span>
            </div>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Tahminini yaz..." 
                value={guess} 
                onChange={(e) => setGuess(e.target.value)}
                min="1"
                max="100"
                className="text-lg h-12"
                autoFocus
              />
              <Button type="submit" className="bg-accent h-12 px-8 font-bold">Dene</Button>
            </div>
            {feedback && (
              <div className="flex items-center gap-2 p-3 bg-accent/10 text-accent rounded-lg border border-accent/20 animate-in slide-in-from-left-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-bold">{feedback}</p>
              </div>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
