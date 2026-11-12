import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { ItemCard, type WishItem } from "@/components/ItemCard";
import { OccasionFilter } from "@/components/OccasionFilter";
import { Button } from "@/components/ui/button";

const getSharedList = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(40) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
    const sb = createClient<Database>(process.env['SUPABASE_URL']!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: list } = await sb
      .from("wishlists")
      .select("title, owner_name, emoji, description, wish_items(id, title, url, image_url, site_name, price, priority, occasion, notes)")
      .eq("share_slug", data.slug)
      .maybeSingle();
    return list;
  });

export const Route = createFileRoute("/l/$slug")({
  loader: async ({ params }) => {
    const list = await getSharedList({ data: { slug: params.slug } });
    if (!list) throw notFound();
    return list;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.emoji} ${loaderData.title}${loaderData.owner_name ? ` de ${loaderData.owner_name}` : ""}` : "Lista de desejos";
    const d = "Veja a lista de desejos e escolha um presente especial 🎁";
    return {
      meta: [
        { title: `${t} — Desejinhos` },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="text-5xl">🔍</div>
      <h1 className="mt-4 text-2xl font-bold">Lista não encontrada</h1>
      <p className="mt-2 text-muted-foreground">O link pode estar errado ou a lista foi removida.</p>
    </main>
  ),
  component: SharedList,
});

function SharedList() {
  const list = Route.useLoaderData();
  const [filter, setFilter] = useState("todas");
  const items = useMemo(() => [...(list.wish_items as WishItem[])].sort((a, b) => b.priority - a.priority), [list]);
  const counts = useMemo(() => items.reduce<Record<string, number>>((a, i) => ({ ...a, [i.occasion]: (a[i.occasion] ?? 0) + 1 }), {}), [items]);
  const shown = filter === "todas" ? items : items.filter((i) => i.occasion === filter);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <div className="animate-float inline-block text-6xl">{list.emoji}</div>
        {list.owner_name && <p className="mt-4 font-medium text-secondary-foreground">Lista de desejos de {list.owner_name}</p>}
        <h1 className="mt-1 text-4xl font-extrabold md:text-5xl">{list.title}</h1>
        <p className="mt-2 text-muted-foreground">Os itens com 🔥 são os mais desejados.</p>
      </div>
      {items.length > 0 && <div className="mt-10 flex justify-center"><OccasionFilter value={filter} onChange={setFilter} counts={counts} /></div>}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((i) => <ItemCard key={i.id} item={i} />)}
      </div>
      {items.length === 0 && <p className="mt-12 text-center text-muted-foreground">Essa lista ainda está vazia.</p>}
      <div className="mt-20 rounded-3xl bg-gradient-primary p-8 text-center text-primary-foreground shadow-pop">
        <h2 className="text-2xl font-bold">Quer fazer a sua lista também?</h2>
        <Button asChild variant="secondary" className="mt-4 rounded-full"><Link to="/auth">Criar minha lista grátis</Link></Button>
      </div>
    </main>
  );
}
