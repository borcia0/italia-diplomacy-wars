
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseGame } from '@/hooks/useSupabaseGame';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Store, TrendingUp, Coins } from 'lucide-react';

interface MarketOffer {
  id: string;
  seller_id: string;
  resource_type: string;
  quantity: number;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

interface ShopOffer {
  id: string;
  resource_type: string;
  quantity: number;
  price: number;
  currency: string;
  seller_name: string;
}

const MarketPanel = () => {
  const { user } = useSupabaseAuth();
  const { currentPlayer, updateResources } = useSupabaseGame();
  const { toast } = useToast();
  
  const [offers, setOffers] = useState<MarketOffer[]>([]);
  const [shopOffers] = useState<ShopOffer[]>([
    { id: 'shop-1', resource_type: 'cibo', quantity: 100, price: 50, currency: 'pizza', seller_name: 'Mercato Centrale' },
    { id: 'shop-2', resource_type: 'pietra', quantity: 80, price: 60, currency: 'cibo', seller_name: 'Cava del Regno' },
    { id: 'shop-3', resource_type: 'ferro', quantity: 50, price: 80, currency: 'pietra', seller_name: 'Fucina Reale' },
    { id: 'shop-4', resource_type: 'pizza', quantity: 30, price: 40, currency: 'ferro', seller_name: 'Pizzeria del Castello' },
    { id: 'shop-5', resource_type: 'carbone', quantity: 60, price: 70, currency: 'cibo', seller_name: 'Miniera Reale' },
  ]);
  
  const [newOffer, setNewOffer] = useState({
    resource_type: 'cibo',
    quantity: '',
    price: '',
    currency: 'pizza'
  });

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('market_offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setOffers(data);
    } catch (error) {
      console.error('Error fetching market offers:', error);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const createOffer = async () => {
    if (!user || !currentPlayer) return;

    const quantity = parseInt(newOffer.quantity);
    const price = parseInt(newOffer.price);

    if (!quantity || !price) {
      toast({
        title: "Errore",
        description: "Inserisci quantità e prezzo validi",
        variant: "destructive",
      });
      return;
    }

    // Check if user has enough resources
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
      const { error } = await supabase.from('market_offers').insert({
        seller_id: user.id,
        resource_type: newOffer.resource_type,
        quantity: quantity,
        price: price,
        currency: newOffer.currency,
        is_active: true
      });

      if (error) throw error;

      // Deduct resources from seller
      const updatedResources = {
        ...currentPlayer.resources,
        [resourceKey]: currentPlayer.resources[resourceKey] - quantity
      };
      await updateResources(updatedResources);

      toast({
        title: "Offerta Creata!",
        description: `Hai messo in vendita ${quantity} ${newOffer.resource_type}`,
      });

      setNewOffer({ resource_type: 'cibo', quantity: '', price: '', currency: 'pizza' });
      await fetchOffers();
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile creare l'offerta",
        variant: "destructive",
      });
    }
  };

  const buyFromShop = async (offer: ShopOffer) => {
    if (!currentPlayer) return;

    const currencyKey = offer.currency as keyof typeof currentPlayer.resources;
    const resourceKey = offer.resource_type as keyof typeof currentPlayer.resources;

    if (currentPlayer.resources[currencyKey] < offer.price) {
      toast({
        title: "Risorse Insufficienti",
        description: `Servono ${offer.price} ${offer.currency}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedResources = {
        ...currentPlayer.resources,
        [currencyKey]: currentPlayer.resources[currencyKey] - offer.price,
        [resourceKey]: currentPlayer.resources[resourceKey] + offer.quantity
      };
      
      await updateResources(updatedResources);

      toast({
        title: "Acquisto Completato!",
        description: `Hai acquistato ${offer.quantity} ${offer.resource_type} per ${offer.price} ${offer.currency}`,
      });
    } catch (error) {
      console.error('Error buying from shop:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile completare l'acquisto",
        variant: "destructive",
      });
    }
  };

  const buyOffer = async (offer: MarketOffer) => {
    if (!user || !currentPlayer || offer.seller_id === user.id) return;

    const currencyKey = offer.currency as keyof typeof currentPlayer.resources;
    const resourceKey = offer.resource_type as keyof typeof currentPlayer.resources;

    if (currentPlayer.resources[currencyKey] < offer.price) {
      toast({
        title: "Risorse Insufficienti",
        description: `Servono ${offer.price} ${offer.currency}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Update buyer resources
      const updatedResources = {
        ...currentPlayer.resources,
        [currencyKey]: currentPlayer.resources[currencyKey] - offer.price,
        [resourceKey]: currentPlayer.resources[resourceKey] + offer.quantity
      };
      
      await updateResources(updatedResources);

      // Mark offer as inactive
      await supabase
        .from('market_offers')
        .update({ is_active: false })
        .eq('id', offer.id);

      toast({
        title: "Acquisto Completato!",
        description: `Hai acquistato ${offer.quantity} ${offer.resource_type}`,
      });

      await fetchOffers();
    } catch (error) {
      console.error('Error buying offer:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile completare l'acquisto",
        variant: "destructive",
      });
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'cibo': return '🍖';
      case 'pietra': return '🏗️';
      case 'ferro': return '⚔️';
      case 'pizza': return '🍕';
      case 'carbone': return '⚫';
      default: return '📦';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-center mb-2">🏪 Mercato del Regno</h2>
        <p className="text-center text-gray-600">Compra e vendi risorse con altri giocatori</p>
      </div>

      <Tabs defaultValue="shop" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shop">Negozio</TabsTrigger>
          <TabsTrigger value="market">Mercato</TabsTrigger>
          <TabsTrigger value="sell">Vendi</TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-green-600" />
                <span>Negozio del Regno</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {shopOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getResourceIcon(offer.resource_type)}</div>
                      <div>
                        <div className="font-medium">
                          {offer.quantity} {offer.resource_type}
                        </div>
                        <div className="text-sm text-gray-600">
                          Venditore: {offer.seller_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">
                        {offer.price} {getResourceIcon(offer.currency)} {offer.currency}
                      </Badge>
                      <Button
                        onClick={() => buyFromShop(offer)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Compra
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Offerte Giocatori</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offers.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nessuna offerta disponibile</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {offers.map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{getResourceIcon(offer.resource_type)}</div>
                        <div>
                          <div className="font-medium">
                            {offer.quantity} {offer.resource_type}
                          </div>
                          <div className="text-sm text-gray-600">
                            Offerta giocatore
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">
                          {offer.price} {getResourceIcon(offer.currency)} {offer.currency}
                        </Badge>
                        {offer.seller_id !== user?.id && (
                          <Button
                            onClick={() => buyOffer(offer)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Compra
                          </Button>
                        )}
                        {offer.seller_id === user?.id && (
                          <Badge variant="secondary">Tua Offerta</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                <span>Crea Offerta di Vendita</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Risorsa da vendere</label>
                  <Select value={newOffer.resource_type} onValueChange={(value) => setNewOffer({...newOffer, resource_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cibo">🍖 Cibo</SelectItem>
                      <SelectItem value="pietra">🏗️ Pietra</SelectItem>
                      <SelectItem value="ferro">⚔️ Ferro</SelectItem>
                      <SelectItem value="pizza">🍕 Pizza</SelectItem>
                      <SelectItem value="carbone">⚫ Carbone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantità</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newOffer.quantity}
                    onChange={(e) => setNewOffer({...newOffer, quantity: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prezzo in</label>
                  <Select value={newOffer.currency} onValueChange={(value) => setNewOffer({...newOffer, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cibo">🍖 Cibo</SelectItem>
                      <SelectItem value="pietra">🏗️ Pietra</SelectItem>
                      <SelectItem value="ferro">⚔️ Ferro</SelectItem>
                      <SelectItem value="pizza">🍕 Pizza</SelectItem>
                      <SelectItem value="carbone">⚫ Carbone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantità richiesta</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newOffer.price}
                    onChange={(e) => setNewOffer({...newOffer, price: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                onClick={createOffer}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                disabled={!newOffer.quantity || !newOffer.price}
              >
                <Coins className="w-4 h-4 mr-2" />
                Crea Offerta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketPanel;
