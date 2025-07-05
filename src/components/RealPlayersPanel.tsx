
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseGame } from '../hooks/useSupabaseGame';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Users, Crown, Swords, Handshake, Shield, MapPin, Star } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type RegionName = Database['public']['Enums']['region_name'];

const RealPlayersPanel = () => {
  const { players, regions, alliances, wars, armyUnits, buildings, proposeAlliance, declareWar, loading } = useSupabaseGame();
  const { user } = useSupabaseAuth();

  // Only show authenticated real players, excluding current user
  const otherPlayers = players.filter(p => p.id !== user?.id && p.email && p.username);

  const getPlayerTerritories = (playerId: string) => {
    return regions.filter(r => r.owner_id === playerId);
  };

  const getPlayerArmyPower = (playerId: string) => {
    const playerUnits = armyUnits.filter(u => u.user_id === playerId);
    const totalAttack = playerUnits.reduce((sum, unit) => sum + (unit.quantity * unit.attack_power), 0);
    const totalDefense = playerUnits.reduce((sum, unit) => sum + (unit.quantity * unit.defense_power), 0);
    return { attack: totalAttack, defense: totalDefense };
  };

  const getPlayerBuildings = (playerId: string) => {
    return buildings.filter(b => b.user_id === playerId);
  };

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

  const getPlayerPowerLevel = (playerId: string) => {
    const territories = getPlayerTerritories(playerId).length;
    const armyPower = getPlayerArmyPower(playerId);
    const buildingsCount = getPlayerBuildings(playerId).length;
    
    const totalPower = territories * 10 + (armyPower.attack + armyPower.defense) / 10 + buildingsCount * 5;
    
    if (totalPower >= 100) return { level: 'Imperatore', color: 'text-purple-600', emoji: '👑' };
    if (totalPower >= 75) return { level: 'Re', color: 'text-yellow-600', emoji: '🤴' };
    if (totalPower >= 50) return { level: 'Duca', color: 'text-blue-600', emoji: '🏴' };
    if (totalPower >= 25) return { level: 'Conte', color: 'text-green-600', emoji: '🎖️' };
    return { level: 'Barone', color: 'text-gray-600', emoji: '🛡️' };
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Caricamento sovrani...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex items-center space-x-2 mb-4 lg:mb-6">
        <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
        <h2 className="text-xl lg:text-2xl font-bold">👥 Sovrani del Regno</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {players.length} Giocatori Online
        </Badge>
      </div>

      <div className="grid gap-3 lg:gap-4">
        {otherPlayers.map(player => {
          const territories = getPlayerTerritories(player.id);
          const armyPower = getPlayerArmyPower(player.id);
          const buildingsCount = getPlayerBuildings(player.id).length;
          const powerLevel = getPlayerPowerLevel(player.id);
          
          return (
            <Card key={player.id} className="transition-all duration-200 hover:shadow-lg border-2 hover:border-blue-200">
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
                        <span className="text-lg">{powerLevel.emoji}</span>
                      </CardTitle>
                      <div className="text-xs lg:text-sm text-gray-600 flex items-center space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span>{player.current_region || 'Nessuna regione'}</span>
                        <span className={`font-medium ${powerLevel.color}`}>• {powerLevel.level}</span>
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
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Crown className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-800">Territori</span>
                      </div>
                      <div className="text-lg font-bold text-green-700">{territories.length}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-800">Edifici</span>
                      </div>
                      <div className="text-lg font-bold text-purple-700">{buildingsCount}</div>
                    </div>
                  </div>

                  {/* Army Power */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-xs lg:text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      ⚔️ Potenza Militare
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center bg-red-100 rounded p-2">
                        <span className="block text-red-600 font-medium">Attacco</span>
                        <span className="text-red-800 font-bold">{armyPower.attack}</span>
                      </div>
                      <div className="text-center bg-blue-100 rounded p-2">
                        <span className="block text-blue-600 font-medium">Difesa</span>
                        <span className="text-blue-800 font-bold">{armyPower.defense}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h4 className="text-xs lg:text-sm font-semibold text-gray-700 mb-2">🏭 Risorse</h4>
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

                  {/* Territories */}
                  {territories.length > 0 && (
                    <div>
                      <h4 className="text-xs lg:text-sm font-semibold text-gray-700 mb-2">🗺️ Territori Controllati</h4>
                      <div className="flex flex-wrap gap-1">
                        {territories.slice(0, 3).map(territory => (
                          <Badge key={territory.id} variant="outline" className="text-xs">
                            {territory.name}
                          </Badge>
                        ))}
                        {territories.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-100">
                            +{territories.length - 3} altri
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2 pt-3 border-t">
                    {!isAllied(player.id) && !isAtWar(player.id) && !hasPendingAlliance(player.id) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs lg:text-sm hover:bg-blue-50"
                          onClick={() => proposeAlliance(player.id, `Proposta di alleanza da ${players.find(p => p.id === user?.id)?.username}`)}
                        >
                          <Handshake className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                          🤝 Alleanza
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 text-xs lg:text-sm"
                          onClick={() => declareWar(player.id, player.current_region as RegionName)}
                        >
                          <Swords className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                          ⚔️ Guerra
                        </Button>
                      </>
                    )}
                    
                    {isAllied(player.id) && (
                      <div className="flex items-center justify-center space-x-2 bg-blue-50 rounded p-2">
                        <Handshake className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">🤝 Alleato Fidato</span>
                      </div>
                    )}
                    
                    {isAtWar(player.id) && (
                      <div className="flex items-center justify-center space-x-2 bg-red-50 rounded p-2">
                        <Swords className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">⚔️ Stato di Guerra</span>
                      </div>
                    )}

                    {hasPendingAlliance(player.id) && (
                      <div className="flex items-center justify-center space-x-2 bg-yellow-50 rounded p-2">
                        <Shield className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">⏳ Negoziati in Corso</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {otherPlayers.length === 0 && (
        <div className="text-center py-8 lg:py-12">
          <Users className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">👤 Nessun altro sovrano online</h3>
          <p className="text-gray-500 text-sm lg:text-base mb-4">
            Invita altri nobili a unirsi al tuo regno per espandere l'impero!
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <strong>💡 Suggerimento:</strong> Condividi questo link per invitare altri giocatori:
            <br />
            <code className="bg-blue-100 px-2 py-1 rounded mt-2 inline-block">
              {window.location.href}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealPlayersPanel;
