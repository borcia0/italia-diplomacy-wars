
-- Crea tabella per tracciare le statistiche dei minigames
CREATE TABLE public.minigame_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  last_dice_play TIMESTAMP WITH TIME ZONE,
  last_memory_play TIMESTAMP WITH TIME ZONE,
  last_slot_play TIMESTAMP WITH TIME ZONE,
  dice_plays_today INTEGER DEFAULT 0,
  memory_plays_today INTEGER DEFAULT 0,
  slot_plays_today INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.minigame_stats ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di vedere solo le proprie statistiche
CREATE POLICY "Users can view own minigame stats" 
  ON public.minigame_stats 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy per permettere agli utenti di inserire le proprie statistiche
CREATE POLICY "Users can insert own minigame stats" 
  ON public.minigame_stats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy per permettere agli utenti di aggiornare le proprie statistiche
CREATE POLICY "Users can update own minigame stats" 
  ON public.minigame_stats 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Aggiungi colonne dinamiche per le giocate giornaliere di ogni giorno
-- Nota: Le colonne per i giorni specifici verranno create dinamicamente dall'applicazione
-- utilizzando nomi come "dice_plays_Mon_Jan_06_2025", etc.
