
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseGame } from '../hooks/useSupabaseGame';
import { Crown, Shield, Swords, Users, MessageCircle, HandHeart, Zap } from 'lucide-react';

const RealPlayersPanel = () => {
  const { players, regions, alliances, wars, currentPlayer, proposeAlliance, declareWar, loading } = useSupabaseGame();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Filter only real human players
  const realPlayers = players.filter(player => 
    player.email && 
    player.email.includes('@') && 
    !player.username.toLowerCase().includes('bot') &&
    player.id !== currentPlayer?.id
  );

  const getPlayerTerritories = (playerId: string) => {
    return regions.filter(region => region.owner_id === playerId).length;
  };

  const getPlayerPower = (playerId: string) => {
    const territories = getPlayerTerritories(playerId);
    const player = players.find(p => p.id === playerId);
    if (!player) return 0;
    
    return territories * 100 + (player.resources?.ferro || 0) + (player.resources?.cibo || 0);
  };

  const getPlayerStatus = (playerId: string) => {
    const isAllied = alliances.some(
      alliance => 
        alliance.status === 'active' &&
        ((alliance.proposer_id === currentPlayer?.id && alliance.target_id === playerId) ||
         (alliance.target_id === currentPlayer?.id && alliance.proposer_id === playerId))
    );
    
    const isAtWar = wars.some(
      war => 
        war.status === 'declared' &&
        ((war.attacker_id === currentPlayer?.id && war.defender_id === playerId) ||
         (war.defender_id === currentPlayer?.id && war.attacker_id === playerId))
    );

    if (isAtWar) return 'war';
    if (isAllied) return 'allied';
    return 'neutral';
  };

  const sortedPlayers = realPlayers.sort((a, b) => getPlayerPower(b.id) - getPlayerPower(a.id));

  const pendingAlliances = alliances.filter(
    alliance => 
      alliance.status === 'pending' && 
      alliance.target_id === currentPlayer?.id
  );

  return (
    <div className="h-full p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-600" />
          Giocatori Online
        </h2>
        <p className="text-gray-600">
          {realPlayers.length} sovrani nel regno
        </p>
      </div>

      {/* Current Player Card */}
      {currentPlayer && (
        <Card className="mb-6 border-2 border-yellow-400">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-600" />
                <span>{currentPlayer.username} (Tu)</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                👑 Sovrano
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Territori:</span>
                <span className="font-bold ml-2">{getPlayerTerritories(currentPlayer.id)}</span>
              </div>
              <div>
                <span className="text-gray-600">Potere:</span>
                <span className="font-bold ml-2 text-blue-600">{getPlayerPower(currentPlayer.id)}</span>
              </div>
              <div>
                <span className="text-gray-600">Risorse:</span>
                <span className="font-bold ml-2">
                  🍞{currentPlayer.resources.cibo} 🏗️{currentPlayer.resources.pietra} ⚔️{currentPlayer.resources.ferro}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="font-bold ml-2 text-green-600">Regnante</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Alliance Requests */}
      {pendingAlliances.length > 0 && (
        <Card className="mb-6 border-2 border-blue-400">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center text-blue-800">
              <HandHeart className="w-5 h-5 mr-2" />
              Richieste di Alleanza ({pendingAlliances.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {pendingAlliances.map(alliance => {
                const proposer = players.find(p => p.id === alliance.proposer_id);
                return (
                  <div key={alliance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{proposer?.username}</h4>
                      <p className="text-sm text-gray-600">{alliance.message}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => {}}>
                        ✅ Accetta
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {}}>
                        ❌ Rifiuta
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Players List */}
      <ScrollArea className="h-96">
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => {
            const territories = getPlayerTerritories(player.id);
            const power = getPlayerPower(player.id);
            const status = getPlayerStatus(player.id);
            
            return (
              <Card key={player.id} className={`${status === 'allied' ? 'border-blue-200 bg-blue-50' : status === 'war' ? 'border-red-200 bg-red-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {player.username}
                          {index === 0 && <span className="ml-2 text-yellow-600">👑</span>}
                          {index === 1 && <span className="ml-2 text-gray-400">🥈</span>}
                          {index === 2 && <span className="ml-2 text-amber-600">🥉</span>}
                        </h3>
                        <p className="text-sm text-gray-600">{player.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {status === 'allied' && (
                        <Badge className="bg-blue-100 text-blue-800 mb-1">🤝 Alleato</Badge>
                      )}
                      {status === 'war' && (
                        <Badge className="bg-red-100 text-red-800 mb-1">⚔️ In Guerra</Badge>
                      )}
                      {status === 'neutral' && (
                        <Badge className="bg-gray-100 text-gray-800 mb-1">🏳️ Neutrale</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Territori:</span>
                      <span className="font-bold ml-2">{territories}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Potere:</span>
                      <span className="font-bold ml-2 text-blue-600">{power}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {status === 'neutral' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => proposeAlliance(player.id, `Alleanza proposta da ${currentPlayer?.username}`)}
                          className="flex-1"
                        >
                          <HandHeart className="w-4 h-4 mr-1" />
                          Alleanza
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {/* Guerra verrà gestita dalla mappa */}}
                          className="flex-1"
                        >
                          <Swords className="w-4 h-4 mr-1" />
                          Guerra
                        </Button>
                      </>
                    )}
                    {status === 'allied' && (
                      <Button size="sm" variant="outline" className="w-full" disabled>
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Messaggio (Coming Soon)
                      </Button>
                    )}
                    {status === 'war' && (
                      <Button size="sm" variant="destructive" className="w-full" disabled>
                        <Zap className="w-4 h-4 mr-1" />
                        In Battaglia
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {realPlayers.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">Nessun altro giocatore online</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Sei l'unico sovrano nel regno al momento.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">
                    💡 Invita i tuoi amici per conquistare l'Italia insieme!
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <input 
                      type="text" 
                      value={window.location.origin} 
                      readOnly 
                      className="flex-1 p-1 border rounded text-xs bg-white"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => navigator.clipboard.writeText(window.location.origin)}
                    >
                      Copia
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RealPlayersPanel;
