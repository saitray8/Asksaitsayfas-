
"use client";

import React, { useState } from 'react';
import { generateTriviaQuestions, TriviaQuestionsOutput } from '@/ai/flows/generate-trivia-questions';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TOPICS = [
  { id: 'genel', name: 'Genel Kültür' },
  { id: 'tarih', name: 'Tarih' },
  { id: 'bilim', name: 'Bilim & Teknoloji' },
  { id: 'spor', name: 'Spor' },
  { id: 'sanat', name: 'Sanat & Edebiyat' }
];

export function TriviaGame() {
  const { spendTokens, addTokens, addExp } = useGame();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<'topic_selection' | 'loading' | 'playing' | 'result'>('topic_selection');
  const [questions, setQuestions] = useState<TriviaQuestionsOutput>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [userAnswer, setUserAnswer] = useState<string | null>(null);

  const startTrivia = async (topic: string) => {
    if (!spendTokens(10)) return;
    
    setSelectedTopic(topic);
    setGameState('loading');
    
    try {
      const data = await generateTriviaQuestions({
        topic,
        difficulty: 'medium',
        numberOfQuestions: 5
      });
      setQuestions(data);
      setCurrentQuestionIndex(0);
      setScore(0);
      setGameState('playing');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Sorular yüklenirken bir hata oluştu.' });
      setGameState('topic_selection');
    }
  };

  const handleAnswer = (option: string) => {
    if (userAnswer) return;
    
    setUserAnswer(option);
    const isCorrect = option === questions[currentQuestionIndex].answer;
    
    if (isCorrect) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(i => i + 1);
        setUserAnswer(null);
      } else {
        const reward = score * 5 + (isCorrect ? 5 : 0);
        addTokens(reward);
        addExp(reward * 2);
        setGameState('result');
      }
    }, 1500);
  };

  if (gameState === 'topic_selection') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-headline">AI Trivia Mücadelesi</h2>
          <p className="text-muted-foreground">Konunu seç ve yapay zekaya karşı yarış! (Giriş: 10 Jeton)</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((topic) => (
            <Card key={topic.id} className="hover:shadow-lg transition-shadow cursor-pointer group border-primary/20" onClick={() => startTrivia(topic.name)}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="font-bold">{topic.name}</span>
                </div>
                <Button variant="ghost" size="sm">Başla</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg font-medium">Yapay Zeka soruları hazırlıyor...</p>
      </div>
    );
  }

  if (gameState === 'playing' && questions.length > 0) {
    const q = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    return (
      <Card className="max-w-2xl mx-auto border-primary/20 shadow-xl overflow-hidden">
        <div className="bg-primary/5 p-1">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">{selectedTopic}</span>
            <span className="text-sm font-medium text-muted-foreground">Soru {currentQuestionIndex + 1} / {questions.length}</span>
          </div>
          <CardTitle className="text-2xl leading-relaxed">{q.question}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4">
          {q.options.map((option, idx) => {
            let variant: "outline" | "default" | "secondary" = "outline";
            let icon = null;

            if (userAnswer === option) {
               if (option === q.answer) {
                 variant = "default";
                 icon = <CheckCircle2 className="h-5 w-5 ml-auto" />;
               } else {
                 variant = "destructive";
                 icon = <XCircle className="h-5 w-5 ml-auto" />;
               }
            } else if (userAnswer && option === q.answer) {
               variant = "default";
            }

            return (
              <Button 
                key={idx} 
                variant={variant} 
                className={`h-16 justify-start px-6 text-lg transition-all ${userAnswer ? 'cursor-default' : 'hover:translate-x-1'}`}
                onClick={() => handleAnswer(option)}
                disabled={!!userAnswer}
              >
                <span className="flex-1 text-left">{option}</span>
                {icon}
              </Button>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'result') {
    return (
      <Card className="max-w-md mx-auto text-center p-8 border-primary shadow-xl">
        <div className="mb-6 inline-flex p-4 rounded-full bg-primary/10">
          <Brain className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Mücadele Tamamlandı!</h2>
        <p className="text-muted-foreground mb-6">Skorun: {score} / {questions.length}</p>
        <div className="bg-secondary rounded-lg p-4 mb-8">
          <p className="text-sm text-muted-foreground">Kazanılan Ödül</p>
          <p className="text-2xl font-bold text-primary">{score * 5} Jeton</p>
        </div>
        <Button className="w-full" onClick={() => setGameState('topic_selection')}>Tekrar Oyna</Button>
      </Card>
    );
  }

  return null;
}
