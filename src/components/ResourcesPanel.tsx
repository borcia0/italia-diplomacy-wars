
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Plus, Gamepad, Users, Crown } from 'lucide-react';
import { useSupabaseGame } from '../hooks/useSupabaseGame';

const ResourcesPanel = () => {
  const { currentPlayer, buildings, armyUnits, regions, buildStructure, trainUnits, upgradeBuilding, loading } = useSupabaseGame();
  const [unitQuantities, setUnitQuantities] = useState<Record<string, number>>({
    legionari: 10,
    arcieri: 10,
    cavalieri: 5,
    catapulte: 1
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Effettua il login per vedere le tue risorse</p>
        </div>
      </div>
    );
  }

  const userRegions = regions.filter(region => region.owner_id === currentPlayer.id);
  const resourceProduction = {
    cibo: buildings.filter(b => b.type === 'fattoria').reduce((sum, b) => sum + (b.level * 5), 0),
    pietra: buildings.filter(b => b.type === 'cava').reduce((sum, b) => sum + (b.level * 5), 0),
    ferro: buildings.filter(b => b.type === 'miniera').reduce((sum, b) => sum + (b.level * 5), 0),
    pizza: buildings.filter(b => b.type === 'pizzeria').reduce((sum, b) => sum + (b.level * 5), 0),
  };

  const totalArmyPower = armyUnits.reduce((sum, army) => sum + (army.attack_power + army.defense_power) * army.quantity, 0);

  const canAfford = (cost: { [key: string]: number }) => {
    return Object.entries(cost).every(([resource, amount]) => {
      const userResource = currentPlayer.resources[resource as keyof typeof currentPlayer.resources] || 0;
      return userResource >= amount;
    });
  };

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Crown className="w-6 h-6 mr-2 text-yellow-600" />
          Regno di {currentPlayer.username}
        </h2>
        <p className="text-gray-600">
          Territori controllati: {userRegions.length}
        </p>
      </div>

      {/* Resource Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🍞</div>
            <div className="text-2xl font-bold text-green-600">{currentPlayer.resources.cibo}</div>
            <div className="text-sm text-gray-600">Cibo</div>
            <div className="text-xs text-green-600 mt-1">+{resourceProduction.cibo}/h</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🏗️</div>
            <div className="text-2xl font-bold text-blue-600">{currentPlayer.resources.pietra}</div>
            <div className="text-sm text-gray-600">Pietra</div>
            <div className="text-xs text-blue-600 mt-1">+{resourceProduction.pietra}/h</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">⚔️</div>
            <div className="text-2xl font-bold text-red-600">{currentPlayer.resources.ferro}</div>
            <div className="text-sm text-gray-600">Ferro</div>
            <div className="text-xs text-red-600 mt-1">+{resourceProduction.ferro}/h</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">⚫</div>
            <div className="text-2xl font-bold text-gray-600">{currentPlayer.resources.carbone}</div>
            <div className="text-sm text-gray-600">Carbone</div>
            <div className="text-xs text-gray-600 mt-1">Stock</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🍕</div>
            <div className="text-2xl font-bold text-yellow-600">{currentPlayer.resources.pizza}</div>
            <div className="text-sm text-gray-600">Pizza</div>
            <div className="text-xs text-yellow-600 mt-1">+{resourceProduction.pizza}/h</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="buildings" className="h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buildings">Edifici</TabsTrigger>
          <TabsTrigger value="army">Esercito</TabsTrigger>
          <TabsTrigger value="build">Costruisci</TabsTrigger>
        </TabsList>

        <TabsContent value="buildings" className="space-y-4">
          <div className="grid gap-4">
            {buildings.map(building => (
              <Card key={building.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">
                        {building.type === 'fattoria' && '🌾'}
                        {building.type === 'cava' && '⛏️'}
                        {building.type === 'miniera' && '⚒️'}
                        {building.type === 'pizzeria' && '🍕'}
                        {building.type === 'caserma' && '🏰'}
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{building.type}</h3>
                        <p className="text-sm text-gray-600">Livello {building.level}</p>
                        <p className="text-sm text-green-600">Produzione: +{building.level * 5}/ora</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        Lv. {building.level}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => upgradeBuilding(building.id)}
                        disabled={!canAfford({ pietra: building.level * 20 })}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Potenzia ({building.level * 20} Pietra)
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={(building.level / 10) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {buildings.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">Nessun edificio costruito. Vai nella sezione "Costruisci" per iniziare!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="army" className="space-y-4">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Potere Militare Totale</h3>
                <div className="text-3xl font-bold text-red-600">{totalArmyPower}</div>
                <p className="text-sm text-gray-600">Somma di attacco e difesa di tutte le unità</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {armyUnits.map(army => (
              <Card key={army.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">
                        {army.type === 'legionari' && '⚔️'}
                        {army.type === 'arcieri' && '🏹'}
                        {army.type === 'cavalieri' && '🐎'}
                        {army.type === 'catapulte' && '🎯'}
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{army.type}</h3>
                        <p className="text-sm text-gray-600">Quantità: {army.quantity}</p>
                        <div className="flex space-x-4 text-xs mt-1">
                          <span className="text-red-600">Attacco: {army.attack_power}</span>
                          <span className="text-blue-600">Difesa: {army.defense_power}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-100 text-red-800 mb-2">
                        {army.quantity} unità
                      </Badge>
                      <div className="text-sm text-gray-600">
                        Potere: {(army.attack_power + army.defense_power) * army.quantity}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {armyUnits.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">Nessuna unità addestrata. Costruisci una caserma e addestra il tuo esercito!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="build" className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-gray-600">
              Seleziona un territorio dalla mappa per costruire edifici e addestrare unità
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite Link Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Invita Amici
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <input 
              type="text" 
              value={window.location.origin} 
              readOnly 
              className="flex-1 p-2 border rounded bg-gray-50"
            />
            <Button onClick={() => navigator.clipboard.writeText(window.location.origin)}>
              Copia Link
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Condividi questo link per invitare altri giocatori nel tuo regno!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesPanel;
