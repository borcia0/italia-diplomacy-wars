
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseGame } from '../hooks/useSupabaseGame';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Users, Crown, Swords, Handshake, Shield } from 'lucide-react';

const RealPlayersPanel = () => {
  const { players, alliances, wars, proposeAlliance, declareWar, loading } = useSupabaseGame();
  const { user } = useSupabaseAuth();

  const otherPlayers = players.filter(p => p.id !== user?.id);

  const isAllied = (playerId: string) => {
    return alliances.some(
      alliance => 
        alliance.status === 'active' &&
        ((alliance.proposer_id === user?.id && alliance.target_id === playerId) ||
         (alliance.target_id === user?.id && alliance.proposer_id === playerId))
    );
  };

  const isAtWar = (playerId: string) => {
    return wars.some(
      war => 
        war.status !== 'resolved' &&
        ((war.attacker_id === user?.id && war.defender_id === playerId) ||
         (war.defender_id === user?.id && war.attacker_id === playerId))
    );
  };

  const hasPendingAlliance = (playerId: string) => {
    return alliances.some(
      alliance => 
        alliance.status === 'pending' &&
        ((alliance.proposer_id === user?.id && alliance.target_id === playerId) ||
         (alliance.target_id === user?.id && alliance.proposer_id === playerId))
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex items-center space-x-2 mb-4 lg:mb-6">
        <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
        <h2 className="text-xl lg:text-2xl font-bold">👥 Giocatori Online</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {players.length} Sovrani Attivi
        </Badge>
      </div>

      <div className="grid gap-3 lg:gap-4">
        {otherPlayers.map(player => (
          <Card key={player.id} className="transition-all duration-200 hover:shadow-lg border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-base">
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base lg:text-lg flex items-center space-x-2">
                      <span>{player.username}</span>
                      <Crown className="w-4 h-4 text-yellow-500" />
                    </CardTitle>
                    <div className="text-xs lg:text-sm text-gray-600">
                      📍 {player.current_region}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  {isAllied(player.id) && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">🤝 Alleato</Badge>
                  )}
                  {isAtWar(player.id) && (
                    <Badge className="bg-red-100 text-red-800 text-xs">⚔️ In Guerra</Badge>
                  )}
                  {hasPendingAlliance(player.id) && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">⏳ In Attesa</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* Resources */}
                <div>
                  <h4 className="text-xs lg:text-sm font-semibold text-gray-700 mb-2">🏭 Risorse Visibili</h4>
                  <div className="grid grid-cols-5 gap-1 lg:gap-2 text-xs">
                    <div className="text-center bg-yellow-50 rounded p-1">
                      <span className="block text-base lg:text-lg">🍞</span>
                      <span className="font-medium">{player.resources.cibo}</span>
                    </div>
                    <div className="text-center bg-gray-50 rounded p-1">
                      <span className="block text-base lg:text-lg">🏗️</span>
                      <span className="font-medium">{player.resources.pietra}</span>
                    </div>
                    <div className="text-center bg-red-50 rounded p-1">
                      <span className="block text-base lg:text-lg">⚔️</span>
                      <span className="font-medium">{player.resources.ferro}</span>
                    </div>
                    <div className="text-center bg-gray-100 rounded p-1">
                      <span className="block text-base lg:text-lg">⚫</span>
                      <span className="font-medium">{player.resources.carbone}</span>
                    </div>
                    <div className="text-center bg-orange-50 rounded p-1">
                      <span className="block text-base lg:text-lg">🍕</span>
                      <span className="font-medium">{player.resources.pizza}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2 pt-2 border-t">
                  {!isAllied(player.id) && !isAtWar(player.id) && !hasPendingAlliance(player.id) && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs lg:text-sm"
                        onClick={() => proposeAlliance(player.id, `Proposta di alleanza da ${players.find(p => p.id === user?.id)?.username}`)}
                      >
                        <Handshake className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                        Alleanza
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 text-xs lg:text-sm"
                        onClick={() => declareWar(player.id, player.current_region)}
                      >
                        <Swords className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                        Guerra
                      </Button>
                    </>
                  )}
                  
                  {isAllied(player.id) && (
                    <Button size="sm" variant="outline" className="w-full text-xs lg:text-sm" disabled>
                      <Handshake className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                      🤝 Alleato Attivo
                    </Button>
                  )}
                  
                  {isAtWar(player.id) && (
                    <Button size="sm" variant="destructive" className="w-full text-xs lg:text-sm">
                      <Swords className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                      ⚔️ Combatti
                    </Button>
                  )}

                  {hasPendingAlliance(player.id) && (
                    <Button size="sm" variant="outline" className="w-full text-xs lg:text-sm" disabled>
                      <Shield className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                      ⏳ Proposta Inviata
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {otherPlayers.length === 0 && (
        <div className="text-center py-8 lg:py-12">
          <Users className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Nessun altro sovrano online</h3>
          <p className="text-gray-500 text-sm lg:text-base">
            Condividi il link del gioco per invitare altri giocatori!
          </p>
        </div>
      )}
    </div>
  );
};

export default RealPlayersPanel;
