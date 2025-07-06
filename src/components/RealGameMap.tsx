import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseGame } from '../hooks/useSupabaseGame';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Shield, Swords, Crown, Users, Flag, Hammer, Star, Plus, Minus, AlertTriangle, Info } from 'lucide-react';
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
    legionari: 5,
    arcieri: 3,
    cavalieri: 2,
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
      case 'controlled': return 'bg-green-500 hover:bg-green-600 border-4 border-yellow-400 shadow-lg animate-pulse';
      case 'enemy': return 'bg-red-500 hover:bg-red-600';
      case 'neutral': return 'bg-gray-400 hover:bg-gray-500 border-2 border-dashed border-blue-300';
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
      fattoria: { cibo: 50, pietra: 100 },
      cava: { pietra: 80, ferro: 60 },
      miniera: { ferro: 100, carbone: 80 },
      pizzeria: { cibo: 150, pizza: 30 },
      caserma: { ferro: 200, pietra: 150 }
    };
    const cost = costs[buildingType];
    return Object.entries(cost).every(([resource, amount]) => 
      currentPlayer.resources[resource as keyof typeof currentPlayer.resources] >= amount
    );
  };

  const canAffordUnits = (unitType: UnitType, quantity: number) => {
    if (!currentPlayer) return false;
    const unitCosts = {
      legionari: { cibo: 20, ferro: 10 },
      arcieri: { cibo: 15, ferro: 25 },
      cavalieri: { cibo: 40, ferro: 30 },
      catapulte: { ferro: 80, pietra: 60 }
    };
    const cost = unitCosts[unitType];
    return Object.entries(cost).every(([resource, amount]) => 
      currentPlayer.resources[resource as keyof typeof currentPlayer.resources] >= amount * quantity
    );
  };

  const canAffordConquest = () => {
    return currentPlayer && currentPlayer.resources.ferro >= 100 && currentPlayer.resources.cibo >= 200;
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
    console.log('🗺️ Region clicked:', regionName);
    const region = regions.find(r => r.name === regionName);
    const owner = getRegionOwner(regionName);
    const status = getRegionStatus(regionName);
    const power = getTotalArmyPower(regionName);
    const regionBuildings = getRegionBuildings(regionName);
    const regionArmy = getRegionArmyUnits(regionName);
    
    setSelectedRegion({
      ...region,
      owner,
      status,
      displayName: italianRegions.find(r => r.name === regionName)?.displayName || regionName,
      armyPower: power,
      buildings: regionBuildings,
      army: regionArmy
    });
    setActiveTab('info');
  };

  const handleDeclareWar = async (targetRegion: RegionName, defenderId: string) => {
    console.log('⚔️ Declaring war:', { targetRegion, defenderId });
    await declareWar(defenderId, targetRegion);
    setSelectedRegion(null);
  };

  const handleConquestTerritory = async (regionName: RegionName) => {
    console.log('🏴 Conquering territory:', regionName);
    await conquestTerritory(regionName);
    setSelectedRegion(null);
  };

  const handleBuildStructure = async (buildingType: BuildingType) => {
    if (selectedRegion) {
      console.log('🏗️ Building structure:', { buildingType, region: selectedRegion.name });
      await buildStructure(selectedRegion.name as RegionName, buildingType);
    }
  };

  const handleTrainUnits = async (unitType: UnitType, quantity: number) => {
    if (selectedRegion) {
      console.log('🛡️ Training units:', { unitType, quantity, region: selectedRegion.name });
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
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl font-semibold text-gray-700">Caricamento del Regno d'Italia...</p>
          <p className="text-gray-600 mt-2">Preparando la mappa per il tuo regno...</p>
        </div>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-red-100">
        <div className="text-center">
          <AlertTriangle className="w-20 h-20 text-yellow-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Accesso Richiesto</h3>
          <p className="text-gray-600 text-lg">Effettua il login per accedere alla mappa del Regno d'Italia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gradient-to-br from-green-50 via-white to-red-50">
      {/* Map Area */}
      <div className="flex-1 p-4 lg:p-6">
        <div className="bg-gradient-to-br from-green-100 via-white to-red-100 rounded-xl shadow-2xl h-full relative overflow-auto border-4 border-gray-300">
          <div className="absolute inset-0 p-4 lg:p-8">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-8 bg-white/90 backdrop-blur rounded-lg p-4 shadow-lg">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
                  🇮🇹 Regno d'Italia - {new Date().getFullYear()}
                  <Crown className="w-8 h-8 ml-3 text-yellow-600" />
                </h2>
                <p className="text-gray-600 mt-1">Conquista, costruisci, domina!</p>
              </div>
              <div className="flex items-center space-x-3 lg:space-x-4">
                <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  {players.length} Sovrani
                </Badge>
                <Badge className="bg-green-100 text-green-800 text-lg px-3 py-2">
                  <Crown className="w-4 h-4 mr-2" />
                  {currentPlayer?.username || 'Ospite'}
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 text-lg px-3 py-2">
                  🏰 {regions.filter(r => r.owner_id === user?.id).length} Territori
                </Badge>
              </div>
            </div>
            
            {/* Italian Map Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 h-4/5 max-w-7xl mx-auto">
              {italianRegions.map(region => {
                const status = getRegionStatus(region.name);
                const owner = getRegionOwner(region.name);
                const power = getTotalArmyPower(region.name);
                const regionBuildings = getRegionBuildings(region.name);
                
                return (
                  <div
                    key={region.name}
                    className={`${getStatusColor(status)} rounded-xl p-3 lg:p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 text-white text-center min-h-[100px] lg:min-h-[120px] flex flex-col justify-center shadow-lg hover:shadow-xl relative`}
                    onClick={() => handleRegionClick(region.name)}
                  >
                    {/* Conquest Cost Badge for Neutral Territories */}
                    {status === 'neutral' && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        200🍞 + 100⚔️
                      </div>
                    )}
                    
                    <div className="mb-2 lg:mb-3 flex justify-center">
                      {status === 'controlled' ? (
                        <Crown className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-300" />
                      ) : status === 'enemy' ? (
                        <Swords className="w-6 h-6 lg:w-8 lg:h-8" />
                      ) : (
                        <Flag className="w-6 h-6 lg:w-8 lg:h-8" />
                      )}
                    </div>
                    <h3 className="font-bold text-sm lg:text-base mb-1">{region.displayName}</h3>
                    {owner ? (
                      <p className="text-xs opacity-90">{owner.username}</p>
                    ) : (
                      <p className="text-xs opacity-90 text-yellow-200">🆓 Territorio Libero</p>
                    )}
                    {status === 'controlled' && (
                      <div className="text-xs mt-2 space-y-1">
                        {regionBuildings.length > 0 && (
                          <div className="bg-white/20 rounded px-2 py-1">
                            🏗️ {regionBuildings.length} Edifici
                          </div>
                        )}
                        {(power.attack > 0 || power.defense > 0) && (
                          <div className="bg-white/20 rounded px-2 py-1">
                            ⚔️{power.attack} 🛡️{power.defense}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Enhanced Legend */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur rounded-xl p-4 shadow-xl border-2 border-gray-200">
              <h4 className="font-bold text-lg mb-3 flex items-center">
                🗺️ Legenda del Regno
                <Crown className="w-5 h-5 ml-2 text-yellow-600" />
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded border-2 border-yellow-400"></div>
                  <span>🏰 I Tuoi Territori (con corona pulsante)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>⚔️ Territori Nemici</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-400 rounded border-2 border-dashed border-blue-300"></div>
                  <span>🆓 Territori Liberi (200🍞 + 100⚔️)</span>
                </div>
              </div>
            </div>

            {/* Enhanced Resource Display with Conquest Info */}
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur rounded-xl p-4 shadow-xl border-2 border-gray-200 max-w-xs">
              <h4 className="font-bold text-lg mb-3 flex items-center">
                💰 Le Tue Risorse
                <Info className="w-4 h-4 ml-2 text-blue-600" />
              </h4>
              <div className="grid grid-cols-5 gap-3 text-sm mb-4">
                <div className="text-center">
                  <span className="block text-2xl mb-1">🍞</span>
                  <span className={`font-bold text-lg block ${currentPlayer.resources.cibo >= 200 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentPlayer.resources.cibo}
                  </span>
                  <span className="text-xs text-gray-600">Cibo</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl mb-1">🏗️</span>
                  <span className="font-bold text-lg block">{currentPlayer.resources.pietra}</span>
                  <span className="text-xs text-gray-600">Pietra</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl mb-1">⚔️</span>
                  <span className={`font-bold text-lg block ${currentPlayer.resources.ferro >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentPlayer.resources.ferro}
                  </span>
                  <span className="text-xs text-gray-600">Ferro</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl mb-1">⚫</span>
                  <span className="font-bold text-lg block">{currentPlayer.resources.carbone}</span>
                  <span className="text-xs text-gray-600">Carbone</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl mb-1">🍕</span>
                  <span className="font-bold text-lg block">{currentPlayer.resources.pizza}</span>
                  <span className="text-xs text-gray-600">Pizza</span>
                </div>
              </div>
              
              {/* Conquest Cost Panel */}
              <div className="border-t pt-3">
                <h5 className="font-semibold text-sm mb-2 flex items-center">
                  🏴 Costo Conquista Territori
                </h5>
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center justify-between text-sm">
                    <span>Cibo necessario:</span>
                    <span className={`font-bold ${currentPlayer.resources.cibo >= 200 ? 'text-green-600' : 'text-red-600'}`}>
                      200 🍞
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span>Ferro necessario:</span>
                    <span className={`font-bold ${currentPlayer.resources.ferro >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                      100 ⚔️
                    </span>
                  </div>
                  <div className="mt-2 text-center">
                    {canAffordConquest() ? (
                      <Badge className="bg-green-100 text-green-800 text-base px-4 py-2">
                        ✅ Hai abbastanza risorse!
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 text-base px-4 py-2">
                        ❌ Risorse insufficienti
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Region Details Panel */}
      {selectedRegion && (
        <div className="w-full lg:w-96 p-4 lg:p-6">
          <Card className="h-full shadow-2xl border-4 border-gray-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <Shield className="w-6 h-6" />
                  <span>{selectedRegion.displayName}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {selectedRegion.status === 'controlled' && (
                    <Badge className="bg-green-100 text-green-800 animate-pulse text-lg px-3 py-1">👑 Tua</Badge>
                  )}
                  {selectedRegion.status === 'enemy' && (
                    <Badge className="bg-red-100 text-red-800 text-lg px-3 py-1">⚔️ Nemica</Badge>
                  )}
                  {selectedRegion.status === 'neutral' && (
                    <Badge className="bg-gray-100 text-gray-800 text-lg px-3 py-1">🆓 Libera</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRegion(null)}
                    className="h-8 w-8 p-0"
                  >
                    ❌
                  </Button>
                </div>
              </div>
              
              {/* Enhanced Tabs */}
              {selectedRegion.status === 'controlled' && (
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant={activeTab === 'info' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('info')}
                    className="flex-1"
                  >
                    📊 Info
                  </Button>
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
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6 max-h-96 overflow-y-auto p-6">
              {activeTab === 'info' && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-lg text-gray-700 mb-3">📍 Informazioni Territorio</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>🏛️ Capitale:</span>
                        <span className="font-bold">{selectedRegion.capital}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>👑 Governatore:</span>
                        <span className="font-bold">
                          {selectedRegion.owner ? selectedRegion.owner.username : '🆓 Nessuno'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>👥 Popolazione:</span>
                        <span className="font-bold">{selectedRegion.population?.toLocaleString()}</span>
                      </div>
                      {selectedRegion.armyPower && (selectedRegion.armyPower.attack > 0 || selectedRegion.armyPower.defense > 0) && (
                        <>
                          <div className="flex justify-between">
                            <span>⚔️ Potere Offensivo:</span>
                            <span className="font-bold text-red-600">{selectedRegion.armyPower.attack}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🛡️ Potere Difensivo:</span>
                            <span className="font-bold text-blue-600">{selectedRegion.armyPower.defense}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedRegion.status === 'neutral' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-bold text-amber-800 mb-3 flex items-center text-lg">
                        💰 Costo per Conquistare
                        <Info className="w-4 h-4 ml-2" />
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between bg-white rounded p-2">
                          <span>🍞 Cibo necessario:</span>
                          <span className={`font-bold text-lg ${currentPlayer && currentPlayer.resources.cibo >= 200 ? 'text-green-600' : 'text-red-600'}`}>
                            200
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-white rounded p-2">
                          <span>⚔️ Ferro necessario:</span>
                          <span className={`font-bold text-lg ${currentPlayer && currentPlayer.resources.ferro >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                            100
                          </span>
                        </div>
                        <div className="text-center mt-3">
                          {canAffordConquest() ? (
                            <Badge className="bg-green-100 text-green-800 text-base px-4 py-2">
                              ✅ Hai abbastanza risorse!
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 text-base px-4 py-2">
                              ❌ Risorse insufficienti
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRegion.status === 'controlled' && (
                    <>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-bold text-lg text-gray-700 mb-3">🏗️ Edifici Presenti</h4>
                        <div className="space-y-2 text-sm">
                          {selectedRegion.buildings.map((building: any) => (
                            <div key={building.id} className="flex justify-between items-center bg-white rounded p-3">
                              <div>
                                <span className="capitalize font-medium">{building.type}</span>
                                <span className="text-gray-600 ml-2">(Lv.{building.level})</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => upgradeBuilding(building.id)}
                                disabled={!currentPlayer || currentPlayer.resources.pietra < building.level * 50}
                              >
                                <Star className="w-3 h-3 mr-1" />
                                ⭐
                              </Button>
                            </div>
                          ))}
                          {selectedRegion.buildings.length === 0 && (
                            <p className="text-gray-500 italic">Nessun edificio costruito</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-bold text-lg text-gray-700 mb-3">🛡️ Unità Militari</h4>
                        <div className="space-y-2 text-sm">
                          {selectedRegion.army.map((unit: any) => (
                            <div key={unit.id} className="flex justify-between bg-white rounded p-3">
                              <span className="capitalize font-medium">{unit.type}</span>
                              <span className="font-bold">{unit.quantity} unità</span>
                            </div>
                          ))}
                          {selectedRegion.army.length === 0 && (
                            <p className="text-gray-500 italic">Nessuna unità presente</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-3 pt-4 border-t-2">
                    {selectedRegion.status === 'neutral' && (
                      <Button 
                        className={`w-full text-lg h-16 ${canAffordConquest() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        onClick={() => handleConquestTerritory(selectedRegion.name as RegionName)}
                        disabled={!canAffordConquest()}
                      >
                        <Flag className="w-5 h-5 mr-3" />
                        <div className="text-center">
                          <div className="font-bold">🏴 Conquista Territorio</div>
                          <div className="text-sm opacity-90">
                            {canAffordConquest() ? 'Costo: 200 🍞 + 100 ⚔️' : 'Risorse Insufficienti'}
                          </div>
                        </div>
                      </Button>
                    )}
                    
                    {selectedRegion.status === 'enemy' && selectedRegion.owner && (
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700 text-lg h-14"
                        onClick={() => handleDeclareWar(selectedRegion.name as RegionName, selectedRegion.owner.id)}
                      >
                        <Swords className="w-5 h-5 mr-3" />
                        ⚔️ Dichiara Guerra a {selectedRegion.owner.username}
                      </Button>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'build' && selectedRegion.status === 'controlled' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-lg text-gray-700">🏗️ Costruisci Nuovi Edifici</h4>
                  {[
                    { type: 'fattoria' as BuildingType, name: 'Fattoria', cost: '50 Cibo + 100 Pietra', emoji: '🌾', desc: 'Produce cibo' },
                    { type: 'cava' as BuildingType, name: 'Cava', cost: '80 Pietra + 60 Ferro', emoji: '⛏️', desc: 'Produce pietra' },
                    { type: 'miniera' as BuildingType, name: 'Miniera', cost: '100 Ferro + 80 Carbone', emoji: '⚒️', desc: 'Produce ferro' },
                    { type: 'pizzeria' as BuildingType, name: 'Pizzeria', cost: '150 Cibo + 30 Pizza', emoji: '🍕', desc: 'Produce pizza' },
                    { type: 'caserma' as BuildingType, name: 'Caserma', cost: '200 Ferro + 150 Pietra', emoji: '🏰', desc: 'Permette addestramento' }
                  ].map(building => (
                    <Button
                      key={building.type}
                      variant="outline"
                      className={`w-full justify-start p-4 h-auto ${canAffordBuilding(building.type) ? 'hover:bg-green-50' : 'opacity-50 cursor-not-allowed'}`}
                      onClick={() => handleBuildStructure(building.type)}
                      disabled={!canAffordBuilding(building.type)}
                    >
                      <span className="mr-4 text-2xl">{building.emoji}</span>
                      <div className="text-left flex-1">
                        <div className="font-bold">{building.name}</div>
                        <div className="text-xs text-gray-500">{building.desc}</div>
                        <div className="text-xs text-gray-600 mt-1">{building.cost}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {activeTab === 'army' && selectedRegion.status === 'controlled' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-lg text-gray-700 mb-3">🛡️ Addestra Nuove Unità</h4>
                  {[
                    { type: 'legionari' as UnitType, name: 'Legionari', cost: '20 Cibo + 10 Ferro', emoji: '⚔️', stats: 'ATK:10 DEF:12' },
                    { type: 'arcieri' as UnitType, name: 'Arcieri', cost: '15 Cibo + 25 Ferro', emoji: '🏹', stats: 'ATK:15 DEF:8' },
                    { type: 'cavalieri' as UnitType, name: 'Cavalieri', cost: '40 Cibo + 30 Ferro', emoji: '🐎', stats: 'ATK:20 DEF:18' },
                    { type: 'catapulte' as UnitType, name: 'Catapulte', cost: '80 Ferro + 60 Pietra', emoji: '🎯', stats: 'ATK:30 DEF:5' }
                  ].map(unit => {
                    const quantity = unitQuantities[unit.type] || 1;
                    const canAfford = canAffordUnits(unit.type, quantity);
                    const hasBarracks = selectedRegion.buildings?.some((b: any) => b.type === 'caserma');

                    return (
                      <div key={unit.type} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-2xl">{unit.emoji}</span>
                          <div className="flex-1">
                            <h5 className="font-bold">{unit.name}</h5>
                            <p className="text-xs text-gray-600">{unit.stats}</p>
                            <p className="text-xs text-blue-600 mt-1">{unit.cost}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateUnitQuantity(unit.type, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-bold text-lg px-3">{quantity}</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateUnitQuantity(unit.type, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          className={`w-full ${canAfford && hasBarracks ? 'hover:bg-red-50' : 'cursor-not-allowed opacity-50'}`}
                          onClick={() => handleTrainUnits(unit.type, quantity)}
                          disabled={!canAfford || !hasBarracks}
                        >
                          <Hammer className="w-4 h-4 mr-2" />
                          {hasBarracks ? 'Addestra' : 'Serve Caserma'}
                        </Button>
                      </div>
                    );
                  })}
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
