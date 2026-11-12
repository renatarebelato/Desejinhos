CREATE TYPE public.occasion AS ENUM ('geral','aniversario','namoro_casamento','dia_das_maes','dia_dos_pais','dia_das_criancas','dia_da_mulher','natal');

CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  owner_name text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text,
  emoji text NOT NULL DEFAULT '🎁',
  share_slug text NOT NULL UNIQUE DEFAULT substr(md5(gen_random_uuid()::text), 1, 10),
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlists TO authenticated;
GRANT SELECT ON public.wishlists TO anon;
GRANT ALL ON public.wishlists TO service_role;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner all" ON public.wishlists FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "public read" ON public.wishlists FOR SELECT TO anon, authenticated USING (is_public);

CREATE TABLE public.wish_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  url text,
  image_url text,
  site_name text,
  price numeric(12,2),
  priority smallint NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  occasion public.occasion NOT NULL DEFAULT 'geral',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wish_items TO authenticated;
GRANT SELECT ON public.wish_items TO anon;
GRANT ALL ON public.wish_items TO service_role;
ALTER TABLE public.wish_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner all items" ON public.wish_items FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.wishlists w WHERE w.id = wishlist_id AND w.owner_id = auth.uid()));
CREATE POLICY "public read items" ON public.wish_items FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.wishlists w WHERE w.id = wishlist_id AND w.is_public));
CREATE INDEX ON public.wish_items(wishlist_id);