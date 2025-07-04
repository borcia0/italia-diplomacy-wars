
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseGame } from '../hooks/useSupabaseGame';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Shield, Swords, Crown, Users, Flag, Hammer, Star } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type RegionName = Database['public']['Enums']['region_name'];
type BuildingType = Database['public']['Enums']['building_type'];
type UnitType = Database['public']['Enums']['unit_type'];

const RealGameMap = () => {
  const { regions, players, currentPlayer, buildings, armyUnits, declareWar, conquestTerritory, buildStructure, trainUnits, upgradeBuilding, loading } = useSupabaseGame();
  const { user } = useSupabaseAuth();
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'build' | 'army'>('info');

  const getRegionOwner = (regionName: string) => {
    const region = regions.find(r => r.name === regionName);
    if (!region?.owner_id) return null;
    return players.find(p => p.id === region.owner_id);
  };

  const getRegionStatus = (regionName: string) => {
    const region = regions.find(r => r.name === regionName);
    if (!region?.owner_id) return 'neutral';
    if (region.owner_id === user?.id) return 'controlled';
    return 'enemy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'controlled': return 'bg-green-500 hover:bg-green-600 border-yellow-300';
      case 'enemy': return 'bg-red-500 hover:bg-red-600';
      case 'neutral': return 'bg-gray-400 hover:bg-gray-500';
      default: return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  const getRegionBuildings = (regionName: string) => {
    return buildings.filter(b => b.region === regionName && b.user_id === user?.id);
  };

  const getRegionArmyUnits = (regionName: string) => {
    return armyUnits.filter(u => u.region === regionName && u.user_id === user?.id);
  };

  const italianRegions = [
    { name: 'valle-daosta' as RegionName, displayName: 'Valle d\'Aosta', position: 'top-left' },
    { name: 'piemonte' as RegionName, displayName: 'Piemonte', position: 'top-left' },
    { name: 'lombardia' as RegionName, displayName: 'Lombardia', position: 'top-center' },
    { name: 'trentino' as RegionName, displayName: 'Trentino', position: 'top-center' },
    { name: 'veneto' as RegionName, displayName: 'Veneto', position: 'top-right' },
    { name: 'friuli' as RegionName, displayName: 'Friuli', position: 'top-right' },
    { name: 'liguria' as RegionName, displayName: 'Liguria', position: 'center-left' },
    { name: 'emilia-romagna' as RegionName, displayName: 'Emilia-Romagna', position: 'center' },
    { name: 'toscana' as RegionName, displayName: 'Toscana', position: 'center-left' },
    { name: 'umbria' as RegionName, displayName: 'Umbria', position: 'center' },
    { name: 'marche' as RegionName, displayName: 'Marche', position: 'center-right' },
    { name: 'lazio' as RegionName, displayName: 'Lazio', position: 'center' },
    { name: 'abruzzo' as RegionName, displayName: 'Abruzzo', position: 'center-right' },
    { name: 'molise' as RegionName, displayName: 'Molise', position: 'center-right' },
    { name: 'campania' as RegionName, displayName: 'Campania', position: 'bottom-left' },
    { name: 'puglia' as RegionName, displayName: 'Puglia', position: 'bottom-right' },
    { name: 'basilicata' as RegionName, displayName: 'Basilicata', position: 'bottom-center' },
    { name: 'calabria' as RegionName, displayName: 'Calabria', position: 'bottom-center' },
    { name: 'sicilia' as RegionName, displayName: 'Sicilia', position: 'bottom' },
    { name: 'sardegna' as RegionName, displayName: 'Sardegna', position: 'bottom-left' },
  ];

  const handleRegionClick = (regionName: RegionName) => {
    const region = regions.find(r => r.name === regionName);
    const owner = getRegionOwner(regionName);
    setSelectedRegion({
      ...region,
      owner,
      status: getRegionStatus(regionName),
      displayName: italianRegions.find(r => r.name === regionName)?.displayName || regionName
    });
    setActiveTab('info');
  };

  const handleDeclareWar = async (targetRegion: RegionName, defenderId: string) => {
    await declareWar(defenderId, targetRegion);
    setSelectedRegion(null);
  };

  const handleConquestTerritory = async (regionName: RegionName) => {
    await conquestTerritory(regionName);
    setSelectedRegion(null);
  };

  const handleBuildStructure = async (buildingType: BuildingType) => {
    if (selectedRegion) {
      await buildStructure(selectedRegion.name as RegionName, buildingType);
    }
  };

  const handleTrainUnits = async (unitType: UnitType, quantity: number) => {
    if (selectedRegion) {
      await trainUnits(selectedRegion.name as RegionName, unitType, quantity);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Map Area */}
      <div className="flex-1 p-4 lg:p-6">
        <div className="bg-gradient-to-br from-green-100 via-white to-red-100 rounded-lg shadow-lg h-full relative overflow-auto border-2 border-gray-200">
          <div className="absolute inset-0 p-4 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                🏛️ Regno d'Italia - {new Date().getFullYear()}
              </h2>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <Badge className="bg-blue-100 text-blue-800">
                  <Users className="w-3 h-3 mr-1" />
                  {players.length} Giocatori
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  <Crown className="w-3 h-3 mr-1" />
                  {currentPlayer?.username || 'Ospite'}
                </Badge>
              </div>
            </div>
            
            {/* Italian Map Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 h-5/6 max-w-6xl mx-auto">
              {italianRegions.map(region => {
                const status = getRegionStatus(region.name);
                const owner = getRegionOwner(region.name);
                
                return (
                  <div
                    key={region.name}
                    className={`${getStatusColor(status)} rounded-lg p-2 lg:p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-md text-white text-center min-h-[80px] lg:min-h-[100px] flex flex-col justify-center ${
                      status === 'controlled' ? 'ring-2 ring-yellow-400' : ''
                    }`}
                    onClick={() => handleRegionClick(region.name)}
                  >
                    <div className="mb-1 lg:mb-2">
                      {status === 'controlled' ? (
                        <Crown className="w-4 h-4 lg:w-6 lg:h-6 mx-auto" />
                      ) : status === 'enemy' ? (
                        <Swords className="w-4 h-4 lg:w-6 lg:h-6 mx-auto" />
                      ) : (
                        <Shield className="w-4 h-4 lg:w-6 lg:h-6 mx-auto" />
                      )}
                    </div>
                    <h3 className="font-bold text-xs lg:text-sm">{region.displayName}</h3>
                    {owner && (
                      <p className="text-xs opacity-90 mt-1">{owner.username}</p>
                    )}
                    {!owner && (
                      <p className="text-xs opacity-90 mt-1">Libera</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg">
              <h4 className="font-semibold text-sm mb-2">🗺️ Legenda</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded border border-yellow-300"></div>
                  <span>I Tuoi Territori</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Territori Nemici</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span>Territori Liberi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Region Details Panel */}
      {selectedRegion && (
        <div className="w-full lg:w-96 p-4 lg:p-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>{selectedRegion.displayName}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {selectedRegion.status === 'controlled' && (
                    <Badge className="bg-green-100 text-green-800">Tua</Badge>
                  )}
                  {selectedRegion.status === 'enemy' && (
                    <Badge className="bg-red-100 text-red-800">Nemica</Badge>
                  )}
                  {selectedRegion.status === 'neutral' && (
                    <Badge className="bg-gray-100 text-gray-800">Libera</Badge>
                  )}
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1 mt-4">
                <Button
                  variant={activeTab === 'info' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('info')}
                >
                  Info
                </Button>
                {selectedRegion.status === 'controlled' && (
                  <>
                    <Button
                      variant={activeTab === 'build' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('build')}
                    >
                      Costruisci
                    </Button>
                    <Button
                      variant={activeTab === 'army' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('army')}
                    >
                      Esercito
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {activeTab === 'info' && (
                <>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">📍 Informazioni</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Capitale:</span>
                        <span className="font-medium">{selectedRegion.capital}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Governatore:</span>
                        <span className="font-medium">
                          {selectedRegion.owner ? selectedRegion.owner.username : 'Nessuno'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Popolazione:</span>
                        <span className="font-medium">{selectedRegion.population?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedRegion.status === 'controlled' && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">🏗️ Edifici</h4>
                      <div className="space-y-1 text-sm">
                        {getRegionBuildings(selectedRegion.name).map(building => (
                          <div key={building.id} className="flex justify-between items-center">
                            <span>{building.type} (Lv.{building.level})</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => upgradeBuilding(building.id)}
                            >
                              <Star className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        {getRegionBuildings(selectedRegion.name).length === 0 && (
                          <p className="text-gray-500">Nessun edificio</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t">
                    <Button
                      onClick={() => setSelectedRegion(null)}
                      variant="outline"
                      className="w-full"
                    >
                      ❌ Chiudi
                    </Button>
                    
                    {selectedRegion.status === 'neutral' && (
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleConquestTerritory(selectedRegion.name as RegionName)}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Conquista (50 Ferro + 100 Cibo)
                      </Button>
                    )}
                    
                    {selectedRegion.status === 'enemy' && selectedRegion.owner && (
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleDeclareWar(selectedRegion.name as RegionName, selectedRegion.owner.id)}
                      >
                        <Swords className="w-4 h-4 mr-2" />
                        Dichiara Guerra
                      </Button>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'build' && selectedRegion.status === 'controlled' && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">🏗️ Costruisci Edifici</h4>
                  {[
                    { type: 'fattoria' as BuildingType, name: 'Fattoria', cost: '20 Cibo + 30 Pietra', emoji: '🌾' },
                    { type: 'cava' as BuildingType, name: 'Cava', cost: '40 Pietra + 20 Ferro', emoji: '⛏️' },
                    { type: 'miniera' as BuildingType, name: 'Miniera', cost: '30 Ferro + 25 Carbone', emoji: '⚒️' },
                    { type: 'pizzeria' as BuildingType, name: 'Pizzeria', cost: '50 Cibo + 10 Pizza', emoji: '🍕' },
                    { type: 'caserma' as BuildingType, name: 'Caserma', cost: '100 Ferro + 80 Pietra', emoji: '🏰' }
                  ].map(building => (
                    <Button
                      key={building.type}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleBuildStructure(building.type)}
                    >
                      <span className="mr-2">{building.emoji}</span>
                      <div className="text-left">
                        <div className="font-medium">{building.name}</div>
                        <div className="text-xs text-gray-500">{building.cost}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {activeTab === 'army' && selectedRegion.status === 'controlled' && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">⚔️ Addestra Unità</h4>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-sm mb-2">Unità Attuali:</h5>
                    {getRegionArmyUnits(selectedRegion.name).map(unit => (
                      <div key={unit.id} className="flex justify-between text-sm">
                        <span>{unit.type}</span>
                        <span>{unit.quantity}</span>
                      </div>
                    ))}
                    {getRegionArmyUnits(selectedRegion.name).length === 0 && (
                      <p className="text-gray-500 text-sm">Nessuna unità</p>
                    )}
                  </div>

                  {[
                    { type: 'legionari' as UnitType, name: 'Legionari', cost: '10 Cibo + 5 Ferro', emoji: '⚔️' },
                    { type: 'arcieri' as UnitType, name: 'Arcieri', cost: '8 Cibo + 12 Ferro', emoji: '🏹' },
                    { type: 'cavalieri' as UnitType, name: 'Cavalieri', cost: '20 Cibo + 15 Ferro', emoji: '🐎' },
                    { type: 'catapulte' as UnitType, name: 'Catapulte', cost: '50 Ferro + 30 Pietra', emoji: '🎯' }
                  ].map(unit => (
                    <Button
                      key={unit.type}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleTrainUnits(unit.type, 10)}
                    >
                      <span className="mr-2">{unit.emoji}</span>
                      <div className="text-left">
                        <div className="font-medium">Addestra 10 {unit.name}</div>
                        <div className="text-xs text-gray-500">{unit.cost} (x10)</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RealGameMap;
