
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseGame } from '@/hooks/useSupabaseGame';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Coins, ShoppingCart, Package, TrendingUp, Store } from 'lucide-react';

const MarketPanel = () => {
  const { currentPlayer, updateResources } = useSupabaseGame();
  const { toast } = useToast();
  const [marketOffers, setMarketOffers] = useState<any[]>([]);
  const [newOffer, setNewOffer] = useState({
    resource_type: '',
    quantity: '',
    price: '',
    currency: 'cibo'
  });

  // Offerte predefinite del negozio
  const shopOffers = [
    { id: 'shop-1', resource_type: 'ferro', quantity: 100, price: 50, currency: 'cibo', seller: 'Mercante del Ferro' },
    { id: 'shop-2', resource_type: 'pietra', quantity: 150, price: 30, currency: 'cibo', seller: 'Cava Reale' },
    { id: 'shop-3', resource_type: 'carbone', quantity: 80, price: 70, currency: 'ferro', seller: 'Miniera Centrale' },
    { id: 'shop-4', resource_type: 'pizza', quantity: 50, price: 100, currency: 'cibo', seller: 'Pizzeria del Regno' },
    { id: 'shop-5', resource_type: 'cibo', quantity: 200, price: 40, currency: 'pietra', seller: 'Fattoria Reale' },
    { id: 'shop-6', resource_type: 'ferro', quantity: 200, price: 20, currency: 'carbone', seller: 'Fucina del Re' },
    { id: 'shop-7', resource_type: 'pietra', quantity: 300, price: 80, currency: 'ferro', seller: 'Cava Imperiale' },
    { id: 'shop-8', resource_type: 'pizza', quantity: 25, price: 150, currency: 'ferro', seller: 'Pizzaiolo Maestro' },
  ];

  const fetchMarketOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('market_offers')
        .select(`
          *,
          profiles:seller_id (username)
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Filtra solo le offerte di giocatori reali (non bot)
      const realPlayerOffers = data?.filter(offer => 
        offer.profiles?.username && 
        !offer.profiles.username.toLowerCase().includes('giocatore') &&
        !offer.profiles.username.toLowerCase().includes('bot') &&
        !offer.profiles.username.toLowerCase().includes('ai')
      ) || [];

      setMarketOffers(realPlayerOffers);
    } catch (error) {
      console.error('Error fetching market offers:', error);
    }
  };

  useEffect(() => {
    fetchMarketOffers();
  }, []);

  const createOffer = async () => {
    if (!currentPlayer || !newOffer.resource_type || !newOffer.quantity || !newOffer.price) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi per creare un'offerta",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(newOffer.quantity);
    const price = parseInt(newOffer.price);

    // Verifica che il giocatore abbia abbastanza risorse
    const resourceKey = newOffer.resource_type as keyof typeof currentPlayer.resources;
    if (currentPlayer.resources[resourceKey] < quantity) {
      toast({
        title: "Risorse Insufficienti",
        description: `Non hai abbastanza ${newOffer.resource_type}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('market_offers')
        .insert({
          seller_id: currentPlayer.id,
          resource_type: newOffer.resource_type,
          quantity: quantity,
          price: price,
          currency: newOffer.currency
        });

      if (error) throw error;

      // Deduci le risorse dal giocatore
      await updateResources({
        [resourceKey]: currentPlayer.resources[resourceKey] - quantity
      });

      toast({
        title: "Offerta Creata!",
        description: `Hai messo in vendita ${quantity} ${newOffer.resource_type}`,
      });

      setNewOffer({ resource_type: '', quantity: '', price: '', currency: 'cibo' });
      fetchMarketOffers();
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Errore",
        description: "Errore nella creazione dell'offerta",
        variant: "destructive",
      });
    }
  };

  const buyOffer = async (offer: any, isShopOffer = false) => {
    if (!currentPlayer) return;

    const currencyKey = offer.currency as keyof typeof currentPlayer.resources;
    if (currentPlayer.resources[currencyKey] < offer.price) {
      toast({
        title: "Risorse Insufficienti",
        description: `Non hai abbastanza ${offer.currency}`,
        variant: "destructive",
      });
      return;
    }

    try {
      if (!isShopOffer) {
        // Rimuovi l'offerta dal market
        const { error } = await supabase
          .from('market_offers')
          .delete()
          .eq('id', offer.id);

        if (error) throw error;
      }

      // Aggiorna le risorse del compratore
      const resourceKey = offer.resource_type as keyof typeof currentPlayer.resources;
      await updateResources({
        [resourceKey]: currentPlayer.resources[resourceKey] + offer.quantity,
        [currencyKey]: currentPlayer.resources[currencyKey] - offer.price
      });

      toast({
        title: "Acquisto Completato!",
        description: `Hai comprato ${offer.quantity} ${offer.resource_type} per ${offer.price} ${offer.currency}`,
      });

      if (!isShopOffer) {
        fetchMarketOffers();
      }
    } catch (error) {
      console.error('Error buying offer:', error);
      toast({
        title: "Errore",
        description: "Errore nell'acquisto",
        variant: "destructive",
      });
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'cibo': return '🍖';
      case 'pietra': return '🏗️';
      case 'ferro': return '⚔️';
      case 'carbone': return '⚫';
      case 'pizza': return '🍕';
      default: return '📦';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Store className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold">Mercato del Regno</h2>
      </div>

      {/* Crea Offerta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Vendi le tue Risorse</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select value={newOffer.resource_type} onValueChange={(value) => setNewOffer({...newOffer, resource_type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona risorsa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cibo">🍖 Cibo</SelectItem>
                <SelectItem value="pietra">🏗️ Pietra</SelectItem>
                <SelectItem value="ferro">⚔️ Ferro</SelectItem>
                <SelectItem value="carbone">⚫ Carbone</SelectItem>
                <SelectItem value="pizza">🍕 Pizza</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Quantità"
              value={newOffer.quantity}
              onChange={(e) => setNewOffer({...newOffer, quantity: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Prezzo"
              value={newOffer.price}
              onChange={(e) => setNewOffer({...newOffer, price: e.target.value})}
            />

            <Select value={newOffer.currency} onValueChange={(value) => setNewOffer({...newOffer, currency: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Valuta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cibo">🍖 Cibo</SelectItem>
                <SelectItem value="pietra">🏗️ Pietra</SelectItem>
                <SelectItem value="ferro">⚔️ Ferro</SelectItem>
                <SelectItem value="carbone">⚫ Carbone</SelectItem>
                <SelectItem value="pizza">🍕 Pizza</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={createOffer} className="w-full">
            <Package className="w-4 h-4 mr-2" />
            Crea Offerta
          </Button>
        </CardContent>
      </Card>

      {/* Negozio del Regno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>🏪 Negozio del Regno</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {shopOffers.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getResourceIcon(offer.resource_type)}</div>
                      <div>
                        <div className="font-semibold">{offer.quantity} {offer.resource_type}</div>
                        <div className="text-sm text-gray-600">Venditore: {offer.seller}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {offer.price} {getResourceIcon(offer.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(offer.price / offer.quantity).toFixed(2)} per unità
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => buyOffer(offer, true)}
                        disabled={!currentPlayer || (currentPlayer.resources[offer.currency as keyof typeof currentPlayer.resources] < offer.price)}
                      >
                        Compra
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Offerte Giocatori */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>🤝 Offerte dei Giocatori</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {marketOffers.length > 0 ? (
              <div className="space-y-3">
                {marketOffers.map((offer) => (
                  <div key={offer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getResourceIcon(offer.resource_type)}</div>
                        <div>
                          <div className="font-semibold">{offer.quantity} {offer.resource_type}</div>
                          <div className="text-sm text-gray-600">
                            Venditore: {offer.profiles?.username || 'Giocatore'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            {offer.price} {getResourceIcon(offer.currency)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(offer.price / offer.quantity).toFixed(2)} per unità
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => buyOffer(offer)}
                          disabled={!currentPlayer || offer.seller_id === currentPlayer.id || (currentPlayer.resources[offer.currency as keyof typeof currentPlayer.resources] < offer.price)}
                        >
                          {offer.seller_id === currentPlayer?.id ? 'Tua' : 'Compra'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nessuna offerta disponibile</p>
                <p className="text-sm">Sii il primo a creare un'offerta!</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketPanel;
