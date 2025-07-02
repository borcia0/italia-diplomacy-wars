
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, Shield, Flag, Bell } from 'lucide-react';

interface DiplomaticAction {
  id: string;
  type: 'alliance' | 'non_aggression' | 'war_declaration' | 'puppet_offer';
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'rejected' | 'active';
  date: string;
  message?: string;
}

const DiplomacyPanel = () => {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [message, setMessage] = useState('');
  const [actionType, setActionType] = useState<'alliance' | 'non_aggression' | 'war_declaration'>('alliance');

  const diplomaticActions: DiplomaticAction[] = [
    {
      id: '1',
      type: 'alliance',
      from: 'GiocatoreX',
      to: 'Tu',
      status: 'pending',
      date: '2024-01-15',
      message: 'Propongo un\'alleanza per conquistare il Sud insieme!'
    },
    {
      id: '2',
      type: 'war_declaration',
      from: 'GiocatoreY',
      to: 'Tu',
      status: 'active',
      date: '2024-01-14',
      message: 'Il Lazio sarà mio!'
    },
    {
      id: '3',
      type: 'non_aggression',
      from: 'Tu',
      to: 'GiocatoreZ',
      status: 'accepted',
      date: '2024-01-10',
      message: 'Patto di non aggressione per 30 giorni'
    }
  ];

  const players = [
    { id: 'player1', name: 'GiocatoreX', region: 'Lombardia', status: 'alleato' },
    { id: 'player2', name: 'GiocatoreY', region: 'Campania', status: 'nemico' },
    { id: 'player3', name: 'GiocatoreZ', region: 'Piemonte', status: 'neutrale' },
    { id: 'player4', name: 'GiocatoreW', region: 'Sicilia', status: 'neutrale' },
  ];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'alliance': return <Users className="w-4 h-4" />;
      case 'war_declaration': return <Flag className="w-4 h-4" />;
      case 'non_aggression': return <Shield className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'alliance': return 'bg-green-100 text-green-800 border-green-200';
      case 'war_declaration': return 'bg-red-100 text-red-800 border-red-200';
      case 'non_aggression': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendAction = () => {
    if (!selectedPlayer || !message) return;
    
    console.log('Sending diplomatic action:', {
      type: actionType,
      to: selectedPlayer,
      message
    });
    
    // Reset form
    setSelectedPlayer('');
    setMessage('');
  };

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Centro Diplomatico</h2>
        <p className="text-gray-600">Gestisci alleanze, guerre e negoziazioni</p>
      </div>

      <Tabs defaultValue="actions" className="h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="actions">Azioni Attive</TabsTrigger>
          <TabsTrigger value="send">Invia Proposta</TabsTrigger>
          <TabsTrigger value="players">Giocatori</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4">
            {diplomaticActions.map(action => (
              <Card key={action.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(action.type)}
                      <CardTitle className="text-lg">
                        {action.type === 'alliance' && 'Proposta di Alleanza'}
                        {action.type === 'war_declaration' && 'Dichiarazione di Guerra'}
                        {action.type === 'non_aggression' && 'Patto di Non Aggressione'}
                      </CardTitle>
                    </div>
                    <Badge className={getStatusColor(action.status)}>
                      {action.status === 'pending' && 'In Attesa'}
                      {action.status === 'accepted' && 'Accettato'}
                      {action.status === 'active' && 'Attivo'}
                      {action.status === 'rejected' && 'Rifiutato'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {action.from === 'Tu' ? `Inviato a ${action.to}` : `Ricevuto da ${action.from}`} - {action.date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {action.message && (
                    <p className="text-sm text-gray-700 mb-4 italic">"{action.message}"</p>
                  )}
                  
                  {action.status === 'pending' && action.from !== 'Tu' && (
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Accetta
                      </Button>
                      <Button size="sm" variant="destructive">
                        Rifiuta
                      </Button>
                    </div>
                  )}
                  
                  {action.status === 'active' && action.type === 'alliance' && (
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      Rompi Alleanza (7 giorni)
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nuova Azione Diplomatica</CardTitle>
              <CardDescription>
                Invia una proposta diplomatica ad un altro giocatore
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di Azione
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={actionType === 'alliance' ? 'default' : 'outline'}
                    onClick={() => setActionType('alliance')}
                    className="text-sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Alleanza
                  </Button>
                  <Button
                    variant={actionType === 'non_aggression' ? 'default' : 'outline'}
                    onClick={() => setActionType('non_aggression')}
                    className="text-sm"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Non Aggressione
                  </Button>
                  <Button
                    variant={actionType === 'war_declaration' ? 'default' : 'outline'}
                    onClick={() => setActionType('war_declaration')}
                    className="text-sm"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Guerra
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinatario
                </label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleziona un giocatore...</option>
                  {players.map(player => (
                    <option key={player.id} value={player.name}>
                      {player.name} ({player.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Messaggio
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Scrivi il tuo messaggio diplomatico..."
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                onClick={handleSendAction}
                className="w-full"
                disabled={!selectedPlayer || !message}
              >
                Invia Proposta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players" className="space-y-4">
          <div className="grid gap-4">
            {players.map(player => (
              <Card key={player.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{player.name}</h3>
                        <p className="text-sm text-gray-600">Controllo: {player.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={
                          player.status === 'alleato' ? 'bg-green-100 text-green-800' :
                          player.status === 'nemico' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {player.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Contatta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiplomacyPanel;
