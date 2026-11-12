import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Gift, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-pop">
            <Gift className="h-5 w-5" />
          </span>
          <span>Desejinhos</span>
        </Link>
        {email ? (
          <div className="flex items-center gap-2">
            <Button asChild variant="soft" size="sm"><Link to="/listas">Minhas listas</Link></Button>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair"><LogOut /></Button>
          </div>
        ) : (
          <Button asChild variant="hero" size="sm"><Link to="/auth">Entrar</Link></Button>
        )}
      </div>
    </header>
  );
}
