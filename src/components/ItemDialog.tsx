import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OCCASIONS, PRIORITIES } from "@/lib/occasions";
import { fetchLinkPreview } from "@/lib/link-preview.functions";
import { cn } from "@/lib/utils";
import type { WishItem } from "@/components/ItemCard";

export type ItemForm = Omit<WishItem, "id">;
const empty: ItemForm = { title: "", url: "", image_url: "", site_name: "", price: null, priority: 2, occasion: "geral", notes: "" };

export function ItemDialog({ open, onOpenChange, initial, onSave, saving }: {
  open: boolean; onOpenChange: (o: boolean) => void; initial?: WishItem | null; onSave: (f: ItemForm) => void; saving: boolean;
}) {
  const [f, setF] = useState<ItemForm>(empty);
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (open) setF(initial ? { ...initial } : empty); }, [open, initial]);
  const set = <K extends keyof ItemForm>(k: K, v: ItemForm[K]) => setF((p) => ({ ...p, [k]: v }));

  async function preview(url: string) {
    try { new URL(url); } catch { return; }
    setLoading(true);
    try {
      const r = await fetchLinkPreview({ data: { url } });
      setF((p) => ({
        ...p,
        title: p.title || r.title || "",
        image_url: p.image_url || r.image || "",
        site_name: r.siteName || p.site_name,
        price: p.price ?? r.price,
      }));
      if (r.title || r.image) toast.success("Encontramos o produto ✨");
    } finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader><DialogTitle>{initial ? "Editar desejo" : "Novo desejo"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Link do produto</Label>
            <div className="relative">
              <Input value={f.url ?? ""} placeholder="Cole aqui o link da loja" onChange={(e) => set("url", e.target.value)} onPaste={(e) => preview(e.clipboardData.getData("text"))} onBlur={(e) => !f.title && preview(e.target.value)} />
              {loading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-primary" />}
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="h-3 w-3" /> Puxamos nome e foto sozinhos</p>
          </div>
          {f.image_url && <img src={f.image_url} alt="" className="h-36 w-full rounded-2xl object-cover" />}
          <div className="space-y-1.5"><Label>O que você quer?</Label><Input required value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Tênis de corrida" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Preço (R$)</Label><Input type="number" step="0.01" min="0" value={f.price ?? ""} onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>URL da imagem</Label><Input value={f.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} placeholder="opcional" /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Quanto você quer?</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => (
                <button type="button" key={p.value} onClick={() => set("priority", p.value)} className={cn("rounded-2xl border p-2 text-sm font-medium transition", f.priority === p.value ? "border-transparent bg-gradient-primary text-primary-foreground shadow-pop" : "border-border")}>
                  <div className="text-xl">{p.emoji}</div>{p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Melhor data para presentear</Label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <button type="button" key={o.value} onClick={() => set("occasion", o.value)} className={cn("rounded-full border px-3 py-1 text-sm transition", f.occasion === o.value ? "border-transparent bg-ink text-ink-foreground" : "border-border")}>
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5"><Label>Observações</Label><Textarea value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Tamanho 38, cor azul…" /></div>
          <Button type="submit" variant="hero" className="w-full" disabled={saving}>{initial ? "Salvar" : "Adicionar à lista"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
