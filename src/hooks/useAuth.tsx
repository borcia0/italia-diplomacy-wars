
import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  currentRegion?: string;
  resources?: {
    cibo: number;
    pietra: number;
    ferro: number;
    carbone: number;
    pizza: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const storedUser = localStorage.getItem('game_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate login - in production this would connect to Supabase
    const mockUser: User = {
      id: '1',
      email,
      username: email.split('@')[0],
      currentRegion: 'Lazio',
      resources: {
        cibo: 100,
        pietra: 50,
        ferro: 30,
        carbone: 20,
        pizza: 10
      }
    };
    setUser(mockUser);
    localStorage.setItem('game_user', JSON.stringify(mockUser));
  };

  const register = async (email: string, password: string, username: string) => {
    // Simulate registration
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      username,
      currentRegion: 'Lazio',
      resources: {
        cibo: 100,
        pietra: 50,
        ferro: 30,
        carbone: 20,
        pizza: 10
      }
    };
    setUser(mockUser);
    localStorage.setItem('game_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('game_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
