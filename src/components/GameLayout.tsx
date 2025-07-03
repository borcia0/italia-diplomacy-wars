import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useSupabaseGame } from '../hooks/useSupabaseGame';
import { Shield, Users, Map, Bell, Key, Star, Sword, Wifi, Menu, X, Home } from 'lucide-react';
import DiplomacyPanel from './DiplomacyPanel';
import ResourcesPanel from './ResourcesPanel';
import MarketPanel from './MarketPanel';
import RealPlayersPanel from './RealPlayersPanel';
import BattleSystem from './BattleSystem';

interface GameLayoutProps {
  children: React.ReactNode;
}

const GameLayout = ({ children }: GameLayoutProps) => {
  const { user, logout } = useSupabaseAuth();
  const { players, wars, currentPlayer, loading } = useSupabaseGame();
  const [activePanel, setActivePanel] = useState<'map' | 'diplomacy' | 'resources' | 'market' | 'players' | 'battle'>('map');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderPanel = () => {
    switch (activePanel) {
      case 'diplomacy':
        return <DiplomacyPanel />;
      case 'resources':
        return <ResourcesPanel />;
      case 'market':
        return <MarketPanel />;
      case 'players':
        return <RealPlayersPanel />;
      case 'battle':
        return <BattleSystem />;
      default:
        return children;
    }
  };

  const onlinePlayersCount = players.filter(p => p.id !== user?.id).length;
  const activeWarsCount = wars.filter(w => 
    w.attacker_id === user?.id || w.defender_id === user?.id
  ).length;

  const navItems = [
    { id: 'map', icon: Map, label: 'Mappa', count: null, emoji: '🗺️' },
    { id: 'players', icon: Users, label: 'Giocatori', count: onlinePlayersCount, emoji: '👥' },
    { id: 'battle', icon: Sword, label: 'Battaglia', count: activeWarsCount, emoji: '⚔️' },
    { id: 'diplomacy', icon: Users, label: 'Diplomazia', count: null, emoji: '🤝' },
    { id: 'resources', icon: Star, label: 'Risorse', count: null, emoji: '🏭' },
    { id: 'market', icon: Key, label: 'Market', count: null, emoji: '💰' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-gray-50 to-red-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-red-50">
      {/* Header Mobile Ottimizzato */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="lg"
                className="sm:hidden p-3"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🏛️</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Taverna Domination
                  </h1>
                  <div className="text-xs text-gray-600">Regno d'Italia</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="hidden sm:flex bg-green-50 text-green-700 border-green-200 text-xs px-3 py-1">
                👑 {currentPlayer?.username || 'Sovrano'}
              </Badge>
              <Badge variant="outline" className="hidden sm:flex bg-blue-50 text-blue-700 border-blue-200 text-xs px-3 py-1">
                📍 {currentPlayer?.current_region || 'Regno'}
              </Badge>
              <div className="flex items-center space-x-1">
                <Wifi className="w-4 h-4 text-green-500" />
                <Badge className="bg-blue-100 text-blue-800 text-sm px-2 py-1">
                  {players.length}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 px-3 py-2"
              >
                Esci
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 bg-white shadow-lg border-r border-gray-200">
          <ScrollArea className="h-full">
            <div className="p-4">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activePanel === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start text-left p-4 h-auto"
                    onClick={() => setActivePanel(item.id as any)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <span className="text-xl">{item.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        {item.count !== null && item.count > 0 && (
                          <div className="text-xs text-gray-500">{item.count} attivi</div>
                        )}
                      </div>
                      {item.count !== null && item.count > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Le Tue Risorse</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg text-center border">
                  <div className="text-2xl mb-1">🍞</div>
                  <div className="text-xs text-gray-600">Cibo</div>
                  <div className="font-bold text-lg">{currentPlayer?.resources?.cibo || 0}</div>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-lg text-center border">
                  <div className="text-2xl mb-1">🏗️</div>
                  <div className="text-xs text-gray-600">Pietra</div>
                  <div className="font-bold text-lg">{currentPlayer?.resources?.pietra || 0}</div>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-lg text-center border">
                  <div className="text-2xl mb-1">⚔️</div>
                  <div className="text-xs text-gray-600">Ferro</div>
                  <div className="font-bold text-lg">{currentPlayer?.resources?.ferro || 0}</div>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-yellow-50 p-3 rounded-lg text-center border">
                  <div className="text-2xl mb-1">🍕</div>
                  <div className="text-xs text-gray-600">Pizza</div>
                  <div className="font-bold text-lg">{currentPlayer?.resources?.pizza || 0}</div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-white w-80 max-w-[90vw] h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b bg-gradient-to-r from-green-600 to-red-600">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg">🏛️ Menu Principale</h3>
                  <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5 text-white" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-5rem)]">
                <nav className="p-4 space-y-3">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activePanel === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start text-left p-4 h-auto"
                      onClick={() => {
                        setActivePanel(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <span className="text-2xl">{item.emoji}</span>
                        <div className="flex-1">
                          <div className="font-medium text-base">{item.label}</div>
                          {item.count !== null && item.count > 0 && (
                            <div className="text-sm text-gray-500">{item.count} attivi</div>
                          )}
                        </div>
                        {item.count !== null && item.count > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {item.count}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </nav>

                {/* Mobile Quick Stats */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Le Tue Risorse</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                      <div className="text-2xl mb-1">🍞</div>
                      <div className="text-xs text-gray-600">Cibo</div>
                      <div className="font-bold text-lg">{currentPlayer?.resources?.cibo || 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                      <div className="text-2xl mb-1">🏗️</div>
                      <div className="text-xs text-gray-600">Pietra</div>
                      <div className="font-bold text-lg">{currentPlayer?.resources?.pietra || 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                      <div className="text-2xl mb-1">⚔️</div>
                      <div className="text-xs text-gray-600">Ferro</div>
                      <div className="font-bold text-lg">{currentPlayer?.resources?.ferro || 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                      <div className="text-2xl mb-1">🍕</div>
                      <div className="text-xs text-gray-600">Pizza</div>
                      <div className="font-bold text-lg">{currentPlayer?.resources?.pizza || 0}</div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderPanel()}
        </div>
      </div>

      {/* Bottom Navigation Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom shadow-lg">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.slice(0, 4).map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 h-auto py-3 px-2 ${
                activePanel === item.id ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
              onClick={() => setActivePanel(item.id as any)}
            >
              <div className="relative">
                <span className="text-2xl">{item.emoji}</span>
                {item.count !== null && item.count > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {item.count}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
