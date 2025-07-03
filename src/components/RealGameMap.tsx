
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseGame } from '../hooks/useSupabaseGame';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Shield, Swords, Crown, Users, Flag } from 'lucide-react';

const RealGameMap = () => {
  const { regions, players, currentPlayer, declareWar, loading } = useSupabaseGame();
  const { user } = useSupabaseAuth();
  const [selectedRegion, setSelectedRegion] = useState<any>(null);

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

  const italianRegions = [
    { name: 'valle-daosta', displayName: 'Valle d\'Aosta', position: 'top-left' },
    { name: 'piemonte', displayName: 'Piemonte', position: 'top-left' },
    { name: 'lombardia', displayName: 'Lombardia', position: 'top-center' },
    { name: 'trentino', displayName: 'Trentino', position: 'top-center' },
    { name: 'veneto', displayName: 'Veneto', position: 'top-right' },
    { name: 'friuli', displayName: 'Friuli', position: 'top-right' },
    { name: 'liguria', displayName: 'Liguria', position: 'center-left' },
    { name: 'emilia-romagna', displayName: 'Emilia-Romagna', position: 'center' },
    { name: 'toscana', displayName: 'Toscana', position: 'center-left' },
    { name: 'umbria', displayName: 'Umbria', position: 'center' },
    { name: 'marche', displayName: 'Marche', position: 'center-right' },
    { name: 'lazio', displayName: 'Lazio', position: 'center' },
    { name: 'abruzzo', displayName: 'Abruzzo', position: 'center-right' },
    { name: 'molise', displayName: 'Molise', position: 'center-right' },
    { name: 'campania', displayName: 'Campania', position: 'bottom-left' },
    { name: 'puglia', displayName: 'Puglia', position: 'bottom-right' },
    { name: 'basilicata', displayName: 'Basilicata', position: 'bottom-center' },
    { name: 'calabria', displayName: 'Calabria', position: 'bottom-center' },
    { name: 'sicilia', displayName: 'Sicilia', position: 'bottom' },
    { name: 'sardegna', displayName: 'Sardegna', position: 'bottom-left' },
  ];

  const handleRegionClick = (regionName: string) => {
    const region = regions.find(r => r.name === regionName);
    const owner = getRegionOwner(regionName);
    setSelectedRegion({
      ...region,
      owner,
      status: getRegionStatus(regionName),
      displayName: italianRegions.find(r => r.name === regionName)?.displayName || regionName
    });
  };

  const handleDeclareWar = async (targetRegion: string, defenderId: string) => {
    await declareWar(defenderId, targetRegion);
    setSelectedRegion(null);
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
        <div className="w-full lg:w-80 p-4 lg:p-6">
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
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-2 pt-4 border-t">
                <Button
                  onClick={() => setSelectedRegion(null)}
                  variant="outline"
                  className="w-full"
                >
                  ❌ Chiudi
                </Button>
                
                {selectedRegion.status === 'controlled' ? (
                  <div className="space-y-2">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Crown className="w-4 h-4 mr-2" />
                      Gestisci Territorio
                    </Button>
                    <Button variant="outline" className="w-full">
                      🏗️ Costruisci Edifici
                    </Button>
                  </div>
                ) : selectedRegion.status === 'enemy' && selectedRegion.owner ? (
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => handleDeclareWar(selectedRegion.name, selectedRegion.owner.id)}
                  >
                    <Swords className="w-4 h-4 mr-2" />
                    Dichiara Guerra
                  </Button>
                ) : (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Flag className="w-4 h-4 mr-2" />
                    Conquista Territorio
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

export default RealGameMap;
