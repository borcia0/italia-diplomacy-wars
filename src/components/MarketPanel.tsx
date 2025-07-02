
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Star, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface MarketOffer {
  id: string;
  seller: string;
  type: 'resource' | 'building' | 'unit';
  item: string;
  quantity: number;
  price: number;
  currency: string;
  isPrivate: boolean;
  targetBuyer?: string;
}

const MarketPanel = () => {
  const { user } = useAuth();
  const [selectedResource, setSelectedResource] = useState('');
  const [offerQuantity, setOfferQuantity] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerCurrency, setOfferCurrency] = useState('cibo');

  const marketOffers: MarketOffer[] = [
    { id: '1', seller: 'GiocatoreX', type: 'resource', item: 'ferro', quantity: 100, price: 50, currency: 'cibo', isPrivate: false },
    { id: '2', seller: 'GiocatoreY', type: 'resource', item: 'pietra', quantity: 200, price: 30, currency: 'pizza', isPrivate: false },
    { id: '3', seller: 'GiocatoreZ', type: 'unit', item: 'legionari', quantity: 25, price: 150, currency: 'ferro', isPrivate: false },
    { id: '4', seller: 'GiocatoreW', type: 'building', item: 'fattoria', quantity: 1, price: 300, currency: 'pietra', isPrivate: true, targetBuyer: 'Tu' },
  ];

  const tradeHistory = [
    { id: '1', type: 'bought', item: 'ferro', quantity: 50, price: 25, partner: 'GiocatoreX', date: '2024-01-15' },
    { id: '2', type: 'sold', item: 'pizza', quantity: 20, price: 40, partner: 'GiocatoreY', date: '2024-01-14' },
    { id: '3', type: 'bought', item: 'legionari', quantity: 10, price: 60, partner: 'GiocatoreZ', date: '2024-01-13' },
  ];

  const getResourceEmoji = (resource: string) => {
    const emojis: { [key: string]: string } = {
      'cibo': '🍞',
      'pietra': '🏗️',
      'ferro': '⚔️',
      'carbone': '⚫',
      'pizza': '🍕',
      'legionari': '⚔️',
      'arcieri': '🏹',
      'cavalieri': '🐎',
      'fattoria': '🌾',
      'cava': '🏗️',
      'miniera': '⛏️',
      'pizzeria': '🍕'
    };
    return emojis[resource] || '📦';
  };

  const canAffordOffer = (offer: MarketOffer) => {
    const userResource = user?.resources?.[offer.currency as keyof typeof user.resources] || 0;
    return userResource >= offer.price;
  };

  const createOffer = () => {
    if (!selectedResource || !offerQuantity || !offerPrice) return;
    
    console.log('Creating market offer:', {
      item: selectedResource,
      quantity: offerQuantity,
      price: offerPrice,
      currency: offerCurrency
    });
    
    // Reset form
    setSelectedResource('');
    setOfferQuantity('');
    setOfferPrice('');
  };

  const buyOffer = (offerId: string) => {
    console.log('Buying offer:', offerId);
  };

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mercato Globale</h2>
        <p className="text-gray-600">Commercia risorse, edifici e unità con altri giocatori</p>
      </div>

      <Tabs defaultValue="browse" className="h-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Sfoglia</TabsTrigger>
          <TabsTrigger value="sell">Vendi</TabsTrigger>
          <TabsTrigger value="private">Privato</TabsTrigger>
          <TabsTrigger value="history">Cronologia</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid gap-4">
            {marketOffers.filter(offer => !offer.isPrivate).map(offer => (
              <Card key={offer.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{getResourceEmoji(offer.item)}</div>
                      <div>
                        <h3 className="font-semibold capitalize">{offer.item}</h3>
                        <p className="text-sm text-gray-600">Venditore: {offer.seller}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-800">
                            Quantità: {offer.quantity}
                          </Badge>
                          <Badge 
                            className={
                              offer.type === 'resource' ? 'bg-green-100 text-green-800' :
                              offer.type === 'unit' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }
                          >
                            {offer.type === 'resource' && 'Risorsa'}
                            {offer.type === 'unit' && 'Unità'}
                            {offer.type === 'building' && 'Edificio'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 mb-2">
                        {offer.price} {getResourceEmoji(offer.currency)}
                      </div>
                      <Button 
                        size="sm"
                        disabled={!canAffordOffer(offer)}
                        onClick={() => buyOffer(offer.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Key className="w-4 h-4 mr-1" />
                        Acquista
                      </Button>
                      {!canAffordOffer(offer) && (
                        <p className="text-xs text-red-600 mt-1">Risorse insufficienti</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crea Nuova Offerta</CardTitle>
              <CardDescription>
                Metti in vendita le tue risorse nel mercato globale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cosa vuoi vendere?
                </label>
                <Select value={selectedResource} onValueChange={setSelectedResource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona risorsa..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cibo">🍞 Cibo</SelectItem>
                    <SelectItem value="pietra">🏗️ Pietra</SelectItem>
                    <SelectItem value="ferro">⚔️ Ferro</SelectItem>
                    <SelectItem value="carbone">⚫ Carbone</SelectItem>
                    <SelectItem value="pizza">🍕 Pizza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantità
                  </label>
                  <Input
                    type="number"
                    value={offerQuantity}
                    onChange={(e) => setOfferQuantity(e.target.value)}
                    placeholder="Es. 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prezzo
                  </label>
                  <Input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="Es. 50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valuta richiesta
                </label>
                <Select value={offerCurrency} onValueChange={setOfferCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cibo">🍞 Cibo</SelectItem>
                    <SelectItem value="pietra">🏗️ Pietra</SelectItem>
                    <SelectItem value="ferro">⚔️ Ferro</SelectItem>
                    <SelectItem value="pizza">🍕 Pizza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={createOffer}
                className="w-full"
                disabled={!selectedResource || !offerQuantity || !offerPrice}
              >
                <Star className="w-4 h-4 mr-2" />
                Pubblica Offerta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          <div className="grid gap-4">
            {marketOffers.filter(offer => offer.isPrivate && offer.targetBuyer === 'Tu').map(offer => (
              <Card key={offer.id} className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Offerta Privata</span>
                    </CardTitle>
                    <Badge className="bg-purple-100 text-purple-800">Solo per te</Badge>
                  </div>
                  <CardDescription>
                    Da {offer.seller} - Scade tra 24 ore
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{getResourceEmoji(offer.item)}</div>
                      <div>
                        <h3 className="font-semibold capitalize">{offer.item}</h3>
                        <p className="text-sm text-gray-600">Quantità: {offer.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600 mb-2">
                        {offer.price} {getResourceEmoji(offer.currency)}
                      </div>
                      <div className="space-y-2">
                        <Button 
                          size="sm"
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          disabled={!canAffordOffer(offer)}
                        >
                          Accetta
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          Rifiuta
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {tradeHistory.map(trade => (
              <Card key={trade.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getResourceEmoji(trade.item)}</div>
                      <div>
                        <h3 className="font-semibold">
                          {trade.type === 'bought' ? 'Acquistato' : 'Venduto'}: {trade.item}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {trade.type === 'bought' ? 'Da' : 'A'}: {trade.partner}
                        </p>
                        <p className="text-xs text-gray-500">{trade.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={
                          trade.type === 'bought' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }
                      >
                        {trade.type === 'bought' ? '-' : '+'}{trade.price}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantità: {trade.quantity}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketPanel;
