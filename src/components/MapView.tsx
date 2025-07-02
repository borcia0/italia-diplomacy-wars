import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameState } from '../hooks/useGameState';
import { useAuth } from '../hooks/useAuth';
import { Shield, Gamepad, Flag, Sword, Users } from 'lucide-react';

interface Region {
  id: string;
  name: string;
  capital: string;
  owner: string;
  status: 'controlled' | 'allied' | 'enemy' | 'neutral';
  population: number;
  resources: string[];
}

const MapView = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const { gameState, attackRegion, declareWar } = useGameState();
  const { user } = useAuth();

  const regions: Region[] = [
    { id: 'lazio', name: 'Lazio', capital: 'Roma', owner: 'Tu', status: 'controlled', population: 5800000, resources: ['Pizza', 'Pietra'] },
    { id: 'lombardia', name: 'Lombardia', capital: 'Milano', owner: 'GiocatoreX', status: 'allied', population: 10000000, resources: ['Ferro', 'Carbone'] },
    { id: 'campania', name: 'Campania', capital: 'Napoli', owner: 'GiocatoreY', status: 'enemy', population: 5800000, resources: ['Pizza', 'Cibo'] },
    { id: 'sicilia', name: 'Sicilia', capital: 'Palermo', owner: 'Neutrale', status: 'neutral', population: 5000000, resources: ['Cibo', 'Pietra'] },
    { id: 'piemonte', name: 'Piemonte', capital: 'Torino', owner: 'GiocatoreZ', status: 'enemy', population: 4400000, resources: ['Ferro', 'Carbone'] },
    { id: 'veneto', name: 'Veneto', capital: 'Venezia', owner: 'Neutrale', status: 'neutral', population: 4900000, resources: ['Cibo', 'Pizza'] },
  ];

  // Update regions based on game state
  const updatedRegions = regions.map(region => {
    if (!gameState) return region;
    
    const ownerId = gameState.regionOwnership[region.id];
    const ownerPlayer = gameState.players.find(p => p.id === ownerId);
    
    if (ownerId === user?.id) {
      return { ...region, owner: 'Tu', status: 'controlled' as const };
    } else if (ownerPlayer) {
      // Check if allied
      const isAllied = gameState.alliances.some(
        alliance => 
          (alliance.player1Id === user?.id && alliance.player2Id === ownerId) ||
          (alliance.player2Id === user?.id && alliance.player1Id === ownerId)
      );
      
      // Check if at war
      const isAtWar = gameState.activeWars.some(
        war => 
          (war.attackerId === user?.id && war.defenderId === ownerId) ||
          (war.defenderId === user?.id && war.attackerId === ownerId)
      );
      
      return { 
        ...region, 
        owner: ownerPlayer.username, 
        status: isAtWar ? 'enemy' as const : isAllied ? 'allied' as const : 'neutral' as const 
      };
    }
    
    return region;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'controlled': return 'bg-green-500 hover:bg-green-600';
      case 'allied': return 'bg-blue-500 hover:bg-blue-600';
      case 'enemy': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'controlled': return <Badge className="bg-green-100 text-green-800">Controllata</Badge>;
      case 'allied': return <Badge className="bg-blue-100 text-blue-800">Alleata</Badge>;
      case 'enemy': return <Badge className="bg-red-100 text-red-800">Nemica</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Neutrale</Badge>;
    }
  };

  const handleAttackRegion = async (region: Region) => {
    if (!gameState || !user) return;
    
    const ownerId = gameState.regionOwnership[region.id];
    if (ownerId && ownerId !== user.id) {
      await attackRegion(region.id, ownerId);
      // Show notification or update UI
      console.log(`Attacco dichiarato su ${region.name}!`);
    }
  };

  return (
    <div className="h-full flex">
      {/* Map Area */}
      <div className="flex-1 p-6">
        <div className="bg-gradient-to-br from-green-100 via-white to-red-100 rounded-lg shadow-lg h-full relative overflow-hidden">
          <div className="absolute inset-0 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Regno d'Italia - Anno 2024
              </h2>
              {gameState && (
                <div className="flex items-center space-x-4">
                  <Badge className="bg-blue-100 text-blue-800">
                    <Users className="w-3 h-3 mr-1" />
                    {gameState.players.length} Giocatori
                  </Badge>
                  <Badge className="bg-red-100 text-red-800">
                    <Sword className="w-3 h-3 mr-1" />
                    {gameState.activeWars.length} Guerre
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Simplified Italy Map Grid */}
            <div className="grid grid-cols-3 gap-4 h-5/6 max-w-4xl mx-auto">
              {/* North */}
              <div className="col-span-3 grid grid-cols-3 gap-2">
                {updatedRegions.filter(r => ['piemonte', 'lombardia', 'veneto'].includes(r.id)).map(region => (
                  <div
                    key={region.id}
                    className={`${getStatusColor(region.status)} rounded-lg p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-md`}
                    onClick={() => setSelectedRegion(region)}
                  >
                    <div className="text-white text-center">
                      <Shield className="w-6 h-6 mx-auto mb-2" />
                      <h3 className="font-bold text-sm">{region.name}</h3>
                      <p className="text-xs opacity-90">{region.capital}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Center */}
              <div className="col-span-3 flex justify-center">
                {updatedRegions.filter(r => r.id === 'lazio').map(region => (
                  <div
                    key={region.id}
                    className={`${getStatusColor(region.status)} rounded-lg p-6 cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-lg ${
                      region.status === 'controlled' ? 'ring-4 ring-yellow-300' : ''
                    }`}
                    onClick={() => setSelectedRegion(region)}
                  >
                    <div className="text-white text-center">
                      <Shield className="w-8 h-8 mx-auto mb-2" />
                      <h3 className="font-bold">{region.name}</h3>
                      <p className="text-sm opacity-90">{region.capital}</p>
                      {region.status === 'controlled' && (
                        <Badge className="mt-2 bg-yellow-100 text-yellow-800">TUA CAPITALE</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* South */}
              <div className="col-span-3 grid grid-cols-2 gap-4">
                {updatedRegions.filter(r => ['campania', 'sicilia'].includes(r.id)).map(region => (
                  <div
                    key={region.id}
                    className={`${getStatusColor(region.status)} rounded-lg p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-md`}
                    onClick={() => setSelectedRegion(region)}
                  >
                    <div className="text-white text-center">
                      <Shield className="w-6 h-6 mx-auto mb-2" />
                      <h3 className="font-bold text-sm">{region.name}</h3>
                      <p className="text-xs opacity-90">{region.capital}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
              <h4 className="font-semibold text-sm mb-2">Legenda</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Territorio Controllato</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Alleato</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Nemico</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span>Neutrale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Region Details Panel */}
      {selectedRegion && (
        <div className="w-80 p-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>{selectedRegion.name}</span>
                </CardTitle>
                {getStatusBadge(selectedRegion.status)}
              </div>
              <CardDescription>
                Capitale: {selectedRegion.capital}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Informazioni</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Governatore:</span>
                    <span className="font-medium">{selectedRegion.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Popolazione:</span>
                    <span className="font-medium">{selectedRegion.population.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Risorse</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedRegion.resources.map(resource => (
                    <Badge key={resource} variant="outline" className="text-xs">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                {selectedRegion.status === 'controlled' ? (
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Gamepad className="w-4 h-4 mr-2" />
                      Gestisci Territorio
                    </Button>
                    <Button className="w-full" variant="outline">
                      Costruisci Edifici
                    </Button>
                  </div>
                ) : selectedRegion.status === 'neutral' ? (
                  <div className="space-y-2">
                    <Button className="w-full">
                      Proponi Alleanza
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={() => handleAttackRegion(selectedRegion)}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Dichiara Guerra
                    </Button>
                  </div>
                ) : selectedRegion.status === 'enemy' ? (
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    onClick={() => handleAttackRegion(selectedRegion)}
                  >
                    <Sword className="w-4 h-4 mr-2" />
                    Attacca Territorio
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline">
                    Invia Messaggio
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapView;
