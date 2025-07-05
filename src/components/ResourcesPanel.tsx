
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Plus, Gamepad, Users, Crown, AlertTriangle, Hammer, Zap } from 'lucide-react';
import { useSupabaseGame } from '../hooks/useSupabaseGame';

const ResourcesPanel = () => {
  const { currentPlayer, buildings, armyUnits, regions, buildStructure, trainUnits, upgradeBuilding, loading } = useSupabaseGame();
  const [unitQuantities, setUnitQuantities] = useState<Record<string, number>>({
    legionari: 5,
    arcieri: 5,
    cavalieri: 2,
    catapulte: 1
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Caricamento del tuo regno...</p>
        </div>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Effettua il login</h3>
          <p className="text-gray-600">Devi essere autenticato per vedere le tue risorse</p>
        </div>
      </div>
    );
  }

  const userRegions = regions.filter(region => region.owner_id === currentPlayer.id);
  const userBuildings = buildings.filter(b => b.user_id === currentPlayer.id);
  const userArmyUnits = armyUnits.filter(a => a.user_id === currentPlayer.id);

  const resourceProduction = {
    cibo: userBuildings.filter(b => b.type === 'fattoria').reduce((sum, b) => sum + (b.level * 10), 0),
    pietra: userBuildings.filter(b => b.type === 'cava').reduce((sum, b) => sum + (b.level * 10), 0),
    ferro: userBuildings.filter(b => b.type === 'miniera').reduce((sum, b) => sum + (b.level * 10), 0),
    pizza: userBuildings.filter(b => b.type === 'pizzeria').reduce((sum, b) => sum + (b.level * 10), 0),
  };

  const totalArmyPower = userArmyUnits.reduce((sum, army) => sum + (army.attack_power + army.defense_power) * army.quantity, 0);

  const canAfford = (cost: { [key: string]: number }) => {
    return Object.entries(cost).every(([resource, amount]) => {
      const userResource = currentPlayer.resources[resource as keyof typeof currentPlayer.resources] || 0;
      return userResource >= amount;
    });
  };

  const handleBuildStructure = async (buildingType: any, regionName: string) => {
    console.log('🏗️ Building:', { buildingType, regionName });
    await buildStructure(regionName as any, buildingType);
  };

  const handleTrainUnits = async (unitType: any, quantity: number, regionName: string) => {
    console.log('🛡️ Training:', { unitType, quantity, regionName });
    await trainUnits(regionName as any, unitType, quantity);
  };

  return (
    <div className="h-full p-4 bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <Crown className="w-8 h-8 mr-3 text-yellow-600" />
            Regno di {currentPlayer.username}
          </h2>
          <p className="text-gray-600 text-lg">
            🏰 Territori controllati: <span className="font-bold text-blue-600">{userRegions.length}</span> | 
            ⚔️ Potere militare: <span className="font-bold text-red-600">{totalArmyPower}</span>
          </p>
        </div>

        {/* Resources Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🍞</div>
              <div className="text-2xl font-bold text-green-700">{currentPlayer.resources.cibo}</div>
              <div className="text-sm text-gray-700 font-medium">Cibo</div>
              <div className="text-xs text-green-600 mt-1">+{resourceProduction.cibo}/ora</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🏗️</div>
              <div className="text-2xl font-bold text-blue-700">{currentPlayer.resources.pietra}</div>
              <div className="text-sm text-gray-700 font-medium">Pietra</div>
              <div className="text-xs text-blue-600 mt-1">+{resourceProduction.pietra}/ora</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-100 to-red-200 border-red-300">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">⚔️</div>
              <div className="text-2xl font-bold text-red-700">{currentPlayer.resources.ferro}</div>
              <div className="text-sm text-gray-700 font-medium">Ferro</div>
              <div className="text-xs text-red-600 mt-1">+{resourceProduction.ferro}/ora</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">⚫</div>
              <div className="text-2xl font-bold text-gray-700">{currentPlayer.resources.carbone}</div>
              <div className="text-sm text-gray-700 font-medium">Carbone</div>
              <div className="text-xs text-gray-600 mt-1">Risorsa</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🍕</div>
              <div className="text-2xl font-bold text-yellow-700">{currentPlayer.resources.pizza}</div>
              <div className="text-sm text-gray-700 font-medium">Pizza</div>
              <div className="text-xs text-yellow-600 mt-1">+{resourceProduction.pizza}/ora</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="buildings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg">
            <TabsTrigger value="buildings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              🏗️ I Miei Edifici
            </TabsTrigger>
            <TabsTrigger value="army" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              ⚔️ Il Mio Esercito
            </TabsTrigger>
            <TabsTrigger value="build" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              🔨 Costruisci & Addestra
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buildings" className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🏗️ Edifici nei Tuoi Territori</h3>
            <div className="grid gap-4">
              {userBuildings.map(building => (
                <Card key={building.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">
                          {building.type === 'fattoria' && '🌾'}
                          {building.type === 'cava' && '⛏️'}
                          {building.type === 'miniera' && '⚒️'}
                          {building.type === 'pizzeria' && '🍕'}
                          {building.type === 'caserma' && '🏰'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg capitalize">{building.type}</h3>
                          <p className="text-gray-600">Livello {building.level} • Regione: {building.region}</p>
                          <p className="text-green-600 font-medium">Produzione: +{building.level * 10}/ora</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-3">
                        <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
                          Lv. {building.level}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => upgradeBuilding(building.id)}
                          disabled={!canAfford({ pietra: building.level * 50 })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Potenzia ({building.level * 50} Pietra)
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={(building.level / 10) * 100} className="h-3" />
                      <p className="text-xs text-gray-500 mt-1">Livello {building.level}/10</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {userBuildings.length === 0 && (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="p-8 text-center">
                    <Hammer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Nessun Edificio</h3>
                    <p className="text-gray-500">Vai nella sezione "Costruisci & Addestra" per iniziare a costruire il tuo impero!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="army" className="space-y-4">
            <Card className="mb-6 bg-gradient-to-r from-red-100 to-orange-100 border-red-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold mb-3">⚔️ Potere Militare Totale</h3>
                <div className="text-4xl font-bold text-red-600 mb-2">{totalArmyPower}</div>
                <p className="text-gray-700">Somma di attacco e difesa di tutte le tue unità</p>
              </CardContent>
            </Card>

            <h3 className="text-xl font-bold text-gray-800 mb-4">🛡️ Le Tue Unità Militari</h3>
            <div className="grid gap-4">
              {userArmyUnits.map(army => (
                <Card key={army.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">
                          {army.type === 'legionari' && '⚔️'}
                          {army.type === 'arcieri' && '🏹'}
                          {army.type === 'cavalieri' && '🐎'}
                          {army.type === 'catapulte' && '🎯'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg capitalize">{army.type}</h3>
                          <p className="text-gray-600">Regione: {army.region}</p>
                          <div className="flex space-x-6 text-sm mt-2">
                            <span className="text-red-600 font-medium">⚔️ Attacco: {army.attack_power}</span>
                            <span className="text-blue-600 font-medium">🛡️ Difesa: {army.defense_power}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-red-100 text-red-800 text-lg px-3 py-2 mb-3">
                          {army.quantity} unità
                        </Badge>
                        <div className="text-lg font-bold text-purple-600">
                          Potere: {(army.attack_power + army.defense_power) * army.quantity}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {userArmyUnits.length === 0 && (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="p-8 text-center">
                    <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Nessuna Unità</h3>
                    <p className="text-gray-500">Costruisci una caserma e addestra il tuo esercito!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="build" className="space-y-6">
            {userRegions.length === 0 ? (
              <Card className="border-dashed border-2 border-yellow-300 bg-yellow-50">
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-yellow-800 mb-2">Nessun Territorio</h3>
                  <p className="text-yellow-700">Devi prima conquistare un territorio dalla mappa per costruire edifici!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Buildings Section */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-800">🏗️ Costruisci Nuovi Edifici</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { type: 'fattoria', name: 'Fattoria', cost: '50 Cibo + 100 Pietra', emoji: '🌾', desc: 'Produce 10 cibo/ora per livello' },
                      { type: 'cava', name: 'Cava', cost: '80 Pietra + 60 Ferro', emoji: '⛏️', desc: 'Produce 10 pietra/ora per livello' },
                      { type: 'miniera', name: 'Miniera', cost: '100 Ferro + 80 Carbone', emoji: '⚒️', desc: 'Produce 10 ferro/ora per livello' },
                      { type: 'pizzeria', name: 'Pizzeria', cost: '150 Cibo + 30 Pizza', emoji: '🍕', desc: 'Produce 10 pizza/ora per livello' },
                      { type: 'caserma', name: 'Caserma', cost: '200 Ferro + 150 Pietra', emoji: '🏰', desc: 'Permette addestramento unità' }
                    ].map(building => {
                      const buildingCosts = {
                        fattoria: { cibo: 50, pietra: 100 },
                        cava: { pietra: 80, ferro: 60 },
                        miniera: { ferro: 100, carbone: 80 },
                        pizzeria: { cibo: 150, pizza: 30 },
                        caserma: { ferro: 200, pietra: 150 }
                      };
                      const canAffordBuilding = canAfford(buildingCosts[building.type as keyof typeof buildingCosts]);

                      return (
                        <Card key={building.type} className={`hover:shadow-lg transition-all ${canAffordBuilding ? 'hover:bg-green-50 border-green-200' : 'opacity-75'}`}>
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4 mb-4">
                              <span className="text-4xl">{building.emoji}</span>
                              <div className="flex-1">
                                <h4 className="font-bold text-lg">{building.name}</h4>
                                <p className="text-sm text-gray-600">{building.desc}</p>
                                <p className="text-sm font-medium text-blue-600 mt-1">Costo: {building.cost}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {userRegions.map(region => (
                                <Button
                                  key={region.id}
                                  variant="outline"
                                  className={`w-full justify-start ${canAffordBuilding ? 'hover:bg-green-100' : 'cursor-not-allowed'}`}
                                  onClick={() => handleBuildStructure(building.type, region.name)}
                                  disabled={!canAffordBuilding}
                                >
                                  <Hammer className="w-4 h-4 mr-2" />
                                  Costruisci in {region.capital}
                                </Button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Army Training Section */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-800">🛡️ Addestra Unità Militari</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { type: 'legionari', name: 'Legionari', cost: '20 Cibo + 10 Ferro', emoji: '⚔️', stats: 'ATK:10 DEF:12' },
                      { type: 'arcieri', name: 'Arcieri', cost: '15 Cibo + 25 Ferro', emoji: '🏹', stats: 'ATK:15 DEF:8' },
                      { type: 'cavalieri', name: 'Cavalieri', cost: '40 Cibo + 30 Ferro', emoji: '🐎', stats: 'ATK:20 DEF:18' },
                      { type: 'catapulte', name: 'Catapulte', cost: '80 Ferro + 60 Pietra', emoji: '🎯', stats: 'ATK:30 DEF:5' }
                    ].map(unit => {
                      const unitCosts = {
                        legionari: { cibo: 20, ferro: 10 },
                        arcieri: { cibo: 15, ferro: 25 },
                        cavalieri: { cibo: 40, ferro: 30 },
                        catapulte: { ferro: 80, pietra: 60 }
                      };
                      const quantity = unitQuantities[unit.type] || 1;
                      const totalCost = Object.fromEntries(
                        Object.entries(unitCosts[unit.type as keyof typeof unitCosts]).map(([k, v]) => [k, v * quantity])
                      );
                      const canAffordUnit = canAfford(totalCost);

                      return (
                        <Card key={unit.type} className={`hover:shadow-lg transition-all ${canAffordUnit ? 'hover:bg-red-50 border-red-200' : 'opacity-75'}`}>
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4 mb-4">
                              <span className="text-4xl">{unit.emoji}</span>
                              <div className="flex-1">
                                <h4 className="font-bold text-lg">{unit.name}</h4>
                                <p className="text-sm text-gray-600">{unit.stats}</p>
                                <p className="text-sm font-medium text-red-600 mt-1">Costo unitario: {unit.cost}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setUnitQuantities(prev => ({ ...prev, [unit.type]: Math.max(1, (prev[unit.type] || 1) - 1) }))}
                              >
                                -
                              </Button>
                              <span className="font-bold text-lg px-4">{quantity}</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setUnitQuantities(prev => ({ ...prev, [unit.type]: (prev[unit.type] || 1) + 1 }))}
                              >
                                +
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {userRegions.map(region => {
                                const hasBarracks = userBuildings.some(b => b.region === region.name && b.type === 'caserma');
                                return (
                                  <Button
                                    key={region.id}
                                    variant="outline"
                                    className={`w-full justify-start ${canAffordUnit && hasBarracks ? 'hover:bg-red-100' : 'cursor-not-allowed'}`}
                                    onClick={() => handleTrainUnits(unit.type, quantity, region.name)}
                                    disabled={!canAffordUnit || !hasBarracks}
                                  >
                                    <Zap className="w-4 h-4 mr-2" />
                                    {hasBarracks ? `Addestra in ${region.capital}` : `Serve Caserma in ${region.capital}`}
                                  </Button>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

        </Tabs>

        {/* Invite Link Section */}
        <Card className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">
              <Users className="w-6 h-6 mr-3" />
              🎯 Invita Altri Giocatori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <input 
                type="text" 
                value={window.location.origin} 
                readOnly 
                className="flex-1 p-3 border rounded-lg bg-white font-mono text-sm"
              />
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  toast({
                    title: "Link Copiato!",
                    description: "Il link di invito è stato copiato negli appunti",
                  });
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                📋 Copia Link
              </Button>
            </div>
            <p className="text-sm text-purple-700 mt-3">
              🚀 Condividi questo link per invitare altri giocatori nel Regno d'Italia!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResourcesPanel;
