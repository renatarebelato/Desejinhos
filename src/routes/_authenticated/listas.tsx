import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/listas")({
  head: () => ({
    meta: [
      { title: "Minhas listas — Desejinhos" },
      { name: "description", content: "Gerencie suas listas de desejos." },
      { property: "og:title", content: "Minhas listas — Desejinhos" },
      { property: "og:description", content: "Gerencie suas listas de desejos." },
    ],
  }),
  component: ListsPage,
});

const EMOJIS = ["🎁", "🎂", "🎄", "💞", "🌷", "🧸", "✈️", "🏡", "📚", "👟"];

function ListsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎁");

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["wishlists"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("wishlists").select("*, wish_items(count)").eq("owner_id", u.user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("wishlists").insert({ title, owner_name: name, emoji }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["wishlists"] });
      setOpen(false);
      toast.success("Lista criada! 🎉");
      navigate({ to: "/listas/$id", params: { id: d.id } });
    },
    onError: () => toast.error("Não foi possível criar a lista"),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold">Minhas listas</h1>
          <p className="mt-1 text-muted-foreground">Uma para cada momento especial.</p>
        </div>
        <Button variant="hero" size="lg" onClick={() => setOpen(true)}><Plus /> Nova lista</Button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && [1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-muted" />)}
        {lists.map((l) => (
          <Link key={l.id} to="/listas/$id" params={{ id: l.id }} className="lift rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="text-4xl">{l.emoji}</div>
            <h2 className="mt-3 text-xl font-bold">{l.title}</h2>
            <p className="text-sm text-muted-foreground">{(l.wish_items as unknown as { count: number }[])[0]?.count ?? 0} desejos</p>
          </Link>
        ))}
        {!isLoading && lists.length === 0 && (
          <button onClick={() => setOpen(true)} className="col-span-full rounded-3xl border-2 border-dashed border-border p-12 text-center hover:border-primary">
            <div className="text-5xl">🎁</div>
            <p className="mt-3 font-semibold">Crie sua primeira lista</p>
            <p className="text-sm text-muted-foreground">Ex.: "Meu aniversário", "Natal 2026"</p>
          </button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>Nova lista</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button type="button" key={e} onClick={() => setEmoji(e)} className={`grid h-10 w-10 place-items-center rounded-xl text-xl transition ${emoji === e ? "bg-gradient-primary shadow-pop" : "bg-muted"}`}>{e}</button>
              ))}
            </div>
            <div className="space-y-1.5"><Label>Nome da lista</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meu aniversário 🎂" /></div>
            <div className="space-y-1.5"><Label>Seu nome (aparece para quem recebe o link)</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Renata" /></div>
            <Button type="submit" variant="hero" className="w-full" disabled={create.isPending}>Criar lista</Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
