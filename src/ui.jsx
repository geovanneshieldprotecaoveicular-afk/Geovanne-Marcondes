import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CREDITO_NOME, CREDITO_FONE, linkWhats } from "./padroes.js";

/* =====================================================================
   Peças de tela do app (cores, janelas, botões, campos)
   ===================================================================== */

export const C = {
  noite: "#071233", marinho: "#0B1F5C", azul: "#1238D1", azulVivo: "#2B5BFF", azulFundo: "#E8EEFF",
  laranja: "#F7A21B", laranjaForte: "#E68600", laranjaFundo: "#FFF3DD", amarelo: "#FFC94D",
  fundo: "#F3F6FD", card: "#FFFFFF", borda: "#DFE6F5",
  texto: "#0E1A3D", suave: "#66728F",
  verde: "#1E9E5A", verdeFundo: "#E3F6EC", vermelho: "#D64545", vermelhoFundo: "#FCEAEA",
  ambar: "#B7790B", ambarFundo: "#FDF2DA", whats: "#25D366",
};
export const FONT = `"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

export const CSS = `
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}

/* TRAVA DE LARGURA — não remover.
   Se qualquer elemento ficar mais largo que a tela, o navegador do celular
   encolhe a página inteira para caber e sobra uma faixa branca na lateral.
   Estas linhas cortam o excesso na raiz. O "clip" corta sem criar rolagem
   lateral, e por isso não atrapalha cabeçalho grudado nem janela flutuante. */
html,body,#root{max-width:100%;overflow-x:clip}
@supports not (overflow-x:clip){ html,body{overflow-x:hidden} }

html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;overscroll-behavior-y:none;background:${C.fundo};color:${C.texto};font-family:${FONT};-webkit-font-smoothing:antialiased}
img,video,table{max-width:100%}
button,input,select,textarea{font-family:inherit;color:inherit}
button{cursor:pointer}
a{color:inherit}

/* Altura real da tela: o 100vh do iPhone conta a barra do Safari e corta. */
.tela{position:fixed;left:0;right:0;top:0;bottom:0;height:100vh;height:100dvh}
.cheia{height:100%;max-height:100%}

/* 16px no campo evita o zoom automático do iPhone ao tocar para digitar. */
@media (max-width:859px){ input,select,textarea{font-size:16px !important} }

/* troca de aba: SÓ opacidade (transform num pai quebra as janelas no Android) */
@keyframes shFade{from{opacity:0}to{opacity:1}}
.sh-aba{animation:shFade .22s ease}
@keyframes shRoda{to{transform:rotate(360deg)}}
.sh-roda{animation:shRoda .8s linear infinite}

