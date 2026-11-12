import { ExternalLink, Gift, Pencil, Trash2 } from "lucide-react";
import { formatBRL, occasionInfo, priorityInfo } from "@/lib/occasions";
import { Button } from "@/components/ui/button";

export type WishItem = {
  id: string;
  title: string;
  url: string | null;
  image_url: string | null;
  site_name: string | null;
  price: number | null;
  priority: number;
  occasion: string;
  notes: string | null;
};

export function ItemCard({ item, onEdit, onDelete }: { item: WishItem; onEdit?: () => void; onDelete?: () => void }) {
  const occ = occasionInfo(item.occasion);
  const pri = priorityInfo(item.priority);
  return (
    <article className="lift group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-secondary-foreground/50"><Gift className="h-14 w-14" /></div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold backdrop-blur">
          {pri.emoji} {pri.label}
        </span>
        {onEdit && (
          <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100">
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={onEdit} aria-label="Editar"><Pencil /></Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={onDelete} aria-label="Excluir"><Trash2 /></Button>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">{occ.emoji} {occ.label}</span>
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{item.title}</h3>
        {item.notes && <p className="line-clamp-2 text-sm text-muted-foreground">{item.notes}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-lg font-bold text-primary">{formatBRL(item.price) ?? ""}</span>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:underline">
              {item.site_name ?? "Ver loja"} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
