
"use client";

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart, Ghost, Rocket, Gift, Coffee, Cloud, Music } from 'lucide-react';

const ICONS = [Star, Heart, Ghost, Rocket, Gift, Coffee, Cloud, Music];

export function MemoryGame() {
  const { spendTokens, addTokens, addExp } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [cards, setCards] = useState<{ id: number; iconIdx: number; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const initGame = () => {
    if (!spendTokens(5)) return;
    
    const gameIcons = [...Array(ICONS.length).keys(), ...Array(ICONS.length).keys()];
    const shuffled = gameIcons
      .sort(() => Math.random() - 0.5)
      .map((iconIdx, id) => ({ id, iconIdx, flipped: false, matched: false }));
    
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setIsPlaying(true);
  };

  const handleCardClick = (idx: number) => {
    if (!isPlaying || cards[idx].flipped || cards[idx].matched || flippedIndices.length === 2) return;

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);
    
    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].iconIdx === cards[second].iconIdx) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setFlippedIndices([]);
        
        if (newCards.every(c => c.matched)) {
          setTimeout(() => endGame(true), 500);
        }
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const endGame = (won: boolean) => {
    setIsPlaying(false);
    if (won) {
      const reward = Math.max(5, 20 - Math.floor(moves / 2));
      addTokens(reward);
      addExp(reward * 3);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-headline">Hafıza Kartları</h2>
          <p className="text-sm text-muted-foreground">Eşleşen ikonları bul! (Giriş: 5 Jeton)</p>
        </div>
        {isPlaying && (
          <div className="bg-primary text-white px-4 py-2 rounded-lg font-bold">
            Hamle: {moves}
          </div>
        )}
      </div>

      {!isPlaying ? (
        <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center space-y-4">
          <Star className="h-16 w-16 text-primary animate-pulse" />
          <Button size="lg" onClick={initGame}>Oyunu Başlat</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          {cards.map((card, idx) => {
            const Icon = ICONS[card.iconIdx];
            return (
              <div
                key={card.id}
                className="aspect-square cursor-pointer perspective-1000"
                onClick={() => handleCardClick(idx)}
              >
                <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${card.flipped || card.matched ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 bg-primary rounded-xl shadow-md border-4 border-white flex items-center justify-center backface-hidden">
                    <span className="text-white text-2xl font-bold">?</span>
                  </div>
                  <div className="absolute inset-0 bg-white rounded-xl shadow-md border-4 border-primary/20 flex items-center justify-center rotate-y-180 backface-hidden">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
