
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
import { Send, MessageCircle, Crown, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
  user_region?: string;
}

const ChatPanel = () => {
  const { user } = useSupabaseAuth();
  const { currentPlayer, players } = useSupabaseGame();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock chat functionality for now since we don't have chat table
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      user_id: 'mock1',
      username: 'GiuseppeRoma',
      message: 'Salve nobili! Chi vuole allearsi con il Lazio?',
      created_at: new Date(Date.now() - 300000).toISOString(),
      user_region: 'lazio'
    },
    {
      id: '2',
      user_id: 'mock2',
      username: 'MarcoVeneto',
      message: 'Il Veneto è aperto al dialogo! 🤝',
      created_at: new Date(Date.now() - 180000).toISOString(),
      user_region: 'veneto'
    },
    {
      id: '3',
      user_id: 'mock3',
      username: 'AnnaMilano',
      message: 'La Lombardia propone un trattato commerciale',
      created_at: new Date(Date.now() - 60000).toISOString(),
      user_region: 'lombardia'
    }
  ];

  useEffect(() => {
    // Set mock messages for now
    setMessages(mockMessages);
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !currentPlayer) return;

    setIsLoading(true);
    
    // For now, just add to local state since we don't have chat table
    const mockNewMessage: ChatMessage = {
      id: Date.now().toString(),
      user_id: user.id,
      username: currentPlayer.username,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      user_region: currentPlayer.current_region || 'lazio'
    };

    setMessages(prev => [...prev, mockNewMessage]);
    setNewMessage('');
    setIsLoading(false);

    toast({
      title: "Messaggio inviato!",
      description: "Il tuo messaggio è stato pubblicato nella chat globale",
    });

    // Scroll to bottom
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRegionEmoji = (region?: string) => {
    const regionEmojis: Record<string, string> = {
      'lazio': '🏛️',
      'lombardia': '🏭',
      'veneto': '🚤',
      'campania': '🌋',
      'sicilia': '🏝️',
      'piemonte': '🍷',
      'toscana': '🎨',
      'emilia-romagna': '🍝',
      'puglia': '🫒',
      'calabria': '🌶️'
    };
    return regionEmojis[region || ''] || '🏰';
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <span>💬 Chat Globale del Regno</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Users className="w-3 h-3 mr-1" />
                {players.length} Online
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-4">
          <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
            <div className="space-y-4 pr-4">
              {messages.map((message) => {
                const isOwnMessage = message.user_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-semibold flex items-center space-x-1">
                          {!isOwnMessage && (
                            <>
                              <span>{getRegionEmoji(message.user_region)}</span>
                              <span>{message.username}</span>
                              {message.username === 'GiuseppeRoma' && <Crown className="w-3 h-3 text-yellow-400" />}
                            </>
                          )}
                          {isOwnMessage && <span>Tu</span>}
                        </span>
                        <span className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scrivi un messaggio al regno..."
              className="flex-1"
              disabled={isLoading}
              maxLength={500}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !newMessage.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            {newMessage.length}/500 caratteri
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPanel;
