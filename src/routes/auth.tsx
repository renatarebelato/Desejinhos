import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Desejinhos" },
      { name: "description", content: "Entre ou crie sua conta para montar suas listas de desejos." },
      { property: "og:title", content: "Entrar — Desejinhos" },
      { property: "og:description", content: "Entre para criar e compartilhar suas listas de desejos." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && navigate({ to: "/listas" }));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => s && navigate({ to: "/listas" }));
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/listas" } });
      if (error) toast.error(error.message);
      else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("E-mail ou senha incorretos");
    }
    setLoading(false);
  }

  async function social(p: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Não foi possível entrar agora");
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md place-items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-border bg-card p-8 shadow-card">
        {sent ? (
          <div className="text-center">
            <div className="text-5xl">💌</div>
            <h1 className="mt-4 text-2xl font-bold">Confira seu e-mail</h1>
            <p className="mt-2 text-muted-foreground">Enviamos um link de confirmação para {email}.</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{mode === "in" ? "Que bom te ver!" : "Crie sua conta"}</h1>
            <p className="mt-1 text-muted-foreground">{mode === "in" ? "Entre para ver suas listas." : "Leva menos de um minuto."}</p>
            <div className="mt-6 space-y-3">
              <Button variant="outline" className="w-full rounded-full" onClick={() => social("google")}>Continuar com Google</Button>
              <button type="button" className="lovable-auth-button w-full" onClick={() => social("lovable")}>Continue with Lovable</button>
            </div>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />ou com e-mail<span className="h-px flex-1 bg-border" /></div>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="pw">Senha</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button type="submit" variant="hero" className="w-full" disabled={loading}>{mode === "in" ? "Entrar" : "Criar conta"}</Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "in" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
              <button className="font-semibold text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "Cadastre-se" : "Entrar"}</button>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
