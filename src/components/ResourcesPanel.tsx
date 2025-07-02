
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Plus, Gamepad } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Building {
  id: string;
  name: string;
  type: 'fattoria' | 'cava' | 'miniera' | 'pizzeria';
  level: number;
  production: number;
  cost: { [key: string]: number };
  emoji: string;
}

interface Army {
  id: string;
  name: string;
  quantity: number;
  attack: number;
  defense: number;
  cost: { [key: string]: number };
  emoji: string;
}

const ResourcesPanel = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([
    { id: '1', name: 'Fattoria di Grano', type: 'fattoria', level: 2, production: 15, cost: { pietra: 20, ferro: 10 }, emoji: '🌾' },
    { id: '2', name: 'Pizzeria Romana', type: 'pizzeria', level: 1, production: 5, cost: { cibo: 30, ferro: 15 }, emoji: '🍕' },
    { id: '3', name: 'Cava di Marmo', type: 'cava', level: 1, production: 8, cost: { ferro: 25 }, emoji: '🏗️' },
  ]);

  const [armies, setArmies] = useState<Army[]>([
    { id: '1', name: 'Legionari', quantity: 50, attack: 10, defense: 8, cost: { ferro: 5, cibo: 3 }, emoji: '⚔️' },
    { id: '2', name: 'Arcieri', quantity: 30, attack: 12, defense: 5, cost: { ferro: 3, cibo: 2 }, emoji: '🏹' },
    { id: '3', name: 'Cavalieri', quantity: 20, attack: 15, defense: 12, cost: { ferro: 10, cibo: 8 }, emoji: '🐎' },
  ]);

  const availableBuildings = [
    { name: 'Nuova Fattoria', type: 'fattoria', cost: { pietra: 50, ferro: 20 }, production: 10, emoji: '🌾' },
    { name: 'Miniera di Ferro', type: 'miniera', cost: { pietra: 80, cibo: 30 }, production: 12, emoji: '⛏️' },
    { name: 'Pizzeria Deluxe', type: 'pizzeria', cost: { pietra: 60, ferro: 40 }, production: 8, emoji: '🍕' },
  ];

  const availableUnits = [
    { name: 'Legionari', attack: 10, defense: 8, cost: { ferro: 5, cibo: 3 }, emoji: '⚔️' },
    { name: 'Arcieri', attack: 12, defense: 5, cost: { ferro: 3, cibo: 2 }, emoji: '🏹' },
    { name: 'Cavalieri', attack: 15, defense: 12, cost: { ferro: 10, cibo: 8 }, emoji: '🐎' },
    { name: 'Catapulte', attack: 20, defense: 3, cost: { ferro: 25, pietra: 15 }, emoji: '🏺' },
  ];

  const resourceProduction = {
    cibo: buildings.filter(b => b.type === 'fattoria').reduce((sum, b) => sum + b.production, 0),
    pietra: buildings.filter(b => b.type === 'cava').reduce((sum, b) => sum + b.production, 0),
    ferro: buildings.filter(b => b.type === 'miniera').reduce((sum, b) => sum + b.production, 0),
    pizza: buildings.filter(b => b.type === 'pizzeria').reduce((sum, b) => sum + b.production, 0),
  };

  const totalArmyPower = armies.reduce((sum, army) => sum + (army.attack + army.defense) * army.quantity, 0);

  const canAfford = (cost: { [key: string]: number }) => {
    return Object.entries(cost).every(([resource, amount]) => {
      const userResource = user?.resources?.[resource as keyof typeof user.resources] || 0;
      return userResource >= amount;
    });
  };

  const upgradeBuilding = (buildingId: string) => {
    setBuildings(prev => prev.map(building => 
      building.id === buildingId 
        ? { ...building, level: building.level + 1, production: Math.floor(building.production * 1.5) }
        : building
    ));
  };

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestione Risorse</h2>
        <p className="text-gray-600">Sviluppa la tua economia e il tuo esercito</p>
      </div>

      {/* Resource Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🍞</div>
            <div className="text-2xl font-bold text-green-600">{user?.resources?.cibo || 0}</div>
            <div className="text-sm text-gray-600">Cibo</div>
            <div className="text-xs text-green-600 mt-1">+{resourceProduction.cibo}/ora</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🏗️</div>
            <div className="text-2xl font-bold text-blue-600">{user?.resources?.pietra || 0}</div>
            <div className="text-sm text-gray-600">Pietra</div>
            <div className="text-xs text-blue-600 mt-1">+{resourceProduction.pietra}/ora</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">⚔️</div>
            <div className="text-2xl font-bold text-red-600">{user?.resources?.ferro || 0}</div>
            <div className="text-sm text-gray-600">Ferro</div>
            <div className="text-xs text-red-600 mt-1">+{resourceProduction.ferro}/ora</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🍕</div>
            <div className="text-2xl font-bold text-yellow-600">{user?.resources?.pizza || 0}</div>
            <div className="text-sm text-gray-600">Pizza</div>
            <div className="text-xs text-yellow-600 mt-1">+{resourceProduction.pizza}/ora</div>
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
                      <div className="text-3xl">{building.emoji}</div>
                      <div>
                        <h3 className="font-semibold">{building.name}</h3>
                        <p className="text-sm text-gray-600">Livello {building.level}</p>
                        <p className="text-sm text-green-600">Produzione: +{building.production}/ora</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        Livello {building.level}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => upgradeBuilding(building.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Potenzia
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={(building.level / 5) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
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
            {armies.map(army => (
              <Card key={army.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{army.emoji}</div>
                      <div>
                        <h3 className="font-semibold">{army.name}</h3>
                        <p className="text-sm text-gray-600">Quantità: {army.quantity}</p>
                        <div className="flex space-x-4 text-xs mt-1">
                          <span className="text-red-600">Attacco: {army.attack}</span>
                          <span className="text-blue-600">Difesa: {army.defense}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-100 text-red-800 mb-2">
                        {army.quantity} unità
                      </Badge>
                      <div className="text-sm text-gray-600">
                        Potere: {(army.attack + army.defense) * army.quantity}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="build" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Nuovi Edifici</h3>
              <div className="space-y-3">
                {availableBuildings.map((building, index) => (
                  <Card key={index} className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{building.emoji}</div>
                          <div>
                            <h4 className="font-medium">{building.name}</h4>
                            <p className="text-sm text-green-600">+{building.production}/ora</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs space-y-1 mb-2">
                            {Object.entries(building.cost).map(([resource, amount]) => (
                              <div key={resource} className="flex justify-between">
                                <span>{resource}:</span>
                                <span>{amount}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            size="sm" 
                            disabled={!canAfford(building.cost)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Costruisci
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Recluta Unità</h3>
              <div className="space-y-3">
                {availableUnits.map((unit, index) => (
                  <Card key={index} className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{unit.emoji}</div>
                          <div>
                            <h4 className="font-medium">{unit.name}</h4>
                            <div className="flex space-x-3 text-xs">
                              <span className="text-red-600">ATK: {unit.attack}</span>
                              <span className="text-blue-600">DEF: {unit.defense}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs space-y-1 mb-2">
                            {Object.entries(unit.cost).map(([resource, amount]) => (
                              <div key={resource} className="flex justify-between">
                                <span>{resource}:</span>
                                <span>{amount}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            size="sm" 
                            disabled={!canAfford(unit.cost)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Gamepad className="w-4 h-4 mr-1" />
                            Recluta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourcesPanel;
