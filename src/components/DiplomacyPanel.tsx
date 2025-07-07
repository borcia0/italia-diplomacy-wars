
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseGame } from '@/hooks/useSupabaseGame';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Handshake, Sword, Shield, Users, MessageSquare, Crown, AlertTriangle } from 'lucide-react';

const DiplomacyPanel = () => {
  const { players, alliances, wars, currentPlayer, proposeAlliance, acceptAlliance, rejectAlliance, declareWar } = useSupabaseGame();
  const { toast } = useToast();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [allianceMessage, setAllianceMessage] = useState('');

  // Filtra solo i giocatori reali (non bot)
  const realPlayers = players.filter(player => 
    player.id !== currentPlayer?.id &&
    player.email && 
    player.email.includes('@') && 
    !player.username.toLowerCase().includes('giocatore') &&
    !player.username.toLowerCase().includes('bot') &&
    !player.username.toLowerCase().includes('ai') &&
    !player.username.toLowerCase().includes('cpu') &&
    player.email !== 'bot@example.com'
  );

  // Filtra alleanze e guerre per mostrare solo quelle con giocatori reali
  const realAlliances = alliances.filter(alliance => {
    const proposer = players.find(p => p.id === alliance.proposer_id);
    const target = players.find(p => p.id === alliance.target_id);
    return proposer && target && 
           !proposer.username.toLowerCase().includes('giocatore') && 
           !target.username.toLowerCase().includes('giocatore') &&
           !proposer.username.toLowerCase().includes('bot') &&
           !target.username.toLowerCase().includes('bot');
  });

  const realWars = wars.filter(war => {
    const attacker = players.find(p => p.id === war.attacker_id);
    const defender = players.find(p => p.id === war.defender_id);
    return attacker && defender && 
           !attacker.username.toLowerCase().includes('giocatore') && 
           !defender.username.toLowerCase().includes('giocatore') &&
           !attacker.username.toLowerCase().includes('bot') &&
           !defender.username.toLowerCase().includes('bot');
  });

  const handleProposeAlliance = async (targetId: string) => {
    if (!currentPlayer) return;

    try {
      await proposeAlliance(targetId, allianceMessage || 'Proposta di alleanza');
      setAllianceMessage('');
      setSelectedPlayer(null);
    } catch (error) {
      console.error('Error proposing alliance:', error);
    }
  };

  const handleDeclareWar = async (targetId: string) => {
    if (!currentPlayer) return;

    try {
      // Trova una regione del target per la guerra
      const targetPlayer = players.find(p => p.id === targetId);
      if (!targetPlayer) return;

      await declareWar(targetId, targetPlayer.current_region || 'lazio');
    } catch (error) {
      console.error('Error declaring war:', error);
    }
  };

  const getRelationshipStatus = (playerId: string) => {
    const alliance = realAlliances.find(a => 
      (a.proposer_id === currentPlayer?.id && a.target_id === playerId) ||
      (a.target_id === currentPlayer?.id && a.proposer_id === playerId)
    );

    const war = realWars.find(w => 
      (w.attacker_id === currentPlayer?.id && w.defender_id === playerId) ||
      (w.defender_id === currentPlayer?.id && w.attacker_id === playerId)
    );

    if (alliance) {
      return { type: 'alliance', status: alliance.status, data: alliance };
    }
    if (war) {
      return { type: 'war', status: war.status, data: war };
    }
    return { type: 'neutral', status: null, data: null };
  };

  const getPendingAlliances = () => {
    return realAlliances.filter(a => 
      a.target_id === currentPlayer?.id && a.status === 'pending'
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Crown className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Diplomazia del Regno</h2>
      </div>

      {/* Richieste di Alleanza Pendenti */}
      {getPendingAlliances().length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <MessageSquare className="w-5 h-5" />
              <span>📨 Richieste di Alleanza</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getPendingAlliances().map((alliance) => {
                const proposer = players.find(p => p.id === alliance.proposer_id);
                return (
                  <div key={alliance.id} className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{proposer?.username}</div>
                        <div className="text-sm text-gray-600">{alliance.message}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(alliance.created_at || '').toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => acceptAlliance(alliance.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accetta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectAlliance(alliance.id)}
                        >
                          Rifiuta
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista Giocatori */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>👥 Altri Giocatori ({realPlayers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {realPlayers.length > 0 ? (
              <div className="space-y-4">
                {realPlayers.map((player) => {
                  const relationship = getRelationshipStatus(player.id);
                  return (
                    <div key={player.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {player.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{player.username}</div>
                            <div className="text-sm text-gray-600">
                              Regione: {player.current_region || 'Sconosciuta'}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {relationship.type === 'alliance' && relationship.status === 'active' && (
                                <Badge className="bg-green-100 text-green-800">
                                  <Handshake className="w-3 h-3 mr-1" />
                                  Alleato
                                </Badge>
                              )}
                              {relationship.type === 'alliance' && relationship.status === 'pending' && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  In Attesa
                                </Badge>
                              )}
                              {relationship.type === 'war' && (
                                <Badge className="bg-red-100 text-red-800">
                                  <Sword className="w-3 h-3 mr-1" />
                                  In Guerra
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {relationship.type === 'neutral' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => setSelectedPlayer(selectedPlayer === player.id ? null : player.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Handshake className="w-4 h-4 mr-1" />
                                Proponi Alleanza
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeclareWar(player.id)}
                              >
                                <Sword className="w-4 h-4 mr-1" />
                                Dichiara Guerra
                              </Button>
                            </>
                          )}
                          {relationship.type === 'alliance' && relationship.status === 'active' && (
                            <Button size="sm" variant="outline" disabled>
                              <Shield className="w-4 h-4 mr-1" />
                              Alleanza Attiva
                            </Button>
                          )}
                          {relationship.type === 'war' && (
                            <Button size="sm" variant="destructive" disabled>
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Stato di Guerra
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Form Alleanza */}
                      {selectedPlayer === player.id && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-t">
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Messaggio di alleanza (opzionale)"
                              value={allianceMessage}
                              onChange={(e) => setAllianceMessage(e.target.value)}
                              className="resize-none"
                              rows={3}
                            />
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleProposeAlliance(player.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Invia Proposta
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPlayer(null);
                                  setAllianceMessage('');
                                }}
                              >
                                Annulla
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nessun altro giocatore online
                </h3>
                <p className="text-gray-500">
                  Aspetta che altri giocatori si uniscano al regno per iniziare le tue manovre diplomatiche!
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Statistiche Diplomazia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-2xl mb-2">🤝</div>
            <div className="text-2xl font-bold text-green-600">
              {realAlliances.filter(a => a.status === 'active' && (a.proposer_id === currentPlayer?.id || a.target_id === currentPlayer?.id)).length}
            </div>
            <div className="text-sm text-gray-600">Alleanze Attive</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-2xl mb-2">⚔️</div>
            <div className="text-2xl font-bold text-red-600">
              {realWars.filter(w => w.status === 'active' && (w.attacker_id === currentPlayer?.id || w.defender_id === currentPlayer?.id)).length}
            </div>
            <div className="text-sm text-gray-600">Guerre Attive</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-2xl mb-2">📨</div>
            <div className="text-2xl font-bold text-blue-600">
              {getPendingAlliances().length}
            </div>
            <div className="text-sm text-gray-600">Richieste Pendenti</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiplomacyPanel;
