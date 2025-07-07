
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseGame } from '@/hooks/useSupabaseGame';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Sword, Shield, Crown, Users, MessageSquare, Target } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type RegionName = Database['public']['Enums']['region_name'];

const DiplomacyPanel = () => {
  const { user } = useSupabaseAuth();
  const { 
    players, 
    regions, 
    alliances, 
    wars, 
    currentPlayer,
    declareWar,
    proposeAlliance,
    acceptAlliance,
    rejectAlliance
  } = useSupabaseGame();
  
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<RegionName>('lazio');
  const [allianceMessage, setAllianceMessage] = useState('');

  // Filter out bot players and current player
  const realPlayers = players.filter(player => 
    player.id !== user?.id &&
    player.email && 
    player.email.includes('@') && 
    !player.username.toLowerCase().includes('bot') &&
    !player.username.toLowerCase().includes('ai') &&
    !player.username.toLowerCase().includes('cpu') &&
    !player.username.toLowerCase().includes('giocatore') &&
    player.email !== 'bot@example.com'
  );

  // Filter real alliances (no bots)
  const realAlliances = alliances.filter(alliance => {
    const proposer = players.find(p => p.id === alliance.proposer_id);
    const target = players.find(p => p.id === alliance.target_id);
    return proposer && target && 
           proposer.email?.includes('@') && target.email?.includes('@') &&
           !proposer.username.toLowerCase().includes('bot') && 
           !target.username.toLowerCase().includes('bot') &&
           !proposer.username.toLowerCase().includes('giocatore') &&
           !target.username.toLowerCase().includes('giocatore');
  });

  // Filter real wars (no bots)
  const realWars = wars.filter(war => {
    const attacker = players.find(p => p.id === war.attacker_id);
    const defender = players.find(p => p.id === war.defender_id);
    return attacker && defender && 
           attacker.email?.includes('@') && defender.email?.includes('@') &&
           !attacker.username.toLowerCase().includes('bot') && 
           !defender.username.toLowerCase().includes('bot') &&
           !attacker.username.toLowerCase().includes('giocatore') &&
           !defender.username.toLowerCase().includes('giocatore');
  });

  const handleDeclareWar = async () => {
    if (selectedTarget && selectedRegion) {
      await declareWar(selectedTarget, selectedRegion);
      setSelectedTarget('');
      setSelectedRegion('lazio');
    }
  };

  const handleProposeAlliance = async () => {
    if (selectedTarget) {
      await proposeAlliance(selectedTarget, allianceMessage || 'Proposta di alleanza');
      setSelectedTarget('');
      setAllianceMessage('');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-center mb-2">👑 Centro Diplomatico</h2>
        <p className="text-center text-gray-600">Gestisci alleanze e dichiarazioni di guerra</p>
      </div>

      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="actions">Azioni Diplomazia</TabsTrigger>
          <TabsTrigger value="alliances">Alleanze</TabsTrigger>
          <TabsTrigger value="wars">Guerre</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Alliance Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Proponi Alleanza</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un giocatore" />
                  </SelectTrigger>
                  <SelectContent>
                    {realPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.username} ({player.current_region})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Messaggio dell'alleanza (opzionale)"
                  value={allianceMessage}
                  onChange={(e) => setAllianceMessage(e.target.value)}
                  rows={3}
                />

                <Button 
                  onClick={handleProposeAlliance}
                  disabled={!selectedTarget}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Proponi Alleanza
                </Button>
              </CardContent>
            </Card>

            {/* War Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sword className="w-5 h-5 text-red-600" />
                  <span>Dichiara Guerra</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un nemico" />
                  </SelectTrigger>
                  <SelectContent>
                    {realPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.username} ({player.current_region})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRegion} onValueChange={(value) => setSelectedRegion(value as RegionName)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona regione obiettivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.filter(r => r.owner_id === selectedTarget).map((region) => (
                      <SelectItem key={region.id} value={region.name}>
                        {region.capital} ({region.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="text-sm text-gray-600">
                  <p>Costo: 50 Ferro + 100 Cibo</p>
                </div>

                <Button 
                  onClick={handleDeclareWar}
                  disabled={!selectedTarget || !selectedRegion}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Sword className="w-4 h-4 mr-2" />
                  Dichiara Guerra
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alliances">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Gestione Alleanze</span>
            </h3>

            {realAlliances.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nessuna alleanza attiva</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {realAlliances.map((alliance) => {
                  const proposer = players.find(p => p.id === alliance.proposer_id);
                  const target = players.find(p => p.id === alliance.target_id);
                  const isTargeted = alliance.target_id === user?.id;
                  const isProposer = alliance.proposer_id === user?.id;

                  return (
                    <Card key={alliance.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                alliance.status === 'active' ? 'default' :
                                alliance.status === 'pending' ? 'secondary' :
                                alliance.status === 'rejected' ? 'destructive' : 'outline'
                              }>
                                {alliance.status === 'active' ? 'Attiva' :
                                 alliance.status === 'pending' ? 'In Attesa' :
                                 alliance.status === 'rejected' ? 'Rifiutata' : 'Sconosciuto'}
                              </Badge>
                              <span className="font-medium">
                                {isProposer ? `Tu → ${target?.username}` : `${proposer?.username} → Tu`}
                              </span>
                            </div>
                            {alliance.message && (
                              <p className="text-sm text-gray-600">{alliance.message}</p>
                            )}
                          </div>

                          {isTargeted && alliance.status === 'pending' && (
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
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="wars">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Conflitti Attivi</span>
            </h3>

            {realWars.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nessun conflitto attivo</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {realWars.map((war) => {
                  const attacker = players.find(p => p.id === war.attacker_id);
                  const defender = players.find(p => p.id === war.defender_id);
                  const isInvolved = war.attacker_id === user?.id || war.defender_id === user?.id;

                  return (
                    <Card key={war.id} className={isInvolved ? 'border-red-200 bg-red-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                war.status === 'declared' ? 'destructive' :
                                war.status === 'active' ? 'default' : 'secondary'
                              }>
                                {war.status === 'declared' ? 'Dichiarata' :
                                 war.status === 'active' ? 'In Corso' : 'Conclusa'}
                              </Badge>
                              <span className="font-medium">
                                {attacker?.username} vs {defender?.username}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Obiettivo: {war.target_region}
                            </p>
                            {war.result && (
                              <p className="text-sm font-medium">
                                Risultato: {war.result}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiplomacyPanel;
