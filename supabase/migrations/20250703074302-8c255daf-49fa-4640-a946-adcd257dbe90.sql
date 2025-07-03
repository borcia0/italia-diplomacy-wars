
-- Create enum types for game mechanics
CREATE TYPE public.region_name AS ENUM (
  'lazio', 'lombardia', 'campania', 'sicilia', 'piemonte', 'veneto', 
  'emilia-romagna', 'toscana', 'puglia', 'calabria', 'sardegna', 'liguria',
  'marche', 'abruzzo', 'umbria', 'basilicata', 'molise', 'friuli', 'trentino', 'valle-daosta'
);

CREATE TYPE public.alliance_status AS ENUM ('pending', 'accepted', 'rejected', 'active');
CREATE TYPE public.war_status AS ENUM ('declared', 'active', 'resolved');
CREATE TYPE public.building_type AS ENUM ('fattoria', 'cava', 'miniera', 'pizzeria', 'caserma');
CREATE TYPE public.unit_type AS ENUM ('legionari', 'arcieri', 'cavalieri', 'catapulte');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  current_region region_name DEFAULT 'lazio',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table
CREATE TABLE public.user_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cibo INTEGER DEFAULT 100,
  pietra INTEGER DEFAULT 50,
  ferro INTEGER DEFAULT 30,
  carbone INTEGER DEFAULT 20,
  pizza INTEGER DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create regions table
CREATE TABLE public.regions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name region_name UNIQUE NOT NULL,
  capital TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  population INTEGER DEFAULT 1000000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buildings table
CREATE TABLE public.buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  region region_name NOT NULL,
  type building_type NOT NULL,
  level INTEGER DEFAULT 1,
  production INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create army units table
CREATE TABLE public.army_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  region region_name NOT NULL,
  type unit_type NOT NULL,
  quantity INTEGER DEFAULT 0,
  attack_power INTEGER DEFAULT 10,
  defense_power INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alliances table
CREATE TABLE public.alliances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status alliance_status DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wars table
CREATE TABLE public.wars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attacker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  defender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_region region_name NOT NULL,
  status war_status DEFAULT 'declared',
  attacker_troops JSONB DEFAULT '{}',
  defender_troops JSONB DEFAULT '{}',
  result TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create market offers table
CREATE TABLE public.market_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default regions
INSERT INTO public.regions (name, capital, population) VALUES
  ('lazio', 'Roma', 5800000),
  ('lombardia', 'Milano', 10000000),
  ('campania', 'Napoli', 5800000),
  ('sicilia', 'Palermo', 5000000),
  ('piemonte', 'Torino', 4400000),
  ('veneto', 'Venezia', 4900000),
  ('emilia-romagna', 'Bologna', 4500000),
  ('toscana', 'Firenze', 3700000),
  ('puglia', 'Bari', 4000000),
  ('calabria', 'Catanzaro', 1900000),
  ('sardegna', 'Cagliari', 1600000),
  ('liguria', 'Genova', 1500000),
  ('marche', 'Ancona', 1500000),
  ('abruzzo', 'Aquila', 1300000),
  ('umbria', 'Perugia', 900000),
  ('basilicata', 'Potenza', 600000),
  ('molise', 'Campobasso', 300000),
  ('friuli', 'Trieste', 1200000),
  ('trentino', 'Trento', 1100000),
  ('valle-daosta', 'Aosta', 125000);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.army_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_offers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_resources
CREATE POLICY "Users can view all resources" ON public.user_resources FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own resources" ON public.user_resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resources" ON public.user_resources FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for regions
CREATE POLICY "Everyone can view regions" ON public.regions FOR SELECT USING (TRUE);
CREATE POLICY "Users can update owned regions" ON public.regions FOR UPDATE USING (auth.uid() = owner_id);

-- Create RLS policies for buildings
CREATE POLICY "Everyone can view buildings" ON public.buildings FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage own buildings" ON public.buildings FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for army_units
CREATE POLICY "Everyone can view army units" ON public.army_units FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage own army units" ON public.army_units FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for alliances
CREATE POLICY "Users can view relevant alliances" ON public.alliances FOR SELECT USING (
  auth.uid() = proposer_id OR auth.uid() = target_id
);
CREATE POLICY "Users can create alliances" ON public.alliances FOR INSERT WITH CHECK (auth.uid() = proposer_id);
CREATE POLICY "Users can update relevant alliances" ON public.alliances FOR UPDATE USING (
  auth.uid() = proposer_id OR auth.uid() = target_id
);

-- Create RLS policies for wars
CREATE POLICY "Everyone can view wars" ON public.wars FOR SELECT USING (TRUE);
CREATE POLICY "Users can create wars" ON public.wars FOR INSERT WITH CHECK (auth.uid() = attacker_id);
CREATE POLICY "Users can update wars they're involved in" ON public.wars FOR UPDATE USING (
  auth.uid() = attacker_id OR auth.uid() = defender_id
);

-- Create RLS policies for market_offers
CREATE POLICY "Everyone can view market offers" ON public.market_offers FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage own market offers" ON public.market_offers FOR ALL USING (auth.uid() = seller_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Create initial resources
  INSERT INTO public.user_resources (user_id)
  VALUES (NEW.id);
  
  -- Assign a random region
  UPDATE public.regions 
  SET owner_id = NEW.id 
  WHERE name = (
    SELECT name FROM public.regions 
    WHERE owner_id IS NULL 
    ORDER BY RANDOM() 
    LIMIT 1
  );
  
  -- Create initial buildings
  INSERT INTO public.buildings (user_id, region, type, level, production)
  SELECT NEW.id, p.current_region, 'fattoria', 1, 15
  FROM public.profiles p WHERE p.id = NEW.id;
  
  -- Create initial army units
  INSERT INTO public.army_units (user_id, region, type, quantity)
  SELECT NEW.id, p.current_region, 'legionari', 50
  FROM public.profiles p WHERE p.id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for all tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.user_resources REPLICA IDENTITY FULL;
ALTER TABLE public.regions REPLICA IDENTITY FULL;
ALTER TABLE public.buildings REPLICA IDENTITY FULL;
ALTER TABLE public.army_units REPLICA IDENTITY FULL;
ALTER TABLE public.alliances REPLICA IDENTITY FULL;
ALTER TABLE public.wars REPLICA IDENTITY FULL;
ALTER TABLE public.market_offers REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_resources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.regions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.buildings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.army_units;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alliances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wars;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_offers;
