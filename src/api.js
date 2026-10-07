// TODAS as chamadas ao banco passam por aqui. As telas nunca falam direto com o Supabase.
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_KEY, BUCKET } from "./config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

function ok({ data, error }) {
  if (error) throw error;
  return data;
}

// O Supabase devolve no máximo 1.000 linhas por vez: busca em páginas até acabar.
async function todas(montar) {
  const saida = [];
  for (let de = 0; ; de += 1000) {
    const parte = ok(await montar().range(de, de + 999));
    saida.push(...parte);
    if (parte.length < 1000) break;
  }
  return saida;
}

/* traduz os erros do banco para algo que dá para entender */
export function msgErro(e) {
  const m = String((e && (e.message || e.error_description)) || e || "");
  if (/sem permissao|permission|row-level/i.test(m)) return "Esta conta não tem permissão para isso.";
  if (/invalid login/i.test(m)) return "E-mail ou senha incorretos.";
  if (/duplicate|unique/i.test(m)) return "Já existe um cadastro igual.";
  if (/fetch|network|Failed/i.test(m)) return "Sem conexão. Confira a internet e tente de novo.";
  if (/payload too large|exceeded|maximum allowed size/i.test(m)) return "A foto é grande demais. Tente outra.";
  return m || "Algo deu errado. Tente de novo.";
}

const agora = () => new Date().toISOString();

// ---------- login ----------
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
export function onAuth(cb) {
  const { data } = supabase.auth.onAuthStateChange((_e, s) => cb(s));
  return () => data.subscription.unsubscribe();
}
export async function login(email, senha) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
  if (error) throw error;
}
export async function logout() {
  await supabase.auth.signOut();
}
export async function trocarSenha(nova) {
  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) throw error;
}
export async function meuPerfil(userId) {
  const { data, error } = await supabase.from("sh_perfis").select("id,email,nome,role").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// ---------- tudo o que o app precisa para abrir ----------
export async function carregarPainel() {
  const [clientes, ganhos, cotacoes, cfg] = await Promise.all([
    todas(() => supabase.from("sh_clientes").select("*").is("excluida", null).order("data_adesao", { ascending: false }).order("criado", { ascending: false })),
    todas(() => supabase.from("sh_ganhos").select("*").is("excluida", null).order("data", { ascending: false })),
    todas(() => supabase.from("sh_cotacoes").select("*").is("excluida", null).order("criado", { ascending: false })),
    supabase.from("sh_config").select("dados").eq("id", 1).maybeSingle(),
  ]);
  if (cfg.error) throw cfg.error;
  return { clientes, ganhos, cotacoes, config: (cfg.data && cfg.data.dados) || {} };
}

// ---------- clientes (cada adesão é um veículo) ----------
const CAMPOS_CLIENTE = ["nome", "whatsapp", "cidade", "tipo", "placa", "modelo", "plano", "data_adesao", "valor", "recebido",
  "recebido_em", "data_receber", "situacao", "cancelado_em", "avisado_em", "cotacao_id", "obs"];

function so(campos, obj) {
  return Object.fromEntries(campos.filter((k) => k in obj).map((k) => [k, obj[k]]));
}

export async function salvarCliente(c) {
  const dados = { ...so(CAMPOS_CLIENTE, c), atualizado: agora() };
  return c.id
    ? ok(await supabase.from("sh_clientes").update(dados).eq("id", c.id).select().single())
    : ok(await supabase.from("sh_clientes").insert(dados).select().single());
}
export async function alterarCliente(id, campos) {
  return ok(await supabase.from("sh_clientes").update({ ...so(CAMPOS_CLIENTE, campos), atualizado: agora() }).eq("id", id).select().single());
}

// ---------- outros ganhos (recorrente, bônus, premiação) ----------
const CAMPOS_GANHO = ["data", "tipo", "descricao", "valor", "recebido"];
export async function salvarGanho(g) {
  const dados = { ...so(CAMPOS_GANHO, g), atualizado: agora() };
  return g.id
    ? ok(await supabase.from("sh_ganhos").update(dados).eq("id", g.id).select().single())
    : ok(await supabase.from("sh_ganhos").insert(dados).select().single());
}

// ---------- cotações do catálogo ----------
export async function listarCotacoes() {
  return todas(() => supabase.from("sh_cotacoes").select("*").is("excluida", null).order("criado", { ascending: false }));
}
export async function alterarCotacao(id, campos) {
  return ok(await supabase.from("sh_cotacoes").update({ ...campos, atualizado: agora() }).eq("id", id).select().single());
}

// ---------- lixeira (clientes, ganhos e cotações) ----------
export async function mandarParaLixeira(tabela, id) {
  ok(await supabase.from(tabela).update({ excluida: agora() }).eq("id", id));
}
export async function restaurar(tabela, id) {
  return ok(await supabase.from(tabela).update({ excluida: null }).eq("id", id).select().single());
}
export async function listarLixeira() {
  const [clientes, ganhos, cotacoes] = await Promise.all([
    todas(() => supabase.from("sh_clientes").select("*").not("excluida", "is", null).order("excluida", { ascending: false })),
    todas(() => supabase.from("sh_ganhos").select("*").not("excluida", "is", null).order("excluida", { ascending: false })),
    todas(() => supabase.from("sh_cotacoes").select("*").not("excluida", "is", null).order("excluida", { ascending: false })),
  ]);
  return { clientes, ganhos, cotacoes };
}
/* este apaga de verdade, e não tem volta */
export async function apagarDeVez(tabela, id) {
  ok(await supabase.from(tabela).delete().eq("id", id));
}

// ---------- ajustes (uma linha só, id = 1, com tudo num campo jsonb) ----------
/* grava e apaga do servidor as fotos do catálogo que foram trocadas ou tiradas */
export async function salvarConfig(dados, antigos) {
  ok(await supabase.from("sh_config").upsert({ id: 1, dados, atualizado: agora() }));
  const antes = Object.values((antigos && antigos.fotos) || {}).filter(Boolean);
  const depois = new Set(Object.values(dados.fotos || {}).filter(Boolean));
  const sairam = antes.filter((f) => !depois.has(f));
  if (sairam.length) await removerArquivos(sairam);
}

// ---------- fotos ----------
const LADO_MAXIMO = 1600; // a maior moldura do catálogo mostra até ~900 px
const QUALIDADE = 0.82;

async function lerImagem(file) {
  if (window.createImageBitmap) {
    try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch { /* tenta do outro jeito */ }
  }
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); rej(e); };
    img.src = url;
  });
}
function melhorBlob(canvas, q) {
  return new Promise((res) => {
    canvas.toBlob((b) => {
      if (b && b.type === "image/webp") return res(b);
      canvas.toBlob((j) => res(j), "image/jpeg", q); // navegador sem WebP devolve PNG, que é enorme
    }, "image/webp", q);
  });
}

