
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type RegionName = Database['public']['Enums']['region_name'];

export interface GamePlayer {
  id: string;
  username: string;
  email: string;
  current_region: string;
  last_active: string;
  resources: {
    cibo: number;
    pietra: number;
    ferro: number;
    carbone: number;
    pizza: number;
  };
}

export interface Region {
  id: string;
  name: string;
  capital: string;
  owner_id: string | null;
  population: number;
}

export interface Alliance {
  id: string;
  proposer_id: string;
  target_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'active';
  message: string | null;
  created_at: string;
}

export interface War {
  id: string;
  attacker_id: string;
  defender_id: string;
  target_region: string;
  status: 'declared' | 'active' | 'resolved';
  result: string | null;
  started_at: string;
}

interface GameContextType {
  players: GamePlayer[];
  regions: Region[];
  alliances: Alliance[];
  wars: War[];
  currentPlayer: GamePlayer | null;
  loading: boolean;
  declareWar: (targetPlayerId: string, targetRegion: RegionName) => Promise<void>;
  proposeAlliance: (targetPlayerId: string, message?: string) => Promise<void>;
  acceptAlliance: (allianceId: string) => Promise<void>;
  rejectAlliance: (allianceId: string) => Promise<void>;
  updateResources: (resources: Partial<GamePlayer['resources']>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const GameContext = createContext<GameContextType>({} as GameContextType);

export const useSupabaseGame = () => useContext(GameContext);

export const SupabaseGameProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [wars, setWars] = useState<War[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    if (!user) return;

    try {
      // Fetch all data in parallel
      const [playersData, regionsData, alliancesData, warsData, resourcesData] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('regions').select('*'),
        supabase.from('alliances').select('*'),
        supabase.from('wars').select('*'),
        supabase.from('user_resources').select('*')
      ]);

      if (playersData.data) {
        const playersWithResources = playersData.data.map(player => {
          const playerResources = resourcesData.data?.find(r => r.user_id === player.id);
          return {
            ...player,
            resources: playerResources ? {
              cibo: playerResources.cibo || 0,
              pietra: playerResources.pietra || 0,
              ferro: playerResources.ferro || 0,
              carbone: playerResources.carbone || 0,
              pizza: playerResources.pizza || 0,
            } : {
              cibo: 0, pietra: 0, ferro: 0, carbone: 0, pizza: 0
            }
          };
        });
        
        setPlayers(playersWithResources);
        setCurrentPlayer(playersWithResources.find(p => p.id === user.id) || null);
      }

      if (regionsData.data) setRegions(regionsData.data);
      if (alliancesData.data) setAlliances(alliancesData.data);
      if (warsData.data) setWars(warsData.data);

    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
      
      // Set up real-time subscriptions
      const channel = supabase
        .channel('game-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, refreshData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'regions' }, refreshData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alliances' }, refreshData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wars' }, refreshData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_resources' }, refreshData)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const declareWar = async (targetPlayerId: string, targetRegion: RegionName) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('wars').insert({
        attacker_id: user.id,
        defender_id: targetPlayerId,
        target_region: targetRegion,
        status: 'declared'
      });

      if (error) throw error;

      toast({
        title: "Guerra Dichiarata!",
        description: `Hai dichiarato guerra per il controllo di ${targetRegion}`,
        variant: "destructive",
      });

      refreshData();
    } catch (error) {
      console.error('Error declaring war:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile dichiarare guerra",
        variant: "destructive",
      });
    }
  };

  const proposeAlliance = async (targetPlayerId: string, message?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('alliances').insert({
        proposer_id: user.id,
        target_id: targetPlayerId,
        status: 'pending',
        message: message || 'Proposta di alleanza'
      });

      if (error) throw error;

      toast({
        title: "Alleanza Proposta!",
        description: "La tua proposta di alleanza è stata inviata",
      });

      refreshData();
    } catch (error) {
      console.error('Error proposing alliance:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile proporre l'alleanza",
        variant: "destructive",
      });
    }
  };

  const acceptAlliance = async (allianceId: string) => {
    try {
      const { error } = await supabase.from('alliances')
        .update({ status: 'active' })
        .eq('id', allianceId);

      if (error) throw error;

      toast({
        title: "Alleanza Accettata!",
        description: "Hai accettato l'alleanza",
      });

      refreshData();
    } catch (error) {
      console.error('Error accepting alliance:', error);
    }
  };

  const rejectAlliance = async (allianceId: string) => {
    try {
      const { error } = await supabase.from('alliances')
        .update({ status: 'rejected' })
        .eq('id', allianceId);

      if (error) throw error;

      toast({
        title: "Alleanza Rifiutata",
        description: "Hai rifiutato l'alleanza",
      });

      refreshData();
    } catch (error) {
      console.error('Error rejecting alliance:', error);
    }
  };

  const updateResources = async (resources: Partial<GamePlayer['resources']>) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('user_resources')
        .update(resources)
        .eq('user_id', user.id);

      if (error) throw error;

      refreshData();
    } catch (error) {
      console.error('Error updating resources:', error);
    }
  };

  return (
    <GameContext.Provider value={{
      players,
      regions,
      alliances,
      wars,
      currentPlayer,
      loading,
      declareWar,
      proposeAlliance,
      acceptAlliance,
      rejectAlliance,
      updateResources,
      refreshData
    }}>
      {children}
    </GameContext.Provider>
  );
};
