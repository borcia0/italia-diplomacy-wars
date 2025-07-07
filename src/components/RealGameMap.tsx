
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseGame } from '@/hooks/useSupabaseGame';
import { Wheat, Pickaxe, Zap, Flame, Pizza, Crown, Users, Swords, Shield, MapPin } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type RegionName = Database['public']['Enums']['region_name'];

const RealGameMap = () => {
  const { regions, players, currentPlayer, buildings, armyUnits, conquestTerritory } = useSupabaseGame();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Italian regions data with real coordinates and information
  const regionsData: Record<string, { 
    name: string; 
    capital: string; 
    color: string; 
    position: { top: string; left: string };
    description: string;
  }> = {
    'valle-daosta': {
      name: 'Valle d\'Aosta',
      capital: 'Aosta',
      color: 'bg-blue-500',
      position: { top: '15%', left: '8%' },
      description: 'Regione montana al confine con Francia e Svizzera'
    },
    'piemonte': {
      name: 'Piemonte',
      capital: 'Torino',
      color: 'bg-red-500',
      position: { top: '20%', left: '12%' },
      description: 'Terra di vini pregiati e industria automobilistica'
    },
    'lombardia': {
      name: 'Lombardia',
      capital: 'Milano',
      color: 'bg-green-500',
      position: { top: '18%', left: '22%' },
      description: 'Cuore economico d\'Italia'
    },
    'trentino': {
      name: 'Trentino-Alto Adige',
      capital: 'Trento',
      color: 'bg-purple-500',
      position: { top: '12%', left: '28%' },
      description: 'Regione alpina bilingue'
    },
    'veneto': {
      name: 'Veneto',
      capital: 'Venezia',
      color: 'bg-cyan-500',
      position: { top: '22%', left: '32%' },
      description: 'Terra della Serenissima'
    },
    'friuli': {
      name: 'Friuli-Venezia Giulia',
      capital: 'Trieste',
      color: 'bg-indigo-500',
      position: { top: '18%', left: '38%' },
      description: 'Crocevia di culture'
    },
    'liguria': {
      name: 'Liguria',
      capital: 'Genova',
      color: 'bg-teal-500',
      position: { top: '32%', left: '14%' },
      description: 'Riviera italiana sul Mediterraneo'
    },
    'emilia-romagna': {
      name: 'Emilia-Romagna',
      capital: 'Bologna',
      color: 'bg-orange-500',
      position: { top: '30%', left: '26%' },
      description: 'Terra della gastronomia italiana'
    },
    'toscana': {
      name: 'Toscana',
      capital: 'Firenze',
      color: 'bg-yellow-500',
      position: { top: '38%', left: '24%' },
      description: 'Culla del Rinascimento'
    },
    'marche': {
      name: 'Marche',
      capital: 'Ancona',
      color: 'bg-pink-500',
      position: { top: '42%', left: '32%' },
      description: 'Bellezze tra mare e montagna'
    },
    'umbria': {
      name: 'Umbria',
      capital: 'Perugia',
      color: 'bg-emerald-500',
      position: { top: '46%', left: '28%' },
      description: 'Cuore verde d\'Italia'
    },
    'lazio': {
      name: 'Lazio',
      capital: 'Roma',
      color: 'bg-amber-500',
      position: { top: '52%', left: '26%' },
      description: 'Sede della Capitale Eterna'
    },
    'abruzzo': {
      name: 'Abruzzo',
      capital: 'L\'Aquila',
      color: 'bg-lime-500',
      position: { top: '50%', left: '34%' },
      description: 'Parchi nazionali e natura selvaggia'
    },
    'molise': {
      name: 'Molise',
      capital: 'Campobasso',
      color: 'bg-violet-500',
      position: { top: '56%', left: '36%' },
      description: 'Piccola regione dai grandi paesaggi'
    },
    'campania': {
      name: 'Campania',
      capital: 'Napoli',
      color: 'bg-rose-500',
      position: { top: '64%', left: '30%' },
      description: 'Terra del Vesuvio e della pizza'
    },
    'basilicata': {
      name: 'Basilicata',
      capital: 'Potenza',
      color: 'bg-slate-500',
      position: { top: '68%', left: '36%' },
      description: 'Paesaggi lunari e antiche tradizioni'
    },
    'puglia': {
      name: 'Puglia',
      capital: 'Bari',
      color: 'bg-zinc-500',
      position: { top: '70%', left: '42%' },
      description: 'Tacco d\'Italia sul mare'
    },
    'calabria': {
      name: 'Calabria',
      capital: 'Catanzaro',
      color: 'bg-stone-500',
      position: { top: '78%', left: '36%' },
      description: 'Punta dello stivale'
    },
    'sicilia': {
      name: 'Sicilia',
      capital: 'Palermo',
      color: 'bg-red-600',
      position: { top: '88%', left: '28%' },
      description: 'Isola del sole e della storia'
    },
    'sardegna': {
      name: 'Sardegna',
      capital: 'Cagliari',
      color: 'bg-blue-600',
      position: { top: '70%', left: '14%' },
      description: 'Isola dai mari cristallini'
    }
  };

  const getRegionOwner = (regionName: string) => {
    const region = regions.find(r => r.name === regionName);
    if (!region?.owner_id) return null;
    return players.find(p => p.id === region.owner_id);
  };

  const getRegionBuildings = (regionName: string) => {
    return buildings.filter(b => b.region === regionName);
  };

  const getRegionArmy = (regionName: string) => {
    return armyUnits.filter(a => a.region === regionName);
  };

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(selectedRegion === regionName ? null : regionName);
  };

  const handleConquest = async (regionName: string) => {
    try {
      await conquestTerritory(regionName as RegionName);
    } catch (error) {
      console.error('Errore nella conquista:', error);
    }
  };

  const selectedRegionData = selectedRegion ? regionsData[selectedRegion] : null;
  const selectedRegionOwner = selectedRegion ? getRegionOwner(selectedRegion) : null;
  const selectedRegionBuildings = selectedRegion ? getRegionBuildings(selectedRegion) : [];
  const selectedRegionArmy = selectedRegion ? getRegionArmy(selectedRegion) : [];

  return (
    <div className="h-full bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative">
      {/* Pannello Risorse - Spostato in alto a sinistra */}
      <div className="absolute top-4 left-4 z-20">
        <Card className="p-4 bg-white/90 backdrop-blur-sm shadow-lg">
          <h3 className="font-bold text-lg mb-3 text-center">🏛️ Tesoro Reale</h3>
          {currentPlayer?.resources ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <Wheat className="w-4 h-4 mr-2 text-orange-600" />
                <span className="font-medium">{currentPlayer.resources.cibo}</span>
              </div>
              <div className="flex items-center">
                <Pickaxe className="w-4 h-4 mr-2 text-gray-600" />
                <span className="font-medium">{currentPlayer.resources.pietra}</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-red-600" />
                <span className="font-medium">{currentPlayer.resources.ferro}</span>
              </div>
              <div className="flex items-center">
                <Pizza className="w-4 h-4 mr-2 text-yellow-600" />
                <span className="font-medium">{currentPlayer.resources.pizza}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Caricamento...</div>
          )}
        </Card>
      </div>

      {/* Mappa d'Italia */}
      <div className="flex h-full">
        {/* Mappa */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-100">
            {/* Mare */}
            <div className="w-full h-full relative">
              {/* Territori italiani */}
              {Object.entries(regionsData).map(([key, regionData]) => {
                const owner = getRegionOwner(key);
                const isSelected = selectedRegion === key;
                const isOwned = owner !== null;
                const isOwnedByCurrentPlayer = owner?.id === currentPlayer?.id;
                
                return (
                  <div
                    key={key}
                    className={`absolute cursor-pointer transform transition-all duration-200 ${
                      isSelected ? 'scale-125 z-10' : 'hover:scale-110'
                    }`}
                    style={{
                      top: regionData.position.top,
                      left: regionData.position.left,
                    }}
                    onClick={() => handleRegionClick(key)}
                  >
                    <div className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold
                      ${isOwnedByCurrentPlayer 
                        ? 'bg-green-500 text-white border-green-700' 
                        : isOwned 
                          ? 'bg-red-500 text-white border-red-700'
                          : 'bg-gray-300 text-gray-700 border-gray-500'
                      }
                      ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                      shadow-lg hover:shadow-xl
                    `}>
                      {isOwnedByCurrentPlayer ? <Crown className="w-4 h-4" /> : 
                       isOwned ? <Shield className="w-4 h-4" /> : 
                       <MapPin className="w-4 h-4" />}
                    </div>
                    <div className="mt-1 text-center">
                      <div className="text-xs font-medium bg-white/80 rounded px-1 shadow">
                        {regionData.capital}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pannello informazioni regione */}
        {selectedRegion && selectedRegionData && (
          <div className="w-80 bg-white border-l border-gray-200">
            <ScrollArea className="h-full">
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedRegionData.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedRegionData.description}
                  </p>
                  
                  {selectedRegionOwner ? (
                    <div className="mb-4">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        <Crown className="w-4 h-4 mr-2" />
                        {selectedRegionOwner.username}
                      </Badge>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        🏴‍☠️ Territorio Libero
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Azioni */}
                {!selectedRegionOwner && (
                  <div className="mb-6">
                    <Button 
                      onClick={() => handleConquest(selectedRegion)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      ⚔️ Conquista Territorio
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Costo: 100 Ferro, 200 Cibo
                    </p>
                  </div>
                )}

                {/* Edifici nella regione */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <div className="w-5 h-5 bg-orange-500 rounded mr-2"></div>
                    Edifici
                  </h3>
                  {selectedRegionBuildings.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRegionBuildings.map((building) => (
                        <div key={building.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">
                              {building.type.replace('-', ' ')}
                            </span>
                            <Badge variant="outline">
                              Lv. {building.level}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Produzione: {building.production}/ora
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Nessun edificio presente
                    </div>
                  )}
                </div>

                {/* Eserciti nella regione */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <Swords className="w-5 h-5 text-red-500 mr-2" />
                    Eserciti
                  </h3>
                  {selectedRegionArmy.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRegionArmy.map((army) => (
                        <div key={army.id} className="bg-red-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">
                              {army.type}
                            </span>
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              {army.quantity}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 flex justify-between">
                            <span>ATK: {army.attack_power}</span>
                            <span>DEF: {army.defense_power}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Nessun esercito presente
                    </div>
                  )}
                </div>

                {/* Statistiche popolazione */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    Popolazione
                  </h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {regions.find(r => r.name === selectedRegion)?.population?.toLocaleString() || '1,000,000'}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealGameMap;
