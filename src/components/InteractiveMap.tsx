
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameState } from '../hooks/useGameState';
import { useAuth } from '../hooks/useAuth';
import { Shield, Gamepad, Flag, Sword, Users, Zap, Crown, Star } from 'lucide-react';

interface Region {
  id: string;
  name: string;
  capital: string;
  owner: string;
  status: 'controlled' | 'allied' | 'enemy' | 'neutral';
  population: number;
  resources: string[];
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
}

const InteractiveMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [animatedRegions, setAnimatedRegions] = useState<Set<string>>(new Set());
  const { gameState, attackRegion } = useGameState();
  const { user } = useAuth();

  const regions: Region[] = [
    { id: 'piemonte', name: 'Piemonte', capital: 'Torino', owner: 'GiocatoreZ', status: 'enemy', population: 4400000, resources: ['Ferro', 'Carbone'], x: 15, y: 20, size: 'medium' },
    { id: 'lombardia', name: 'Lombardia', capital: 'Milano', owner: 'GiocatoreX', status: 'allied', population: 10000000, resources: ['Ferro', 'Carbone'], x: 35, y: 25, size: 'large' },
    { id: 'veneto', name: 'Veneto', capital: 'Venezia', owner: 'Neutrale', status: 'neutral', population: 4900000, resources: ['Cibo', 'Pizza'], x: 55, y: 30, size: 'medium' },
    { id: 'lazio', name: 'Lazio', capital: 'Roma', owner: 'Tu', status: 'controlled', population: 5800000, resources: ['Pizza', 'Pietra'], x: 35, y: 60, size: 'large' },
    { id: 'campania', name: 'Campania', capital: 'Napoli', owner: 'GiocatoreY', status: 'enemy', population: 5800000, resources: ['Pizza', 'Cibo'], x: 45, y: 80, size: 'medium' },
    { id: 'sicilia', name: 'Sicilia', capital: 'Palermo', owner: 'Neutrale', status: 'neutral', population: 5000000, resources: ['Cibo', 'Pietra'], x: 35, y: 95, size: 'medium' },
  ];

  // Animate regions when wars are declared
  useEffect(() => {
    if (gameState?.activeWars) {
      const newAnimated = new Set<string>();
      gameState.activeWars.forEach(war => {
        newAnimated.add(war.targetRegion);
      });
      setAnimatedRegions(newAnimated);
      
      // Remove animation after 3 seconds
      const timer = setTimeout(() => {
        setAnimatedRegions(new Set());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState?.activeWars]);

  // Update regions based on game state
  const updatedRegions = regions.map(region => {
    if (!gameState) return region;
    
    const ownerId = gameState.regionOwnership[region.id];
    const ownerPlayer = gameState.players.find(p => p.id === ownerId);
    
    if (ownerId === user?.id) {
      return { ...region, owner: 'Tu', status: 'controlled' as const };
    } else if (ownerPlayer) {
      const isAllied = gameState.alliances.some(
        alliance => 
          (alliance.player1Id === user?.id && alliance.player2Id === ownerId) ||
          (alliance.player2Id === user?.id && alliance.player1Id === ownerId)
      );
      
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

  const getRegionColor = (status: string) => {
    switch (status) {
      case 'controlled': return 'from-green-400 to-green-600';
      case 'allied': return 'from-blue-400 to-blue-600';
      case 'enemy': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRegionSize = (size: string) => {
    switch (size) {
      case 'large': return 'w-16 h-16 md:w-20 md:h-20';
      case 'medium': return 'w-12 h-12 md:w-16 md:h-16';
      default: return 'w-10 h-10 md:w-12 md:h-12';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'controlled': return <Badge className="bg-green-100 text-green-800 text-xs">Controllata</Badge>;
      case 'allied': return <Badge className="bg-blue-100 text-blue-800 text-xs">Alleata</Badge>;
      case 'enemy': return <Badge className="bg-red-100 text-red-800 text-xs">Nemica</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800 text-xs">Neutrale</Badge>;
    }
  };

  const handleAttackRegion = async (region: Region) => {
    if (!gameState || !user) return;
    
    const ownerId = gameState.regionOwnership[region.id];
    if (ownerId && ownerId !== user.id) {
      await attackRegion(region.id, ownerId);
      console.log(`Attacco dichiarato su ${region.name}!`);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Interactive Map */}
      <div className="flex-1 p-2 md:p-6">
        <div className="bg-gradient-to-br from-green-100 via-white to-red-100 rounded-lg shadow-lg h-full relative overflow-hidden">
          <div className="absolute inset-0 p-2 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-0">
                Regno d'Italia - Anno 2024
              </h2>
              {gameState && (
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {gameState.players.length} Giocatori
                  </Badge>
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    <Sword className="w-3 h-3 mr-1" />
                    {gameState.activeWars.length} Guerre
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Interactive Italy Map */}
            <div className="relative w-full h-[400px] md:h-[500px] max-w-6xl mx-auto">
              {/* Map Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg opacity-30"></div>
              
              {/* Regions */}
              {updatedRegions.map(region => (
                <div
                  key={region.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  onClick={() => setSelectedRegion(region)}
                >
                  <div className={`
                    ${getRegionSize(region.size)}
                    bg-gradient-to-br ${getRegionColor(region.status)}
                    rounded-full shadow-lg hover:shadow-xl
                    transition-all duration-300 transform hover:scale-110
                    flex items-center justify-center relative
                    ${animatedRegions.has(region.id) ? 'animate-pulse ring-4 ring-yellow-400' : ''}
                    ${region.status === 'controlled' ? 'ring-4 ring-yellow-300' : ''}
                  `}>
                    {/* Icon based on status */}
                    {region.status === 'controlled' ? (
                      <Crown className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    ) : region.status === 'enemy' ? (
                      <Sword className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    ) : region.status === 'allied' ? (
                      <Shield className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    ) : (
                      <Star className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    )}
                    
                    {/* Animated border for wars */}
                    {animatedRegions.has(region.id) && (
                      <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping"></div>
                    )}
                  </div>
                  
                  {/* Region Label */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {region.name}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Battle Lines - Show active wars */}
              {gameState?.activeWars.map((war, index) => {
                const attackerRegion = updatedRegions.find(r => gameState.regionOwnership[r.id] === war.attackerId);
                const targetRegion = updatedRegions.find(r => r.id === war.targetRegion);
                
                if (!attackerRegion || !targetRegion) return null;
                
                return (
                  <svg key={index} className="absolute inset-0 w-full h-full pointer-events-none">
                    <line
                      x1={`${attackerRegion.x}%`}
                      y1={`${attackerRegion.y}%`}
                      x2={`${targetRegion.x}%`}
                      y2={`${targetRegion.y}%`}
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeDasharray="10,5"
                      className="animate-pulse"
                    />
                    <circle
                      cx={`${(attackerRegion.x + targetRegion.x) / 2}%`}
                      cy={`${(attackerRegion.y + targetRegion.y) / 2}%`}
                      r="4"
                      fill="#ef4444"
                      className="animate-bounce"
                    />
                  </svg>
                );
              })}
            </div>

            {/* Legend */}
            <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-white/90 backdrop-blur rounded-lg p-2 md:p-3 shadow-lg">
              <h4 className="font-semibold text-xs md:text-sm mb-2">Legenda</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center space-x-1">
                  <Crown className="w-3 h-3 text-green-600" />
                  <span>Tuo</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-blue-600" />
                  <span>Alleato</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Sword className="w-3 h-3 text-red-600" />
                  <span>Nemico</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-gray-600" />
                  <span>Neutrale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Region Details Panel - Mobile Optimized */}
      {selectedRegion && (
        <div className="w-full md:w-80 p-2 md:p-6">
          <Card className="h-full">
            <CardHeader className="pb-2 md:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-sm md:text-base">
                  <Shield className="w-4 h-4 md:w-5 md:h-5" />
                  <span>{selectedRegion.name}</span>
                </CardTitle>
                {getStatusBadge(selectedRegion.status)}
              </div>
              <CardDescription className="text-xs md:text-sm">
                Capitale: {selectedRegion.capital}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 text-xs md:text-sm">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Informazioni</h4>
                <div className="space-y-1">
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
                <h4 className="font-semibold text-gray-700 mb-2">Risorse</h4>
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
                    <Button className="w-full text-xs md:text-sm" variant="outline">
                      <Gamepad className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                      Gestisci Territorio
                    </Button>
                    <Button className="w-full text-xs md:text-sm" variant="outline">
                      Costruisci Edifici
                    </Button>
                  </div>
                ) : selectedRegion.status === 'neutral' ? (
                  <div className="space-y-2">
                    <Button className="w-full text-xs md:text-sm">
                      Proponi Alleanza
                    </Button>
                    <Button 
                      className="w-full text-xs md:text-sm" 
                      variant="destructive"
                      onClick={() => handleAttackRegion(selectedRegion)}
                    >
                      <Flag className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                      Dichiara Guerra
                    </Button>
                  </div>
                ) : selectedRegion.status === 'enemy' ? (
                  <Button 
                    className="w-full text-xs md:text-sm" 
                    variant="destructive"
                    onClick={() => handleAttackRegion(selectedRegion)}
                  >
                    <Sword className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    Attacca Territorio
                  </Button>
                ) : (
                  <Button className="w-full text-xs md:text-sm" variant="outline">
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

export default InteractiveMap;
