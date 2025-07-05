
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseGame } from '../hooks/useSupabaseGame';
import { Crown, Shield, Swords, Users, MessageCircle, HandHeart, Zap, AlertTriangle, Star } from 'lucide-react';

const RealPlayersPanel = () => {
  const { players, regions, alliances, wars, currentPlayer, proposeAlliance, declareWar, loading } = useSupabaseGame();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Caricamento giocatori...</p>
        </div>
      </div>
    );
  }

  // Filter ONLY real human players - STRICT filtering to remove ALL bots
  const realPlayers = players.filter(player => 
    player.email && 
    player.email.includes('@') && 
    !player.username.toLowerCase().includes('bot') &&
    !player.username.toLowerCase().includes('ai') &&
    !player.username.toLowerCase().includes('cpu') &&
    !player.username.toLowerCase().includes('computer') &&
    !player.username.toLowerCase().includes('npc') &&
    player.email !== 'bot@example.com' &&
    player.email !== 'ai@example.com' &&
    player.id !== currentPlayer?.id
  );

  console.log('🔍 Filtered players:', { 
    total: players.length, 
    real: realPlayers.length,
    current: currentPlayer?.username 
  });

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

  // Filter pending alliances to exclude any bot requests
  const pendingAlliances = alliances.filter(
    alliance => 
      alliance.status === 'pending' && 
      alliance.target_id === currentPlayer?.id &&
      realPlayers.some(p => p.id === alliance.proposer_id) // Only real players
  );

  return (
    <div className="h-full p-4 bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            🇮🇹 Giocatori del Regno d'Italia
          </h2>
          <p className="text-gray-600 text-lg">
            {realPlayers.length} sovrani attivi nel regno
          </p>
        </div>

        {/* Current Player Card */}
        {currentPlayer && (
          <Card className="border-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Crown className="w-8 h-8 mr-3 text-yellow-600" />
                  <span className="text-xl">{currentPlayer.username}</span>
                  <Badge className="ml-3 bg-yellow-100 text-yellow-800 text-lg px-3 py-1">
                    👑 Tu
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    🏰 {getPlayerTerritories(currentPlayer.id)} Territori
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800">
                    ⚡ {getPlayerPower(currentPlayer.id)} Potere
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                  <span className="text-2xl block mb-1">🍞</span>
                  <span className="font-bold text-lg">{currentPlayer.resources.cibo}</span>
                  <p className="text-xs text-gray-600">Cibo</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <span className="text-2xl block mb-1">🏗️</span>
                  <span className="font-bold text-lg">{currentPlayer.resources.pietra}</span>
                  <p className="text-xs text-gray-600">Pietra</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <span className="text-2xl block mb-1">⚔️</span>
                  <span className="font-bold text-lg">{currentPlayer.resources.ferro}</span>
                  <p className="text-xs text-gray-600">Ferro</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <span className="text-2xl block mb-1">🍕</span>
                  <span className="font-bold text-lg">{currentPlayer.resources.pizza}</span>
                  <p className="text-xs text-gray-600">Pizza</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Alliance Requests - Only from real players */}
        {pendingAlliances.length > 0 && (
          <Card className="border-2 border-blue-400 bg-blue-50">
            <CardHeader className="bg-blue-100">
              <CardTitle className="flex items-center text-blue-800">
                <HandHeart className="w-6 h-6 mr-3" />
                🤝 Richieste di Alleanza ({pendingAlliances.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {pendingAlliances.map(alliance => {
                  const proposer = realPlayers.find(p => p.id === alliance.proposer_id);
                  if (!proposer) return null; // Extra safety check
                  
                  return (
                    <div key={alliance.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {proposer.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{proposer.username}</h4>
                          <p className="text-gray-600">{alliance.message}</p>
                          <p className="text-xs text-gray-500">{proposer.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            console.log('✅ Accepting alliance:', alliance.id);
                            // acceptAlliance(alliance.id); // Uncomment when function is ready
                          }}
                        >
                          ✅ Accetta
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            console.log('❌ Rejecting alliance:', alliance.id);
                            // rejectAlliance(alliance.id); // Uncomment when function is ready
                          }}
                        >
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

        {/* Real Players List */}
        {realPlayers.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-600" />
              🏆 Classifica Giocatori
            </h3>
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {sortedPlayers.map((player, index) => {
                  const territories = getPlayerTerritories(player.id);
                  const power = getPlayerPower(player.id);
                  const status = getPlayerStatus(player.id);
                  
                  return (
                    <Card key={player.id} className={`hover:shadow-lg transition-all ${
                      status === 'allied' ? 'border-blue-200 bg-blue-50' : 
                      status === 'war' ? 'border-red-200 bg-red-50' : 
                      'hover:bg-gray-50'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                              {player.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-xl text-gray-800">{player.username}</h3>
                                {index === 0 && <span className="text-2xl">👑</span>}
                                {index === 1 && <span className="text-2xl">🥈</span>}
                                {index === 2 && <span className="text-2xl">🥉</span>}
                              </div>
                              <p className="text-gray-600">{player.email}</p>
                              <p className="text-sm text-gray-500">Ultimo accesso: {new Date(player.last_active).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            {status === 'allied' && (
                              <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">🤝 Alleato</Badge>
                            )}
                            {status === 'war' && (
                              <Badge className="bg-red-100 text-red-800 text-lg px-3 py-1">⚔️ In Guerra</Badge>
                            )}
                            {status === 'neutral' && (
                              <Badge className="bg-gray-100 text-gray-800 text-lg px-3 py-1">🏳️ Neutrale</Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm mb-4">
                          <div className="text-center bg-white rounded-lg p-3">
                            <span className="text-gray-600">🏰 Territori:</span>
                            <span className="font-bold text-xl block text-blue-600">{territories}</span>
                          </div>
                          <div className="text-center bg-white rounded-lg p-3">
                            <span className="text-gray-600">⚡ Potere:</span>
                            <span className="font-bold text-xl block text-purple-600">{power}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {status === 'neutral' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  console.log('🤝 Proposing alliance to:', player.username);
                                  proposeAlliance(player.id, `Alleanza proposta da ${currentPlayer?.username}`);
                                }}
                                className="flex-1 hover:bg-blue-50"
                              >
                                <HandHeart className="w-4 h-4 mr-2" />
                                🤝 Alleanza
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  console.log('⚔️ Declaring war on:', player.username);
                                  // This will be handled by the map interface
                                }}
                                className="flex-1"
                              >
                                <Swords className="w-4 h-4 mr-2" />
                                ⚔️ Guerra
                              </Button>
                            </>
                          )}
                          {status === 'allied' && (
                            <Button size="sm" variant="outline" className="w-full" disabled>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              💬 Messaggio (Prossimamente)
                            </Button>
                          )}
                          {status === 'war' && (
                            <Button size="sm" variant="destructive" className="w-full" disabled>
                              <Zap className="w-4 h-4 mr-2" />
                              ⚔️ In Battaglia
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 text-center">
              <Users className="w-20 h-20 mx-auto text-gray-400 mb-4" />
              <h3 className="font-bold text-2xl text-gray-700 mb-3">🏰 Regno Solitario</h3>
              <p className="text-gray-600 text-lg mb-6">
                Sei attualmente l'unico sovrano nel Regno d'Italia!
              </p>
              
              {/* Invite Section */}
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <h4 className="font-bold text-lg text-blue-800 mb-3">
                  🚀 Invita Altri Giocatori
                </h4>
                <div className="flex items-center space-x-3">
                  <input 
                    type="text" 
                    value={window.location.origin} 
                    readOnly 
                    className="flex-1 p-3 border rounded-lg text-sm bg-white font-mono"
                  />
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      console.log('📋 Invite link copied');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    📋 Copia
                  </Button>
                </div>
                <p className="text-sm text-blue-700 mt-3">
                  Condividi questo link per invitare amici a giocare nel Regno d'Italia!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RealPlayersPanel;
