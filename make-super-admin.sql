-- ============================================
-- Make gigsdev007@gmail.com a Super Admin
-- ============================================

-- Update the profile role to super-admin
UPDATE public.profiles
SET 
  role = 'super-admin',
  updated_at = NOW()
WHERE email = 'gigsdev007@gmail.com';

-- Verify the update
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  status,
  created_at,
  updated_at
FROM public.profiles
WHERE email = 'gigsdev007@gmail.com';

-- If the user doesn't exist yet, you can create them manually:
-- (Uncomment the lines below if needed)
/*
INSERT INTO public.profiles (id, email, role, status, created_at, updated_at)
VALUES (
  gen_random_uuid(), -- or use a specific UUID if you know it
  'gigsdev007@gmail.com',
  'super-admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET role = 'super-admin', updated_at = NOW();
*/
