
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Shield, Crown, Swords } from 'lucide-react';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { login, register, loading } = useSupabaseAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(email, password, username);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-slate-100 to-red-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Taverna Domination</h1>
          <p className="text-gray-600 text-lg">Conquista l'Italia attraverso strategia e diplomazia</p>
          <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Difendi</span>
            </div>
            <div className="flex items-center space-x-1">
              <Swords className="w-4 h-4" />
              <span>Conquista</span>
            </div>
            <div className="flex items-center space-x-1">
              <Crown className="w-4 h-4" />
              <span>Domina</span>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur bg-white/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">Accedi al Regno</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Entra nel gioco per iniziare la tua conquista dell'Italia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-base">Accedi</TabsTrigger>
                <TabsTrigger value="register" className="text-base">Registrati</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="La tua email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="La tua password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 font-semibold"
                    disabled={loading}
                  >
                    {loading ? '🏰 Accesso in corso...' : '👑 Entra nel Regno'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Il tuo nome da sovrano"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="La tua email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Crea una password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 font-semibold"
                    disabled={loading}
                  >
                    {loading ? '🏰 Creazione Regno...' : '⚔️ Fonda il Regno'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-green-50 to-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">
                  🎮 Gioco multiplayer in tempo reale
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  I tuoi progressi vengono salvati automaticamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
