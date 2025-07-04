
-- Reset all player progress and game state
DELETE FROM public.wars;
DELETE FROM public.alliances;
DELETE FROM public.army_units;
DELETE FROM public.buildings;
DELETE FROM public.market_offers;

-- Reset regions ownership
UPDATE public.regions SET owner_id = NULL;

-- Reset user resources to default values
UPDATE public.user_resources SET 
  cibo = 100,
  pietra = 50,
  ferro = 30,
  carbone = 20,
  pizza = 10;

-- Reset user regions to default
UPDATE public.profiles SET current_region = 'lazio';

-- Insert default data for all existing users
INSERT INTO public.buildings (user_id, region, type, level, production)
SELECT p.id, p.current_region, 'fattoria', 1, 15
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.buildings b 
  WHERE b.user_id = p.id AND b.type = 'fattoria'
);

INSERT INTO public.army_units (user_id, region, type, quantity, attack_power, defense_power)
SELECT p.id, p.current_region, 'legionari', 50, 10, 8
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.army_units a 
  WHERE a.user_id = p.id AND a.type = 'legionari'
);

-- Assign random regions to users who don't have one
UPDATE public.regions 
SET owner_id = (
  SELECT p.id 
  FROM public.profiles p 
  WHERE NOT EXISTS (
    SELECT 1 FROM public.regions r2 WHERE r2.owner_id = p.id
  )
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE owner_id IS NULL;
