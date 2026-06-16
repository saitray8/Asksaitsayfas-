
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCw, Coins, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Grid = (number | null)[][];

export function Game2048() {
  const { spendTokens, addTokens, addExp } = useGame();
  const [grid, setGrid] = useState<Grid>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const initGame = useCallback(() => {
    if (!spendTokens(5)) return;

    let newGrid: Grid = Array(4).fill(null).map(() => Array(4).fill(null));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  }, [spendTokens]);

  function addRandomTile(currentGrid: Grid): Grid {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === null) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentGrid;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = [...currentGrid.map(row => [...row])];
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  }

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!isPlaying || gameOver) return;

    let newGrid = [...grid.map(row => [...row])];
    let moved = false;
    let earnedPoints = 0;

    const rotateGrid = (g: Grid) => g[0].map((_, i) => g.map(row => row[i]).reverse());
    
    // Normalize to "left" movement
    let rotations = 0;
    if (direction === 'up') rotations = 1;
    else if (direction === 'right') rotations = 2;
    else if (direction === 'down') rotations = 3;

    for (let i = 0; i < rotations; i++) newGrid = rotateGrid(newGrid);

    // Slide and Merge
    for (let r = 0; r < 4; r++) {
      let row = newGrid[r].filter(val => val !== null) as number[];
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
          row[i] *= 2;
          earnedPoints += row[i];
          row.splice(i + 1, 1);
          moved = true;
        }
      }
      const newRow = [...row, ...Array(4 - row.length).fill(null)];
      if (JSON.stringify(newGrid[r]) !== JSON.stringify(newRow)) moved = true;
      newGrid[r] = newRow;
    }

    // Rotate back
    for (let i = 0; i < (4 - rotations) % 4; i++) newGrid = rotateGrid(newGrid);

    if (moved) {
      const finalGrid = addRandomTile(newGrid);
      setGrid(finalGrid);
      setScore(prev => prev + earnedPoints);
      
      // Check for Game Over
      if (isGameOver(finalGrid)) {
        setGameOver(true);
        const reward = Math.floor(score / 100);
        if (reward > 0) {
          addTokens(reward);
          addExp(reward * 5);
        }
      }
    }
  }, [grid, isPlaying, gameOver, score, addTokens, addExp]);

  function isGameOver(currentGrid: Grid): boolean {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === null) return false;
        if (r < 3 && currentGrid[r][c] === currentGrid[r + 1][c]) return false;
        if (c < 3 && currentGrid[r][c] === currentGrid[r][c + 1]) return false;
      }
    }
    return true;
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('up');
      if (e.key === 'ArrowDown') move('down');
      if (e.key === 'ArrowLeft') move('left');
      if (e.key === 'ArrowRight') move('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getTileColor = (val: number | null) => {
    switch (val) {
      case 2: return "bg-slate-200 text-slate-800";
      case 4: return "bg-slate-300 text-slate-800";
      case 8: return "bg-orange-200 text-orange-800";
      case 16: return "bg-orange-300 text-white";
      case 32: return "bg-orange-400 text-white";
      case 64: return "bg-orange-500 text-white";
      case 128: return "bg-yellow-200 text-yellow-800 text-2xl";
      case 256: return "bg-yellow-300 text-yellow-900 text-2xl";
      case 512: return "bg-yellow-400 text-white text-2xl";
      case 1024: return "bg-yellow-500 text-white text-xl";
      case 2048: return "bg-yellow-600 text-white text-xl shadow-[0_0_15px_rgba(234,179,8,0.5)]";
      default: return "bg-slate-100 opacity-50";
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-4xl font-black font-headline text-slate-800 tracking-tighter">2048</CardTitle>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Sayıları Birleştir</p>
          </div>
          <div className="flex flex-col items-end gap-1">
             <div className="bg-slate-800 text-white px-4 py-1.5 rounded-xl text-center min-w-[100px]">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">SKOR</p>
                <p className="text-xl font-black">{score}</p>
             </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-6">
          {!isPlaying ? (
            <div className="aspect-square bg-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center space-y-6 border-4 border-dashed border-slate-200">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl">
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">Meydan Okumaya Hazır Mısın?</h3>
                <p className="text-slate-500 font-medium text-sm mt-2">5 Jeton karşılığında en yüksek skoru hedefle!</p>
              </div>
              <Button onClick={initGame} size="lg" className="w-full h-16 text-xl font-black bg-slate-800 hover:bg-slate-900 rounded-2xl shadow-xl">
                OYUNU BAŞLAT
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="aspect-square bg-slate-200 p-3 rounded-[2rem] grid grid-cols-4 gap-3 relative overflow-hidden">
                {grid.map((row, r) => row.map((val, c) => (
                  <div 
                    key={`${r}-${c}`} 
                    className={cn(
                      "h-full w-full rounded-2xl flex items-center justify-center text-3xl font-black transition-all duration-100 animate-in zoom-in-50",
                      getTileColor(val)
                    )}
                  >
                    {val}
                  </div>
                )))}
                
                {gameOver && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                    <Trophy className="h-12 w-12 text-yellow-500 mb-4" />
                    <h2 className="text-3xl font-black text-slate-800">Oyun Bitti!</h2>
                    <p className="text-slate-600 font-bold mt-2">Toplam Skor: {score}</p>
                    <div className="flex items-center gap-2 mt-4 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-black">
                      <Coins className="h-4 w-4" />
                      +{Math.floor(score / 100)} Jeton Kazandın
                    </div>
                    <Button onClick={initGame} className="mt-8 bg-slate-800 font-black h-12 px-8 rounded-xl">TEKRAR OYNA</Button>
                  </div>
                )}
              </div>

              {/* Mobile Controls */}
              <div className="grid grid-cols-3 gap-2 sm:hidden">
                <div />
                <Button variant="secondary" onClick={() => move('up')} className="h-12 rounded-xl"><ArrowUp /></Button>
                <div />
                <Button variant="secondary" onClick={() => move('left')} className="h-12 rounded-xl"><ArrowLeft /></Button>
                <Button variant="secondary" onClick={() => move('down')} className="h-12 rounded-xl"><ArrowDown /></Button>
                <Button variant="secondary" onClick={() => move('right')} className="h-12 rounded-xl"><ArrowRight /></Button>
              </div>

              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                <span className="flex items-center gap-1"><RotateCw className="h-3 w-3" /> Yön tuşlarını kullan</span>
                <span className="flex items-center gap-1"><Coins className="h-3 w-3" /> Her 100 puan = 1 Jeton</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
