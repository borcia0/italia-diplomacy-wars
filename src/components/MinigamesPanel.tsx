
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseGame } from '../hooks/useSupabaseGame';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { toast } from 'sonner';
import { Dices, Target, Zap, Trophy, Coins, Pizza, Pickaxe, Wheat } from 'lucide-react';

const MinigamesPanel = () => {
  const { user } = useSupabaseAuth();
  const { currentPlayer, refreshData } = useSupabaseGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);

  // Dice Game - Lancia 3 dadi e vinci in base al risultato
  const playDiceGame = async () => {
    if (!user || isPlaying) return;
    
    setIsPlaying(true);
    setGameResult(null);

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const dice3 = Math.floor(Math.random() * 6) + 1;
    
    const total = dice1 + dice2 + dice3;
    
    let reward = { cibo: 0, pietra: 0, ferro: 0, pizza: 0 };
    let message = '';
    
    if (dice1 === dice2 && dice2 === dice3) {
      // Tris! Grande premio
      reward = { cibo: 50, pietra: 30, ferro: 20, pizza: 5 };
      message = '🎰 TRIS! Premio MASSIMO!';
    } else if (total >= 15) {
      // Punteggio alto
      reward = { cibo: 30, pietra: 15, ferro: 10, pizza: 2 };
      message = '🎲 Ottimo lancio!';
    } else if (total >= 10) {
      // Punteggio medio
      reward = { cibo: 20, pietra: 10, ferro: 5, pizza: 1 };
      message = '🎯 Buon lancio!';
    } else {
      // Punteggio basso
      reward = { cibo: 10, pietra: 5, ferro: 2, pizza: 0 };
      message = '🍀 Meglio di niente!';
    }

    try {
      await supabase
        .from('user_resources')
        .update({
          cibo: (currentPlayer?.resources?.cibo || 0) + reward.cibo,
          pietra: (currentPlayer?.resources?.pietra || 0) + reward.pietra,
          ferro: (currentPlayer?.resources?.ferro || 0) + reward.ferro,
          pizza: (currentPlayer?.resources?.pizza || 0) + reward.pizza,
        })
        .eq('user_id', user.id);

      setGameResult({
        type: 'dice',
        dice: [dice1, dice2, dice3],
        total,
        reward,
        message
      });

      toast.success(message);
      await refreshData();
    } catch (error) {
      console.error('Errore nel gioco dei dadi:', error);
      toast.error('Errore nel gioco');
    }

    setIsPlaying(false);
  };

  // Memory Game - Trova le coppie
  const playMemoryGame = async () => {
    if (!user || isPlaying) return;
    
    setIsPlaying(true);
    setGameResult(null);

    // Simula un gioco della memoria con successo casuale
    const success = Math.random() > 0.3; // 70% di successo
    const timeBonus = Math.floor(Math.random() * 3) + 1; // 1-3 moltiplicatore
    
    let reward = { cibo: 0, pietra: 0, ferro: 0, pizza: 0 };
    let message = '';
    
    if (success) {
      const baseReward = 15 * timeBonus;
      reward = { 
        cibo: baseReward, 
        pietra: Math.floor(baseReward * 0.6), 
        ferro: Math.floor(baseReward * 0.4), 
        pizza: timeBonus 
      };
      message = `🧠 Memoria perfetta! Bonus x${timeBonus}`;
    } else {
      reward = { cibo: 5, pietra: 2, ferro: 1, pizza: 0 };
      message = '🤔 Quasi! Ritenta!';
    }

    try {
      await supabase
        .from('user_resources')
        .update({
          cibo: (currentPlayer?.resources?.cibo || 0) + reward.cibo,
          pietra: (currentPlayer?.resources?.pietra || 0) + reward.pietra,
          ferro: (currentPlayer?.resources?.ferro || 0) + reward.ferro,
          pizza: (currentPlayer?.resources?.pizza || 0) + reward.pizza,
        })
        .eq('user_id', user.id);

      setGameResult({
        type: 'memory',
        success,
        timeBonus,
        reward,
        message
      });

      toast.success(message);
      await refreshData();
    } catch (error) {
      console.error('Errore nel gioco della memoria:', error);
      toast.error('Errore nel gioco');
    }

    setIsPlaying(false);
  };

  // Slot Machine - Classico gioco delle slot
  const playSlotMachine = async () => {
    if (!user || isPlaying) return;
    
    setIsPlaying(true);
    setGameResult(null);

    const symbols = ['🍕', '🍞', '⚔️', '🏗️', '💎', '🏆'];
    const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel3 = symbols[Math.floor(Math.random() * symbols.length)];
    
    let reward = { cibo: 0, pietra: 0, ferro: 0, pizza: 0 };
    let message = '';
    
    if (reel1 === reel2 && reel2 === reel3) {
      // Tris di simboli
      if (reel1 === '🏆') {
        reward = { cibo: 100, pietra: 60, ferro: 40, pizza: 10 };
        message = '🏆 JACKPOT SUPREMO!!! 🏆';
      } else if (reel1 === '💎') {
        reward = { cibo: 60, pietra: 40, ferro: 25, pizza: 6 };
        message = '💎 JACKPOT! 💎';
      } else if (reel1 === '🍕') {
        reward = { cibo: 0, pietra: 0, ferro: 0, pizza: 15 };
        message = '🍕 PIZZA PARTY! 🍕';
      } else {
        reward = { cibo: 40, pietra: 20, ferro: 15, pizza: 3 };
        message = '✨ TRIS! ✨';
      }
    } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      // Coppia
      reward = { cibo: 20, pietra: 12, ferro: 8, pizza: 1 };
      message = '🎯 Coppia!';
    } else {
      // Nessuna vincita
      reward = { cibo: 5, pietra: 2, ferro: 1, pizza: 0 };
      message = '🎰 Riprova!';
    }

    try {
      await supabase
        .from('user_resources')
        .update({
          cibo: (currentPlayer?.resources?.cibo || 0) + reward.cibo,
          pietra: (currentPlayer?.resources?.pietra || 0) + reward.pietra,
          ferro: (currentPlayer?.resources?.ferro || 0) + reward.ferro,
          pizza: (currentPlayer?.resources?.pizza || 0) + reward.pizza,
        })
        .eq('user_id', user.id);

      setGameResult({
        type: 'slot',
        reels: [reel1, reel2, reel3],
        reward,
        message
      });

      toast.success(message);
      await refreshData();
    } catch (error) {
      console.error('Errore nella slot machine:', error);
      toast.error('Errore nel gioco');
    }

    setIsPlaying(false);
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎮 Arena dei Minigames
          </h1>
          <p className="text-gray-600">
            Gioca e guadagna risorse per il tuo regno!
          </p>
        </div>

        <Tabs defaultValue="arcade" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="arcade" className="text-lg">🎰 Arcade</TabsTrigger>
            <TabsTrigger value="strategy" className="text-lg">🧠 Strategia</TabsTrigger>
          </TabsList>

          <TabsContent value="arcade" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Dice Game */}
              <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-orange-50">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎲</div>
                  <h3 className="text-xl font-bold mb-2">Dadi della Fortuna</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Lancia 3 dadi e vinci risorse in base al risultato!
                  </p>
                  <div className="text-xs text-gray-500 mb-4">
                    <div>• Tris: Premio MASSIMO!</div>
                    <div>• 15+: Ottimo premio</div>
                    <div>• 10+: Buon premio</div>
                  </div>
                  <Button 
                    onClick={playDiceGame}
                    disabled={isPlaying}
                    className="w-full bg-red-500 hover:bg-red-600"
                  >
                    <Dices className="w-4 h-4 mr-2" />
                    {isPlaying ? 'Lancio...' : 'Lancia i Dadi!'}
                  </Button>
                </div>
              </Card>

              {/* Slot Machine */}
              <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎰</div>
                  <h3 className="text-xl font-bold mb-2">Slot Reale</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Tre simboli uguali per il jackpot!
                  </p>
                  <div className="text-xs text-gray-500 mb-4">
                    <div>🏆 Jackpot Supremo</div>
                    <div>💎 Jackpot Prezioso</div>
                    <div>🍕 Pizza Party</div>
                  </div>
                  <Button 
                    onClick={playSlotMachine}
                    disabled={isPlaying}
                    className="w-full bg-yellow-500 hover:bg-yellow-600"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    {isPlaying ? 'Girando...' : 'Gira le Slot!'}
                  </Button>
                </div>
              </Card>

              {/* Memory Game */}
              <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                  <div className="text-4xl mb-4">🧠</div>
                  <h3 className="text-xl font-bold mb-2">Test di Memoria</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Sfida la tua memoria per bonus moltiplicatori!
                  </p>
                  <div className="text-xs text-gray-500 mb-4">
                    <div>• Più veloce = Bonus maggiore</div>
                    <div>• Allena la mente del sovrano</div>
                  </div>
                  <Button 
                    onClick={playMemoryGame}
                    disabled={isPlaying}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {isPlaying ? 'Pensando...' : 'Sfida la Memoria!'}
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strategy">
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-2xl font-bold mb-4">Giochi di Strategia</h3>
              <p className="text-gray-600 mb-4">
                I giochi di strategia sono in arrivo! Conquiste tattiche, battaglie navali e molto altro!
              </p>
              <Badge variant="outline" className="text-lg px-4 py-2">
                Prossimamente...
              </Badge>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results Display */}
        {gameResult && (
          <Card className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-green-800">
                {gameResult.message}
              </h3>
              
              {gameResult.type === 'dice' && (
                <div className="mb-4">
                  <div className="flex justify-center space-x-4 text-4xl mb-2">
                    {gameResult.dice.map((die: number, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 shadow-md">
                        {die}
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-600">Totale: {gameResult.total}</p>
                </div>
              )}
              
              {gameResult.type === 'slot' && (
                <div className="mb-4">
                  <div className="flex justify-center space-x-2 text-5xl mb-2">
                    {gameResult.reels.map((symbol: string, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-md">
                        {symbol}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {gameResult.type === 'memory' && gameResult.success && (
                <div className="mb-4">
                  <div className="text-3xl mb-2">🧠✨</div>
                  <p className="text-gray-600">Bonus Velocità: x{gameResult.timeBonus}</p>
                </div>
              )}
              
              <div className="flex justify-center space-x-4 text-sm">
                {gameResult.reward.cibo > 0 && (
                  <Badge className="bg-orange-100 text-orange-800">
                    <Wheat className="w-3 h-3 mr-1" />
                    +{gameResult.reward.cibo} Cibo
                  </Badge>
                )}
                {gameResult.reward.pietra > 0 && (
                  <Badge className="bg-gray-100 text-gray-800">
                    <Pickaxe className="w-3 h-3 mr-1" />
                    +{gameResult.reward.pietra} Pietra
                  </Badge>
                )}
                {gameResult.reward.ferro > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    <Zap className="w-3 h-3 mr-1" />
                    +{gameResult.reward.ferro} Ferro
                  </Badge>
                )}
                {gameResult.reward.pizza > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Pizza className="w-3 h-3 mr-1" />
                    +{gameResult.reward.pizza} Pizza
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MinigamesPanel;
