
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseGame } from '@/hooks/useSupabaseGame';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Users, Crown, Wifi } from 'lucide-react';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
  is_system?: boolean;
}

const ChatPanel = () => {
  const { user } = useSupabaseAuth();
  const { players, currentPlayer } = useSupabaseGame();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat
  useEffect(() => {
    if (!user) return;

    // Join the chat channel
    channelRef.current = supabase
      .channel('kingdom-chat')
      .on('presence', { event: 'sync' }, () => {
        const newState = channelRef.current.presenceState();
        const users = Object.keys(newState);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const joinedUser = players.find(p => p.id === key);
        if (joinedUser) {
          const systemMessage: ChatMessage = {
            id: `system-${Date.now()}`,
            user_id: 'system',
            username: 'Sistema',
            message: `👑 ${joinedUser.username} si è unito alla chat`,
            created_at: new Date().toISOString(),
            is_system: true
          };
          setMessages(prev => [...prev, systemMessage]);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const leftUser = players.find(p => p.id === key);
        if (leftUser) {
          const systemMessage: ChatMessage = {
            id: `system-${Date.now()}`,
            user_id: 'system',
            username: 'Sistema',
            message: `👋 ${leftUser.username} ha lasciato la chat`,
            created_at: new Date().toISOString(),
            is_system: true
          };
          setMessages(prev => [...prev, systemMessage]);
        }
      })
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        const message = payload as ChatMessage;
        setMessages(prev => [...prev, message]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await channelRef.current.track({
            user_id: user.id,
            username: currentPlayer?.username || user.email?.split('@')[0] || 'Giocatore',
            online_at: new Date().toISOString(),
          });
        }
      });

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, currentPlayer, players]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !currentPlayer || isLoading) return;

    setIsLoading(true);
    
    try {
      const message: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        user_id: user.id,
        username: currentPlayer.username,
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
      };

      // Broadcast message to all connected users
      await channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload: message
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOnlinePlayersList = () => {
    return players.filter(p => onlineUsers.includes(p.id));
  };

  return (
    <div className="p-6 h-full flex flex-col max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <MessageSquare className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">💬 Chat del Regno</h2>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <Wifi className="w-3 h-3 mr-1" />
          {onlineUsers.length} online
        </Badge>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Messages */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Messaggi</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 px-4 pb-4 max-h-96">
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nessun messaggio ancora</p>
                      <p className="text-sm">Sii il primo a scrivere!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-lg ${
                          message.is_system 
                            ? 'bg-yellow-100 text-yellow-800 text-center text-sm italic'
                            : message.user_id === user?.id 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-800'
                        }`}>
                          {!message.is_system && (
                            <div className="text-xs opacity-75 mb-1">
                              {message.user_id === user?.id ? 'Tu' : message.username}
                            </div>
                          )}
                          <div className="break-words">{message.message}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Scrivi un messaggio..."
                    disabled={isLoading}
                    className="flex-1"
                    maxLength={500}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Premi Invio per inviare • {newMessage.length}/500 caratteri
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Online Users */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Online</span>
                <Badge variant="outline" className="text-xs">
                  {getOnlinePlayersList().length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {getOnlinePlayersList().map((player) => (
                    <div key={player.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm flex items-center">
                          {player.username}
                          {player.id === currentPlayer?.id && (
                            <Crown className="w-3 h-3 ml-1 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {player.current_region}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {getOnlinePlayersList().length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessuno online</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
