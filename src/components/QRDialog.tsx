import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function QRDialog({ open, onOpenChange, url, title }: { open: boolean; onOpenChange: (o: boolean) => void; url: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function download() {
    const c = ref.current?.querySelector("canvas");
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `qrcode-${title.replace(/\W+/g, "-").toLowerCase()}.png`;
    a.click();
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-sm">
        <DialogHeader><DialogTitle>QR code da lista</DialogTitle></DialogHeader>
        <div ref={ref} className="mx-auto rounded-3xl bg-card p-5 shadow-card">
          <QRCodeCanvas value={url} size={240} marginSize={2} level="M" />
        </div>
        <p className="text-center text-sm text-muted-foreground">Quem escanear vai direto para “{title}”. Baixe a imagem e mande por WhatsApp ou imprima no convite.</p>
        <Button variant="hero" onClick={download}><Download /> Baixar imagem</Button>
      </DialogContent>
    </Dialog>
  );
}
