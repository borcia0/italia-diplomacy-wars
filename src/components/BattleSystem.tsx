
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGameState } from '../hooks/useGameState';
import { useAuth } from '../hooks/useAuth';
import { Sword, Shield, Clock, AlertTriangle } from 'lucide-react';

const BattleSystem = () => {
  const { gameState, attackRegion } = useGameState();
  const { user } = useAuth();
  const [selectedTroops, setSelectedTroops] = useState({
    infantry: 0,
    cavalry: 0,
    artillery: 0
  });

  if (!gameState) return null;

  const activeWars = gameState.activeWars.filter(
    war => war.attackerId === user?.id || war.defenderId === user?.id
  );

  const getTimeRemaining = (war: any) => {
    const elapsed = Date.now() - new Date(war.startTime).getTime();
    const remaining = (4 * 60 * 60 * 1000) - elapsed; // 4 hours
    return Math.max(0, remaining);
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const isDefender = (war: any) => war.defenderId === user?.id;

  const calculateBattlePower = () => {
    return selectedTroops.infantry * 1 + selectedTroops.cavalry * 3 + selectedTroops.artillery * 5;
  };

  const canAffordTroops = () => {
    if (!user?.resources) return false;
    const cost = selectedTroops.infantry * 10 + selectedTroops.cavalry * 30 + selectedTroops.artillery * 50;
    return user.resources.cibo >= cost;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Sword className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold">Sistema di Battaglia</h2>
        {activeWars.length > 0 && (
          <Badge variant="destructive">{activeWars.length} Guerre Attive</Badge>
        )}
      </div>

      {activeWars.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nessuna Guerra Attiva</h3>
            <p className="text-gray-500">Vai alla mappa per dichiarare guerra o formar alleanze</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeWars.map((war, index) => {
            const timeRemaining = getTimeRemaining(war);
            const isTimeUp = timeRemaining <= 0;
            const defender = isDefender(war);
            const enemy = gameState.players.find(p => 
              p.id === (defender ? war.attackerId : war.defenderId)
            );

            return (
              <Card key={index} className="border-red-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {defender ? (
                        <>
                          <Shield className="w-5 h-5 text-blue-600" />
                          <span>Difendi {war.targetRegion}</span>
                        </>
                      ) : (
                        <>
                          <Sword className="w-5 h-5 text-red-600" />
                          <span>Attacca {war.targetRegion}</span>
                        </>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {isTimeUp ? 'Tempo Scaduto!' : formatTime(timeRemaining)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {defender ? `Attaccante: ${enemy?.username}` : `Difensore: ${enemy?.username}`}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {!isTimeUp && (
                    <div className="space-y-3">
                      <Progress 
                        value={(timeRemaining / (4 * 60 * 60 * 1000)) * 100} 
                        className="h-2"
                      />
                      
                      {/* Troop Selection */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Schiera le tue truppe:</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <span className="block text-sm font-medium mb-2">🚶 Fanteria</span>
                            <div className="flex items-center justify-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedTroops(prev => ({
                                  ...prev, 
                                  infantry: Math.max(0, prev.infantry - 1)
                                }))}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{selectedTroops.infantry}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedTroops(prev => ({
                                  ...prev, 
                                  infantry: prev.infantry + 1
                                }))}
                              >
                                +
                              </Button>
                            </div>
                            <span className="text-xs text-gray-500">10 cibo/unità</span>
                          </div>
                          
                          <div className="text-center">
                            <span className="block text-sm font-medium mb-2">🐎 Cavalleria</span>
                            <div className="flex items-center justify-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedTroops(prev => ({
                                  ...prev, 
                                  cavalry: Math.max(0, prev.cavalry - 1)
                                }))}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{selectedTroops.cavalry}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedTroops(prev => ({
                                  ...prev, 
                                  cavalry: prev.cavalry + 1
                                }))}
                              >
                                +
                              </Button>
                            </div>
                            <span className="text-xs text-gray-500">30 cibo/unità</span>
                          </div>
                          
                          <div className="text-center">
                            <span className="block text-sm font-medium mb-2">🎯 Artiglieria</span>
                            <div className="flex items-center justify-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedTroops(prev => ({
                                  ...prev, 
                                  artillery: Math.max(0, prev.artillery - 1)
                                }))}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{selectedTroops.artillery}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedTroops(prev => ({
                                  ...prev, 
                                  artillery: prev.artillery + 1
                                }))}
                              >
                                +
                              </Button>
                            </div>
                            <span className="text-xs text-gray-500">50 cibo/unità</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Potenza Totale:</span>
                            <span className="text-xl font-bold text-blue-600">{calculateBattlePower()}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Costo Totale:</span>
                            <span>{selectedTroops.infantry * 10 + selectedTroops.cavalry * 30 + selectedTroops.artillery * 50} cibo</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1" 
                          disabled={!canAffordTroops() || calculateBattlePower() === 0}
                        >
                          {defender ? 'Schiera Difesa' : 'Lancia Attacco'}
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Negozia Pace
                        </Button>
                      </div>
                    </div>
                  )}

                  {isTimeUp && (
                    <div className="text-center p-4 bg-red-50 rounded border border-red-200">
                      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-red-700">Tempo Scaduto!</h4>
                      <p className="text-sm text-red-600">
                        {defender ? 'Hai perso per mancata difesa' : 'Vittoria per abbandono!'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BattleSystem;
