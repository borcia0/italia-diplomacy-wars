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
  startResourceProduction: () => void;
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

  // Initialize new user with proper setup
  const initializeNewUser = async (userId: string, email: string, username: string) => {
    try {
      console.log('🚀 Initializing new user:', { userId, email, username });

      // 1. Create user resources with good starting amounts
      const { error: resourceError } = await supabase
        .from('user_resources')
        .upsert({
          user_id: userId,
          cibo: 500,
          pietra: 300,
          ferro: 200,
          carbone: 100,
          pizza: 50
        });

      if (resourceError) throw resourceError;
      console.log('✅ Resources created');

      // 2. Assign a random free region
      const { data: freeRegions } = await supabase
        .from('regions')
        .select('*')
        .is('owner_id', null)
        .limit(5);

      if (freeRegions && freeRegions.length > 0) {
        const randomRegion = freeRegions[Math.floor(Math.random() * freeRegions.length)];
        
        const { error: regionError } = await supabase
          .from('regions')
          .update({ owner_id: userId })
          .eq('id', randomRegion.id);

        if (regionError) throw regionError;
        console.log('✅ Region assigned:', randomRegion.name);

        // 3. Update profile with assigned region
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            username,
            email,
            current_region: randomRegion.name as RegionName
          });

        if (profileError) throw profileError;
        console.log('✅ Profile updated');

        // 4. Create starting buildings
        const { error: buildingError } = await supabase
          .from('buildings')
          .insert([
            {
              user_id: userId,
              region: randomRegion.name as RegionName,
              type: 'fattoria' as BuildingType,
              level: 1,
              production: 20
            },
            {
              user_id: userId,
              region: randomRegion.name as RegionName,
              type: 'caserma' as BuildingType,
              level: 1,
              production: 0
            }
          ]);

        if (buildingError) throw buildingError;
        console.log('✅ Starting buildings created');

        // 5. Create starting army
        const { error: armyError } = await supabase
          .from('army_units')
          .insert({
            user_id: userId,
            region: randomRegion.name as RegionName,
            type: 'legionari' as UnitType,
            quantity: 100,
            attack_power: 10,
            defense_power: 12
          });

        if (armyError) throw armyError;
        console.log('✅ Starting army created');

        toast({
          title: "🎉 Benvenuto nel Regno d'Italia!",
          description: `Il tuo regno è stato creato in ${randomRegion.capital}. Hai ricevuto risorse iniziali e un esercito!`,
        });
      }
    } catch (error) {
      console.error('❌ Error initializing user:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'inizializzazione del giocatore",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Refreshing game data for user:', user.id);
      
      const [playersData, regionsData, alliancesData, warsData, resourcesData, buildingsData, armyData] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('regions').select('*'),
        supabase.from('alliances').select('*'),
        supabase.from('wars').select('*'),
        supabase.from('user_resources').select('*'),
        supabase.from('buildings').select('*'),
        supabase.from('army_units').select('*')
      ]);

      console.log('📊 Data fetched:', { 
        players: playersData.data?.length, 
        resources: resourcesData.data?.length,
        buildings: buildingsData.data?.length,
        armyUnits: armyData.data?.length 
      });

      // Filter ONLY real human players - NO BOTS
      if (playersData.data) {
        const realPlayers = playersData.data.filter(player => 
          player.email && 
          player.email.includes('@') && 
          !player.username.toLowerCase().includes('bot') &&
          !player.username.toLowerCase().includes('ai') &&
          !player.username.toLowerCase().includes('cpu') &&
          !player.username.toLowerCase().includes('giocatore') &&
          player.email !== 'bot@example.com'
        );
        
        const playersWithResources = realPlayers.map(player => {
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
        setCurrentPlayer(current || null);

        // Initialize new user if they don't exist
        if (!current && user.email) {
          await initializeNewUser(user.id, user.email, user.email.split('@')[0]);
          // Refresh after initialization
          setTimeout(() => refreshData(), 2000);
        }
      }

      if (regionsData.data) setRegions(regionsData.data);
      
      // Filter alliances to exclude bot alliances
      if (alliancesData.data && playersData.data) {
        const realAlliances = alliancesData.data.filter(alliance => {
          const proposer = playersData.data.find(p => p.id === alliance.proposer_id);
          const target = playersData.data.find(p => p.id === alliance.target_id);
          return proposer && target && 
                 proposer.email?.includes('@') && target.email?.includes('@') &&
                 !proposer.username.toLowerCase().includes('bot') && 
                 !target.username.toLowerCase().includes('bot') &&
                 !proposer.username.toLowerCase().includes('giocatore') &&
                 !target.username.toLowerCase().includes('giocatore');
        });
        setAlliances(realAlliances);
      }
      
      // Filter wars to exclude bot wars
      if (warsData.data && playersData.data) {
        const realWars = warsData.data.filter(war => {
          const attacker = playersData.data.find(p => p.id === war.attacker_id);
          const defender = playersData.data.find(p => p.id === war.defender_id);
          return attacker && defender && 
                 attacker.email?.includes('@') && defender.email?.includes('@') &&
                 !attacker.username.toLowerCase().includes('bot') && 
                 !defender.username.toLowerCase().includes('bot') &&
                 !attacker.username.toLowerCase().includes('giocatore') &&
                 !defender.username.toLowerCase().includes('giocatore');
        });
        setWars(realWars);
      }
      
      if (buildingsData.data) setBuildings(buildingsData.data.filter(b => b.user_id));
      if (armyData.data) setArmyUnits(armyData.data.filter(a => a.user_id));

    } catch (error) {
      console.error('❌ Error fetching game data:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei dati di gioco",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Resource production system - runs every minute for testing
  const startResourceProduction = () => {
    const interval = setInterval(async () => {
      if (!user || !currentPlayer) return;

      try {
        const userBuildings = buildings.filter(b => b.user_id === user.id);
        let ciboProduction = 0;
        let pietraProduction = 0;
        let ferroProduction = 0;
        let pizzaProduction = 0;

        userBuildings.forEach(building => {
          const productionPerHour = building.level * 10; // 10 per level per hour
          switch (building.type) {
            case 'fattoria':
              ciboProduction += productionPerHour;
              break;
            case 'cava':
              pietraProduction += productionPerHour;
              break;
            case 'miniera':
              ferroProduction += productionPerHour;
              break;
            case 'pizzeria':
              pizzaProduction += productionPerHour;
              break;
          }
        });

        if (ciboProduction > 0 || pietraProduction > 0 || ferroProduction > 0 || pizzaProduction > 0) {
          const newResources = {
            cibo: Math.min(currentPlayer.resources.cibo + Math.floor(ciboProduction / 60), 10000), // Cap at 10k
            pietra: Math.min(currentPlayer.resources.pietra + Math.floor(pietraProduction / 60), 10000),
            ferro: Math.min(currentPlayer.resources.ferro + Math.floor(ferroProduction / 60), 10000),
            pizza: Math.min(currentPlayer.resources.pizza + Math.floor(pizzaProduction / 60), 10000)
          };

          await updateResources(newResources);
          console.log('🏭 Resources produced:', { ciboProduction: Math.floor(ciboProduction / 60), pietraProduction: Math.floor(pietraProduction / 60) });
        }
      } catch (error) {
        console.error('❌ Error in resource production:', error);
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (user) {
      refreshData();
      
      const cleanup = startResourceProduction();
      
      const channel = supabase
        .channel('game-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          console.log('🔄 Profile change detected, refreshing...');
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_resources' }, () => {
          console.log('🔄 Resource change detected, refreshing...');
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'regions' }, () => {
          console.log('🔄 Region change detected, refreshing...');
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'buildings' }, () => {
          console.log('🔄 Building change detected, refreshing...');
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'army_units' }, () => {
          console.log('🔄 Army change detected, refreshing...');
          refreshData();
        })
        .subscribe();

      return () => {
        cleanup();
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const declareWar = async (targetPlayerId: string, targetRegion: RegionName) => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per dichiarare guerra",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('⚔️ Declaring war:', { targetPlayerId, targetRegion });
      
      // Check if user has enough resources for war
      if (!currentPlayer || currentPlayer.resources.ferro < 50 || currentPlayer.resources.cibo < 100) {
        toast({
          title: "Risorse Insufficienti",
          description: "Servono 50 Ferro e 100 Cibo per dichiarare guerra",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('wars').insert({
        attacker_id: user.id,
        defender_id: targetPlayerId,
        target_region: targetRegion,
        status: 'declared'
      });

      if (error) throw error;

      // Deduct war costs
      await updateResources({
        ferro: currentPlayer.resources.ferro - 50,
        cibo: currentPlayer.resources.cibo - 100
      });

      toast({
        title: "⚔️ Guerra Dichiarata!",
        description: `Hai dichiarato guerra per il controllo di ${targetRegion}! Costo: 50 Ferro, 100 Cibo`,
        variant: "destructive",
      });

      await refreshData();
    } catch (error) {
      console.error('❌ Error declaring war:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile dichiarare guerra",
        variant: "destructive",
      });
    }
  };

  const proposeAlliance = async (targetPlayerId: string, message?: string) => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per proporre alleanze",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🤝 Proposing alliance:', { targetPlayerId, message });
      
      // Check if alliance already exists
      const existingAlliance = alliances.find(a => 
        (a.proposer_id === user.id && a.target_id === targetPlayerId) ||
        (a.proposer_id === targetPlayerId && a.target_id === user.id)
      );

      if (existingAlliance) {
        toast({
          title: "Alleanza Esistente",
          description: "Esiste già una proposta di alleanza con questo giocatore",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('alliances').insert({
        proposer_id: user.id,
        target_id: targetPlayerId,
        status: 'pending',
        message: message || 'Proposta di alleanza'
      });

      if (error) throw error;

      toast({
        title: "🤝 Alleanza Proposta!",
        description: "La tua proposta di alleanza è stata inviata",
      });

      await refreshData();
    } catch (error) {
      console.error('❌ Error proposing alliance:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile proporre l'alleanza",
        variant: "destructive",
      });
    }
  };

  const acceptAlliance = async (allianceId: string) => {
    try {
      console.log('✅ Accepting alliance:', allianceId);
      
      const { error } = await supabase.from('alliances')
        .update({ status: 'active' })
        .eq('id', allianceId);

      if (error) throw error;

      toast({
        title: "🤝 Alleanza Accettata!",
        description: "Hai accettato l'alleanza",
      });

      await refreshData();
    } catch (error) {
      console.error('❌ Error accepting alliance:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile accettare l'alleanza",
        variant: "destructive",
      });
    }
  };

  const rejectAlliance = async (allianceId: string) => {
    try {
      console.log('❌ Rejecting alliance:', allianceId);
      
      const { error } = await supabase.from('alliances')
        .update({ status: 'rejected' })
        .eq('id', allianceId);

      if (error) throw error;

      toast({
        title: "❌ Alleanza Rifiutata",
        description: "Hai rifiutato l'alleanza",
      });

      await refreshData();
    } catch (error) {
      console.error('❌ Error rejecting alliance:', error);
    }
  };

  const updateResources = async (newResources: Partial<GamePlayer['resources']>) => {
    if (!user) return;

    try {
      console.log('💰 Updating resources:', newResources);
      
      const { error } = await supabase
        .from('user_resources')
        .update(newResources)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Resources updated successfully');
      await refreshData();
    } catch (error) {
      console.error('❌ Error updating resources:', error);
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
      console.log('🏴 Attempting to conquer territory:', regionName);
      
      // Check if region is free
      const region = regions.find(r => r.name === regionName);
      if (region && region.owner_id) {
        toast({
          title: "Territorio Occupato",
          description: "Questo territorio è già controllato da un altro giocatore",
          variant: "destructive",
        });
        return;
      }

      // Fixed conquest cost
      const conquestCost = { ferro: 100, cibo: 200 };
      if (currentPlayer.resources.ferro < conquestCost.ferro || currentPlayer.resources.cibo < conquestCost.cibo) {
        toast({
          title: "Risorse Insufficienti",
          description: `Servono ${conquestCost.ferro} Ferro e ${conquestCost.cibo} Cibo per conquistare un territorio`,
          variant: "destructive",
        });
        return;
      }

      // Update region ownership
      const { error: regionError } = await supabase
        .from('regions')
        .update({ owner_id: user.id })
        .eq('name', regionName);

      if (regionError) throw regionError;

      // Create initial buildings in the new territory
      const { error: buildingError } = await supabase
        .from('buildings')
        .insert({
          user_id: user.id,
          region: regionName,
          type: 'fattoria' as BuildingType,
          level: 1,
          production: 15
        });

      if (buildingError) console.error('Error creating initial building:', buildingError);

      // Deduct resources
      const newResources = {
        ferro: currentPlayer.resources.ferro - conquestCost.ferro,
        cibo: currentPlayer.resources.cibo - conquestCost.cibo
      };
      
      await updateResources(newResources);

      toast({
        title: "🏴 Territorio Conquistato!",
        description: `Hai conquistato ${regionName}! Costo: ${conquestCost.ferro} Ferro, ${conquestCost.cibo} Cibo`,
      });

      await refreshData();
    } catch (error) {
      console.error('❌ Error conquering territory:', error);
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
      console.log('🏗️ Building structure:', { regionName, buildingType });

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

      // Fixed building costs
      const costs: Record<BuildingType, Record<string, number>> = {
        fattoria: { cibo: 50, pietra: 100 },
        cava: { pietra: 80, ferro: 60 },
        miniera: { ferro: 100, carbone: 80 },
        pizzeria: { cibo: 150, pizza: 30 },
        caserma: { ferro: 200, pietra: 150 }
      };

      const cost = costs[buildingType];
      
      // Check resources
      for (const [resource, amount] of Object.entries(cost)) {
        const resourceKey = resource as keyof GamePlayer['resources'];
        if (currentPlayer.resources[resourceKey] < amount) {
          toast({
            title: "Risorse Insufficienti",
            description: `Non hai abbastanza ${resource}: servono ${amount}, hai ${currentPlayer.resources[resourceKey]}`,
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

      if (error) throw error;

      // Deduct resources
      const newResources: Partial<GamePlayer['resources']> = {};
      for (const [resource, amount] of Object.entries(cost)) {
        const resourceKey = resource as keyof GamePlayer['resources'];
        newResources[resourceKey] = currentPlayer.resources[resourceKey] - amount;
      }

      await updateResources(newResources);

      toast({
        title: "🏗️ Edificio Costruito!",
        description: `Hai costruito ${buildingType} in ${regionName}`,
      });

    } catch (error) {
      console.error('❌ Error building structure:', error);
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
      console.log('🛡️ Training units:', { regionName, unitType, quantity });

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

      // Check for barracks
      const hasBarracks = buildings.some(b => 
        b.user_id === user.id && 
        b.region === regionName && 
        b.type === 'caserma'
      );

      if (!hasBarracks) {
        toast({
          title: "Caserma Richiesta",
          description: "Devi costruire una caserma per addestrare unità",
          variant: "destructive",
        });
        return;
      }

      // Fixed unit costs
      const unitCosts: Record<UnitType, Record<string, number>> = {
        legionari: { cibo: 20, ferro: 10 },
        arcieri: { cibo: 15, ferro: 25 },
        cavalieri: { cibo: 40, ferro: 30 },
        catapulte: { ferro: 80, pietra: 60 }
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
            description: `Non hai abbastanza ${resource}: servono ${totalAmount}, hai ${currentPlayer.resources[resourceKey]}`,
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
          arcieri: { attack: 15, defense: 8 },
          cavalieri: { attack: 20, defense: 18 },
          catapulte: { attack: 30, defense: 5 }
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
        title: "🛡️ Unità Addestrate!",
        description: `Hai addestrato ${quantity} ${unitType} in ${regionName}`,
      });

    } catch (error) {
      console.error('❌ Error training units:', error);
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
      console.log('⭐ Upgrading building:', buildingId);
      
      const building = buildings.find(b => b.id === buildingId);
      if (!building || building.user_id !== user.id) {
        toast({
          title: "Errore",
          description: "Non puoi migliorare questo edificio",
          variant: "destructive",
        });
        return;
      }

      // Fixed upgrade cost
      const upgradeCost = building.level * 50; // 50 stone per level
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
          production: (building.level + 1) * 10 // 10 production per level
        })
        .eq('id', buildingId);

      if (error) throw error;

      await updateResources({ pietra: currentPlayer.resources.pietra - upgradeCost });

      toast({
        title: "⭐ Edificio Migliorato!",
        description: `Hai migliorato ${building.type} al livello ${building.level + 1}`,
      });

    } catch (error) {
      console.error('❌ Error upgrading building:', error);
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
      refreshData,
      startResourceProduction
    }}>
      {children}
    </GameContext.Provider>
  );
};
