
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseGame } from '../hooks/useSupabaseGame';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Shield, Swords, Crown, Users, Flag, Hammer, Star, Plus, Minus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type RegionName = Database['public']['Enums']['region_name'];
type BuildingType = Database['public']['Enums']['building_type'];
type UnitType = Database['public']['Enums']['unit_type'];

const RealGameMap = () => {
  const { regions, players, currentPlayer, buildings, armyUnits, declareWar, conquestTerritory, buildStructure, trainUnits, upgradeBuilding, loading } = useSupabaseGame();
  const { user } = useSupabaseAuth();
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'build' | 'army'>('info');
  const [unitQuantities, setUnitQuantities] = useState<Record<UnitType, number>>({
    legionari: 10,
    arcieri: 10,
    cavalieri: 5,
    catapulte: 1
  });

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
      case 'controlled': return 'bg-green-500 hover:bg-green-600 border-2 border-yellow-400 shadow-lg';
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

  const getTotalArmyPower = (regionName: string) => {
    const units = getRegionArmyUnits(regionName);
    const attack = units.reduce((total, unit) => total + (unit.quantity * unit.attack_power), 0);
    const defense = units.reduce((total, unit) => total + (unit.quantity * unit.defense_power), 0);
    return { attack, defense };
  };

  const canAffordBuilding = (buildingType: BuildingType) => {
    if (!currentPlayer) return false;
    const costs = {
      fattoria: { cibo: 20, pietra: 30 },
      cava: { pietra: 40, ferro: 20 },
      miniera: { ferro: 30, carbone: 25 },
      pizzeria: { cibo: 50, pizza: 10 },
      caserma: { ferro: 100, pietra: 80 }
    };
    const cost = costs[buildingType];
    return Object.entries(cost).every(([resource, amount]) => 
      currentPlayer.resources[resource as keyof typeof currentPlayer.resources] >= amount
    );
  };

  const canAffordUnits = (unitType: UnitType, quantity: number) => {
    if (!currentPlayer) return false;
    const unitCosts = {
      legionari: { cibo: 10, ferro: 5 },
      arcieri: { cibo: 8, ferro: 12 },
      cavalieri: { cibo: 20, ferro: 15 },
      catapulte: { ferro: 50, pietra: 30 }
    };
    const cost = unitCosts[unitType];
    return Object.entries(cost).every(([resource, amount]) => 
      currentPlayer.resources[resource as keyof typeof currentPlayer.resources] >= amount * quantity
    );
  };

  const canAffordConquest = () => {
    return currentPlayer && currentPlayer.resources.ferro >= 50 && currentPlayer.resources.cibo >= 100;
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
    const status = getRegionStatus(regionName);
    const power = getTotalArmyPower(regionName);
    
    setSelectedRegion({
      ...region,
      owner,
      status,
      displayName: italianRegions.find(r => r.name === regionName)?.displayName || regionName,
      armyPower: power
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

  const updateUnitQuantity = (unitType: UnitType, change: number) => {
    setUnitQuantities(prev => ({
      ...prev,
      [unitType]: Math.max(1, prev[unitType] + change)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-100 to-red-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Caricamento del Regno d'Italia...</p>
        </div>
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
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center">
                🏛️ Regno d'Italia - {new Date().getFullYear()}
                <Crown className="w-6 h-6 ml-2 text-yellow-600" />
              </h2>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <Badge className="bg-blue-100 text-blue-800">
                  <Users className="w-3 h-3 mr-1" />
                  {players.length} Sovrani
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  <Crown className="w-3 h-3 mr-1" />
                  {currentPlayer?.username || 'Ospite'}
                </Badge>
                {currentPlayer && (
                  <Badge className="bg-purple-100 text-purple-800">
                    👑 {regions.filter(r => r.owner_id === user?.id).length} Territori
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Italian Map Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 h-5/6 max-w-6xl mx-auto">
              {italianRegions.map(region => {
                const status = getRegionStatus(region.name);
                const owner = getRegionOwner(region.name);
                const power = getTotalArmyPower(region.name);
                
                return (
                  <div
                    key={region.name}
                    className={`${getStatusColor(status)} rounded-lg p-2 lg:p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 text-white text-center min-h-[80px] lg:min-h-[100px] flex flex-col justify-center ${
                      status === 'controlled' ? 'animate-pulse' : ''
                    }`}
                    onClick={() => handleRegionClick(region.name)}
                  >
                    <div className="mb-1 lg:mb-2 flex justify-center">
                      {status === 'controlled' ? (
                        <Crown className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-300" />
                      ) : status === 'enemy' ? (
                        <Swords className="w-4 h-4 lg:w-6 lg:h-6" />
                      ) : (
                        <Shield className="w-4 h-4 lg:w-6 lg:h-6" />
                      )}
                    </div>
                    <h3 className="font-bold text-xs lg:text-sm">{region.displayName}</h3>
                    {owner && (
                      <p className="text-xs opacity-90 mt-1">{owner.username}</p>
                    )}
                    {!owner && (
                      <p className="text-xs opacity-90 mt-1">🆓 Libera</p>
                    )}
                    {status === 'controlled' && (power.attack > 0 || power.defense > 0) && (
                      <div className="text-xs mt-1 opacity-80">
                        ⚔️{power.attack} 🛡️{power.defense}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Enhanced Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center">
                🗺️ Legenda
                <Crown className="w-4 h-4 ml-2 text-yellow-600" />
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded border-2 border-yellow-400"></div>
                  <span>🏰 I Tuoi Territori</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>⚔️ Territori Nemici</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span>🆓 Territori Liberi</span>
                </div>
              </div>
            </div>

            {/* Resource Display */}
            {currentPlayer && (
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg">
                <h4 className="font-semibold text-sm mb-2">💰 Tue Risorse</h4>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div className="text-center">
                    <span className="block text-base">🍞</span>
                    <span className="font-medium">{currentPlayer.resources.cibo}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-base">🏗️</span>
                    <span className="font-medium">{currentPlayer.resources.pietra}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-base">⚔️</span>
                    <span className="font-medium">{currentPlayer.resources.ferro}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-base">⚫</span>
                    <span className="font-medium">{currentPlayer.resources.carbone}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-base">🍕</span>
                    <span className="font-medium">{currentPlayer.resources.pizza}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Region Details Panel */}
      {selectedRegion && (
        <div className="w-full lg:w-96 p-4 lg:p-6">
          <Card className="h-full shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>{selectedRegion.displayName}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {selectedRegion.status === 'controlled' && (
                    <Badge className="bg-green-100 text-green-800 animate-pulse">👑 Tua</Badge>
                  )}
                  {selectedRegion.status === 'enemy' && (
                    <Badge className="bg-red-100 text-red-800">⚔️ Nemica</Badge>
                  )}
                  {selectedRegion.status === 'neutral' && (
                    <Badge className="bg-gray-100 text-gray-800">🆓 Libera</Badge>
                  )}
                </div>
              </div>
              
              {/* Enhanced Tabs */}
              <div className="flex space-x-1 mt-4">
                <Button
                  variant={activeTab === 'info' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('info')}
                  className="flex-1"
                >
                  📊 Info
                </Button>
                {selectedRegion.status === 'controlled' && (
                  <>
                    <Button
                      variant={activeTab === 'build' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('build')}
                      className="flex-1"
                    >
                      🏗️ Costruisci
                    </Button>
                    <Button
                      variant={activeTab === 'army' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('army')}
                      className="flex-1"
                    >
                      ⚔️ Esercito
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {activeTab === 'info' && (
                <>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">📍 Informazioni Territorio</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Capitale:</span>
                        <span className="font-medium">{selectedRegion.capital}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Governatore:</span>
                        <span className="font-medium">
                          {selectedRegion.owner ? selectedRegion.owner.username : '🆓 Nessuno'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Popolazione:</span>
                        <span className="font-medium">{selectedRegion.population?.toLocaleString()}</span>
                      </div>
                      {selectedRegion.armyPower && (selectedRegion.armyPower.attack > 0 || selectedRegion.armyPower.defense > 0) && (
                        <>
                          <div className="flex justify-between">
                            <span>Potere Offensivo:</span>
                            <span className="font-medium text-red-600">⚔️ {selectedRegion.armyPower.attack}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Potere Difensivo:</span>
                            <span className="font-medium text-blue-600">🛡️ {selectedRegion.armyPower.defense}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedRegion.status === 'controlled' && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">🏗️ Edifici Presenti</h4>
                      <div className="space-y-2 text-sm">
                        {getRegionBuildings(selectedRegion.name).map(building => (
                          <div key={building.id} className="flex justify-between items-center bg-white rounded p-2">
                            <span className="capitalize">{building.type} (Lv.{building.level})</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => upgradeBuilding(building.id)}
                              disabled={!currentPlayer || currentPlayer.resources.pietra < building.level * 50}
                            >
                              <Star className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        {getRegionBuildings(selectedRegion.name).length === 0 && (
                          <p className="text-gray-500 italic">Nessun edificio costruito</p>
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
                        className={`w-full ${canAffordConquest() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        onClick={() => handleConquestTerritory(selectedRegion.name as RegionName)}
                        disabled={!canAffordConquest()}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        {canAffordConquest() ? 'Conquista (50 Ferro + 100 Cibo)' : 'Risorse Insufficienti'}
                      </Button>
                    )}
                    
                    {selectedRegion.status === 'enemy' && selectedRegion.owner && (
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleDeclareWar(selectedRegion.name as RegionName, selectedRegion.owner.id)}
                      >
                        <Swords className="w-4 h-4 mr-2" />
                        Dichiara Guerra a {selectedRegion.owner.username}
                      </Button>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'build' && selectedRegion.status === 'controlled' && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">🏗️ Costruisci Nuovi Edifici</h4>
                  {[
                    { type: 'fattoria' as BuildingType, name: 'Fattoria', cost: '20 Cibo + 30 Pietra', emoji: '🌾', desc: 'Produce cibo' },
                    { type: 'cava' as BuildingType, name: 'Cava', cost: '40 Pietra + 20 Ferro', emoji: '⛏️', desc: 'Produce pietra' },
                    { type: 'miniera' as BuildingType, name: 'Miniera', cost: '30 Ferro + 25 Carbone', emoji: '⚒️', desc: 'Produce ferro' },
                    { type: 'pizzeria' as BuildingType, name: 'Pizzeria', cost: '50 Cibo + 10 Pizza', emoji: '🍕', desc: 'Produce pizza' },
                    { type: 'caserma' as BuildingType, name: 'Caserma', cost: '100 Ferro + 80 Pietra', emoji: '🏰', desc: 'Permette addestramento' }
                  ].map(building => (
                    <Button
                      key={building.type}
                      variant="outline"
                      className={`w-full justify-start p-3 h-auto ${canAffordBuilding(building.type) ? 'hover:bg-green-50' : 'opacity-50 cursor-not-allowed'}`}
                      onClick={() => handleBuildStructure(building.type)}
                      disabled={!canAffordBuilding(building.type)}
                    >
                      <span className="mr-3 text-xl">{building.emoji}</span>
                      <div className="text-left flex-1">
                        <div className="font-medium">{building.name}</div>
                        <div className="text-xs text-gray-500">{building.desc}</div>
                        <div className="text-xs text-gray-600 mt-1">{building.cost}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {activeTab === 'army' && selectedRegion.status === 'controlled' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">⚔️ Unità Attuali</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      {getRegionArmyUnits(selectedRegion.name).map(unit => (
                        <div key={unit.id} className="flex justify-between text-sm py-1">
                          <span className="capitalize">{unit.type}</span>
                          <span className="font-medium">{unit.quantity} unità</span>
                        </div>
                      ))}
                      {getRegionArmyUnits(selectedRegion.name).length === 0 && (
                        <p className="text-gray-500 text-sm italic">Nessuna unità presente</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">🛡️ Addestra Nuove Unità</h4>
                    {[
                      { type: 'legionari' as UnitType, name: 'Legionari', cost: '10 Cibo + 5 Ferro', emoji: '⚔️', stats: 'ATK:10 DEF:12' },
                      { type: 'arcieri' as UnitType, name: 'Arcieri', cost: '8 Cibo + 12 Ferro', emoji: '🏹', stats: 'ATK:12 DEF:8' },
                      { type: 'cavalieri' as UnitType, name: 'Cavalieri', cost: '20 Cibo + 15 Ferro', emoji: '🐎', stats: 'ATK:18 DEF:15' },
                      { type: 'catapulte' as UnitType, name: 'Catapulte', cost: '50 Ferro + 30 Pietra', emoji: '🎯', stats: 'ATK:25 DEF:5' }
                    ].map(unit => (
                      <div key={unit.type} className="bg-white border rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="mr-2 text-lg">{unit.emoji}</span>
                            <div>
                              <div className="font-medium text-sm">{unit.name}</div>
                              <div className="text-xs text-gray-500">{unit.stats}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">{unit.cost} (cad.)</div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUnitQuantity(unit.type, -1)}
                            disabled={unitQuantities[unit.type] <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="mx-3 min-w-[30px] text-center font-medium">
                            {unitQuantities[unit.type]}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUnitQuantity(unit.type, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            className={`flex-1 ${canAffordUnits(unit.type, unitQuantities[unit.type]) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            onClick={() => handleTrainUnits(unit.type, unitQuantities[unit.type])}
                            disabled={!canAffordUnits(unit.type, unitQuantities[unit.type])}
                          >
                            <Hammer className="w-3 h-3 mr-1" />
                            Addestra
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
