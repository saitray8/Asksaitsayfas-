
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Coins, Play, RotateCcw, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Block {
  x: number;
  width: number;
  color: string;
}

interface FallingPiece extends Block {
  id: number;
  bottom: number;
}

const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 
  'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500'
];

export function StackGame() {
  const { spendTokens, addTokens, addExp } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [stack, setStack] = useState<Block[]>([]);
  const [movingBlock, setMovingBlock] = useState({ x: 0, width: 60, direction: 1 });
  const [fallingPieces, setFallingPieces] = useState<FallingPiece[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);

  const startNewGame = () => {
    if (!spendTokens(5)) return;
    setScore(0);
    setIsGameOver(false);
    setStack([{ x: 20, width: 60, color: 'bg-slate-800' }]);
    setMovingBlock({ x: 0, width: 60, direction: 1 });
    setFallingPieces([]);
    setIsPlaying(true);
  };

  const handlePlace = useCallback(() => {
    if (!isPlaying || isGameOver) return;

    const lastBlock = stack[stack.length - 1];
    const leftBound = lastBlock.x;
    const rightBound = lastBlock.x + lastBlock.width;
    
    const blockLeft = movingBlock.x;
    const blockRight = movingBlock.x + movingBlock.width;

    // Calculate overlap
    const newLeft = Math.max(leftBound, blockLeft);
    const newRight = Math.min(rightBound, blockRight);
    const newWidth = newRight - newLeft;

    if (newWidth <= 0) {
      // Piece falls entirely
      const fallingPiece: FallingPiece = {
        id: Date.now(),
        x: movingBlock.x,
        width: movingBlock.width,
        color: COLORS[stack.length % COLORS.length],
        bottom: Math.min(stack.length, 8) * 34
      };
      setFallingPieces(prev => [...prev, fallingPiece]);
      setTimeout(() => {
        setFallingPieces(prev => prev.filter(p => p.id !== fallingPiece.id));
      }, 1000);
      
      endGame();
      return;
    }

    // Calculate overhang for effect
    let overhang: { x: number, width: number } | null = null;
    if (blockLeft < leftBound) {
      overhang = { x: blockLeft, width: leftBound - blockLeft };
    } else if (blockRight > rightBound) {
      overhang = { x: rightBound, width: blockRight - rightBound };
    }

    if (overhang) {
      const fallingPiece: FallingPiece = {
        id: Date.now(),
        ...overhang,
        color: COLORS[stack.length % COLORS.length],
        bottom: Math.min(stack.length, 8) * 34
      };
      setFallingPieces(prev => [...prev, fallingPiece]);
      setTimeout(() => {
        setFallingPieces(prev => prev.filter(p => p.id !== fallingPiece.id));
      }, 1000);
    }

    const nextColor = COLORS[stack.length % COLORS.length];
    const newBlock: Block = { x: newLeft, width: newWidth, color: nextColor };
    
    setStack(prev => [...prev, newBlock]);
    setScore(s => s + 1);
    
    // Reset moving block for next round
    setMovingBlock({
      x: movingBlock.direction === 1 ? 0 : 100 - newWidth,
      width: newWidth,
      direction: movingBlock.direction
    });
  }, [stack, movingBlock, isPlaying, isGameOver]);

  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    const reward = Math.floor(score / 2);
    if (reward > 0) {
      addTokens(reward);
      addExp(reward * 5);
    }
  };

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const moveBlock = () => {
      setMovingBlock(prev => {
        const speed = 0.5 + (score * 0.05); 
        let newX = prev.x + (prev.direction * speed);
        let newDir = prev.direction;

        if (newX + prev.width > 100) {
          newX = 100 - prev.width;
          newDir = -1;
        } else if (newX < 0) {
          newX = 0;
          newDir = 1;
        }

        return { ...prev, x: newX, direction: newDir };
      });
      requestRef.current = requestAnimationFrame(moveBlock);
    };

    requestRef.current = requestAnimationFrame(moveBlock);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlace]);

  return (
    <Card className="max-w-md mx-auto border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="text-center bg-indigo-600 text-white pb-6">
        <CardTitle className="text-3xl font-black font-headline flex items-center justify-center gap-2">
          <Box className="h-8 w-8" /> BLOK KULESİ
        </CardTitle>
        <div className="flex justify-between items-center mt-4 bg-white/20 px-4 py-2 rounded-xl">
           <span className="text-xs font-black uppercase tracking-widest">SKOR: {score}</span>
           <span className="text-xs font-black uppercase tracking-widest">EN YÜKSEK: {Math.max(score, 0)}</span>
        </div>
      </CardHeader>

      <CardContent className="p-6 relative">
        {!isPlaying && !isGameOver ? (
          <div className="py-12 text-center space-y-6">
            <div className="bg-indigo-50 p-6 rounded-[2.5rem] inline-block mb-4">
              <Box className="h-16 w-16 text-indigo-600 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Kuleyi Yükselt!</h3>
              <p className="text-slate-500 font-medium text-sm mt-2">Zamanlamanı kullan, blokları üst üste diz. (Giriş: 5 Jeton)</p>
            </div>
            <Button onClick={startNewGame} className="w-full h-16 text-xl font-black bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xl transition-all">
              OYUNA BAŞLA
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div 
              ref={containerRef}
              onClick={handlePlace}
              className="relative h-[400px] bg-slate-100 rounded-[2rem] border-4 border-white shadow-inner overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-x-0 bottom-0 flex flex-col-reverse items-start p-1 h-full">
                {/* Fixed Stack */}
                {stack.slice(-8).map((block, idx) => (
                  <div 
                    key={idx}
                    className={cn("h-8 rounded-md mb-0.5 shadow-sm transition-all duration-300", block.color)}
                    style={{ 
                      width: `${block.width}%`,
                      marginLeft: `${block.x}%`
                    }}
                  />
                ))}
                
                {/* Moving Block */}
                {!isGameOver && isPlaying && (
                  <div 
                    className={cn("h-8 rounded-md absolute shadow-lg border-2 border-white/50", COLORS[stack.length % COLORS.length])}
                    style={{ 
                      width: `${movingBlock.width}%`,
                      left: `${movingBlock.x}%`,
                      bottom: `${Math.min(stack.length, 8) * 34}px`
                    }}
                  />
                )}

                {/* Falling Pieces */}
                {fallingPieces.map((piece) => (
                  <div
                    key={piece.id}
                    className={cn("h-8 rounded-md absolute animate-fall-away", piece.color)}
                    style={{
                      width: `${piece.width}%`,
                      left: `${piece.x}%`,
                      bottom: `${piece.bottom}px`
                    }}
                  />
                ))}
              </div>

              {!isGameOver && (
                <div className="absolute top-4 left-0 right-0 text-center animate-pulse pointer-events-none">
                  <span className="bg-white/80 backdrop-blur px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100 shadow-sm">
                    Tıkla veya BOŞLUK Tuşuna Bas!
                  </span>
                </div>
              )}

              {isGameOver && (
                <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                  <Trophy className="h-12 w-12 text-yellow-400 mb-4" />
                  <h2 className="text-4xl font-black text-white">OYUN BİTTİ</h2>
                  <p className="text-indigo-100 font-bold mt-2">Kule Yüksekliği: {score}</p>
                  <div className="mt-6 bg-white/20 px-6 py-3 rounded-2xl flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-black">+{Math.floor(score / 2)} Jeton</span>
                  </div>
                  <Button onClick={startNewGame} className="mt-8 bg-white text-indigo-600 hover:bg-indigo-50 font-black h-14 px-10 rounded-2xl text-lg shadow-2xl">
                    <RotateCcw className="mr-2" /> TEKRAR DENE
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
              <span className="flex items-center gap-1"><Play className="h-3 w-3" /> Zamanlama Her Şeydir</span>
              <span className="flex items-center gap-1"><Coins className="h-3 w-3" /> Her 2 Kat = 1 Jeton</span>
            </div>
          </div>
        )}
      </CardContent>
      <style jsx global>{`
        @keyframes fall-away {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(500px) rotate(20deg); opacity: 0; }
        }
        .animate-fall-away {
          animation: fall-away 0.8s forwards ease-in;
          z-index: 5;
        }
      `}</style>
    </Card>
  );
}
