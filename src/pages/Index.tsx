
import React from 'react';
import GameLayout from '../components/GameLayout';
import RealGameMap from '../components/RealGameMap';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import AuthPage from '../components/AuthPage';

const Index = () => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-white to-red-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">🏰 Caricamento del Regno...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <GameLayout>
      <RealGameMap />
    </GameLayout>
  );
};

export default Index;
