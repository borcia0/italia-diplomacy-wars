
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { useGameState } from '../hooks/useGameState';
import { Shield, Users, Map, Bell, Key, Star, Sword, Wifi, Menu, X } from 'lucide-react';
import DiplomacyPanel from './DiplomacyPanel';
import ResourcesPanel from './ResourcesPanel';
import MarketPanel from './MarketPanel';
import OnlinePlayersPanel from './OnlinePlayersPanel';
import BattleSystem from './BattleSystem';

interface GameLayoutProps {
  children: React.ReactNode;
}

const GameLayout = ({ children }: GameLayoutProps) => {
  const { user, logout } = useAuth();
  const { gameState } = useGameState();
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
        return <OnlinePlayersPanel />;
      case 'battle':
        return <BattleSystem />;
      default:
        return children;
    }
  };

  const onlinePlayersCount = gameState?.players.filter(p => p.isOnline).length || 0;
  const activeWarsCount = gameState?.activeWars.filter(w => 
    w.attackerId === user?.id || w.defenderId === user?.id
  ).length || 0;

  const navItems = [
    { id: 'map', icon: Map, label: 'Mappa', count: null },
    { id: 'players', icon: Users, label: 'Giocatori', count: onlinePlayersCount },
    { id: 'battle', icon: Sword, label: 'Battaglia', count: activeWarsCount },
    { id: 'diplomacy', icon: Users, label: 'Diplomazia', count: null },
    { id: 'resources', icon: Star, label: 'Risorse', count: null },
    { id: 'market', icon: Key, label: 'Market', count: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-red-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-600 to-red-600 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 md:w-5 md:h-5 text-white" />
                </div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">Taverna Domination</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <Badge variant="outline" className="hidden sm:flex bg-green-50 text-green-700 border-green-200 text-xs">
                {user?.currentRegion || 'Nessuna Regione'}
              </Badge>
              <div className="flex items-center space-x-1">
                <Wifi className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                <Badge className="bg-blue-100 text-blue-800 text-xs">{onlinePlayersCount}</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 text-xs md:text-sm"
              >
                Esci
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 bg-white shadow-lg border-r border-gray-200">
          <div className="p-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activePanel === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActivePanel(item.id as any)}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                  {item.count !== null && item.count > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {item.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Risorse Rapide</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">🍞 Cibo</span>
                <span className="font-medium">{user?.resources?.cibo || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">🏗️ Pietra</span>
                <span className="font-medium">{user?.resources?.pietra || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">⚔️ Ferro</span>
                <span className="font-medium">{user?.resources?.ferro || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">🍕 Pizza</span>
                <span className="font-medium">{user?.resources?.pizza || 0}</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Bell className="w-4 h-4 text-gray-700" />
              <h3 className="text-sm font-semibold text-gray-700">Notifiche</h3>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <span className="text-yellow-800">Nuova proposta di alleanza da Milano</span>
              </div>
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                <span className="text-red-800">Napoli ha dichiarato guerra!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-white w-64 h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">Menu</h3>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activePanel === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      setActivePanel(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                    {item.count !== null && item.count > 0 && (
                      <Badge className="ml-2 bg-red-500 text-white text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderPanel()}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1">
        <div className="flex justify-around">
          {navItems.slice(0, 4).map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-1 ${
                activePanel === item.id ? 'text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActivePanel(item.id as any)}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.count !== null && item.count > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-4 w-4 p-0 flex items-center justify-center">
                    {item.count}
                  </Badge>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
