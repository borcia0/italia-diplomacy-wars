
-- Delete all authentication data (this will force complete re-registration)
DELETE FROM auth.users CASCADE;

-- Delete all existing game data
DELETE FROM public.wars;
DELETE FROM public.alliances;
DELETE FROM public.army_units;
DELETE FROM public.buildings;
DELETE FROM public.market_offers;
DELETE FROM public.user_resources;
DELETE FROM public.profiles;

-- Reset all regions to have no owner
UPDATE public.regions SET owner_id = NULL;

-- Reset sequences if they exist
SELECT setval(pg_get_serial_sequence('public.profiles', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.user_resources', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.buildings', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.army_units', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.alliances', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.wars', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.market_offers', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.regions', 'id'), 1, false);

-- Ensure we have regions data
INSERT INTO public.regions (name, capital, population) VALUES
('lazio', 'Roma', 2800000),
('lombardia', 'Milano', 10000000),
('campania', 'Napoli', 5800000),
('sicilia', 'Palermo', 5000000),
('piemonte', 'Torino', 4400000),
('veneto', 'Venezia', 4900000),
('emilia-romagna', 'Bologna', 4500000),
('toscana', 'Firenze', 3700000),
('puglia', 'Bari', 4000000),
('calabria', 'Catanzaro', 1950000),
('sardegna', 'Cagliari', 1640000),
('liguria', 'Genova', 1550000),
('marche', 'Ancona', 1530000),
('abruzzo', 'L''Aquila', 1310000),
('umbria', 'Perugia', 880000),
('basilicata', 'Potenza', 560000),
('molise', 'Campobasso', 305000),
('friuli', 'Trieste', 1215000),
('trentino', 'Trento', 1070000),
('valle-daosta', 'Aosta', 125000)
ON CONFLICT (name) DO UPDATE SET 
  capital = EXCLUDED.capital,
  population = EXCLUDED.population,
  owner_id = NULL;
