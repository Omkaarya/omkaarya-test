-- Temple admin profile image (Super Admin temple wizard, stored as Cloudinary URL)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT NULL;
