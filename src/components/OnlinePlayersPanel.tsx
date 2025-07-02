
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameState } from '../hooks/useGameState';
import { useAuth } from '../hooks/useAuth';
import { Users, Wifi, WifiOff, Sword, Handshake } from 'lucide-react';

const OnlinePlayersPanel = () => {
  const { gameState, proposeAlliance, declareWar } = useGameState();
  const { user } = useAuth();

  if (!gameState) return null;

  const otherPlayers = gameState.players.filter(p => p.id !== user?.id);

  const isAllied = (playerId: string) => {
    return gameState.alliances.some(
      alliance => 
        (alliance.player1Id === user?.id && alliance.player2Id === playerId) ||
        (alliance.player2Id === user?.id && alliance.player1Id === playerId)
    );
  };

  const isAtWar = (playerId: string) => {
    return gameState.activeWars.some(
      war => 
        (war.attackerId === user?.id && war.defenderId === playerId) ||
        (war.defenderId === user?.id && war.attackerId === playerId)
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Giocatori Online</h2>
        <Badge variant="outline">{gameState.players.length} Giocatori Attivi</Badge>
      </div>

      <div className="grid gap-4">
        {otherPlayers.map(player => (
          <Card key={player.id} className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      player.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{player.username}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {player.isOnline ? (
                        <><Wifi className="w-3 h-3" /> Online</>
                      ) : (
                        <><WifiOff className="w-3 h-3" /> Offline</>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isAllied(player.id) && (
                    <Badge className="bg-blue-100 text-blue-800">Alleato</Badge>
                  )}
                  {isAtWar(player.id) && (
                    <Badge className="bg-red-100 text-red-800">In Guerra</Badge>
                  )}
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {player.region}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* Resources */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Risorse Visibili</h4>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    <div className="text-center">
                      <span className="block">🍞</span>
                      <span>{player.resources.cibo}</span>
                    </div>
                    <div className="text-center">
                      <span className="block">🏗️</span>
                      <span>{player.resources.pietra}</span>
                    </div>
                    <div className="text-center">
                      <span className="block">⚔️</span>
                      <span>{player.resources.ferro}</span>
                    </div>
                    <div className="text-center">
                      <span className="block">⚫</span>
                      <span>{player.resources.carbone}</span>
                    </div>
                    <div className="text-center">
                      <span className="block">🍕</span>
                      <span>{player.resources.pizza}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2 border-t">
                  {!isAllied(player.id) && !isAtWar(player.id) && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => proposeAlliance(player.id)}
                      >
                        <Handshake className="w-4 h-4 mr-1" />
                        Alleanza
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => declareWar(player.id)}
                      >
                        <Sword className="w-4 h-4 mr-1" />
                        Guerra
                      </Button>
                    </>
                  )}
                  
                  {isAllied(player.id) && (
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      <Handshake className="w-4 h-4 mr-1" />
                      Alleato Attivo
                    </Button>
                  )}
                  
                  {isAtWar(player.id) && (
                    <Button size="sm" variant="destructive" className="w-full">
                      <Sword className="w-4 h-4 mr-1" />
                      Combatti
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {otherPlayers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Nessun altro giocatore online</h3>
          <p className="text-gray-500">Aspetta che altri giocatori si uniscano alla partita!</p>
        </div>
      )}
    </div>
  );
};

export default OnlinePlayersPanel;
