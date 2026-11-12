import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function meta(html: string, keys: string[]) {
  for (const k of keys) {
    const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*content=["']([^"']+)["']`, "i");
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${k}["']`, "i");
    const m = html.match(re1) ?? html.match(re2);
    if (m?.[1]) return decode(m[1]);
  }
  return null;
}
function decode(s: string) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

export const fetchLinkPreview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ url: z.string().url().max(2000) }).parse(d))
  .handler(async ({ data }) => {
    const u = new URL(data.url);
    if (!["http:", "https:"].includes(u.protocol)) return { title: null, image: null, siteName: null, price: null };
    try {
      const res = await fetch(u.toString(), {
        headers: { "user-agent": "Mozilla/5.0 (compatible; WishlistBot/1.0)", accept: "text/html" },
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
      const html = (await res.text()).slice(0, 400_000);
      const title = meta(html, ["og:title", "twitter:title"]) ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null;
      let image = meta(html, ["og:image", "og:image:secure_url", "twitter:image"]);
      if (image) image = new URL(image, u).toString();
      const siteName = meta(html, ["og:site_name"]) ?? u.hostname.replace(/^www\./, "");
      const priceRaw = meta(html, ["product:price:amount", "og:price:amount"]);
      const price = priceRaw ? Number(priceRaw.replace(/[^\d.,]/g, "").replace(",", ".")) || null : null;
      return { title: title ? decode(title) : null, image, siteName, price };
    } catch {
      return { title: null, image: null, siteName: u.hostname.replace(/^www\./, ""), price: null };
    }
  });
