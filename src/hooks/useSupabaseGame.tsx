
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type RegionName = Database['public']['Enums']['region_name'];
type BuildingType = Database['public']['Enums']['building_type'];
type UnitType = Database['public']['Enums']['unit_type'];

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

export interface Building {
  id: string;
  user_id: string;
  region: string;
  type: BuildingType;
  level: number;
  production: number;
}

export interface ArmyUnit {
  id: string;
  user_id: string;
  region: string;
  type: UnitType;
  quantity: number;
  attack_power: number;
  defense_power: number;
}

interface GameContextType {
  players: GamePlayer[];
  regions: Region[];
  alliances: Alliance[];
  wars: War[];
  buildings: Building[];
  armyUnits: ArmyUnit[];
  currentPlayer: GamePlayer | null;
  loading: boolean;
  declareWar: (targetPlayerId: string, targetRegion: RegionName) => Promise<void>;
  proposeAlliance: (targetPlayerId: string, message?: string) => Promise<void>;
  acceptAlliance: (allianceId: string) => Promise<void>;
  rejectAlliance: (allianceId: string) => Promise<void>;
  updateResources: (resources: Partial<GamePlayer['resources']>) => Promise<void>;
  conquestTerritory: (regionName: RegionName) => Promise<void>;
  buildStructure: (regionName: RegionName, buildingType: BuildingType) => Promise<void>;
  trainUnits: (regionName: RegionName, unitType: UnitType, quantity: number) => Promise<void>;
  upgradeBuilding: (buildingId: string) => Promise<void>;
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
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [armyUnits, setArmyUnits] = useState<ArmyUnit[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    if (!user) return;

    try {
      // Fetch all data in parallel
      const [playersData, regionsData, alliancesData, warsData, resourcesData, buildingsData, armyData] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('regions').select('*'),
        supabase.from('alliances').select('*'),
        supabase.from('wars').select('*'),
        supabase.from('user_resources').select('*'),
        supabase.from('buildings').select('*'),
        supabase.from('army_units').select('*')
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
      if (buildingsData.data) setBuildings(buildingsData.data);
      if (armyData.data) setArmyUnits(armyData.data);

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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'buildings' }, refreshData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'army_units' }, refreshData)
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

  const conquestTerritory = async (regionName: RegionName) => {
    if (!user || !currentPlayer) return;

    try {
      // Check if player has enough resources
      if (currentPlayer.resources.ferro < 50 || currentPlayer.resources.cibo < 100) {
        toast({
          title: "Risorse Insufficienti",
          description: "Servono 50 Ferro e 100 Cibo per conquistare un territorio",
          variant: "destructive",
        });
        return;
      }

      // Update region ownership
      const { error: regionError } = await supabase.from('regions')
        .update({ owner_id: user.id })
        .eq('name', regionName)
        .is('owner_id', null);

      if (regionError) throw regionError;

      // Deduct resources
      const newResources = {
        ferro: currentPlayer.resources.ferro - 50,
        cibo: currentPlayer.resources.cibo - 100
      };
      
      await updateResources(newResources);

      toast({
        title: "Territorio Conquistato!",
        description: `Hai conquistato ${regionName}!`,
      });

      refreshData();
    } catch (error) {
      console.error('Error conquering territory:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile conquistare il territorio",
        variant: "destructive",
      });
    }
  };

  const buildStructure = async (regionName: RegionName, buildingType: BuildingType) => {
    if (!user || !currentPlayer) return;

    try {
      // Check if region belongs to player
      const region = regions.find(r => r.name === regionName);
      if (!region || region.owner_id !== user.id) {
        toast({
          title: "Errore",
          description: "Puoi costruire solo nei tuoi territori",
          variant: "destructive",
        });
        return;
      }

      // Check resource requirements
      const costs = {
        fattoria: { cibo: 20, pietra: 30 },
        cava: { pietra: 40, ferro: 20 },
        miniera: { ferro: 30, carbone: 25 },
        pizzeria: { cibo: 50, pizza: 10 },
        caserma: { ferro: 100, pietra: 80 }
      };

      const cost = costs[buildingType];
      const hasResources = Object.entries(cost).every(([resource, amount]) => 
        currentPlayer.resources[resource as keyof typeof currentPlayer.resources] >= amount
      );

      if (!hasResources) {
        toast({
          title: "Risorse Insufficienti",
          description: "Non hai abbastanza risorse per costruire questo edificio",
          variant: "destructive",
        });
        return;
      }

      // Build structure
      const { error } = await supabase.from('buildings').insert({
        user_id: user.id,
        region: regionName,
        type: buildingType,
        level: 1,
        production: 10
      });

      if (error) throw error;

      // Deduct resources
      const newResources = Object.entries(cost).reduce((acc, [resource, amount]) => ({
        ...acc,
        [resource]: currentPlayer.resources[resource as keyof typeof currentPlayer.resources] - amount
      }), {});

      await updateResources(newResources);

      toast({
        title: "Edificio Costruito!",
        description: `Hai costruito ${buildingType} in ${regionName}`,
      });

      refreshData();
    } catch (error) {
      console.error('Error building structure:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile costruire l'edificio",
        variant: "destructive",
      });
    }
  };

  const trainUnits = async (regionName: RegionName, unitType: UnitType, quantity: number) => {
    if (!user || !currentPlayer) return;

    try {
      // Check if region belongs to player
      const region = regions.find(r => r.name === regionName);
      if (!region || region.owner_id !== user.id) {
        toast({
          title: "Errore",
          description: "Puoi addestrare unità solo nei tuoi territori",
          variant: "destructive",
        });
        return;
      }

      // Check if player has barracks
      const hasBarracks = buildings.some(b => 
        b.user_id === user.id && 
        b.region === regionName && 
        b.type === 'caserma'
      );

      if (!hasBarracks) {
        toast({
          title: "Errore",
          description: "Serve una caserma per addestrare unità",
          variant: "destructive",
        });
        return;
      }

      const unitCosts = {
        legionari: { cibo: 10, ferro: 5 },
        arcieri: { cibo: 8, ferro: 12 },
        cavalieri: { cibo: 20, ferro: 15 },
        catapulte: { ferro: 50, pietra: 30 }
      };

      const cost = unitCosts[unitType];
      const totalCost = Object.entries(cost).reduce((acc, [resource, amount]) => ({
        ...acc,
        [resource]: amount * quantity
      }), {} as Record<string, number>);

      const hasResources = Object.entries(totalCost).every(([resource, amount]) => 
        currentPlayer.resources[resource as keyof typeof currentPlayer.resources] >= amount
      );

      if (!hasResources) {
        toast({
          title: "Risorse Insufficienti",
          description: "Non hai abbastanza risorse per addestrare queste unità",
          variant: "destructive",
        });
        return;
      }

      // Check if units already exist
      const existingUnits = armyUnits.find(u => 
        u.user_id === user.id && 
        u.region === regionName && 
        u.type === unitType
      );

      if (existingUnits) {
        // Update existing units
        const { error } = await supabase.from('army_units')
          .update({ quantity: existingUnits.quantity + quantity })
          .eq('id', existingUnits.id);

        if (error) throw error;
      } else {
        // Create new units
        const { error } = await supabase.from('army_units').insert({
          user_id: user.id,
          region: regionName,
          type: unitType,
          quantity: quantity,
          attack_power: unitType === 'catapulte' ? 25 : unitType === 'cavalieri' ? 18 : unitType === 'arcieri' ? 12 : 10,
          defense_power: unitType === 'catapulte' ? 5 : unitType === 'cavalieri' ? 15 : unitType === 'arcieri' ? 8 : 12
        });

        if (error) throw error;
      }

      // Deduct resources  
      const newResources = Object.entries(totalCost).reduce((acc, [resource, amount]) => ({
        ...acc,
        [resource]: currentPlayer.resources[resource as keyof typeof currentPlayer.resources] - amount
      }), {});

      await updateResources(newResources);

      toast({
        title: "Unità Addestrate!",
        description: `Hai addestrato ${quantity} ${unitType} in ${regionName}`,
      });

      refreshData();
    } catch (error) {
      console.error('Error training units:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile addestrare le unità",
        variant: "destructive",
      });
    }
  };

  const upgradeBuilding = async (buildingId: string) => {
    if (!user || !currentPlayer) return;

    try {
      const building = buildings.find(b => b.id === buildingId);
      if (!building || building.user_id !== user.id) {
        toast({
          title: "Errore",
          description: "Non puoi migliorare questo edificio",
          variant: "destructive",
        });
        return;
      }

      const upgradeCost = building.level * 50;
      if (currentPlayer.resources.pietra < upgradeCost) {
        toast({
          title: "Risorse Insufficienti",
          description: `Servono ${upgradeCost} Pietra per migliorare questo edificio`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('buildings')
        .update({ 
          level: building.level + 1,
          production: building.production + 5
        })
        .eq('id', buildingId);

      if (error) throw error;

      await updateResources({ pietra: currentPlayer.resources.pietra - upgradeCost });

      toast({
        title: "Edificio Migliorato!",
        description: `Hai migliorato ${building.type} al livello ${building.level + 1}`,
      });

      refreshData();
    } catch (error) {
      console.error('Error upgrading building:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile migliorare l'edificio",
        variant: "destructive",
      });
    }
  };

  return (
    <GameContext.Provider value={{
      players,
      regions,
      alliances,
      wars,
      buildings,
      armyUnits,
      currentPlayer,
      loading,
      declareWar,
      proposeAlliance,
      acceptAlliance,
      rejectAlliance,
      updateResources,
      conquestTerritory,
      buildStructure,
      trainUnits,
      upgradeBuilding,
      refreshData
    }}>
      {children}
    </GameContext.Provider>
  );
};
