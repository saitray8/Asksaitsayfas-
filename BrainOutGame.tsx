
"use client";

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, CheckCircle2, XCircle, HelpCircle, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Level {
  id: number;
  question: string;
  options: string[];
  answer: string;
  hint: string;
  isVisual?: boolean;
}

const LEVELS: Level[] = [
  {
    id: 1,
    question: "Hangi ayda 28 gün vardır?",
    options: ["Şubat", "Ocak", "Mart", "Hepsi"],
    answer: "Hepsi",
    hint: "Düşün bakalım, her ayda en az 28 gün yok mudur?"
  },
  {
    id: 2,
    question: "Bir elinde 3 elma, diğer elinde 4 elma varsa elinde ne vardır?",
    options: ["7 Elma", "Büyük Eller", "Meyve Salatası", "Hiçbir Şey"],
    answer: "Büyük Eller",
    hint: "Bu kadar çok elmayı aynı anda tutabiliyorsan..."
  },
  {
    id: 3,
    question: "Hangi sayı daha büyüktür?",
    options: ["100", "50", "200", "10"], // Visual trick: the "50" button will be visually larger
    answer: "50",
    hint: "Sayısal değere değil, görünüme odaklan!"
  },
  {
    id: 4,
    question: "Kapatıldığında ışık saçan, açıldığında karanlık olan şey nedir?",
    options: ["Buzdolabı", "Göz Kapakları", "Lamba", "Güneş"],
    answer: "Göz Kapakları",
    hint: "Dünyayı nasıl karartırsın?"
  },
  {
    id: 5,
    question: "Eğer 3 elmadan 2'sini alırsan, sende kaç elma olur?",
    options: ["1", "2", "3", "0"],
    answer: "2",
    hint: "Sen kaç tane aldın?"
  }
];

export function BrainOutGame() {
  const { spendTokens, addTokens, addExp } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const startGame = () => {
    if (!spendTokens(5)) return;
    setIsPlaying(true);
    setCurrentLevelIdx(0);
    setScore(0);
    setShowHint(false);
    setFeedback(null);
    setIsFinished(false);
  };

  const handleAnswer = (option: string) => {
    if (feedback) return;

    const currentLevel = LEVELS[currentLevelIdx];
    if (option === currentLevel.answer) {
      setFeedback('correct');
      setScore(s => s + 1);
      
      setTimeout(() => {
        if (currentLevelIdx + 1 < LEVELS.length) {
          setCurrentLevelIdx(i => i + 1);
          setFeedback(null);
          setShowHint(false);
        } else {
          endGame();
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const endGame = () => {
    const finalReward = score * 5 + 10; // Level bonus + completion
    addTokens(finalReward);
    addExp(finalReward * 2);
    setIsFinished(true);
  };

  if (!isPlaying) {
    return (
      <Card className="max-w-md mx-auto border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
          <Lightbulb className="h-20 w-20 text-white animate-pulse" />
        </div>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black font-headline text-slate-800">Beyin Yakan Sorular</CardTitle>
          <CardDescription className="font-bold">Klasik mantığı unut, ters köşe olmaya hazır mısın?</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600 space-y-2">
            <p>• Soruları dikkatli oku, cevap göründüğü gibi olmayabilir.</p>
            <p>• Her seviye seni daha çok şaşırtacak.</p>
            <p>• Giriş ücreti: 5 Jeton</p>
          </div>
          <Button onClick={startGame} className="w-full h-16 text-xl font-black bg-orange-500 hover:bg-orange-600 shadow-xl rounded-2xl transition-all hover:scale-105 active:scale-95">
            OYUNU BAŞLAT
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isFinished) {
    return (
      <Card className="max-w-md mx-auto text-center p-10 border-none shadow-2xl bg-white/90">
        <div className="bg-emerald-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="h-12 w-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Tebrikler!</h2>
        <p className="text-slate-500 font-bold mb-8">Zekanı kanıtladın ve tüm soruları çözdün.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKOR</p>
            <p className="text-2xl font-black text-slate-800">{score}/{LEVELS.length}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">KAZANÇ</p>
            <p className="text-2xl font-black text-emerald-600">+{score * 5 + 10} J</p>
          </div>
        </div>
        
        <Button onClick={() => setIsPlaying(false)} className="w-full h-14 font-black bg-slate-800 rounded-xl">
          MENÜYE DÖN
        </Button>
      </Card>
    );
  }

  const currentLevel = LEVELS[currentLevelIdx];
  const progress = (currentLevelIdx / LEVELS.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-white/90 overflow-hidden">
      <div className="bg-slate-100 h-2">
        <Progress value={progress} className="h-full rounded-none" />
      </div>
      
      <CardHeader className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-black">SEVİYE {currentLevel.id}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Beyin Yakılıyor...</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowHint(true)} disabled={showHint} className="text-orange-500 font-bold hover:bg-orange-50">
            <Lightbulb className="h-4 w-4 mr-1" /> İpucu
          </Button>
        </div>
        <CardTitle className="text-3xl font-black text-slate-800 leading-tight">
          {currentLevel.question}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8 pt-0 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentLevel.options.map((option, idx) => (
            <Button
              key={idx}
              variant="outline"
              disabled={!!feedback}
              onClick={() => handleAnswer(option)}
              className={cn(
                "h-20 text-lg font-bold border-2 rounded-2xl transition-all flex justify-between px-6",
                feedback === 'correct' && option === currentLevel.answer ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-500" : "hover:border-orange-500 hover:text-orange-500",
                feedback === 'wrong' && option !== currentLevel.answer ? "opacity-50" : "",
                // Visual trick for Level 2 (id 3)
                currentLevel.id === 3 && option === "50" ? "scale-125 z-10 shadow-xl border-orange-200" : ""
              )}
            >
              {option}
              {feedback === 'correct' && option === currentLevel.answer && <CheckCircle2 className="h-6 w-6" />}
              {feedback === 'wrong' && option === currentLevel.answer && <HelpCircle className="h-6 w-6 text-orange-500 animate-bounce" />}
            </Button>
          ))}
        </div>

        {showHint && (
          <div className="bg-orange-50 border-2 border-dashed border-orange-200 p-4 rounded-2xl animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-orange-600 font-black text-sm mb-1 uppercase tracking-widest">
              <Lightbulb className="h-4 w-4" /> İPUCU
            </div>
            <p className="text-orange-800 font-medium italic">{currentLevel.hint}</p>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Sparkles className="h-3 w-3" /> Dikkatli ol, her şey göründüğü gibi değildir!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
