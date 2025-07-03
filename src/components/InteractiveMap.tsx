import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameState } from '../hooks/useGameState';
import { useAuth } from '../hooks/useAuth';
import { Shield, Gamepad, Flag, Sword, Users, Zap, Crown, Star, X } from 'lucide-react';

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
  shape: string;
}

const InteractiveMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [animatedRegions, setAnimatedRegions] = useState<Set<string>>(new Set());
  const [mapScale, setMapScale] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { gameState, attackRegion } = useGameState();
  const { user } = useAuth();

  // Regioni italiane con coordinate precise
  const regions: Region[] = [
    { id: 'piemonte', name: 'Piemonte', capital: 'Torino', owner: 'GiocatoreZ', status: 'enemy', population: 4400000, resources: ['Ferro', 'Carbone'], x: 12, y: 15, size: 'medium', shape: 'M10,10 L25,8 L30,25 L15,30 L8,20 Z' },
    { id: 'lombardia', name: 'Lombardia', capital: 'Milano', owner: 'GiocatoreX', status: 'allied', population: 10000000, resources: ['Ferro', 'Carbone'], x: 22, y: 18, size: 'large', shape: 'M15,12 L35,10 L40,25 L25,28 L12,22 Z' },
    { id: 'veneto', name: 'Veneto', capital: 'Venezia', owner: 'Neutrale', status: 'neutral', population: 4900000, resources: ['Cibo', 'Pizza'], x: 35, y: 20, size: 'medium', shape: 'M30,15 L45,12 L50,25 L35,28 L28,20 Z' },
    { id: 'liguria', name: 'Liguria', capital: 'Genova', owner: 'GiocatoreW', status: 'enemy', population: 1550000, resources: ['Pesce', 'Commercio'], x: 15, y: 28, size: 'small', shape: 'M8,25 L25,22 L28,35 L12,38 L5,30 Z' },
    { id: 'emilia', name: 'Emilia-Romagna', capital: 'Bologna', owner: 'Tu', status: 'controlled', population: 4460000, resources: ['Cibo', 'Industria'], x: 28, y: 32, size: 'medium', shape: 'M20,28 L40,25 L45,40 L25,43 L18,35 Z' },
    { id: 'toscana', name: 'Toscana', capital: 'Firenze', owner: 'GiocatoreV', status: 'allied', population: 3730000, resources: ['Vino', 'Arte'], x: 22, y: 42, size: 'medium', shape: 'M15,38 L35,35 L40,50 L20,53 L12,45 Z' },
    { id: 'umbria', name: 'Umbria', capital: 'Perugia', owner: 'Neutrale', status: 'neutral', population: 884000, resources: ['Agricoltura'], x: 32, y: 48, size: 'small', shape: 'M28,45 L38,42 L42,55 L30,58 L25,50 Z' },
    { id: 'marche', name: 'Marche', capital: 'Ancona', owner: 'Tu', status: 'controlled', population: 1525000, resources: ['Industria', 'Agricoltura'], x: 38, y: 45, size: 'small', shape: 'M35,40 L45,38 L50,52 L38,55 L32,47 Z' },
    { id: 'lazio', name: 'Lazio', capital: 'Roma', owner: 'Tu', status: 'controlled', population: 5800000, resources: ['Pizza', 'Pietra'], x: 30, y: 58, size: 'large', shape: 'M22,52 L42,50 L45,68 L25,70 L18,60 Z' },
    { id: 'abruzzo', name: 'Abruzzo', capital: "L'Aquila", owner: 'GiocatoreU', status: 'enemy', population: 1311000, resources: ['Montagna'], x: 40, y: 58, size: 'small', shape: 'M35,52 L48,50 L52,65 L38,68 L32,60 Z' },
    { id: 'molise', name: 'Molise', capital: 'Campobasso', owner: 'Neutrale', status: 'neutral', population: 305000, resources: ['Agricoltura'], x: 42, y: 65, size: 'small', shape: 'M38,62 L48,60 L52,72 L40,75 L35,68 Z' },
    { id: 'campania', name: 'Campania', capital: 'Napoli', owner: 'GiocatoreY', status: 'enemy', population: 5800000, resources: ['Pizza', 'Cibo'], x: 35, y: 72, size: 'medium', shape: 'M28,68 L45,65 L50,80 L32,83 L25,75 Z' },
    { id: 'puglia', name: 'Puglia', capital: 'Bari', owner: 'GiocatoreT', status: 'enemy', population: 4030000, resources: ['Olio', 'Grano'], x: 48, y: 75, size: 'medium', shape: 'M42,70 L58,68 L62,85 L45,88 L40,78 Z' },
    { id: 'basilicata', name: 'Basilicata', capital: 'Potenza', owner: 'Neutrale', status: 'neutral', population: 562000, resources: ['Petrolio'], x: 42, y: 80, size: 'small', shape: 'M38,75 L48,73 L52,88 L40,90 L35,82 Z' },
    { id: 'calabria', name: 'Calabria', capital: 'Catanzaro', owner: 'GiocatoreS', status: 'enemy', population: 1947000, resources: ['Agricoltura'], x: 40, y: 88, size: 'small', shape: 'M35,82 L48,80 L52,98 L38,100 L32,90 Z' },
    { id: 'sicilia', name: 'Sicilia', capital: 'Palermo', owner: 'Neutrale', status: 'neutral', population: 5000000, resources: ['Cibo', 'Pietra'], x: 35, y: 105, size: 'large', shape: 'M25,100 L50,98 L55,115 L30,118 L20,108 Z' },
    { id: 'sardegna', name: 'Sardegna', capital: 'Cagliari', owner: 'GiocatoreR', status: 'enemy', population: 1640000, resources: ['Minerali'], x: 15, y: 85, size: 'medium', shape: 'M8,78 L25,75 L28,95 L12,98 L5,88 Z' },
  ];

  // Zoom e pan handlers per mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - mapPosition.x,
        y: e.touches[0].clientY - mapPosition.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setMapPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setMapScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setMapScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const resetView = () => {
    setMapScale(1);
    setMapPosition({ x: 0, y: 0 });
  };

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
      case 'controlled': return '#22c55e';
      case 'allied': return '#3b82f6';
      case 'enemy': return '#ef4444';
      default: return '#6b7280';
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
    <div className="h-full flex flex-col">
      {/* Mappa Italia Interattiva */}
      <div className="flex-1 relative bg-gradient-to-b from-blue-50 to-green-50 overflow-hidden">
        {/* Controlli Zoom Mobile */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button size="sm" onClick={handleZoomIn} className="bg-white/90 text-black hover:bg-white">
            +
          </Button>
          <Button size="sm" onClick={handleZoomOut} className="bg-white/90 text-black hover:bg-white">
            -
          </Button>
          <Button size="sm" onClick={resetView} className="bg-white/90 text-black hover:bg-white text-xs">
            Reset
          </Button>
        </div>

        {/* Header Info */}
        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            🇮🇹 Italia - Taverna Domination
          </h2>
          {gameState && (
            <div className="flex gap-2 text-xs">
              <Badge className="bg-blue-100 text-blue-800">
                <Users className="w-3 h-3 mr-1" />
                {gameState.players.length}
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                <Sword className="w-3 h-3 mr-1" />
                {gameState.activeWars.length}
              </Badge>
            </div>
          )}
        </div>

        {/* Mappa SVG Italia */}
        <div 
          className="absolute inset-0 touch-pan-x touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${mapScale})`,
            transformOrigin: 'center center'
          }}
        >
          <svg
            viewBox="0 0 80 130"
            className="w-full h-full"
            style={{ minHeight: '600px' }}
          >
            {/* Background Mare */}
            <defs>
              <radialGradient id="seaGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#0284c7" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#seaGradient)" opacity="0.3" />
            
            {/* Regioni Italia */}
            {regions.map(region => (
              <g key={region.id}>
                <path
                  d={region.shape}
                  fill={getRegionColor(region.status)}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  className={`cursor-pointer transition-all duration-300 hover:opacity-80 ${
                    animatedRegions.has(region.id) ? 'animate-pulse' : ''
                  }`}
                  onClick={() => setSelectedRegion(region)}
                />
                
                {/* Icona Regione */}
                <g transform={`translate(${region.x - 2}, ${region.y - 2})`}>
                  <circle
                    cx="2"
                    cy="2"
                    r="3"
                    fill="white"
                    stroke={getRegionColor(region.status)}
                    strokeWidth="1"
                    className="cursor-pointer"
                    onClick={() => setSelectedRegion(region)}
                  />
                  {region.status === 'controlled' && (
                    <text x="2" y="2.5" textAnchor="middle" fontSize="2" fill="#22c55e">👑</text>
                  )}
                  {region.status === 'enemy' && (
                    <text x="2" y="2.5" textAnchor="middle" fontSize="2" fill="#ef4444">⚔️</text>
                  )}
                  {region.status === 'allied' && (
                    <text x="2" y="2.5" textAnchor="middle" fontSize="2" fill="#3b82f6">🛡️</text>
                  )}
                  {region.status === 'neutral' && (
                    <text x="2" y="2.5" textAnchor="middle" fontSize="2" fill="#6b7280">⭐</text>
                  )}
                </g>
                
                {/* Nome Regione (solo se zoom > 1.5) */}
                {mapScale > 1.5 && (
                  <text
                    x={region.x}
                    y={region.y + 6}
                    textAnchor="middle"
                    fontSize="2"
                    fill="#1f2937"
                    className="font-bold pointer-events-none"
                  >
                    {region.name}
                  </text>
                )}
              </g>
            ))}

            {/* Linee di Guerra Animate */}
            {gameState?.activeWars.map((war, index) => {
              const attackerRegion = regions.find(r => gameState.regionOwnership[r.id] === war.attackerId);
              const targetRegion = regions.find(r => r.id === war.targetRegion);
              
              if (!attackerRegion || !targetRegion) return null;
              
              return (
                <g key={index}>
                  <line
                    x1={attackerRegion.x}
                    y1={attackerRegion.y}
                    x2={targetRegion.x}
                    y2={targetRegion.y}
                    stroke="#ef4444"
                    strokeWidth="1"
                    strokeDasharray="2,1"
                    className="animate-pulse"
                  />
                  <circle
                    cx={(attackerRegion.x + targetRegion.x) / 2}
                    cy={(attackerRegion.y + targetRegion.y) / 2}
                    r="1"
                    fill="#ef4444"
                    className="animate-bounce"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legenda */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
          <h4 className="font-semibold text-sm mb-2">Legenda</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Tue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Alleate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Nemiche</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>Neutrali</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Dettagli Regione - Mobile Ottimizzato */}
      {selectedRegion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[80vh] bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Shield className="w-5 h-5" />
                  <span>{selectedRegion.name}</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRegion(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <CardDescription>
                  🏛️ {selectedRegion.capital}
                </CardDescription>
                {getStatusBadge(selectedRegion.status)}
              </div>
            </CardHeader>
            
            <ScrollArea className="h-[400px]">
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">📊 Informazioni</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>👑 Governatore:</span>
                      <span className="font-medium">{selectedRegion.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>👥 Popolazione:</span>
                      <span className="font-medium">{selectedRegion.population.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🏭 Risorse</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegion.resources.map(resource => (
                      <Badge key={resource} variant="outline" className="text-xs">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  {selectedRegion.status === 'controlled' ? (
                    <div className="space-y-2">
                      <Button className="w-full text-sm" variant="outline">
                        <Gamepad className="w-4 h-4 mr-2" />
                        🏰 Gestisci Territorio
                      </Button>
                      <Button className="w-full text-sm" variant="outline">
                        🏗️ Costruisci Edifici
                      </Button>
                    </div>
                  ) : selectedRegion.status === 'neutral' ? (
                    <div className="space-y-2">
                      <Button className="w-full text-sm">
                        🤝 Proponi Alleanza
                      </Button>
                      <Button 
                        className="w-full text-sm" 
                        variant="destructive"
                        onClick={() => handleAttackRegion(selectedRegion)}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        ⚔️ Dichiara Guerra
                      </Button>
                    </div>
                  ) : selectedRegion.status === 'enemy' ? (
                    <Button 
                      className="w-full text-sm" 
                      variant="destructive"
                      onClick={() => handleAttackRegion(selectedRegion)}
                    >
                      <Sword className="w-4 h-4 mr-2" />
                      ⚔️ Attacca Territorio
                    </Button>
                  ) : (
                    <Button className="w-full text-sm" variant="outline">
                      💬 Invia Messaggio
                    </Button>
                  )}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
