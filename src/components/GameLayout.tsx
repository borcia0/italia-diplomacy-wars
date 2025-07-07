
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSupabaseGame } from '@/hooks/useSupabaseGame';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import RealGameMap from './RealGameMap';
import MinigamesPanel from './MinigamesPanel';
import MarketPanel from './MarketPanel';
import DiplomacyPanel from './DiplomacyPanel';
import ChatPanel from './ChatPanel';
import { Button } from '@/components/ui/button';
import { LogOut, Crown, Wheat, Pickaxe, Zap, Pizza } from 'lucide-react';

const GameLayout = () => {
  const { currentPlayer, players } = useSupabaseGame();
  const { logout } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-8 h-8 text-yellow-500" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Regno d'Italia 2024
                </h1>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {players.length} Giocatori Online
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {/* Resources Display */}
              {currentPlayer?.resources && (
                <div className="hidden md:flex items-center space-x-3 bg-white/80 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-1">
                    <Wheat className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">{currentPlayer.resources.cibo}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Pickaxe className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">{currentPlayer.resources.pietra}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-red-600" />
                    <span className="font-medium">{currentPlayer.resources.ferro}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Pizza className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium">{currentPlayer.resources.pizza}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="font-semibold">{currentPlayer?.username}</div>
                  <div className="text-sm text-gray-600">{currentPlayer?.current_region}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <span>🗺️ Mappa</span>
            </TabsTrigger>
            <TabsTrigger value="minigames" className="flex items-center space-x-2">
              <span>🎮 Minigames</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center space-x-2">
              <span>🏪 Mercato</span>
            </TabsTrigger>
            <TabsTrigger value="diplomacy" className="flex items-center space-x-2">
              <span>👑 Diplomazia</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <span>💬 Chat</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg min-h-[calc(100vh-200px)]">
            <TabsContent value="map" className="h-full">
              <RealGameMap />
            </TabsContent>

            <TabsContent value="minigames" className="h-full">
              <MinigamesPanel />
            </TabsContent>

            <TabsContent value="market" className="h-full">
              <MarketPanel />
            </TabsContent>

            <TabsContent value="diplomacy" className="h-full">
              <DiplomacyPanel />
            </TabsContent>

            <TabsContent value="chat" className="h-full">
              <ChatPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default GameLayout;
