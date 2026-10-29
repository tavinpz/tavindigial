// receber-video — entrega um link de upload (válido 2 h) para o bucket "videos".
// Só responde se o par { caminho, sha256 } estiver registrado em videos_envio e ainda não usado:
// o Claude registra o par no banco e o GitHub Actions do repositório faz o upload.
// Assim nenhuma senha fica no repositório.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { ok: false });
  const { caminho, sha256 } = await req.json().catch(() => ({}));
  if (typeof caminho !== "string" || typeof sha256 !== "string" || !/^[a-z0-9/_.-]+$/.test(caminho)) return json(400, { ok: false });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: reg } = await db.from("videos_envio").update({ usado_em: new Date().toISOString() })
    .eq("caminho", caminho).eq("sha256", sha256.toLowerCase()).is("usado_em", null).select("caminho").maybeSingle();
  if (!reg) return json(403, { ok: false, erro: "arquivo não registrado (ou já enviado)" });

  const { data, error } = await db.storage.from("videos").createSignedUploadUrl(caminho, { upsert: true });
  if (error) return json(500, { ok: false, erro: error.message });
  return json(200, { ok: true, url: data.signedUrl });
});
