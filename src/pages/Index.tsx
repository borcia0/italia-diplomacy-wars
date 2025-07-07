
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { SupabaseGameProvider } from "@/hooks/useSupabaseGame";
import AuthPage from "@/components/AuthPage";
import GameLayout from "@/components/GameLayout";

const Index = () => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <SupabaseGameProvider>
      <GameLayout />
    </SupabaseGameProvider>
  );
};

export default Index;