/* A foto encolhe sozinha antes de subir. Se qualquer coisa falhar, sobe o original. */
export async function encolherImagem(file, lado = LADO_MAXIMO, q = QUALIDADE) {
  try {
    if (!file || !file.type.startsWith("image/")) return file;
    if (file.type === "image/gif") return file;
    const img = await lerImagem(file);
    const escala = Math.min(1, lado / Math.max(img.width, img.height));
    if (escala === 1 && file.size <= 400 * 1024) return file;
    const nl = Math.round(img.width * escala), na = Math.round(img.height * escala);
    const canvas = document.createElement("canvas");
    canvas.width = nl; canvas.height = na;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, nl, na);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, nl, na);
    const blob = await melhorBlob(canvas, q);
    if (!blob || blob.size >= file.size) return file;
    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    return new File([blob], `foto.${ext}`, { type: blob.type });
  } catch {
    return file;
  }
}

/* sobe a foto já encolhida, com nome automático, dentro da pasta "catalogo/" */
export async function enviarFoto(file, pasta = "catalogo") {
  const f = await encolherImagem(file);
  const ext = (f.type === "image/webp" && "webp") || (f.type === "image/png" && "png") || "jpg";
  const cod = Math.random().toString(36).slice(2, 8);
  const caminho = `${pasta}/${Date.now()}-${cod}.${ext}`;
  ok(await supabase.storage.from(BUCKET).upload(caminho, f, { contentType: f.type || "image/jpeg", cacheControl: "31536000", upsert: false }));
  return supabase.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
}

export function caminhoDoArquivo(url) {
  const RAIZ = `/storage/v1/object/public/${BUCKET}/`;
  const i = String(url || "").indexOf(RAIZ);
  return i < 0 ? null : decodeURIComponent(url.slice(i + RAIZ.length).split("?")[0]);
}

/* apagar tem que apagar de verdade: tira o arquivo do servidor, não só o endereço do banco */
export async function removerArquivos(urls) {
  const caminhos = [].concat(urls).map(caminhoDoArquivo).filter(Boolean);
  if (!caminhos.length) return 0;
  const { error } = await supabase.storage.from(BUCKET).remove(caminhos);
  return error ? 0 : caminhos.length;
}

// ---------- espaço usado ----------
export async function listarArquivos() {
  return ok(await supabase.rpc("sh_storage_list"));
}
/* tudo o que está em uso: as fotos escolhidas para os espaços do catálogo */
export async function arquivosEmUso() {
  const cfg = await supabase.from("sh_config").select("dados").eq("id", 1).maybeSingle();
  const usados = new Set();
  Object.values((cfg.data && cfg.data.dados && cfg.data.dados.fotos) || {}).forEach((f) => { const c = caminhoDoArquivo(f); if (c) usados.add(c); });
  return usados;
}
export async function apagarCaminhos(caminhos) {
  if (!caminhos.length) return 0;
  const { error } = await supabase.storage.from(BUCKET).remove(caminhos);
  return error ? 0 : caminhos.length;
}

// ---------- acessos ao catálogo ----------
export async function getCatalogStats() {
  return ok(await supabase.rpc("sh_stats"));
}
export async function logCatalogVisit() {
  try {
    let id = localStorage.getItem("sh_visitante");
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);
      localStorage.setItem("sh_visitante", id);
    }
    await supabase.rpc("sh_log_visit", { p_visitor: id });
  } catch { /* nunca atrapalha quem está vendo o catálogo */ }
}

// ---------- catálogo público ----------
/* os ajustes (textos, fotos, WhatsApp). Se o banco não responder, o catálogo abre com os padrões. */
export async function carregarCatalogo() {
  try {
    const { data, error } = await supabase.from("sh_config").select("dados").eq("id", 1).maybeSingle();
    if (error) return {};
    return (data && data.dados) || {};
  } catch {
    return {};
  }
}
/* se gravar falhar, o WhatsApp abre do mesmo jeito: o cliente nunca fica travado */
export async function registrarCotacao(dados) {
  try { await supabase.rpc("sh_registrar_cotacao", { p: dados }); return true; }
  catch { return false; }
}