.sh-campo{width:100%;padding:12px 14px;border:1.5px solid ${C.borda};border-radius:12px;background:#fff;font-size:15px;outline:none;transition:border-color .15s}
.sh-campo:focus{border-color:${C.azul}}
.sh-campo::placeholder{color:#A4AEC7}
.sh-toque:active{opacity:.75}
.sh-chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.sh-chips::-webkit-scrollbar{display:none}
`;

/* ---------------------------------------------------------------------
   Ícones (SVG à mão)
   --------------------------------------------------------------------- */
const svg = (d, extra) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...extra}>{d}</svg>
);
export const ICONES = {
  inicio: svg(<><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>),
  clientes: svg(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></>),
  ganhos: svg(<><rect x="2.5" y="6" width="19" height="13" rx="2.5" /><circle cx="12" cy="12.5" r="3" /><path d="M6 9.5v.01M18 15.5v.01" /></>),
  cotacoes: svg(<><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" /></>),
  fotos: svg(<><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5L5 20" /></>),
  ajustes: svg(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>),
  voltar: svg(<path d="M15 18l-6-6 6-6" />),
  x: svg(<path d="M18 6L6 18M6 6l12 12" />),
  mais: svg(<path d="M12 5v14M5 12h14" />, { strokeWidth: 2.4 }),
  busca: svg(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>),
  check: svg(<path d="M5 12.5l4.5 4.5L19 7.5" />, { strokeWidth: 2.6 }),
  editar: svg(<><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>),
  lixo: svg(<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>),
  sair: svg(<><path d="M15 4h4v16h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>),
  alerta: svg(<><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18h.01" /></>),
  dir: svg(<path d="M9 6l6 6-6 6" />),
  cima: svg(<path d="M6 15l6-6 6 6" />),
  baixo: svg(<path d="M6 9l6 6 6-6" />),
  foto: svg(<><rect x="3" y="5" width="18" height="15" rx="2.5" /><circle cx="12" cy="12.5" r="3.5" /><path d="M8 5l1.5-2h5L16 5" /></>),
  link: svg(<><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" /><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" /></>),
  copiar: svg(<><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>),
  escudo: svg(<><path d="M12 3l8 3v6c0 4.4-3.2 7.9-8 9-4.8-1.1-8-4.6-8-9V6z" /><path d="M9 12l2 2 4-4" /></>),
  pessoa: svg(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  predio: svg(<><path d="M4 21V5l8-3 8 3v16" /><path d="M9 21v-5h6v5M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01" /></>),
  formulario: svg(<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3v2h6V3M8.5 10h7M8.5 14h7M8.5 18h4" /></>),
  mensagem: svg(<><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" /></>),
  texto: svg(<><path d="M4 6h16M4 12h10M4 18h13" /></>),
  celular: svg(<><rect x="6.5" y="2" width="11" height="20" rx="2.4" /><path d="M10.5 18.5h3" /></>),
  disco: svg(<><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>),
  catalogo: svg(<><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v18H5.5A2.5 2.5 0 0 1 3 18.5z" /><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v18h5.5a2.5 2.5 0 0 0 2.5-2.5z" /></>),
  carro: svg(<><path d="M5 16v-4l2-5h10l2 5v4" /><path d="M3 16h18v2.5H3z" /><circle cx="7.5" cy="16.5" r="1.5" /><circle cx="16.5" cy="16.5" r="1.5" /><path d="M5 12h14" /></>),
  moto: svg(<><circle cx="5.5" cy="16" r="3.2" /><circle cx="18.5" cy="16" r="3.2" /><path d="M5.5 16l4-6h5l4 6" /><path d="M14 10l-1-3h3" /><path d="M9.5 10l3 6" /></>),
  caminhao: svg(<><path d="M2 6h11v10H2z" /><path d="M13 9h4l3 3v4h-7" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" /></>),
  desfazer: svg(<><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></>),
  repetir: svg(<><path d="M17 2l3 3-3 3" /><path d="M4 11V9a4 4 0 0 1 4-4h12" /><path d="M7 22l-3-3 3-3" /><path d="M20 13v2a4 4 0 0 1-4 4H4" /></>),
  whats: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3z" />
    </svg>
  ),
};
export const ICONE_TIPO = { carro: ICONES.carro, moto: ICONES.moto, caminhao: ICONES.caminhao };

export const tamanho = (b) => {
  if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  if (b >= 1024) return `${Math.round(b / 1024)} KB`;
  return `${b} B`;
};
export const parseValor = (s) => {
  const t = String(s ?? "").replace(/[^\d,.-]/g, "");
  if (!t) return null;
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};
export const valorParaCampo = (v) => (v === null || v === undefined || v === "" ? "" : Number(v).toFixed(2).replace(".", ","));

/* ---------------------------------------------------------------------
   Botão voltar do celular: fecha o que está aberto antes de sair do app
   --------------------------------------------------------------------- */
const PILHA = [];
let IGNORAR = 0;
let VOLTAS = 0;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    if (IGNORAR > 0) { IGNORAR--; return; }
    const item = PILHA.pop();
    if (item) { item.porVoltar = true; item.fechar(); }
  });
}
/* junta vários "voltar" do mesmo instante num só (fechar duas janelas de uma vez) */
function voltarHistorico() {
  VOLTAS++;
  if (VOLTAS === 1) setTimeout(() => { const n = VOLTAS; VOLTAS = 0; IGNORAR++; window.history.go(-n); }, 0);
}
export function useVoltar(aberto, fechar) {
  const ref = useRef(fechar);
  ref.current = fechar;
  useEffect(() => {
    if (!aberto) return;
    const item = { fechar: () => ref.current(), porVoltar: false };
    PILHA.push(item);
    window.history.pushState({ sh: PILHA.length }, "");
    return () => {
      const i = PILHA.indexOf(item);
      if (i >= 0) { PILHA.splice(i, 1); if (!item.porVoltar) voltarHistorico(); }
    };
  }, [aberto]);
}

/* trava o fundo (só esconder a rolagem não segura o Safari). Com contador:
   janela abre por cima de janela, e só a última a fechar devolve o fundo. */
let TRAVAS = 0;
let ANTES = null;
function useTravaFundo(ativo) {
  useEffect(() => {
    if (!ativo) return;
    if (TRAVAS === 0) {
      const y = window.scrollY || 0;
      const b = document.body;
      ANTES = { y, position: b.style.position, top: b.style.top, width: b.style.width, overflow: b.style.overflow };
      b.style.position = "fixed"; b.style.top = `-${y}px`; b.style.width = "100%"; b.style.overflow = "hidden";
    }
    TRAVAS++;
    return () => {
      TRAVAS--;
      if (TRAVAS === 0 && ANTES) {
        const b = document.body;
        b.style.position = ANTES.position; b.style.top = ANTES.top; b.style.width = ANTES.width; b.style.overflow = ANTES.overflow;
        window.scrollTo(0, ANTES.y);
        ANTES = null;
      }
    };
  }, [ativo]);
}

export function useTelaLarga() {
  const [larga, setLarga] = useState(() => window.innerWidth >= 860);
  useEffect(() => {
    const r = () => setLarga(window.innerWidth >= 860);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  return larga;
}

/* ---------------------------------------------------------------------
   Janela que abre por cima (padrão: portal, dvh, teclado, trava do fundo)
   --------------------------------------------------------------------- */
export function Modal({ aberto, aoFechar, titulo, sub, children, rodape, largo }) {
  const telaLarga = useTelaLarga();
  const [altura, setAltura] = useState(null);
  useVoltar(aberto, aoFechar);
  useTravaFundo(aberto);

  /* teclado do iPhone: a janela encolhe junto e o botão de salvar fica à vista */
  useEffect(() => {
    if (!aberto || !window.visualViewport) return;
    const vv = window.visualViewport;
    const aj = () => setAltura(Math.round(vv.height));
    aj();
    vv.addEventListener("resize", aj);
    vv.addEventListener("scroll", aj);
    return () => { vv.removeEventListener("resize", aj); vv.removeEventListener("scroll", aj); };
  }, [aberto]);

  if (!aberto) return null;
  const topo = `linear-gradient(135deg, ${C.azul}, ${C.marinho})`;

  if (!telaLarga) {
    return createPortal(
      <div className="tela" style={{ zIndex: 100, background: C.fundo, display: "flex", flexDirection: "column",
        height: altura ? `${altura}px` : undefined, animation: "shFade .18s ease", fontFamily: FONT, color: C.texto }}>
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 6, color: "#fff", background: topo,
          padding: "calc(8px + env(safe-area-inset-top,0px)) 10px 10px" }}>
          <button onClick={aoFechar} aria-label="Voltar" style={S.btnIcone}>{ICONES.voltar}</button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titulo}</div>
            {sub && <div style={{ fontSize: 12.5, color: C.amarelo, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
          </div>
        </div>
        <div style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch",
          padding: rodape ? 16 : "16px 16px calc(24px + env(safe-area-inset-bottom,0px))" }}>{children}</div>
        {rodape && (
          <div style={{ flex: "0 0 auto", background: "#fff", borderTop: `1px solid ${C.borda}`,
            padding: "12px 16px calc(12px + env(safe-area-inset-bottom,0px))" }}>{rodape}</div>
        )}
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="tela" onMouseDown={(e) => { if (e.target === e.currentTarget) aoFechar(); }}
      style={{ zIndex: 100, background: "rgba(7,18,51,.55)", display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24, animation: "shFade .18s ease", fontFamily: FONT, color: C.texto }}>
      <div style={{ background: C.fundo, borderRadius: 20, width: "100%", maxWidth: largo ? 780 : 560,
        maxHeight: "calc(100dvh - 48px)", display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 24px 70px rgba(0,0,0,.35)" }}>
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 12, padding: "15px 16px 15px 20px", background: topo, color: "#fff" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{titulo}</div>
            {sub && <div style={{ fontSize: 13, color: C.amarelo }}>{sub}</div>}
          </div>
          <button onClick={aoFechar} aria-label="Fechar" style={S.btnIcone}>{ICONES.x}</button>
        </div>
        <div style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: 20 }}>{children}</div>
        {rodape && <div style={{ flex: "0 0 auto", background: "#fff", borderTop: `1px solid ${C.borda}`, padding: "14px 20px" }}>{rodape}</div>}
      </div>
    </div>,
    document.body
  );
}

/* ---------------------------------------------------------------------
   Estilos e peças reaproveitadas
   --------------------------------------------------------------------- */
export const S = {
  btnIcone: { width: 42, height: 42, flex: "0 0 42px", display: "grid", placeItems: "center", border: "none",
    background: "transparent", color: "inherit", borderRadius: 12 },
  card: { background: C.card, border: `1px solid ${C.borda}`, borderRadius: 16, minWidth: 0 },
  rotulo: { display: "block", fontSize: 13, fontWeight: 600, color: C.suave, marginBottom: 6 },
  titSecao: { fontSize: 12.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.suave, margin: "24px 2px 10px" },
  dica: { fontSize: 12.5, color: C.suave, marginTop: 6, lineHeight: 1.5 },
  h1: { fontSize: 22, fontWeight: 800, margin: "4px 2px 4px", letterSpacing: -0.3 },
};

export function Botao({ children, onClick, cor = C.azul, texto = "#fff", contorno, cheio, pequeno, disabled, icone, style, ...resto }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="sh-toque" {...resto}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: pequeno ? "9px 12px" : "13px 18px", minHeight: pequeno ? 40 : 48, borderRadius: 12,
        fontWeight: 700, fontSize: pequeno ? 13.5 : 15, width: cheio ? "100%" : undefined,
        border: contorno ? `1.5px solid ${cor}` : "none", background: contorno ? "transparent" : cor,
        color: contorno ? cor : texto, opacity: disabled ? 0.55 : 1, whiteSpace: "nowrap", ...style }}>
      {icone}{children}
    </button>
  );
}
export const LARANJA = { cor: C.laranja, texto: C.noite };

/* abre o WhatsApp com a mensagem pronta; aoAbrir marca "avisado" */
export function BotaoWhats({ fone, msg, children = "WhatsApp", pequeno = true, cheio, aoAbrir, style }) {
  return (
    <a href={linkWhats(fone, msg)} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); if (aoAbrir) aoAbrir(); }} className="sh-toque"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none",
        padding: pequeno ? "9px 13px" : "13px 18px", minHeight: pequeno ? 40 : 48, borderRadius: 12, fontWeight: 700,
        fontSize: pequeno ? 13.5 : 15, background: C.whats, color: "#fff", width: cheio ? "100%" : undefined, whiteSpace: "nowrap", ...style }}>
      {ICONES.whats}{children}
    </a>
  );
}

/* Campo declarado FORA dos formulários: se fosse dentro, o teclado do celular
   fecharia a cada letra digitada. */
export function Campo({ n, rotulo, children, dica, style }) {
  return (
    <div style={{ marginBottom: 16, minWidth: 0, ...style }}>
      <label style={S.rotulo}>
        {n ? <span style={{ display: "inline-grid", placeItems: "center", width: 20, height: 20, borderRadius: 6, background: C.azul,
          color: "#fff", fontSize: 11, fontWeight: 700, marginRight: 7 }}>{n}</span> : null}
        {rotulo}
      </label>
      {children}
      {dica && <div style={S.dica}>{dica}</div>}
    </div>
  );
}

export function Interruptor({ ligado, mudar, rotulo, dica }) {
  return (
    <button type="button" onClick={() => mudar(!ligado)} className="sh-toque"
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 10,
        borderRadius: 14, border: `1.5px solid ${ligado ? C.azul : C.borda}`, background: ligado ? C.azulFundo : "#fff", minWidth: 0 }}>
      <span style={{ flex: "0 0 44px", height: 26, borderRadius: 999, background: ligado ? C.verde : "#CBD3E4", position: "relative", transition: "background .2s" }}>
        <span style={{ position: "absolute", top: 3, left: ligado ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff",
          transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
      </span>
      <span style={{ minWidth: 0 }}>
        <b style={{ display: "block", fontSize: 14.5 }}>{rotulo}</b>
        {dica && <span style={{ display: "block", fontSize: 12.5, color: C.suave, marginTop: 2, lineHeight: 1.45 }}>{dica}</span>}
      </span>
    </button>
  );
}

export function Chips({ opcoes, valor, mudar, permitirVazio, rolar }) {
  return (
    <div className={rolar ? "sh-chips" : undefined} style={rolar ? undefined : { display: "flex", flexWrap: "wrap", gap: 8 }}>
      {opcoes.map((o) => {
        const v = typeof o === "string" ? o : o.v;
        const l = typeof o === "string" ? o : o.l;
        const on = valor === v;
        return (
          <button key={v} type="button" onClick={() => mudar(on && permitirVazio ? "" : v)} className="sh-toque"
            style={{ flex: "0 0 auto", padding: "9px 14px", borderRadius: 999, fontSize: 13.5, fontWeight: 600,
              border: `1.5px solid ${on ? C.azul : C.borda}`, background: on ? C.azul : "#fff", color: on ? "#fff" : C.texto }}>{l}</button>
        );
      })}
    </div>
  );
}

export function Selo({ tipo, children }) {
  const cores = {
    ok: [C.verdeFundo, C.verde], erro: [C.vermelhoFundo, C.vermelho], aviso: [C.ambarFundo, C.ambar],
    azul: [C.azulFundo, C.azul], laranja: [C.laranjaFundo, C.laranjaForte], neutro: ["#EDF0F7", C.suave],
    Black: [C.noite, "#fff"], Gold: ["#FFF0CC", "#9A6400"], Exclusive: [`linear-gradient(90deg, ${C.azul}, ${C.marinho})`, C.amarelo],
  }[tipo] || ["#EDF0F7", C.suave];
  return (
    <span style={{ display: "inline-block", padding: "4px 9px", borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: cores[0], color: cores[1], whiteSpace: "nowrap" }}>{children}</span>
  );
}

export function Carregando({ texto = "Carregando…" }) {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: 60, color: C.suave, gap: 14 }}>
      <div className="sh-roda" style={{ width: 34, height: 34, borderRadius: "50%", border: `3px solid ${C.borda}`, borderTopColor: C.laranja }} />
      <div style={{ fontSize: 14, fontWeight: 600 }}>{texto}</div>
    </div>
  );
}

export function Vazio({ texto }) {
  return <div style={{ ...S.card, padding: "30px 16px", textAlign: "center", color: C.suave, fontSize: 14, lineHeight: 1.5 }}>{texto}</div>;
}

export function Credito({ claro }) {
  return (
    <div style={{ textAlign: "center", fontSize: 12, color: claro ? "rgba(255,255,255,.55)" : C.suave, padding: "18px 12px" }}>
      Programa feito por <b style={{ color: claro ? "rgba(255,255,255,.85)" : C.texto }}>{CREDITO_NOME}</b> — {CREDITO_FONE}
    </div>
  );
}

/* número grande de painel. nowrap: sem isso "R$ 13.220,85" quebra no meio do número */
export function Numero({ rotulo, valor, sub, destaque, cor, fundo, aoTocar }) {
  return (
    <button type="button" onClick={aoTocar} disabled={!aoTocar} className="sh-toque"
      style={{ ...S.card, textAlign: "left", padding: "14px 15px", cursor: aoTocar ? "pointer" : "default",
        border: `1px solid ${destaque ? C.azul : C.borda}`,
        background: destaque ? `linear-gradient(135deg, ${C.azul}, ${C.marinho})` : fundo || "#fff", color: destaque ? "#fff" : C.texto }}>
      <div style={{ fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase", fontWeight: 700, color: destaque ? C.amarelo : C.suave }}>{rotulo}</div>
      <div style={{ fontSize: "clamp(17px,5vw,24px)", fontWeight: 800, margin: "4px 0 1px", whiteSpace: "nowrap", overflow: "hidden",
        textOverflow: "ellipsis", color: destaque ? "#fff" : cor || C.texto }}>{valor}</div>
      {sub && <div style={{ fontSize: 12, color: destaque ? "rgba(255,255,255,.7)" : C.suave }}>{sub}</div>}
    </button>
  );
}

/* linha de lista que abre algo (Ajustes) */
export function Linha({ icone, titulo, sub, aoTocar, direita, primeira }) {
  return (
    <button type="button" onClick={aoTocar} className="sh-toque"
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "14px",
        border: "none", background: "#fff", borderTop: primeira ? "none" : `1px solid ${C.borda}`, minWidth: 0 }}>
      {icone && <span style={{ flex: "0 0 40px", height: 40, borderRadius: 12, display: "grid", placeItems: "center", background: C.azulFundo, color: C.azul }}>{icone}</span>}
      <span style={{ flex: 1, minWidth: 0 }}>
        <b style={{ display: "block", fontSize: 14.5 }}>{titulo}</b>
        {sub && <span style={{ display: "block", fontSize: 12.5, color: C.suave, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</span>}
      </span>
      {direita}
      <span style={{ color: C.suave, display: "flex" }}>{ICONES.dir}</span>
    </button>
  );
}

/* botão de copiar (placa, link) */
export function BotaoCopiar({ texto, rotulo = "Copiar", pequeno = true }) {
  const [ok, setOk] = useState(false);
  const copiar = async (e) => {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(texto); }
    catch {
      const t = document.createElement("textarea");
      t.value = texto; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch { /* nada */ }
      document.body.removeChild(t);
    }
    setOk(true); setTimeout(() => setOk(false), 1800);
  };
  return (
    <button type="button" onClick={copiar} className="sh-toque" aria-label={`${rotulo}: ${texto}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: pequeno ? "4px 8px" : "9px 13px", borderRadius: 8, border: `1px solid ${C.borda}`,
        background: ok ? C.verdeFundo : "#fff", color: ok ? C.verde : C.suave, fontSize: 12, fontWeight: 700 }}>
      <span style={{ display: "flex", transform: "scale(.7)", margin: "-4px" }}>{ok ? ICONES.check : ICONES.copiar}</span>{ok ? "Copiado" : rotulo}
    </button>
  );
}

/* aviso rápido no pé da tela */
export function useAviso() {
  const [aviso, setAviso] = useState(null);
  const t = useRef(null);
  const mostrar = (texto, tipo = "ok") => {
    clearTimeout(t.current);
    setAviso({ texto, tipo });
    t.current = setTimeout(() => setAviso(null), 2800);
  };
  const el = aviso && createPortal(
    <div style={{ position: "fixed", left: 16, right: 16, zIndex: 300, display: "flex", justifyContent: "center",
      bottom: "calc(90px + env(safe-area-inset-bottom,0px))", pointerEvents: "none", animation: "shFade .2s ease", fontFamily: FONT }}>
      <div style={{ background: aviso.tipo === "erro" ? C.vermelho : C.noite, color: "#fff", padding: "12px 18px",
        borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,.25)", maxWidth: 480,
        border: aviso.tipo === "erro" ? "none" : "1px solid rgba(247,162,27,.5)" }}>
        {aviso.texto}
      </div>
    </div>,
    document.body
  );
  return [mostrar, el];
}
