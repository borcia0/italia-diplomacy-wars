
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
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Refreshing game data for user:', user.id);
      
      const [playersData, regionsData, alliancesData, warsData, resourcesData, buildingsData, armyData] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('regions').select('*'),
        supabase.from('alliances').select('*'),
        supabase.from('wars').select('*'),
        supabase.from('user_resources').select('*'),
        supabase.from('buildings').select('*'),
        supabase.from('army_units').select('*')
      ]);

      console.log('Data fetched:', { playersData, regionsData, resourcesData });

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
        const current = playersWithResources.find(p => p.id === user.id);
        console.log('Current player:', current);
        setCurrentPlayer(current || null);
      }

      if (regionsData.data) setRegions(regionsData.data);
      if (alliancesData.data) setAlliances(alliancesData.data);
      if (warsData.data) setWars(warsData.data);
      if (buildingsData.data) setBuildings(buildingsData.data);
      if (armyData.data) setArmyUnits(armyData.data);

    } catch (error) {
      console.error('Error fetching game data:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei dati di gioco",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
      
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

  const updateResources = async (newResources: Partial<GamePlayer['resources']>) => {
    if (!user) return;

    try {
      console.log('Updating resources:', newResources);
      
      const { error } = await supabase
        .from('user_resources')
        .update(newResources)
        .eq('user_id', user.id);

      if (error) {
        console.error('Resource update error:', error);
        throw error;
      }

      console.log('Resources updated successfully');
      await refreshData();
    } catch (error) {
      console.error('Error updating resources:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento delle risorse",
        variant: "destructive",
      });
    }
  };

  const conquestTerritory = async (regionName: RegionName) => {
    if (!user || !currentPlayer) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per conquistare territori",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting to conquer territory:', regionName);
      
      // Check if region is already owned
      const region = regions.find(r => r.name === regionName);
      if (region && region.owner_id && region.owner_id !== user.id) {
        toast({
          title: "Territorio Occupato",
          description: "Questo territorio è già controllato da un altro giocatore",
          variant: "destructive",
        });
        return;
      }

      // Check resources
      const requiredCost = { ferro: 50, cibo: 100 };
      if (currentPlayer.resources.ferro < requiredCost.ferro || currentPlayer.resources.cibo < requiredCost.cibo) {
        toast({
          title: "Risorse Insufficienti",
          description: `Servono ${requiredCost.ferro} Ferro e ${requiredCost.cibo} Cibo per conquistare un territorio`,
          variant: "destructive",
        });
        return;
      }

      // Update region ownership
      const { error: regionError } = await supabase
        .from('regions')
        .update({ owner_id: user.id })
        .eq('name', regionName);

      if (regionError) {
        console.error('Region update error:', regionError);
        throw regionError;
      }

      // Update user's current region if they don't have one
      if (!currentPlayer.current_region || currentPlayer.current_region === 'lazio') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ current_region: regionName })
          .eq('id', user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }
      }

      // Deduct resources
      const newResources = {
        ferro: currentPlayer.resources.ferro - requiredCost.ferro,
        cibo: currentPlayer.resources.cibo - requiredCost.cibo
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
    if (!user || !currentPlayer) {
      toast({
        title: "Errore", 
        description: "Devi essere autenticato per costruire",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Building structure:', { regionName, buildingType });

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

      // Check if building already exists
      const existingBuilding = buildings.find(b => 
        b.user_id === user.id && 
        b.region === regionName && 
        b.type === buildingType
      );

      if (existingBuilding) {
        toast({
          title: "Edificio Esistente",
          description: `Hai già un ${buildingType} in ${regionName}`,
          variant: "destructive",
        });
        return;
      }

      // Define costs
      const costs: Record<BuildingType, Record<string, number>> = {
        fattoria: { cibo: 20, pietra: 30 },
        cava: { pietra: 40, ferro: 20 },
        miniera: { ferro: 30, carbone: 25 },
        pizzeria: { cibo: 50, pizza: 10 },
        caserma: { ferro: 100, pietra: 80 }
      };

      const cost = costs[buildingType];
      
      // Check resources
      for (const [resource, amount] of Object.entries(cost)) {
        const resourceKey = resource as keyof GamePlayer['resources'];
        if (currentPlayer.resources[resourceKey] < amount) {
          toast({
            title: "Risorse Insufficienti",
            description: `Non hai abbastanza ${resource} per costruire ${buildingType}`,
            variant: "destructive",
          });
          return;
        }
      }

      // Build structure
      const { error } = await supabase.from('buildings').insert({
        user_id: user.id,
        region: regionName,
        type: buildingType,
        level: 1,
        production: 10
      });

      if (error) {
        console.error('Building creation error:', error);
        throw error;
      }

      // Deduct resources
      const newResources: Partial<GamePlayer['resources']> = {};
      for (const [resource, amount] of Object.entries(cost)) {
        const resourceKey = resource as keyof GamePlayer['resources'];
        newResources[resourceKey] = currentPlayer.resources[resourceKey] - amount;
      }

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
    if (!user || !currentPlayer) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per addestrare unità",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Training units:', { regionName, unitType, quantity });

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

      // Check if player has barracks in this region
      const hasBarracks = buildings.some(b => 
        b.user_id === user.id && 
        b.region === regionName && 
        b.type === 'caserma'
      );

      if (!hasBarracks) {
        toast({
          title: "Caserma Richiesta",
          description: "Serve una caserma per addestrare unità",
          variant: "destructive",
        });
        return;
      }

      // Define unit costs
      const unitCosts: Record<UnitType, Record<string, number>> = {
        legionari: { cibo: 10, ferro: 5 },
        arcieri: { cibo: 8, ferro: 12 },
        cavalieri: { cibo: 20, ferro: 15 },
        catapulte: { ferro: 50, pietra: 30 }
      };

      const cost = unitCosts[unitType];
      
      // Calculate total cost
      const totalCost: Record<string, number> = {};
      for (const [resource, amount] of Object.entries(cost)) {
        totalCost[resource] = amount * quantity;
      }

      // Check resources
      for (const [resource, totalAmount] of Object.entries(totalCost)) {
        const resourceKey = resource as keyof GamePlayer['resources'];
        if (currentPlayer.resources[resourceKey] < totalAmount) {
          toast({
            title: "Risorse Insufficienti",
            description: `Non hai abbastanza ${resource} per addestrare ${quantity} ${unitType}`,
            variant: "destructive",
          });
          return;
        }
      }

      // Check if units already exist
      const existingUnits = armyUnits.find(u => 
        u.user_id === user.id && 
        u.region === regionName && 
        u.type === unitType
      );

      if (existingUnits) {
        // Update existing units
        const { error } = await supabase
          .from('army_units')
          .update({ quantity: existingUnits.quantity + quantity })
          .eq('id', existingUnits.id);

        if (error) throw error;
      } else {
        // Create new units
        const unitStats: Record<UnitType, { attack: number; defense: number }> = {
          legionari: { attack: 10, defense: 12 },
          arcieri: { attack: 12, defense: 8 },
          cavalieri: { attack: 18, defense: 15 },
          catapulte: { attack: 25, defense: 5 }
        };

        const stats = unitStats[unitType];
        
        const { error } = await supabase.from('army_units').insert({
          user_id: user.id,
          region: regionName,
          type: unitType,
          quantity: quantity,
          attack_power: stats.attack,
          defense_power: stats.defense
        });

        if (error) throw error;
      }

      // Deduct resources
      const newResources: Partial<GamePlayer['resources']> = {};
      for (const [resource, totalAmount] of Object.entries(totalCost)) {
        const resourceKey = resource as keyof GamePlayer['resources'];
        newResources[resourceKey] = currentPlayer.resources[resourceKey] - totalAmount;
      }

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

      const { error } = await supabase
        .from('buildings')
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
