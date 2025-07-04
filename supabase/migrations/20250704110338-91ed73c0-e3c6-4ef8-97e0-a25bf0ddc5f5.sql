
-- Delete all existing user data completely
DELETE FROM public.wars;
DELETE FROM public.alliances;
DELETE FROM public.army_units;
DELETE FROM public.buildings;
DELETE FROM public.market_offers;
DELETE FROM public.user_resources;
DELETE FROM public.profiles;

-- Reset all regions to have no owner
UPDATE public.regions SET owner_id = NULL;

-- Note: This will force all users to re-register when they try to login
-- The handle_new_user() trigger will automatically create their profile and initial data
