
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseGame } from '@/hooks/useSupabaseGame';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Brain, Gamepad2, Coins, Trophy, Target, Puzzle, Sparkles, Timer } from 'lucide-react';

interface MinigameStats {
  dice_plays_today: number;
  memory_plays_today: number;
  slot_plays_today: number;
  puzzle_plays_today: number;
  target_plays_today: number;
  last_dice_play: string | null;
  last_memory_play: string | null;
  last_slot_play: string | null;
  last_puzzle_play: string | null;
  last_target_play: string | null;
}

const MinigamesPanel = () => {
  const { user } = useSupabaseAuth();
  const { updateResources, currentPlayer } = useSupabaseGame();
  const { toast } = useToast();
  
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [memoryCards, setMemoryCards] = useState<number[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [slotResult, setSlotResult] = useState<string[]>([]);
  const [puzzleGrid, setPuzzleGrid] = useState<number[]>([]);
  const [targetScore, setTargetScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [gameStats, setGameStats] = useState<MinigameStats>({
    dice_plays_today: 0,
    memory_plays_today: 0,
    slot_plays_today: 0,
    puzzle_plays_today: 0,
    target_plays_today: 0,
    last_dice_play: null,
    last_memory_play: null,
    last_slot_play: null,
    last_puzzle_play: null,
    last_target_play: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch game statistics
  const fetchGameStats = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('minigame_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching game stats:', error);
        return;
      }

      if (data) {
        setGameStats({
          dice_plays_today: data.dice_plays_today || 0,
          memory_plays_today: data.memory_plays_today || 0,
          slot_plays_today: data.slot_plays_today || 0,
          puzzle_plays_today: data.puzzle_plays_today || 0,
          target_plays_today: data.target_plays_today || 0,
          last_dice_play: data.last_dice_play,
          last_memory_play: data.last_memory_play,
          last_slot_play: data.last_slot_play,
          last_puzzle_play: data.last_puzzle_play,
          last_target_play: data.last_target_play,
        });
      }
    } catch (error) {
      console.error('Error fetching game stats:', error);
    }
  };

  useEffect(() => {
    fetchGameStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchGameStats, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Check if user can play a specific game
  const checkCanPlay = async (gameType: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase.rpc('can_play_minigame', {
        p_user_id: user.id,
        p_game_type: gameType
      });

      if (error) {
        console.error('Error checking play permission:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error checking play permission:', error);
      return false;
    }
  };

  // Update game statistics after playing
  const updateGameStats = async (gameType: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.rpc('update_minigame_stats', {
        p_user_id: user.id,
        p_game_type: gameType
      });

      if (error) {
        console.error('Error updating game stats:', error);
      } else {
        await fetchGameStats();
      }
    } catch (error) {
      console.error('Error updating game stats:', error);
    }
  };

  // Get remaining cooldown time
  const getCooldownTime = (lastPlay: string | null): number => {
    if (!lastPlay) return 0;
    const lastPlayTime = new Date(lastPlay).getTime();
    const now = new Date().getTime();
    const cooldownEnd = lastPlayTime + (5 * 60 * 1000); // 5 minutes
    return Math.max(0, cooldownEnd - now);
  };

  // Format cooldown time
  const formatCooldown = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Dice Game
  const playDice = async () => {
    if (isLoading) return;
    
    const canPlay = await checkCanPlay('dice');
    if (!canPlay) {
      const cooldown = getCooldownTime(gameStats.last_dice_play);
      if (cooldown > 0) {
        toast({
          title: "Cooldown Attivo",
          description: `Aspetta ancora ${formatCooldown(cooldown)} prima di giocare di nuovo`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Limite Raggiunto",
          description: "Hai raggiunto il limite giornaliero di 10 partite",
          variant: "destructive",
        });
      }
      return;
    }

    setIsLoading(true);
    const result = Math.floor(Math.random() * 6) + 1;
    setDiceResult(result);
    
    let reward = 0;
    if (result === 6) reward = 100;
    else if (result >= 4) reward = 50;
    else reward = 10;

    if (currentPlayer && reward > 0) {
      await updateResources({
        cibo: currentPlayer.resources.cibo + reward
      });
    }

    await updateGameStats('dice');
    
    toast({
      title: `🎲 Hai ottenuto ${result}!`,
      description: `Ricompensa: ${reward} Cibo`,
    });
    
    setIsLoading(false);
  };

  // Memory Game
  const initializeMemory = () => {
    const cards = [...Array(8)].map((_, i) => Math.floor(i / 2));
    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedCards([]);
  };

  const playMemory = async () => {
    if (isLoading) return;
    
    const canPlay = await checkCanPlay('memory');
    if (!canPlay) {
      const cooldown = getCooldownTime(gameStats.last_memory_play);
      if (cooldown > 0) {
        toast({
          title: "Cooldown Attivo",
          description: `Aspetta ancora ${formatCooldown(cooldown)} prima di giocare di nuovo`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Limite Raggiunto",
          description: "Hai raggiunto il limite giornaliero di 10 partite",
          variant: "destructive",
        });
      }
      return;
    }

    setIsLoading(true);
    initializeMemory();
    await updateGameStats('memory');
    
    toast({
      title: "🧠 Memory Game Iniziato!",
      description: "Trova tutte le coppie per vincere le ricompense!",
    });
    
    setIsLoading(false);
  };

  // Slot Machine
  const playSlot = async () => {
    if (isLoading) return;
    
    const canPlay = await checkCanPlay('slot');
    if (!canPlay) {
      const cooldown = getCooldownTime(gameStats.last_slot_play);
      if (cooldown > 0) {
        toast({
          title: "Cooldown Attivo",
          description: `Aspetta ancora ${formatCooldown(cooldown)} prima di giocare di nuovo`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Limite Raggiunto",
          description: "Hai raggiunto il limite giornaliero di 10 partite",
          variant: "destructive",
        });
      }
      return;
    }

    setIsLoading(true);
    const symbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '💎'];
    const result = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];
    setSlotResult(result);
    
    let reward = 0;
    if (result[0] === result[1] && result[1] === result[2]) {
      if (result[0] === '💎') reward = 500;
      else reward = 200;
    } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
      reward = 50;
    } else {
      reward = 10;
    }

    if (currentPlayer && reward > 0) {
      await updateResources({
        pizza: currentPlayer.resources.pizza + reward
      });
    }

    await updateGameStats('slot');
    
    toast({
      title: `🎰 ${result.join(' ')}`,
      description: `Ricompensa: ${reward} Pizza`,
    });
    
    setIsLoading(false);
  };

  // Puzzle Game
  const playPuzzle = async () => {
    if (isLoading) return;
    
    const canPlay = await checkCanPlay('puzzle');
    if (!canPlay) {
      const cooldown = getCooldownTime(gameStats.last_puzzle_play);
      if (cooldown > 0) {
        toast({
          title: "Cooldown Attivo",
          description: `Aspetta ancora ${formatCooldown(cooldown)} prima di giocare di nuovo`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Limite Raggiunto",
          description: "Hai raggiunto il limite giornaliero di 10 partite",
          variant: "destructive",
        });
      }
      return;
    }

    setIsLoading(true);
    const grid = Array.from({length: 9}, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    setPuzzleGrid(grid);
    
    const reward = Math.floor(Math.random() * 100) + 50;
    if (currentPlayer) {
      await updateResources({
        pietra: currentPlayer.resources.pietra + reward
      });
    }

    await updateGameStats('puzzle');
    
    toast({
      title: "🧩 Puzzle Completato!",
      description: `Ricompensa: ${reward} Pietra`,
    });
    
    setIsLoading(false);
  };

  // Target Game
  const playTarget = async () => {
    if (isLoading) return;
    
    const canPlay = await checkCanPlay('target');
    if (!canPlay) {
      const cooldown = getCooldownTime(gameStats.last_target_play);
      if (cooldown > 0) {
        toast({
          title: "Cooldown Attivo",
          description: `Aspetta ancora ${formatCooldown(cooldown)} prima di giocare di nuovo`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Limite Raggiunto",
          description: "Hai raggiunto il limite giornaliero di 10 partite",
          variant: "destructive",
        });
      }
      return;
    }

    setIsLoading(true);
    const target = Math.floor(Math.random() * 100) + 50;
    const score = Math.floor(Math.random() * 150) + 25;
    setTargetScore(target);
    setCurrentScore(score);
    
    const reward = score >= target ? 80 : 20;
    if (currentPlayer) {
      await updateResources({
        ferro: currentPlayer.resources.ferro + reward
      });
    }

    await updateGameStats('target');
    
    toast({
      title: `🎯 ${score >= target ? 'Centro!' : 'Mancato'}`,
      description: `Ricompensa: ${reward} Ferro`,
    });
    
    setIsLoading(false);
  };

  const getDiceIcon = (value: number) => {
    switch (value) {
      case 1: return <Dice1 className="w-8 h-8" />;
      case 2: return <Dice2 className="w-8 h-8" />;
      case 3: return <Dice3 className="w-8 h-8" />;
      case 4: return <Dice4 className="w-8 h-8" />;
      case 5: return <Dice5 className="w-8 h-8" />;
      case 6: return <Dice6 className="w-8 h-8" />;
      default: return <Dice1 className="w-8 h-8" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-center mb-2">🎮 Minigames Arena</h2>
        <p className="text-center text-gray-600">Gioca e vinci risorse! Limite: 10 partite al giorno per gioco</p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
          {/* Dice Game */}
          <Card className="relative overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Dice1 className="w-6 h-6" />
                  <span>🎲 Lancia il Dado</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {gameStats.dice_plays_today}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {diceResult && (
                  <div className="flex justify-center">
                    {getDiceIcon(diceResult)}
                  </div>
                )}
                <Button 
                  onClick={playDice} 
                  disabled={isLoading || gameStats.dice_plays_today >= 10 || getCooldownTime(gameStats.last_dice_play) > 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isLoading ? "Lanciando..." : 
                   getCooldownTime(gameStats.last_dice_play) > 0 ? 
                   `Cooldown: ${formatCooldown(getCooldownTime(gameStats.last_dice_play))}` :
                   gameStats.dice_plays_today >= 10 ? "Limite Raggiunto" : "Lancia il Dado"}
                </Button>
                <div className="text-sm text-gray-600">
                  <div>🍖 Ricompensa: 10-100 Cibo</div>
                  <div className="flex items-center justify-center mt-2">
                    <Timer className="w-4 h-4 mr-1" />
                    Cooldown: 5 minuti
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Game */}
          <Card className="relative overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="w-6 h-6" />
                  <span>🧠 Memory Game</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {gameStats.memory_plays_today}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {memoryCards.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {memoryCards.map((card, index) => (
                      <div
                        key={index}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                          flippedCards.includes(index) || matchedCards.includes(index)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        onClick={() => {
                          if (!flippedCards.includes(index) && flippedCards.length < 2) {
                            setFlippedCards([...flippedCards, index]);
                          }
                        }}
                      >
                        {flippedCards.includes(index) || matchedCards.includes(index) ? card : '?'}
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  onClick={playMemory} 
                  disabled={isLoading || gameStats.memory_plays_today >= 10 || getCooldownTime(gameStats.last_memory_play) > 0}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                >
                  {isLoading ? "Preparando..." : 
                   getCooldownTime(gameStats.last_memory_play) > 0 ? 
                   `Cooldown: ${formatCooldown(getCooldownTime(gameStats.last_memory_play))}` :
                   gameStats.memory_plays_today >= 10 ? "Limite Raggiunto" : "Inizia Memory"}
                </Button>
                <div className="text-sm text-gray-600">
                  <div>🍖 Ricompensa: 30-150 Cibo</div>
                  <div className="flex items-center justify-center mt-2">
                    <Timer className="w-4 h-4 mr-1" />
                    Cooldown: 5 minuti
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slot Machine */}
          <Card className="relative overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-6 h-6" />
                  <span>🎰 Slot Machine</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {gameStats.slot_plays_today}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {slotResult.length > 0 && (
                  <div className="text-4xl font-bold">
                    {slotResult.join(' ')}
                  </div>
                )}
                <Button 
                  onClick={playSlot} 
                  disabled={isLoading || gameStats.slot_plays_today >= 10 || getCooldownTime(gameStats.last_slot_play) > 0}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                >
                  {isLoading ? "Girando..." : 
                   getCooldownTime(gameStats.last_slot_play) > 0 ? 
                   `Cooldown: ${formatCooldown(getCooldownTime(gameStats.last_slot_play))}` :
                   gameStats.slot_plays_today >= 10 ? "Limite Raggiunto" : "Gira Slot"}
                </Button>
                <div className="text-sm text-gray-600">
                  <div>🍕 Ricompensa: 10-500 Pizza</div>
                  <div className="flex items-center justify-center mt-2">
                    <Timer className="w-4 h-4 mr-1" />
                    Cooldown: 5 minuti
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Puzzle Game */}
          <Card className="relative overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Puzzle className="w-6 h-6" />
                  <span>🧩 Puzzle Master</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {gameStats.puzzle_plays_today}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {puzzleGrid.length > 0 && (
                  <div className="grid grid-cols-3 gap-1 mb-4">
                    {puzzleGrid.map((num, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 bg-yellow-500 text-white rounded-lg flex items-center justify-center font-bold"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  onClick={playPuzzle} 
                  disabled={isLoading || gameStats.puzzle_plays_today >= 10 || getCooldownTime(gameStats.last_puzzle_play) > 0}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                >
                  {isLoading ? "Risolvendo..." : 
                   getCooldownTime(gameStats.last_puzzle_play) > 0 ? 
                   `Cooldown: ${formatCooldown(getCooldownTime(gameStats.last_puzzle_play))}` :
                   gameStats.puzzle_plays_today >= 10 ? "Limite Raggiunto" : "Risolvi Puzzle"}
                </Button>
                <div className="text-sm text-gray-600">
                  <div>🏗️ Ricompensa: 50-150 Pietra</div>
                  <div className="flex items-center justify-center mt-2">
                    <Timer className="w-4 h-4 mr-1" />
                    Cooldown: 5 minuti
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Game */}
          <Card className="relative overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-6 h-6" />
                  <span>🎯 Tiro al Bersaglio</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {gameStats.target_plays_today}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {targetScore > 0 && (
                  <div className="space-y-2">
                    <div className="text-lg">Obiettivo: {targetScore}</div>
                    <div className={`text-2xl font-bold ${currentScore >= targetScore ? 'text-green-600' : 'text-red-600'}`}>
                      Il tuo punteggio: {currentScore}
                    </div>
                    <div className={`text-lg ${currentScore >= targetScore ? 'text-green-600' : 'text-red-600'}`}>
                      {currentScore >= targetScore ? '🎯 CENTRO!' : '❌ MANCATO'}
                    </div>
                  </div>
                )}
                <Button 
                  onClick={playTarget} 
                  disabled={isLoading || gameStats.target_plays_today >= 10 || getCooldownTime(gameStats.last_target_play) > 0}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  {isLoading ? "Mirando..." : 
                   getCooldownTime(gameStats.last_target_play) > 0 ? 
                   `Cooldown: ${formatCooldown(getCooldownTime(gameStats.last_target_play))}` :
                   gameStats.target_plays_today >= 10 ? "Limite Raggiunto" : "Spara!"}
                </Button>
                <div className="text-sm text-gray-600">
                  <div>⚔️ Ricompensa: 20-80 Ferro</div>
                  <div className="flex items-center justify-center mt-2">
                    <Timer className="w-4 h-4 mr-1" />
                    Cooldown: 5 minuti
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Stats */}
          <Card className="lg:col-span-2 bg-gradient-to-r from-gray-50 to-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span>📊 Statistiche Giornaliere</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl">🎲</div>
                  <div className="font-bold">{gameStats.dice_plays_today}/10</div>
                  <div className="text-sm text-gray-600">Dadi</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl">🧠</div>
                  <div className="font-bold">{gameStats.memory_plays_today}/10</div>
                  <div className="text-sm text-gray-600">Memory</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl">🎰</div>
                  <div className="font-bold">{gameStats.slot_plays_today}/10</div>
                  <div className="text-sm text-gray-600">Slot</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl">🧩</div>
                  <div className="font-bold">{gameStats.puzzle_plays_today}/10</div>
                  <div className="text-sm text-gray-600">Puzzle</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl">🎯</div>
                  <div className="font-bold">{gameStats.target_plays_today}/10</div>
                  <div className="text-sm text-gray-600">Target</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MinigamesPanel;
