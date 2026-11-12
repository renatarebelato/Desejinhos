import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarHeart, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-gifts.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Desejinhos — crie e compartilhe sua lista de desejos" },
      { name: "description", content: "Monte listas de presentes com links das lojas, prioridade e data comemorativa. Compartilhe com quem você ama." },
      { property: "og:title", content: "Desejinhos — sua lista de desejos" },
      { property: "og:description", content: "Monte e compartilhe listas de presentes com família e amigos." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Link2, title: "Cole o link, pronto", text: "Puxamos foto, nome e loja do produto automaticamente." },
  { icon: CalendarHeart, title: "Para cada data", text: "Aniversário, Natal, Dia das Mães… cada item com sua ocasião ideal." },
  { icon: Share2, title: "Compartilhe fácil", text: "Um link para família e amigos — sem precisar de conta." },
];

function Index() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">🎁 Acabou o "o que eu te dou?"</span>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] md:text-6xl">
            Seus desejos, <span className="text-gradient">numa lista só.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Junte os produtos que você ama de qualquer loja, marque o que quer muito e mande o link pra quem vai te presentear.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg"><Link to="/listas">Criar minha lista</Link></Button>
          </div>
        </div>
        <img src={hero} alt="Pilha de presentes embrulhados" width={1024} height={1024} className="animate-float mx-auto w-full max-w-md" />
      </section>
      <section className="grid gap-4 pb-24 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="lift rounded-3xl border border-border bg-card p-6 shadow-card">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground"><f.icon className="h-5 w-5" /></span>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
