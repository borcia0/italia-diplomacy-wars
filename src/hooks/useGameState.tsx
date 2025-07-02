
import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth';

interface GamePlayer {
  id: string;
  username: string;
  region: string;
  isOnline: boolean;
  lastActive: Date;
  resources: {
    cibo: number;
    pietra: number;
    ferro: number;
    carbone: number;
    pizza: number;
  };
}

interface GameState {
  players: GamePlayer[];
  regionOwnership: Record<string, string>; // regionId -> playerId
  activeWars: Array<{
    attackerId: string;
    defenderId: string;
    targetRegion: string;
    startTime: Date;
    status: 'declared' | 'active' | 'resolved';
  }>;
  alliances: Array<{
    player1Id: string;
    player2Id: string;
    startTime: Date;
  }>;
}

interface GameContextType {
  gameState: GameState | null;
  joinGame: () => Promise<void>;
  attackRegion: (targetRegion: string, defenderId: string) => Promise<void>;
  proposeAlliance: (targetPlayerId: string) => Promise<void>;
  declareWar: (targetPlayerId: string) => Promise<void>;
  updateResources: (resources: Partial<GamePlayer['resources']>) => Promise<void>;
  loading: boolean;
}

const GameContext = createContext<GameContextType>({} as GameContextType);

export const useGameState = () => useContext(GameContext);

const availableRegions = [
  'lazio', 'lombardia', 'campania', 'sicilia', 'piemonte', 'veneto', 
  'emilia-romagna', 'toscana', 'puglia', 'calabria', 'sardegna', 'liguria',
  'marche', 'abruzzo', 'umbria', 'basilicata', 'molise', 'friuli', 'trentino', 'valle-daosta'
];

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameSocket, setGameSocket] = useState<WebSocket | null>(null);

  // Simulate WebSocket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    // In a real implementation, this would connect to your WebSocket server
    console.log('Connecting to game server...');
    
    // Simulate connection
    const mockSocket = {
      send: (data: string) => console.log('Sending to server:', data),
      close: () => console.log('Disconnected from game server')
    } as any;

    setGameSocket(mockSocket);

    // Load initial game state
    loadGameState();

    return () => {
      mockSocket.close();
    };
  }, [user]);

  const loadGameState = async () => {
    if (!user) return;

    setLoading(true);
    
    // Simulate loading game state from server
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock game state with multiple players
    const mockGameState: GameState = {
      players: [
        {
          id: user.id,
          username: user.username,
          region: user.currentRegion || 'lazio',
          isOnline: true,
          lastActive: new Date(),
          resources: user.resources || { cibo: 100, pietra: 50, ferro: 30, carbone: 20, pizza: 10 }
        },
        {
          id: '2',
          username: 'GiocatoreX',
          region: 'lombardia',
          isOnline: true,
          lastActive: new Date(),
          resources: { cibo: 80, pietra: 60, ferro: 40, carbone: 25, pizza: 15 }
        },
        {
          id: '3',
          username: 'GiocatoreY',
          region: 'campania',
          isOnline: false,
          lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          resources: { cibo: 120, pietra: 40, ferro: 20, carbone: 30, pizza: 20 }
        },
        {
          id: '4',
          username: 'GiocatoreZ',
          region: 'piemonte',
          isOnline: true,
          lastActive: new Date(),
          resources: { cibo: 90, pietra: 70, ferro: 50, carbone: 15, pizza: 5 }
        }
      ],
      regionOwnership: {
        'lazio': user.id,
        'lombardia': '2',
        'campania': '3',
        'piemonte': '4',
        'sicilia': 'neutral',
        'veneto': 'neutral'
      },
      activeWars: [
        {
          attackerId: '3',
          defenderId: user.id,
          targetRegion: 'lazio',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: 'declared'
        }
      ],
      alliances: [
        {
          player1Id: user.id,
          player2Id: '2',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
      ]
    };

    setGameState(mockGameState);
    setLoading(false);
  };

  const joinGame = async () => {
    if (!user) return;

    // Assign a random available region to new player
    const occupiedRegions = gameState?.players.map(p => p.region) || [];
    const availableRegionsFiltered = availableRegions.filter(r => !occupiedRegions.includes(r));
    const assignedRegion = availableRegionsFiltered[Math.floor(Math.random() * availableRegionsFiltered.length)] || 'lazio';

    console.log(`Player ${user.username} assigned to region: ${assignedRegion}`);
    
    // In real implementation, this would send to server
    gameSocket?.send(JSON.stringify({
      type: 'JOIN_GAME',
      playerId: user.id,
      region: assignedRegion
    }));
  };

  const attackRegion = async (targetRegion: string, defenderId: string) => {
    if (!user || !gameState) return;

    const newWar = {
      attackerId: user.id,
      defenderId,
      targetRegion,
      startTime: new Date(),
      status: 'declared' as const
    };

    // Update local state immediately for responsiveness
    setGameState(prev => prev ? {
      ...prev,
      activeWars: [...prev.activeWars, newWar]
    } : null);

    // Send to server
    gameSocket?.send(JSON.stringify({
      type: 'DECLARE_WAR',
      war: newWar
    }));

    console.log(`War declared! ${user.username} attacks ${targetRegion}`);
  };

  const proposeAlliance = async (targetPlayerId: string) => {
    if (!user) return;

    gameSocket?.send(JSON.stringify({
      type: 'PROPOSE_ALLIANCE',
      fromPlayerId: user.id,
      toPlayerId: targetPlayerId
    }));

    console.log(`Alliance proposed to player ${targetPlayerId}`);
  };

  const declareWar = async (targetPlayerId: string) => {
    if (!user || !gameState) return;

    const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer) return;

    await attackRegion(targetPlayer.region, targetPlayerId);
  };

  const updateResources = async (resources: Partial<GamePlayer['resources']>) => {
    if (!user) return;

    gameSocket?.send(JSON.stringify({
      type: 'UPDATE_RESOURCES',
      playerId: user.id,
      resources
    }));
  };

  return (
    <GameContext.Provider value={{
      gameState,
      joinGame,
      attackRegion,
      proposeAlliance,
      declareWar,
      updateResources,
      loading
    }}>
      {children}
    </GameContext.Provider>
  );
};
