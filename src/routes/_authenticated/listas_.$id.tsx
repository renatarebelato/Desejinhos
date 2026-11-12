import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, Copy, MessageCircle, Plus, QrCode, Trash2 } from "lucide-react";
import { QRDialog } from "@/components/QRDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ItemCard, type WishItem } from "@/components/ItemCard";
import { ItemDialog, type ItemForm } from "@/components/ItemDialog";
import { OccasionFilter } from "@/components/OccasionFilter";

export const Route = createFileRoute("/_authenticated/listas_/$id")({
  head: () => ({
    meta: [
      { title: "Editar lista — Desejinhos" },
      { name: "description", content: "Adicione e organize seus desejos." },
      { property: "og:title", content: "Editar lista — Desejinhos" },
      { property: "og:description", content: "Adicione e organize seus desejos." },
    ],
  }),
  component: ListPage,
});

function ListPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WishItem | null>(null);
  const [filter, setFilter] = useState("todas");
  const [qr, setQr] = useState(false);

  const { data } = useQuery({
    queryKey: ["wishlist", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("wishlists").select("*, wish_items(*)").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
  const items = useMemo(() => [...((data?.wish_items ?? []) as WishItem[])].sort((a, b) => b.priority - a.priority), [data]);
  const counts = useMemo(() => items.reduce<Record<string, number>>((a, i) => ({ ...a, [i.occasion]: (a[i.occasion] ?? 0) + 1 }), {}), [items]);
  const shown = filter === "todas" ? items : items.filter((i) => i.occasion === filter);

  const save = useMutation({
    mutationFn: async (f: ItemForm) => {
      const row = { ...f, url: f.url || null, image_url: f.image_url || null, notes: f.notes || null, occasion: f.occasion as never };
      const q = editing
        ? supabase.from("wish_items").update(row).eq("id", editing.id)
        : supabase.from("wish_items").insert({ ...row, wishlist_id: id });
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wishlist", id] }); setOpen(false); toast.success(editing ? "Atualizado!" : "Desejo adicionado 💖"); },
    onError: () => toast.error("Não foi possível salvar"),
  });

  const remove = useMutation({
    mutationFn: async (itemId: string) => { const { error } = await supabase.from("wish_items").delete().eq("id", itemId); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist", id] }),
  });

  async function deleteList() {
    if (!confirm("Excluir esta lista e todos os desejos?")) return;
    await supabase.from("wishlists").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["wishlists"] });
    navigate({ to: "/listas" });
  }

  if (!data) return <main className="mx-auto max-w-6xl px-4 py-10"><div className="h-40 animate-pulse rounded-3xl bg-muted" /></main>;

  const shareUrl = `${window.location.origin}/l/${data.share_slug}`;
  const copy = async () => { await navigator.clipboard.writeText(shareUrl); toast.success("Link copiado! Agora é só mandar 💌"); };
  const wa = `https://wa.me/?text=${encodeURIComponent(`Olha minha lista de desejos "${data.title}" 🎁 ${shareUrl}`)}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/listas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Minhas listas</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-5xl">{data.emoji}</div>
          <h1 className="mt-2 text-4xl font-extrabold">{data.title}</h1>
          <p className="text-muted-foreground">{items.length} desejos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="soft" onClick={copy}><Copy /> Copiar link</Button>
          <Button variant="soft" onClick={() => setQr(true)}><QrCode /> QR code</Button>
          <Button asChild variant="soft"><a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle /> WhatsApp</a></Button>
          <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Adicionar desejo</Button>
        </div>
      </div>

      {items.length > 0 && <div className="mt-8"><OccasionFilter value={filter} onChange={setFilter} counts={counts} /></div>}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((i) => (
          <ItemCard key={i.id} item={i} onEdit={() => { setEditing(i); setOpen(true); }} onDelete={() => remove.mutate(i.id)} />
        ))}
        {items.length === 0 && (
          <button onClick={() => { setEditing(null); setOpen(true); }} className="col-span-full rounded-3xl border-2 border-dashed border-border p-12 text-center hover:border-primary">
            <div className="text-5xl">🛍️</div>
            <p className="mt-3 font-semibold">Adicione seu primeiro desejo</p>
            <p className="text-sm text-muted-foreground">Cole o link de qualquer loja</p>
          </button>
        )}
      </div>

      <button onClick={deleteList} className="mt-16 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /> Excluir lista</button>

      <QRDialog open={qr} onOpenChange={setQr} url={shareUrl} title={data.title} />
      <ItemDialog open={open} onOpenChange={setOpen} initial={editing} onSave={(f) => save.mutate(f)} saving={save.isPending} />
    </main>
  );
}
