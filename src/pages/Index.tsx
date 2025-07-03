
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import GameLayout from '../components/GameLayout';
import InteractiveMap from '../components/InteractiveMap';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-white to-red-900">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <GameLayout>
      <InteractiveMap />
    </GameLayout>
  );
};

export default Index;
