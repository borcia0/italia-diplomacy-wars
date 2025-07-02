
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { Shield, Users, Map, Bell, Key, Star } from 'lucide-react';
import DiplomacyPanel from './DiplomacyPanel';
import ResourcesPanel from './ResourcesPanel';
import MarketPanel from './MarketPanel';

interface GameLayoutProps {
  children: React.ReactNode;
}

const GameLayout = ({ children }: GameLayoutProps) => {
  const { user, logout } = useAuth();
  const [activePanel, setActivePanel] = useState<'map' | 'diplomacy' | 'resources' | 'market'>('map');

  const renderPanel = () => {
    switch (activePanel) {
      case 'diplomacy':
        return <DiplomacyPanel />;
      case 'resources':
        return <ResourcesPanel />;
      case 'market':
        return <MarketPanel />;
      default:
        return children;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-red-600 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">La Diplomazia</h1>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {user?.currentRegion || 'Nessuna Regione'}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{user?.username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Esci
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg border-r border-gray-200">
          <div className="p-4">
            <nav className="space-y-2">
              <Button
                variant={activePanel === 'map' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActivePanel('map')}
              >
                <Map className="w-4 h-4 mr-2" />
                Mappa
              </Button>
              <Button
                variant={activePanel === 'diplomacy' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActivePanel('diplomacy')}
              >
                <Users className="w-4 h-4 mr-2" />
                Diplomazia
              </Button>
              <Button
                variant={activePanel === 'resources' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActivePanel('resources')}
              >
                <Star className="w-4 h-4 mr-2" />
                Risorse
              </Button>
              <Button
                variant={activePanel === 'market' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActivePanel('market')}
              >
                <Key className="w-4 h-4 mr-2" />
                Market
              </Button>
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

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
