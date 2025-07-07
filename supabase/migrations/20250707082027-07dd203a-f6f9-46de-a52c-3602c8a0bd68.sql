
-- Aggiungi una funzione per resettare le statistiche giornaliere
CREATE OR REPLACE FUNCTION public.reset_daily_minigame_stats()
RETURNS void AS $$
BEGIN
  -- Reset delle statistiche se è passato un giorno dall'ultimo aggiornamento
  UPDATE public.minigame_stats 
  SET 
    dice_plays_today = 0,
    memory_plays_today = 0,
    slot_plays_today = 0,
    updated_at = now()
  WHERE DATE(updated_at) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea una funzione per verificare se l'utente può giocare
CREATE OR REPLACE FUNCTION public.can_play_minigame(
  p_user_id UUID,
  p_game_type TEXT
)
RETURNS boolean AS $$
DECLARE
  v_stats RECORD;
  v_last_play TIMESTAMP WITH TIME ZONE;
  v_plays_today INTEGER;
  v_can_play BOOLEAN := FALSE;
BEGIN
  -- Prima resetta le statistiche se necessario
  PERFORM public.reset_daily_minigame_stats();
  
  -- Ottieni le statistiche dell'utente
  SELECT * INTO v_stats
  FROM public.minigame_stats 
  WHERE user_id = p_user_id;
  
  -- Se non esistono statistiche, l'utente può giocare
  IF v_stats IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Controlla il tipo di gioco e verifica cooldown e limite giornaliero
  CASE p_game_type
    WHEN 'dice' THEN
      v_last_play := v_stats.last_dice_play;
      v_plays_today := COALESCE(v_stats.dice_plays_today, 0);
    WHEN 'memory' THEN
      v_last_play := v_stats.last_memory_play;
      v_plays_today := COALESCE(v_stats.memory_plays_today, 0);
    WHEN 'slot' THEN
      v_last_play := v_stats.last_slot_play;
      v_plays_today := COALESCE(v_stats.slot_plays_today, 0);
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- Verifica limite giornaliero (max 10 volte al giorno)
  IF v_plays_today >= 10 THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica cooldown (5 minuti)
  IF v_last_play IS NOT NULL AND (now() - v_last_play) < interval '5 minutes' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea una funzione per aggiornare le statistiche dopo una giocata
CREATE OR REPLACE FUNCTION public.update_minigame_stats(
  p_user_id UUID,
  p_game_type TEXT
)
RETURNS void AS $$
BEGIN
  -- Inserisci o aggiorna le statistiche
  INSERT INTO public.minigame_stats (
    user_id,
    last_dice_play,
    last_memory_play,
    last_slot_play,
    dice_plays_today,
    memory_plays_today,
    slot_plays_today,
    updated_at
  )
  VALUES (
    p_user_id,
    CASE WHEN p_game_type = 'dice' THEN now() ELSE NULL END,
    CASE WHEN p_game_type = 'memory' THEN now() ELSE NULL END,
    CASE WHEN p_game_type = 'slot' THEN now() ELSE NULL END,
    CASE WHEN p_game_type = 'dice' THEN 1 ELSE 0 END,
    CASE WHEN p_game_type = 'memory' THEN 1 ELSE 0 END,
    CASE WHEN p_game_type = 'slot' THEN 1 ELSE 0 END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    last_dice_play = CASE WHEN p_game_type = 'dice' THEN now() ELSE minigame_stats.last_dice_play END,
    last_memory_play = CASE WHEN p_game_type = 'memory' THEN now() ELSE minigame_stats.last_memory_play END,
    last_slot_play = CASE WHEN p_game_type = 'slot' THEN now() ELSE minigame_stats.last_slot_play END,
    dice_plays_today = CASE WHEN p_game_type = 'dice' THEN COALESCE(minigame_stats.dice_plays_today, 0) + 1 ELSE minigame_stats.dice_plays_today END,
    memory_plays_today = CASE WHEN p_game_type = 'memory' THEN COALESCE(minigame_stats.memory_plays_today, 0) + 1 ELSE minigame_stats.memory_plays_today END,
    slot_plays_today = CASE WHEN p_game_type = 'slot' THEN COALESCE(minigame_stats.slot_plays_today, 0) + 1 ELSE minigame_stats.slot_plays_today END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
