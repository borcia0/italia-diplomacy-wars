
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameState } from '../hooks/useGameState';
import { useAuth } from '../hooks/useAuth';
import { Shield, Gamepad, Flag, Sword, Users, Zap, Crown, Star, X, Plus, Minus, RotateCcw } from 'lucide-react';

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
  const { gameState, attackRegion, proposeAlliance } = useGameState();
  const { user } = useAuth();

  // Regioni italiane con forme più accurate
  const regions: Region[] = [
    { id: 'piemonte', name: 'Piemonte', capital: 'Torino', owner: 'GiocatoreZ', status: 'enemy', population: 4400000, resources: ['Ferro', 'Carbone'], x: 45, y: 45, size: 'medium', shape: 'M35,35 L55,32 L58,52 L45,58 L32,48 Z' },
    { id: 'lombardia', name: 'Lombardia', capital: 'Milano', owner: 'GiocatoreX', status: 'allied', population: 10000000, resources: ['Ferro', 'Industria'], x: 65, y: 40, size: 'large', shape: 'M55,32 L75,28 L82,48 L68,55 L55,45 Z' },
    { id: 'veneto', name: 'Veneto', capital: 'Venezia', owner: 'Neutrale', status: 'neutral', population: 4900000, resources: ['Cibo', 'Commercio'], x: 85, y: 42, size: 'medium', shape: 'M75,28 L95,25 L102,45 L88,52 L75,42 Z' },
    { id: 'liguria', name: 'Liguria', capital: 'Genova', owner: 'GiocatoreW', status: 'enemy', population: 1550000, resources: ['Pesce', 'Porto'], x: 50, y: 65, size: 'small', shape: 'M42,58 L62,55 L65,72 L48,75 L40,68 Z' },
    { id: 'emilia', name: 'Emilia-Romagna', capital: 'Bologna', owner: 'Tu', status: 'controlled', population: 4460000, resources: ['Cibo', 'Industria'], x: 75, y: 62, size: 'medium', shape: 'M62,55 L88,52 L92,72 L68,78 L58,68 Z' },
    { id: 'toscana', name: 'Toscana', capital: 'Firenze', owner: 'GiocatoreV', status: 'allied', population: 3730000, resources: ['Vino', 'Arte'], x: 65, y: 85, size: 'medium', shape: 'M52,75 L78,72 L82,95 L58,98 L48,88 Z' },
    { id: 'umbria', name: 'Umbria', capital: 'Perugia', owner: 'Neutrale', status: 'neutral', population: 884000, resources: ['Agricoltura'], x: 78, y: 95, size: 'small', shape: 'M72,88 L85,85 L88,102 L75,105 L68,98 Z' },
    { id: 'marche', name: 'Marche', capital: 'Ancona', owner: 'Tu', status: 'controlled', population: 1525000, resources: ['Industria', 'Porto'], x: 95, y: 88, size: 'small', shape: 'M88,82 L105,78 L108,98 L92,102 L85,92 Z' },
    { id: 'lazio', name: 'Lazio', capital: 'Roma', owner: 'Tu', status: 'controlled', population: 5800000, resources: ['Pizza', 'Potere'], x: 75, y: 115, size: 'large', shape: 'M62,105 L88,102 L92,125 L68,128 L58,118 Z' },
    { id: 'abruzzo', name: 'Abruzzo', capital: "L'Aquila", owner: 'GiocatoreU', status: 'enemy', population: 1311000, resources: ['Montagna'], x: 95, y: 115, size: 'small', shape: 'M88,108 L105,105 L108,125 L92,128 L85,118 Z' },
    { id: 'molise', name: 'Molise', capital: 'Campobasso', owner: 'Neutrale', status: 'neutral', population: 305000, resources: ['Agricoltura'], x: 98, y: 130, size: 'small', shape: 'M92,125 L105,122 L108,138 L95,142 L88,132 Z' },
    { id: 'campania', name: 'Campania', capital: 'Napoli', owner: 'GiocatoreY', status: 'enemy', population: 5800000, resources: ['Pizza', 'Vulcano'], x: 78, y: 145, size: 'medium', shape: 'M68,135 L92,132 L95,155 L72,158 L62,148 Z' },
    { id: 'puglia', name: 'Puglia', capital: 'Bari', owner: 'GiocatoreT', status: 'enemy', population: 4030000, resources: ['Olio', 'Grano'], x: 105, y: 155, size: 'medium', shape: 'M95,142 L118,138 L125,168 L102,172 L92,158 Z' },
    { id: 'basilicata', name: 'Basilicata', capital: 'Potenza', owner: 'Neutrale', status: 'neutral', population: 562000, resources: ['Petrolio'], x: 88, y: 165, size: 'small', shape: 'M82,158 L102,155 L105,175 L85,178 L78,168 Z' },
    { id: 'calabria', name: 'Calabria', capital: 'Catanzaro', owner: 'GiocatoreS', status: 'enemy', population: 1947000, resources: ['Agricoltura'], x: 85, y: 185, size: 'small', shape: 'M78,175 L98,172 L102,195 L82,198 L75,188 Z' },
    { id: 'sicilia', name: 'Sicilia', capital: 'Palermo', owner: 'Neutrale', status: 'neutral', population: 5000000, resources: ['Cibo', 'Zolfo'], x: 75, y: 215, size: 'large', shape: 'M55,205 L95,202 L102,225 L58,228 L48,218 Z' },
    { id: 'sardegna', name: 'Sardegna', capital: 'Cagliari', owner: 'GiocatoreR', status: 'enemy', population: 1640000, resources: ['Minerali'], x: 35, y: 185, size: 'medium', shape: 'M25,175 L45,172 L48,205 L28,208 L22,188 Z' },
  ];

  // Controlli touch ottimizzati
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
    setMapScale(prev => Math.min(prev * 1.3, 4));
  };

  const handleZoomOut = () => {
    setMapScale(prev => Math.max(prev / 1.3, 0.4));
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
      case 'controlled': return '#10b981';
      case 'allied': return '#3b82f6';
      case 'enemy': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'controlled': return <Badge className="bg-green-100 text-green-800 text-xs">🏛️ Tua</Badge>;
      case 'allied': return <Badge className="bg-blue-100 text-blue-800 text-xs">🤝 Alleata</Badge>;
      case 'enemy': return <Badge className="bg-red-100 text-red-800 text-xs">⚔️ Nemica</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800 text-xs">🏳️ Neutrale</Badge>;
    }
  };

  const handleAttackRegion = async (region: Region) => {
    if (!gameState || !user) return;
    
    const ownerId = gameState.regionOwnership[region.id];
    if (ownerId && ownerId !== user.id) {
      await attackRegion(region.id, ownerId);
      console.log(`⚔️ Guerra dichiarata a ${region.name}!`);
    }
  };

  const handleProposeAlliance = async (region: Region) => {
    if (!gameState || !user) return;
    
    const ownerId = gameState.regionOwnership[region.id];
    if (ownerId && ownerId !== user.id) {
      await proposeAlliance(ownerId);
      console.log(`🤝 Alleanza proposta a ${region.name}!`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-green-50 to-red-50">
      {/* Header compatto */}
      <div className="bg-white/95 backdrop-blur border-b border-gray-200 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🇮🇹</div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Italia Domination</h2>
            <div className="text-xs text-gray-600">Tocca per esplorare</div>
          </div>
        </div>
        
        {gameState && (
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              <Users className="w-3 h-3 mr-1" />
              {gameState.players.length}
            </Badge>
            <Badge className="bg-red-100 text-red-800 text-xs">
              <Sword className="w-3 h-3 mr-1" />
              {gameState.activeWars.length}
            </Badge>
          </div>
        )}
      </div>

      {/* Mappa Italia Interattiva */}
      <div className="flex-1 relative overflow-hidden">
        {/* Controlli Zoom - Più grandi per mobile */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button size="lg" onClick={handleZoomIn} className="bg-white/90 text-black hover:bg-white shadow-lg w-12 h-12 rounded-full">
            <Plus className="w-6 h-6" />
          </Button>
          <Button size="lg" onClick={handleZoomOut} className="bg-white/90 text-black hover:bg-white shadow-lg w-12 h-12 rounded-full">
            <Minus className="w-6 h-6" />
          </Button>
          <Button size="lg" onClick={resetView} className="bg-white/90 text-black hover:bg-white shadow-lg w-12 h-12 rounded-full">
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Contenitore Mappa */}
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
            viewBox="0 0 150 250"
            className="w-full h-full"
            style={{ minHeight: '100%' }}
          >
            {/* Sfondo Mare Mediterraneo */}
            <defs>
              <radialGradient id="seaGradient" cx="50%" cy="50%" r="80%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </radialGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#seaGradient)" opacity="0.4" />
            
            {/* Regioni Italia con forme accurate */}
            {updatedRegions.map(region => (
              <g key={region.id}>
                <path
                  d={region.shape}
                  fill={getRegionColor(region.status)}
                  stroke="#ffffff"
                  strokeWidth="1"
                  filter="url(#shadow)"
                  className={`cursor-pointer transition-all duration-300 hover:opacity-90 ${
                    animatedRegions.has(region.id) ? 'animate-pulse' : ''
                  }`}
                  onClick={() => setSelectedRegion(region)}
                />
                
                {/* Icone Regioni */}
                <g transform={`translate(${region.x - 4}, ${region.y - 4})`}>
                  <circle
                    cx="4"
                    cy="4"
                    r="6"
                    fill="white"
                    stroke={getRegionColor(region.status)}
                    strokeWidth="2"
                    className="cursor-pointer drop-shadow-md"
                    onClick={() => setSelectedRegion(region)}
                  />
                  {region.status === 'controlled' && (
                    <text x="4" y="6" textAnchor="middle" fontSize="6" fill="#10b981">👑</text>
                  )}
                  {region.status === 'enemy' && (
                    <text x="4" y="6" textAnchor="middle" fontSize="6" fill="#ef4444">⚔️</text>
                  )}
                  {region.status === 'allied' && (
                    <text x="4" y="6" textAnchor="middle" fontSize="6" fill="#3b82f6">🛡️</text>
                  )}
                  {region.status === 'neutral' && (
                    <text x="4" y="6" textAnchor="middle" fontSize="6" fill="#6b7280">🏳️</text>
                  )}
                </g>
                
                {/* Nome Regione se zoom abbastanza */}
                {mapScale > 1.2 && (
                  <text
                    x={region.x}
                    y={region.y + 12}
                    textAnchor="middle"
                    fontSize="4"
                    fill="#1f2937"
                    className="font-bold pointer-events-none drop-shadow-sm"
                  >
                    {region.name}
                  </text>
                )}
              </g>
            ))}

            {/* Linee di Guerra Animate */}
            {gameState?.activeWars.map((war, index) => {
              const attackerRegion = updatedRegions.find(r => gameState.regionOwnership[r.id] === war.attackerId);
              const targetRegion = updatedRegions.find(r => r.id === war.targetRegion);
              
              if (!attackerRegion || !targetRegion) return null;
              
              return (
                <g key={index}>
                  <line
                    x1={attackerRegion.x}
                    y1={attackerRegion.y}
                    x2={targetRegion.x}
                    y2={targetRegion.y}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                    className="animate-pulse"
                  />
                  <circle
                    cx={(attackerRegion.x + targetRegion.x) / 2}
                    cy={(attackerRegion.y + targetRegion.y) / 2}
                    r="2"
                    fill="#ef4444"
                    className="animate-bounce"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legenda Mobile */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg">
          <h4 className="font-semibold text-sm mb-2">🎯 Legenda</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Tue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Alleate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Nemiche</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Neutrali</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Dettagli Regione - Ottimizzato Mobile */}
      {selectedRegion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <Card className="w-full max-w-sm mx-4 mb-4 max-h-[80vh] bg-white shadow-2xl">
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
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm">
                  🏛️ {selectedRegion.capital}
                </CardDescription>
                {getStatusBadge(selectedRegion.status)}
              </div>
            </CardHeader>
            
            <ScrollArea className="max-h-96">
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
                      <Button className="w-full text-sm h-12" variant="outline">
                        <Gamepad className="w-4 h-4 mr-2" />
                        🏰 Gestisci Territorio
                      </Button>
                      <Button className="w-full text-sm h-12" variant="outline">
                        🏗️ Costruisci Edifici
                      </Button>
                      <Button className="w-full text-sm h-12" variant="outline">
                        🛡️ Schiera Truppe
                      </Button>
                    </div>
                  ) : selectedRegion.status === 'neutral' ? (
                    <div className="space-y-2">
                      <Button 
                        className="w-full text-sm h-12" 
                        onClick={() => handleProposeAlliance(selectedRegion)}
                      >
                        🤝 Proponi Alleanza
                      </Button>
                      <Button 
                        className="w-full text-sm h-12" 
                        variant="destructive"
                        onClick={() => handleAttackRegion(selectedRegion)}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        ⚔️ Dichiara Guerra
                      </Button>
                    </div>
                  ) : selectedRegion.status === 'enemy' ? (
                    <div className="space-y-2">
                      <Button 
                        className="w-full text-sm h-12" 
                        variant="destructive"
                        onClick={() => handleAttackRegion(selectedRegion)}
                      >
                        <Sword className="w-4 h-4 mr-2" />
                        ⚔️ Attacca Territorio
                      </Button>
                      <Button className="w-full text-sm h-12" variant="outline">
                        🛡️ Difendi Posizioni
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button className="w-full text-sm h-12" variant="outline">
                        💬 Invia Messaggio
                      </Button>
                      <Button 
                        className="w-full text-sm h-12"
                        onClick={() => handleProposeAlliance(selectedRegion)}
                      >
                        🤝 Proponi Alleanza
                      </Button>
                    </div>
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
