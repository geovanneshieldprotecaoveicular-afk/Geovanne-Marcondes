import { Component, useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import * as api from "./api.js";
import {
  CREDITO_NOME, CREDITO_FONE, PLANOS, TIPOS, nomeTipo, mesclarConfig, fotoDoEspaco,
  foneFmt, foneOk, foneLimpo, foneDigitando, placaLimpa, placaOk, linkWhats, linkInstagram, linkMapa, telefone0800,
  perguntaVisivel, mensagemCotacao, respostasParaGuardar,
} from "./padroes.js";

/* =====================================================================
   CATÁLOGO PÚBLICO — GEOVANNE MARCONDES · SHIELD PROTEÇÃO VEICULAR
   Abre em /catalogo. Sem login.

   IDENTIDADE PRÓPRIA. O Geovanne e o Ricardo (Universo AGV) se conhecem
   e as empresas concorrem: este catálogo NÃO pode lembrar o do Ricardo.
   Lá: fundo escuro, dourado, Montserrat, foto em tela cheia, textos que
   sobem. Aqui: azul royal e laranja da Shield, Poppins, seções claras e
   azuis alternadas, a lente com a foto dele, títulos que se revelam como
   cortina, faixa de coberturas correndo, chave Carro/Moto/Caminhão,
   formulário em etapas e barra fixa embaixo. Manter assim.

   Planos e coberturas: só o que está nas artes da Shield (src/padroes.js).
   ===================================================================== */

const C = {
  noite: "#071233",
  marinho: "#0B1F5C",
  azul: "#1238D1",
  azulVivo: "#2B5BFF",
  azulClaro: "#8FB0FF",
  gelo: "#F2F5FF",
  branco: "#FFFFFF",
  tinta: "#0E1A3D",
  cinza: "#5B6B8C",
  linha: "#DCE3F5",
  laranja: "#F7A21B",
  laranjaForte: "#FF8A00",
  amarelo: "#FFC94D",
  whats: "#25D366",
  vermelho: "#E04848",
};
const FONT = `"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
const LOGO = "/logo.jpg";
const LARGURA = 1120;

const CSS = `
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}

/* TRAVA DE LARGURA — não remover.
   Se qualquer elemento ficar mais largo que a tela, o navegador do celular
   encolhe a página inteira para caber e sobra uma faixa branca na lateral.
   Estas linhas cortam o excesso na raiz. O "clip" corta sem criar rolagem
   lateral, e por isso não atrapalha cabeçalho grudado nem janela flutuante. */
html,body,#root{max-width:100%;overflow-x:clip}
@supports not (overflow-x:clip){ html,body{overflow-x:hidden} }

html{-webkit-text-size-adjust:100%;text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;overscroll-behavior-y:none;background:${C.branco};color:${C.tinta};font-family:${FONT};-webkit-font-smoothing:antialiased}
img,video,table{max-width:100%}
img{display:block}
button,input,select,textarea{font-family:inherit;color:inherit}
button{cursor:pointer}
a{color:inherit}

/* Altura real da tela: o 100vh do iPhone conta a barra do Safari e corta. */
.tela{position:fixed;left:0;right:0;top:0;bottom:0;height:100vh;height:100dvh}

/* 16px no campo evita o zoom automático do iPhone ao tocar para digitar. */
@media (max-width:859px){ input,select,textarea{font-size:16px !important} }

@keyframes shGira{to{transform:rotate(360deg)}}
@keyframes shGiraVolta{to{transform:rotate(-360deg)}}
@keyframes shFaixa{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes shOnda{0%{transform:translate(-50%,-50%) scale(.3);opacity:.9}100%{transform:translate(-50%,-50%) scale(2.6);opacity:0}}
@keyframes shBoia{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes shListra{from{transform:translateX(-5%) rotate(-24deg)}to{transform:translateX(5%) rotate(-24deg)}}
@keyframes shRespira{0%,100%{transform:scale(1.02)}50%{transform:scale(1.09)}}
@keyframes shChama{0%,100%{box-shadow:0 10px 30px rgba(247,162,27,.35),0 0 0 0 rgba(247,162,27,.45)}60%{box-shadow:0 10px 30px rgba(247,162,27,.35),0 0 0 14px rgba(247,162,27,0)}}
@keyframes shTroca{from{opacity:0}to{opacity:1}}
@keyframes shSurge{from{opacity:0}to{opacity:1}}
@keyframes shPisca{0%,100%{opacity:1}50%{opacity:.35}}

/* títulos se revelam como uma cortina, da esquerda para a direita */
.sh-cortina{clip-path:inset(-10% 100% -10% 0);transition:clip-path 1.05s cubic-bezier(.77,0,.18,1)}
.sh-cortina.sh-in{clip-path:inset(-10% 0 -10% 0)}
@keyframes shCortina{from{clip-path:inset(-10% 100% -10% 0)}to{clip-path:inset(-10% 0 -10% 0)}}
.sh-cortina-ja{animation:shCortina 1.2s cubic-bezier(.77,0,.18,1) .3s both}
/* cartões entram desfocados e crescendo */
.sh-foco{opacity:0;transform:scale(.94);filter:blur(8px);transition:opacity .8s ease,transform .9s cubic-bezier(.2,.8,.2,1),filter .8s ease}
.sh-foco.sh-in{opacity:1;transform:none;filter:none}
/* entra de lado */
.sh-lado{opacity:0;transform:translateX(-34px);transition:opacity .8s ease,transform .9s cubic-bezier(.2,.8,.2,1)}
.sh-lado.sh-in{opacity:1;transform:none}

.sh-toque{transition:transform .15s ease,opacity .15s ease,box-shadow .3s ease,background .25s ease}
.sh-toque:active{transform:scale(.97);opacity:.92}
.sh-carrossel{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:4px 2px 18px}
.sh-carrossel::-webkit-scrollbar{display:none}
.sh-carrossel>*{scroll-snap-align:start}
.sh-campo{width:100%;padding:14px 15px;border-radius:14px;font-size:15px;outline:none;border:1.5px solid ${C.linha};background:#fff;color:${C.tinta};transition:border-color .18s,box-shadow .18s}
.sh-campo::placeholder{color:#9AA7C4}
.sh-campo:focus{border-color:${C.azul};box-shadow:0 0 0 4px rgba(18,56,209,.12)}
.sh-laranja-texto{background:linear-gradient(90deg,${C.laranja},${C.amarelo},${C.laranjaForte});-webkit-background-clip:text;background-clip:text;color:transparent}
@media (hover:hover){
  .sh-plano:hover{transform:translateY(-6px)}
  .sh-btn-laranja:hover{filter:brightness(1.05)}
}
.sh-plano{transition:transform .35s cubic-bezier(.2,.8,.2,1)}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important}
  .sh-cortina{clip-path:none}
  .sh-foco,.sh-lado{opacity:1;transform:none;filter:none}
}
`;

/* ---------------------------------------------------------------------
   Ícones desenhados à mão
   --------------------------------------------------------------------- */
const svg = (d, t = 24, p) => (
  <svg width={t} height={t} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{d}</svg>
);
const I = {
  escudo: svg(<><path d="M12 3l8 3v6c0 4.4-3.2 7.9-8 9-4.8-1.1-8-4.6-8-9V6z" /><path d="M9 12l2 2 4-4" /></>),
  check: svg(<path d="M5 12.5l4.5 4.5L19 7" />, 18, { strokeWidth: 2.8 }),
  mais: svg(<path d="M12 5v14M5 12h14" />, 18, { strokeWidth: 2.6 }),
  carro: svg(<><path d="M5 16v-4l2-5h10l2 5v4" /><path d="M3 16h18v2.5H3z" /><circle cx="7.5" cy="16.5" r="1.5" /><circle cx="16.5" cy="16.5" r="1.5" /><path d="M5 12h14" /></>),
  moto: svg(<><circle cx="5.5" cy="16" r="3.2" /><circle cx="18.5" cy="16" r="3.2" /><path d="M5.5 16l4-6h5l4 6" /><path d="M14 10l-1-3h3" /><path d="M9.5 10l3 6" /></>),
  caminhao: svg(<><path d="M2 6h11v10H2z" /><path d="M13 9h4l3 3v4h-7" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" /></>),
  guincho: svg(<><path d="M2 16h9v-5H4l-2 3z" /><path d="M11 16h4l3-4h3v4" /><circle cx="6" cy="17.5" r="1.7" /><circle cx="17" cy="17.5" r="1.7" /><path d="M13 11V5h5" /></>),
  chave: svg(<><circle cx="8" cy="15" r="4" /><path d="M11 12l8-8M17 6l2 2M15 8l2 2" /></>),
  pneu: svg(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.4" /><path d="M12 3v5.6M12 15.4V21M3 12h5.6M15.4 12H21" /></>),
  bateria: svg(<><rect x="2" y="8" width="16" height="9" rx="2" /><path d="M18 11h3v3h-3" /><path d="M6 6v2M13 6v2" /><path d="M8 12.5h5" /></>),
  combustivel: svg(<><path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" /><path d="M3 21h12" /><path d="M7 8h4" /><path d="M14 10h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-3-3" /></>),
  cama: svg(<><path d="M3 18V7" /><path d="M3 14h18v4" /><path d="M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="2" /></>),
  taxi: svg(<><path d="M5 16v-4l2-5h10l2 5v4" /><path d="M3 16h18v2.5H3z" /><path d="M10 4h4v3h-4z" /></>),
  casa: svg(<><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>),
  telefone: svg(<path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.2 2 2 0 0 1 5 3z" />),
  relogio24: svg(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>),
  insta: svg(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></>),
  mapa: svg(<><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></>),
  rota: svg(<><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7" /></>),
  gente: svg(<><circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></>),
  raio: svg(<path d="M13 2L4 14h7l-1 8 9-12h-7z" />),
  alvo: svg(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>),
  bola: svg(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3v18" /><path d="M5.6 5.6c3.4 3 3.4 9.8 0 12.8M18.4 5.6c-3.4 3-3.4 9.8 0 12.8" /></>),
  boleto: svg(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9v6M10 9v6M13 9v6M17 9v6" /></>),
  doc: svg(<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>),
  alerta: svg(<><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18h.01" /></>),
  ferramenta: svg(<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 6.3-6.3a4 4 0 0 1-5-5L13 5z" />),
  presente: svg(<><rect x="3" y="8" width="18" height="13" rx="1.5" /><path d="M3 12h18M12 8v13" /><path d="M12 8c-2-4-6-3-5 0M12 8c2-4 6-3 5 0" /></>),
  conversa: svg(<><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" /></>),
  esq: svg(<path d="M15 5l-7 7 7 7" />, 22, { strokeWidth: 2.2 }),
  dir: svg(<path d="M9 5l7 7-7 7" />, 22, { strokeWidth: 2.2 }),
  baixo: svg(<path d="M6 9l6 6 6-6" />, 20, { strokeWidth: 2.2 }),
  x: svg(<path d="M18 6L6 18M6 6l12 12" />, 22, { strokeWidth: 2.2 }),
  voltar: svg(<path d="M15 18l-6-6 6-6" />, 22, { strokeWidth: 2.2 }),
  lixo: svg(<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />, 20),
  seta: svg(<path d="M5 12h14M13 6l6 6-6 6" />, 20, { strokeWidth: 2.2 }),
  whats: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3z" />
    </svg>
  ),
  play: (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 3.5v17l9.5-8.5z" fill="#34A853" /><path d="M4 3.5l9.5 8.5 3-2.7L6 3z" fill="#4285F4" />
      <path d="M4 20.5l9.5-8.5 3 2.7L6 21z" fill="#EA4335" /><path d="M16.5 9.3L20 11.2c.8.5.8 1.2 0 1.6l-3.5 1.9-3-2.7z" fill="#FBBC04" />
    </svg>
  ),
  apple: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8-.8 0-1.9-.8-3.1-.8-1.6 0-3 .9-3.9 2.3-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.4 3 2.4 1.2-.1 1.6-.8 3.1-.8 1.4 0 1.8.8 3.1.8 1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.7-1-2.7-3.9zM14.1 5.5c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3z" />
    </svg>
  ),
};
const ICONE_TIPO = { carro: I.carro, moto: I.moto, caminhao: I.caminhao };

/* ---------------------------------------------------------------------
   Aparecer ao rolar — um observador só para a página inteira
   --------------------------------------------------------------------- */
let OBS = null;
const ALVOS = new WeakMap();
function observar(el, cb) {
  if (!("IntersectionObserver" in window)) { cb(); return () => {}; }
  if (!OBS) {
    OBS = new IntersectionObserver(
      (itens) => itens.forEach((i) => {
        if (!i.isIntersecting) return;
        const f = ALVOS.get(i.target);
        if (f) { f(); ALVOS.delete(i.target); OBS.unobserve(i.target); }
      }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
    );
  }
  ALVOS.set(el, cb);
  OBS.observe(el);
  return () => { ALVOS.delete(el); OBS.unobserve(el); };
}
function useVisto() {
  const ref = useRef(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observar(el, () => setVisto(true));
  }, []);
  return [ref, visto];
}
/* efeito: "cortina" (títulos), "foco" (cartões) ou "lado" */
function Surge({ efeito = "foco", atraso = 0, como: Tag = "div", style, className = "", children, ...resto }) {
  const [ref, visto] = useVisto();
  /* a cortina recorta o próprio elemento, e o Chrome não avisa que um elemento todo recortado
     entrou na tela: por isso quem é observado é uma caixa por fora */
  if (efeito === "cortina") {
    return (
      <div ref={ref}>
        <Tag className={`sh-cortina${visto ? " sh-in" : ""} ${className}`} style={{ transitionDelay: `${atraso}ms`, ...style }} {...resto}>{children}</Tag>
      </div>
    );
  }
  return (
    <Tag ref={ref} className={`sh-${efeito}${visto ? " sh-in" : ""} ${className}`}
      style={{ transitionDelay: `${atraso}ms`, ...style }} {...resto}>{children}</Tag>
  );
}

function useTelaLarga() {
  const [larga, setLarga] = useState(() => window.innerWidth >= 860);
  useEffect(() => {
    const r = () => setLarga(window.innerWidth >= 860);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  return larga;
}

/* ---------------------------------------------------------------------
   Botão voltar do celular + trava do fundo (com contador: janela sobre janela)
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
function voltarHistorico() {
  VOLTAS++;
  if (VOLTAS === 1) setTimeout(() => { const n = VOLTAS; VOLTAS = 0; IGNORAR++; window.history.go(-n); }, 0);
}
function useVoltar(aberto, fechar) {
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

/* ---------------------------------------------------------------------
   Rede de proteção: erro vira aviso, não tela branca
   --------------------------------------------------------------------- */
class Guarda extends Component {
  constructor(p) { super(p); this.state = { erro: false }; }
  static getDerivedStateFromError() { return { erro: true }; }
  componentDidCatch() { /* nada: só não deixa a página ficar branca */ }
  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: C.noite, color: "#fff", textAlign: "center", fontFamily: FONT }}>
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Algo não abriu direito</div>
          <div style={{ opacity: 0.75, marginBottom: 20, lineHeight: 1.5 }}>Atualize a página. Se continuar, me chame no WhatsApp.</div>
          <button onClick={() => window.location.reload()} style={{ padding: "13px 22px", borderRadius: 999, border: "none", background: C.laranja, color: C.noite, fontWeight: 700 }}>
            Atualizar
          </button>
        </div>
      </div>
    );
  }
}

/* ---------------------------------------------------------------------
   Peças visuais
   --------------------------------------------------------------------- */
function Secao({ id, fundo = C.branco, escuro, children, style }) {
  return (
    <section id={id} style={{ position: "relative", overflow: "hidden", background: fundo, color: escuro ? "#fff" : C.tinta,
      padding: "clamp(64px,12vw,112px) 18px", ...style }}>
      <div style={{ position: "relative", maxWidth: LARGURA, margin: "0 auto", minWidth: 0 }}>{children}</div>
    </section>
  );
}

/* "rótulo" com as duas listras do escudo */
function Rotulo({ children, escuro, centro }) {
  return (
    <Surge efeito="lado" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, justifyContent: centro ? "center" : "flex-start" }}>
      <span style={{ display: "flex", gap: 3 }} aria-hidden="true">
        <i style={{ width: 16, height: 6, background: C.laranja, transform: "skewX(-22deg)", borderRadius: 2 }} />
        <i style={{ width: 8, height: 6, background: escuro ? "#fff" : C.azul, transform: "skewX(-22deg)", borderRadius: 2 }} />
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.2, color: escuro ? C.amarelo : C.azul, textTransform: "uppercase" }}>{children}</span>
    </Surge>
  );
}

function Titulo({ children, escuro, centro, style }) {
  return (
    <Surge efeito="cortina" como="h2" style={{ margin: "0 0 16px", fontSize: "clamp(28px,7.4vw,48px)", lineHeight: 1.08, fontWeight: 800,
      letterSpacing: -1, color: escuro ? "#fff" : C.tinta, textAlign: centro ? "center" : "left", ...style }}>
      {children}
    </Surge>
  );
}

function Texto({ children, escuro, centro, style }) {
  return (
    <Surge efeito="foco" atraso={120} como="p" style={{ margin: centro ? "0 auto 14px" : "0 0 14px", fontSize: "clamp(15px,3.9vw,17.5px)", lineHeight: 1.7,
      color: escuro ? "rgba(255,255,255,.8)" : C.cinza, maxWidth: 640, textAlign: centro ? "center" : "left", ...style }}>
      {children}
    </Surge>
  );
}

function Nota({ children, escuro, centro }) {
  return <div style={{ marginTop: 18, fontSize: 12.5, lineHeight: 1.55, color: escuro ? "rgba(255,255,255,.55)" : "#8592AE", textAlign: centro ? "center" : "left" }}>{children}</div>;
}

/* Botões: laranja (principal), contorno e WhatsApp */
function Botao({ children, tipo = "laranja", href, onClick, cheio, grande, icone, style, ...resto }) {
  const estilos = {
    laranja: { background: `linear-gradient(100deg, ${C.laranja}, ${C.laranjaForte})`, color: C.noite, border: "none", animation: "shChama 2.8s ease-out infinite" },
    claro: { background: "rgba(255,255,255,.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,.4)" },
    azul: { background: C.azul, color: "#fff", border: "none" },
    contorno: { background: "transparent", color: C.azul, border: `1.5px solid ${C.azul}` },
    whats: { background: C.whats, color: "#fff", border: "none" },
  }[tipo];
  const s = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, textDecoration: "none",
    padding: grande ? "17px 28px" : "13px 22px", minHeight: grande ? 58 : 50, borderRadius: 999, width: cheio ? "100%" : undefined,
    fontSize: grande ? 16 : 15, fontWeight: 700, letterSpacing: 0.2, whiteSpace: "nowrap", ...estilos, ...style,
  };
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className="sh-toque sh-btn-laranja" style={s} {...resto}>{icone}{children}</a>;
  return <button type="button" onClick={onClick} className="sh-toque sh-btn-laranja" style={s} {...resto}>{icone}{children}</button>;
}

/* Foto de um espaço do catálogo. Sem foto (ou se não carregar), não aparece nada. */
function FotoEspaco({ src, alt, proporcao = "4/3", raio = 26, style, children }) {
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [src]);
  if (!src || falhou) return null;
  const [a, b] = proporcao.split("/").map(Number);
  return (
    <Surge efeito="foco" style={{ position: "relative", borderRadius: raio, overflow: "hidden", background: C.gelo,
      boxShadow: "0 30px 60px rgba(11,31,92,.22)", ...style }}>
      <div style={{ position: "relative", paddingTop: `${(b / a) * 100}%` }}>
        <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFalhou(true)}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {children}
    </Surge>
  );
}

/* as duas listras inclinadas do escudo, deslizando devagar no fundo */
function Listras({ cor = "rgba(255,255,255,.07)", topo = "10%" }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: topo, left: "-30%", width: "160%", height: "clamp(60px,12vw,120px)", background: cor, borderRadius: 999,
        animation: "shListra 9s ease-in-out infinite alternate" }} />
      <div style={{ position: "absolute", top: `calc(${topo} + clamp(110px,20vw,200px))`, left: "-30%", width: "160%", height: "clamp(26px,5vw,52px)",
        background: cor, borderRadius: 999, animation: "shListra 11s ease-in-out -3s infinite alternate" }} />
    </div>
  );
}

/* =====================================================================
   CATÁLOGO
   ===================================================================== */
export default function Catalog() {
  return <Guarda><Vitrine /></Guarda>;
}

function Vitrine() {
  const [bruto, setBruto] = useState(null);
  const [form, setForm] = useState(null);   // null · { tipo, plano }
  const c = useMemo(() => mesclarConfig(bruto), [bruto]);

  useEffect(() => {
    api.carregarCatalogo().then(setBruto);
    api.logCatalogVisit();
  }, []);

  const cotar = (pre) => setForm(pre || {});
  const zap = linkWhats(c.whatsapp, c.msg_geral);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ fontFamily: FONT, background: C.branco, overflow: "hidden" }}>
        <Abertura c={c} cotar={cotar} zap={zap} />
        <Faixa />
        <Sobre c={c} />
        <AShield c={c} />
        <Protecao c={c} cotar={cotar} />
        <ComoFunciona />
        <Assistencia c={c} />
        <SemCNH c={c} />
        <Aplicativo c={c} />
        <Sede c={c} zap={zap} />
        <Final c={c} cotar={cotar} zap={zap} />
        <Rodape c={c} />
      </div>
      <Doca c={c} cotar={cotar} zap={zap} escondida={!!form} />
      <Formulario aberto={!!form} inicial={form || {}} c={c} fechar={() => setForm(null)} />
    </>
  );
}

/* ---------------------------------------------------------------------
   1 · ABERTURA — a lente com a foto do Geovanne
   --------------------------------------------------------------------- */
function LenteFoto({ src, nome, cargo, empresa }) {
  const R = 238;
  const anel = `${nome} · ${cargo} · ${empresa} · `.toUpperCase();
  const marcas = [];
  for (let k = 0; k < 72; k++) {
    const a = (k * 5 * Math.PI) / 180;
    const forte = k % 6 === 0;
    const r1 = 296, r2 = r1 - (forte ? 16 : 8);
    marcas.push(<line key={k} x1={300 + r1 * Math.cos(a)} y1={300 - r1 * Math.sin(a)} x2={300 + r2 * Math.cos(a)} y2={300 - r2 * Math.sin(a)}
      stroke={forte ? C.laranja : "#fff"} strokeOpacity={forte ? 0.95 : 0.35} strokeWidth={forte ? 2.4 : 1.2} />);
  }
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [src]);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 470, margin: "0 auto" }}>
      <div style={{ position: "relative", width: "100%", paddingTop: "100%" }}>
        {/* brilho atrás */}
        <div style={{ position: "absolute", top: "8%", right: "8%", bottom: "8%", left: "8%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(43,91,255,.55), rgba(43,91,255,0) 70%)", filter: "blur(10px)" }} />

        {/* a foto dentro do vidro */}
        <div style={{ position: "absolute", top: "15%", left: "15%", width: "70%", height: "70%", borderRadius: "50%", overflow: "hidden",
          background: `linear-gradient(160deg, ${C.azul}, ${C.marinho})`, WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}>
          {src && !falhou ? (
            <img src={src} alt={`${nome}, ${cargo} da ${empresa}`} fetchpriority="high" decoding="async" onError={() => setFalhou(true)}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 18%",
                animation: "shRespira 14s ease-in-out infinite" }} />
          ) : (
            <img src={LOGO} alt={empresa} style={{ position: "absolute", top: "30%", left: "8%", width: "84%", borderRadius: 12 }} />
          )}
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: "50%",
            background: "radial-gradient(circle at 50% 45%, transparent 58%, rgba(7,18,51,.55) 100%)" }} />
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255,255,255,.22) 0%, rgba(255,255,255,0) 30%)" }} />
        </div>

        <svg viewBox="0 0 600 600" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }} aria-hidden="true">
          <defs>
            <path id="shAnel" d={`M300,300 m-${R},0 a${R},${R} 0 1,1 ${R * 2},0 a${R},${R} 0 1,1 -${R * 2},0`} />
            <linearGradient id="shAro" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={C.amarelo} /><stop offset=".45" stopColor={C.laranja} /><stop offset="1" stopColor={C.laranjaForte} />
            </linearGradient>
          </defs>
          {/* escala girando devagar para um lado */}
          <g style={{ transformOrigin: "300px 300px", animation: "shGira 120s linear infinite" }}>{marcas}</g>
          {/* o nome girando para o outro lado */}
          <g style={{ transformOrigin: "300px 300px", animation: "shGiraVolta 70s linear infinite" }}>
            <text fill="#fff" fillOpacity=".92" fontSize="17" fontFamily="Poppins, sans-serif" fontWeight="600" letterSpacing="4">
              <textPath href="#shAnel" textLength={Math.round(2 * Math.PI * R) - 4} lengthAdjust="spacing">{anel}</textPath>
            </text>
          </g>
          <circle cx="300" cy="300" r="222" fill="none" stroke="#fff" strokeOpacity=".25" />
          {/* aro laranja em dois arcos que giram */}
          <g style={{ transformOrigin: "300px 300px", animation: "shGira 16s linear infinite" }}>
            <circle cx="300" cy="300" r="212" fill="none" stroke="url(#shAro)" strokeWidth="9" strokeLinecap="round"
              strokeDasharray="520 146" />
          </g>
          <circle cx="300" cy="300" r="204" fill="none" stroke={C.noite} strokeOpacity=".6" strokeWidth="2" />
        </svg>
      </div>

      {/* selos flutuando em volta */}
      {[
        { t: "Carro · Moto · Caminhão", i: I.escudo, pos: { top: "4%", left: "-2%" }, atraso: 0 },
        { t: "Assistência 24h", i: I.relogio24, pos: { top: "66%", right: "-3%" }, atraso: 0.8 },
        { t: "Fala direto comigo", i: I.conversa, pos: { bottom: "-1%", left: "3%" }, atraso: 1.6 },
      ].map((s) => (
        <div key={s.t} style={{ position: "absolute", ...s.pos, display: "flex", alignItems: "center", gap: 7, padding: "8px 12px 8px 9px", borderRadius: 999,
          background: "rgba(255,255,255,.96)", color: C.tinta, fontSize: "clamp(10.5px,2.9vw,12.5px)", fontWeight: 700, boxShadow: "0 12px 28px rgba(7,18,51,.35)",
          animation: `shBoia 4.2s ease-in-out ${s.atraso}s infinite`, whiteSpace: "nowrap", maxWidth: "62%" }}>
          <span style={{ display: "flex", color: C.azul, transform: "scale(.78)", margin: "-3px" }}>{s.i || I.escudo}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{s.t}</span>
        </div>
      ))}
    </div>
  );
}
function Abertura({ c, cotar, zap }) {
  const larga = useTelaLarga();
  return (
    <header style={{ position: "relative", overflow: "hidden", color: "#fff",
      background: `radial-gradient(120% 90% at 85% 10%, ${C.azulVivo} 0%, ${C.azul} 35%, ${C.marinho} 75%, ${C.noite} 100%)`,
      padding: "calc(18px + env(safe-area-inset-top,0px)) 18px clamp(56px,10vw,96px)" }}>
      <Listras />
      <div style={{ position: "relative", maxWidth: LARGURA, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <img src={LOGO} alt={c.empresa} width="588" height="330"
            style={{ height: "clamp(46px,12vw,62px)", width: "auto", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.25)" }} />
          <a href={zap} target="_blank" rel="noopener noreferrer" className="sh-toque" aria-label="Falar no WhatsApp"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 999, textDecoration: "none",
              background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.28)", fontSize: 13.5, fontWeight: 600 }}>
            <span style={{ display: "flex", color: C.whats }}>{I.whats}</span>{larga ? foneFmt(c.whatsapp) : "WhatsApp"}
          </a>
        </div>

        <div style={{ display: larga ? "grid" : "block", gridTemplateColumns: "1.05fr .95fr", gap: 40, alignItems: "center", marginTop: larga ? 30 : 26 }}>
          <div style={{ order: larga ? 2 : 1, marginBottom: larga ? 0 : 30, padding: larga ? 0 : "0 4%" }}>
            <LenteFoto src={fotoDoEspaco(c, "abertura")} nome={c.nome} cargo={c.cargo} empresa={c.empresa} />
          </div>
          <div style={{ order: larga ? 1 : 2, minWidth: 0, textAlign: larga ? "left" : "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "8px 14px", borderRadius: 999,
              background: "rgba(247,162,27,.16)", border: "1px solid rgba(247,162,27,.5)", color: C.amarelo, fontSize: 12, fontWeight: 700, letterSpacing: 1.6,
              animation: "shSurge .8s ease .1s both" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.laranja, animation: "shPisca 1.8s ease-in-out infinite" }} />
              {c.cargo.toUpperCase()} · SHIELD
            </div>
            <h1 className="sh-cortina-ja" style={{ margin: "18px 0 0", fontSize: "clamp(40px,11.5vw,76px)", lineHeight: 0.98, fontWeight: 800, letterSpacing: -2 }}>
              {c.nome.split(" ")[0]}<br /><span className="sh-laranja-texto">{c.nome.split(" ").slice(1).join(" ")}</span>
            </h1>
            <p style={{ margin: "20px auto 0", marginLeft: larga ? 0 : "auto", fontSize: "clamp(16.5px,4.4vw,21px)", lineHeight: 1.45, fontWeight: 500, maxWidth: 480,
              color: "rgba(255,255,255,.88)", animation: "shSurge 1s ease .5s both" }}>
              {c.frase}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: larga ? "flex-start" : "center", marginTop: 28,
              animation: "shSurge 1s ease .75s both" }}>
              <Botao grande onClick={() => cotar()} icone={I.escudo}>Quero minha cotação</Botao>
              <Botao grande tipo="claro" href={zap} icone={<span style={{ display: "flex", color: C.whats }}>{I.whats}</span>}>Falar comigo</Botao>
            </div>
            <div style={{ marginTop: 22, fontSize: 13, color: "rgba(255,255,255,.62)", animation: "shSurge 1s ease 1s both" }}>
              Uberlândia e região · atendimento presencial e pelo WhatsApp
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* faixa inclinada com as coberturas correndo */
function Faixa() {
  const itens = ["Roubo e furto", "Colisão", "Assistência 24h", "Fenômenos naturais", "Danos a terceiros", "Guincho", "Carro reserva", "Vidros e faróis"];
  const linha = (
    <div style={{ display: "flex", flex: "0 0 auto" }}>
      {itens.map((t) => (
        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: "0 18px", fontSize: "clamp(14px,3.6vw,17px)", fontWeight: 800,
          letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
          {t}<span style={{ width: 10, height: 10, background: C.noite, transform: "rotate(45deg)", borderRadius: 2 }} />
        </span>
      ))}
    </div>
  );
  return (
    <div aria-hidden="true" style={{ position: "relative", zIndex: 2, margin: "-26px -10px -14px", transform: "rotate(-2.2deg)",
      background: `linear-gradient(90deg, ${C.laranja}, ${C.amarelo}, ${C.laranja})`, color: C.noite, padding: "15px 0",
      boxShadow: "0 14px 34px rgba(247,162,27,.35)", overflow: "hidden" }}>
      <div style={{ display: "flex", width: "max-content", animation: "shFaixa 32s linear infinite" }}>{linha}{linha}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   2 · QUEM SOU EU
   --------------------------------------------------------------------- */
const ICONES_SOBRE = [I.conversa, I.alvo, I.raio, I.bola];

function Sobre({ c }) {
  const larga = useTelaLarga();
  const foto = fotoDoEspaco(c, "sobre");
  return (
    <Secao id="sobre" fundo={C.gelo} style={{ paddingTop: "clamp(84px,14vw,130px)" }}>
      <div style={{ display: larga && foto ? "grid" : "block", gridTemplateColumns: ".85fr 1.15fr", gap: 50, alignItems: "center" }}>
        {foto && (
          <div style={{ position: "relative", marginBottom: larga ? 0 : 34, padding: larga ? 0 : "0 6%" }}>
            <div aria-hidden="true" style={{ position: "absolute", top: "-4%", left: "-4%", width: "70%", height: "70%", borderRadius: 30,
              background: `linear-gradient(135deg, ${C.laranja}, ${C.amarelo})`, transform: "rotate(-6deg)" }} />
            <FotoEspaco src={foto} alt={`${c.nome}`} proporcao="4/5" raio={30} />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <Rotulo>Quem vai cuidar de você</Rotulo>
          <Titulo>Prazer, eu sou o <span style={{ color: C.azul }}>{c.nome.split(" ")[0]}</span></Titulo>
          <Texto>{c.sobre}</Texto>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))", gap: 12, marginTop: 24 }}>
            {c.quadros.map((q, k) => (
              <Surge key={k} efeito="foco" atraso={k * 110} style={{ background: "#fff", borderRadius: 20, padding: "18px 18px 16px",
                border: `1px solid ${C.linha}`, boxShadow: "0 10px 26px rgba(11,31,92,.06)", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 8 }}>
                  <span style={{ flex: "0 0 40px", height: 40, borderRadius: 12, display: "grid", placeItems: "center",
                    background: k % 2 ? "rgba(247,162,27,.16)" : "rgba(18,56,209,.1)", color: k % 2 ? C.laranjaForte : C.azul }}>
                    {ICONES_SOBRE[k % ICONES_SOBRE.length]}
                  </span>
                  <b style={{ fontSize: 15.5, lineHeight: 1.3 }}>{q.t}</b>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: C.cinza }}>{q.d}</div>
              </Surge>
            ))}
          </div>
        </div>
      </div>
    </Secao>
  );
}

/* ---------------------------------------------------------------------
   3 · A SHIELD — a empresa e os cinco motivos
   --------------------------------------------------------------------- */
function AShield({ c }) {
  const larga = useTelaLarga();
  const foto = fotoDoEspaco(c, "shield");
  const trilho = useRef(null);
  const [ativo, setAtivo] = useState(0);
  const aoRolar = () => {
    const el = trilho.current;
    if (!el || !el.children.length) return;
    const passo = el.children[0].getBoundingClientRect().width + 14;
    setAtivo(Math.max(0, Math.min(c.motivos.length - 1, Math.round(el.scrollLeft / passo))));
  };
  const irPara = (k) => {
    const el = trilho.current;
    if (!el || !el.children[k]) return;
    el.scrollTo({ left: el.children[k].offsetLeft - el.children[0].offsetLeft, behavior: "smooth" });
  };

  return (
    <Secao id="shield" fundo={`linear-gradient(170deg, ${C.marinho} 0%, ${C.noite} 100%)`} escuro>
      <Listras cor="rgba(43,91,255,.12)" topo="58%" />
      <div style={{ position: "relative", display: larga && foto ? "grid" : "block", gridTemplateColumns: "1.1fr .9fr", gap: 50, alignItems: "center" }}>
        <div style={{ minWidth: 0, marginBottom: foto && !larga ? 30 : 0 }}>
          <Rotulo escuro>A empresa</Rotulo>
          <Titulo escuro>Shield: feita para você <span className="sh-laranja-texto">dirigir tranquilo</span></Titulo>
          <Texto escuro>
            A Shield Proteção Veicular é uma associação nascida aqui em Uberlândia, com sede na {c.endereco.split("·")[0].trim()}.
            Funciona assim: os associados se unem e, juntos, garantem o suporte quando um imprevisto acontece com qualquer um deles.
          </Texto>
          <Texto escuro>
            Carro, moto ou caminhão: a ideia é dar a quem trabalha e conquistou o seu veículo uma proteção de verdade, com
            atendimento digno, transparente e perto de você.
          </Texto>
        </div>
        {foto && <FotoEspaco src={foto} alt="Shield Proteção Veicular" proporcao="4/3" />}
      </div>

      <div style={{ marginTop: 48 }}>
        <Surge efeito="lado" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: "clamp(20px,5vw,26px)", fontWeight: 800 }}>{c.motivos.length} motivos para ser Shield</div>
          {larga && (
            <div style={{ display: "flex", gap: 8 }}>
              {[[I.esq, -1], [I.dir, 1]].map(([ic, p], k) => (
                <button key={k} onClick={() => irPara(Math.max(0, Math.min(c.motivos.length - 1, ativo + p)))} aria-label={p < 0 ? "Anterior" : "Próximo"}
                  className="sh-toque" style={{ width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center",
                    border: "1px solid rgba(255,255,255,.3)", background: "transparent", color: "#fff" }}>{ic}</button>
              ))}
            </div>
          )}
        </Surge>
        <div ref={trilho} onScroll={aoRolar} className="sh-carrossel">
          {c.motivos.map((m, k) => (
            <div key={k} style={{ flex: `0 0 ${larga ? "calc((100% - 28px) / 3)" : "84%"}`, minWidth: 0, position: "relative", borderRadius: 24,
              padding: "26px 22px 24px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", overflow: "hidden" }}>
              <div aria-hidden="true" style={{ position: "absolute", right: -8, top: -22, fontSize: 112, fontWeight: 800, lineHeight: 1,
                color: "transparent", WebkitTextStroke: "1.5px rgba(247,162,27,.45)" }}>{String(k + 1).padStart(2, "0")}</div>
              <span style={{ display: "inline-grid", placeItems: "center", width: 46, height: 46, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.laranja}, ${C.amarelo})`, color: C.noite, fontWeight: 800, fontSize: 16 }}>
                {String(k + 1).padStart(2, "0")}
              </span>
              <div style={{ position: "relative", fontSize: 18.5, fontWeight: 700, margin: "16px 0 8px", lineHeight: 1.3 }}>{m.t}</div>
              <div style={{ position: "relative", fontSize: 14.5, lineHeight: 1.65, color: "rgba(255,255,255,.75)" }}>{m.d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 7, justifyContent: "center" }}>
          {c.motivos.map((_, k) => (
            <button key={k} onClick={() => irPara(k)} aria-label={`Motivo ${k + 1}`}
              style={{ width: k === ativo ? 26 : 8, height: 8, borderRadius: 999, border: "none", padding: 0,
                background: k === ativo ? C.laranja : "rgba(255,255,255,.28)", transition: "width .3s, background .3s" }} />
          ))}
        </div>
      </div>
    </Secao>
  );
}

/* ---------------------------------------------------------------------
   4 · PROTEÇÃO — a chave Carro / Moto / Caminhão troca foto e planos
   --------------------------------------------------------------------- */
const INTRO_TIPO = {
  carro: {
    titulo: <>Seu carro <span style={{ color: C.azul }}>protegido</span>, do dia a dia à viagem</>,
    texto: "Roubo, colisão, granizo, alagamento: o seu carro protegido contra os imprevistos mais comuns, com guincho e assistência a qualquer hora.",
  },
  moto: {
    titulo: <>Planos <span style={{ color: C.azul }}>especiais</span> para quem vive sobre duas rodas</>,
    texto: "Proteção contra roubo e furto, colisão e fenômenos da natureza, com guincho e assistência 24h quando a estrada aprontar.",
  },
  caminhao: {
    titulo: <>Para quem faz da <span style={{ color: C.azul }}>estrada</span> o seu trabalho</>,
    texto: "Os mesmos planos completos do carro, com guincho de longa distância e assistência 24 horas, porque caminhão parado é prejuízo.",
  },
};

function Protecao({ c, cotar }) {
  const larga = useTelaLarga();
  const [tipo, setTipo] = useState("carro");
  const idx = TIPOS.findIndex((t) => t.v === tipo);
  const dados = PLANOS[tipo];
  const foto = fotoDoEspaco(c, tipo);

  return (
    <Secao id="planos" fundo={C.branco}>
      <div style={{ textAlign: "center" }}>
        <Rotulo centro>Planos Shield</Rotulo>
        <Titulo centro>Qual veículo você quer <span style={{ color: C.azul }}>proteger</span>?</Titulo>
      </div>

      {/* a chave, com o destaque deslizando */}
      <div role="tablist" aria-label="Tipo de veículo" style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3,1fr)",
        maxWidth: 520, margin: "22px auto 0", padding: 6, borderRadius: 999, background: C.gelo, border: `1px solid ${C.linha}` }}>
        <span aria-hidden="true" style={{ position: "absolute", top: 6, bottom: 6, left: `calc(6px + ${idx} * (100% - 12px) / 3)`, width: "calc((100% - 12px) / 3)",
          borderRadius: 999, background: `linear-gradient(135deg, ${C.azul}, ${C.azulVivo})`, boxShadow: "0 8px 22px rgba(18,56,209,.35)",
          transition: "left .45s cubic-bezier(.2,.8,.2,1)" }} />
        {TIPOS.map((t) => (
          <button key={t.v} role="tab" aria-selected={tipo === t.v} onClick={() => setTipo(t.v)}
            style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px 4px", minWidth: 0,
              border: "none", background: "transparent", borderRadius: 999, fontSize: "clamp(13px,3.6vw,15px)", fontWeight: 700,
              color: tipo === t.v ? "#fff" : C.tinta, transition: "color .3s" }}>
            <span style={{ display: "flex", transform: "scale(.85)" }}>{ICONE_TIPO[t.v]}</span>{t.l}
          </button>
        ))}
      </div>

      <div key={tipo} style={{ animation: "shTroca .45s ease" }}>
        <div style={{ display: larga && foto ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 44, alignItems: "center", marginTop: 40 }}>
          {foto && <div style={{ marginBottom: larga ? 0 : 24 }}><FotoEspaco src={foto} alt={`${nomeTipo(tipo)} protegido pela Shield`} proporcao="4/3" /></div>}
          <div style={{ minWidth: 0, textAlign: !foto ? "center" : "left" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "clamp(22px,5.6vw,32px)", lineHeight: 1.15, fontWeight: 800, letterSpacing: -0.6 }}>{INTRO_TIPO[tipo].titulo}</h3>
            <p style={{ margin: !foto ? "0 auto" : 0, fontSize: 16, lineHeight: 1.7, color: C.cinza, maxWidth: 560 }}>{INTRO_TIPO[tipo].texto}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18, justifyContent: !foto ? "center" : "flex-start" }}>
              {dados.planos.map((p) => (
                <span key={p.nome} style={{ padding: "7px 13px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: C.gelo, color: C.azul,
                  border: `1px solid ${C.linha}` }}>Plano {p.nome}</span>
              ))}
            </div>
          </div>
        </div>

        <CarrosselPlanos planos={dados.planos} assistencia={dados.assistencia} tipo={tipo} cotar={cotar} />
      </div>

      <Nota centro>
        Coberturas, limites e condições conforme o plano contratado e o regulamento da associação.
        Consulte as condições específicas para cada tipo de veículo.
      </Nota>
    </Secao>
  );
}

function CarrosselPlanos({ planos, assistencia, tipo, cotar }) {
  const larga = useTelaLarga();
  const trilho = useRef(null);
  const [ativo, setAtivo] = useState(0);
  const aoRolar = () => {
    const el = trilho.current;
    if (!el || !el.children.length) return;
    const passo = el.children[0].getBoundingClientRect().width + 14;
    setAtivo(Math.max(0, Math.min(planos.length - 1, Math.round(el.scrollLeft / passo))));
  };
  const lado = larga || planos.length < 3;
  return (
    <>
      <div ref={trilho} onScroll={aoRolar} className={lado ? "" : "sh-carrossel"}
        style={lado ? { display: "grid", gridTemplateColumns: larga ? `repeat(${planos.length}, minmax(0,1fr))` : "1fr", gap: 18, marginTop: 34,
          maxWidth: planos.length < 3 && larga ? 780 : undefined, marginLeft: "auto", marginRight: "auto" } : { marginTop: 30 }}>
        {planos.map((p, k) => (
          <div key={p.nome} style={lado ? { minWidth: 0 } : { flex: "0 0 86%", minWidth: 0 }}>
            <CartaoPlano p={p} assistencia={assistencia} tipo={tipo} cotar={cotar} atraso={k * 120} />
          </div>
        ))}
      </div>
      {!lado && (
        <div style={{ display: "flex", gap: 7, justifyContent: "center" }}>
          {planos.map((p, k) => (
            <span key={p.nome} style={{ width: k === ativo ? 26 : 8, height: 8, borderRadius: 999,
              background: k === ativo ? C.azul : C.linha, transition: "width .3s, background .3s" }} />
          ))}
        </div>
      )}
    </>
  );
}

function CartaoPlano({ p, assistencia, tipo, cotar, atraso }) {
  const [verAssist, setVerAssist] = useState(false);
  const top = !!p.fita;
  const corpo = (
    <div style={{ position: "relative", height: "100%", borderRadius: top ? 26 : 28, padding: "26px 22px 22px", display: "flex", flexDirection: "column",
      background: top ? `linear-gradient(165deg, ${C.marinho}, ${C.noite})` : "#fff", color: top ? "#fff" : C.tinta,
      border: top ? "none" : `1px solid ${C.linha}`, boxShadow: top ? "none" : "0 18px 40px rgba(11,31,92,.08)" }}>
      {top && (
        <span style={{ alignSelf: "flex-start", marginBottom: 12, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 1.2,
          background: `linear-gradient(90deg, ${C.laranja}, ${C.amarelo})`, color: C.noite }}>{p.fita}</span>
      )}
      <div style={{ fontSize: 13, fontWeight: 600, color: top ? C.amarelo : C.laranjaForte, letterSpacing: 1 }}>PLANO</div>
      <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>{p.nome}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: top ? "rgba(255,255,255,.72)" : C.cinza, margin: "6px 0 18px" }}>{p.resumo}</div>

      <div style={{ display: "grid", gap: 9 }}>
        {p.coberturas.map((t) => (
          <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.45, minWidth: 0 }}>
            <span style={{ flex: "0 0 20px", height: 20, borderRadius: "50%", display: "grid", placeItems: "center", marginTop: 1,
              background: top ? "rgba(255,255,255,.14)" : "rgba(18,56,209,.1)", color: top ? "#fff" : C.azul }}>
              <span style={{ display: "flex", transform: "scale(.62)" }}>{I.check}</span>
            </span>
            <span style={{ minWidth: 0, color: top ? "rgba(255,255,255,.88)" : C.tinta }}>{t}</span>
          </div>
        ))}
        {p.extras.map((t) => (
          <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.45, fontWeight: 700, minWidth: 0 }}>
            <span style={{ flex: "0 0 20px", height: 20, borderRadius: "50%", display: "grid", placeItems: "center", marginTop: 1,
              background: `linear-gradient(135deg, ${C.laranja}, ${C.amarelo})`, color: C.noite }}>
              <span style={{ display: "flex", transform: "scale(.62)" }}>{I.mais}</span>
            </span>
            <span style={{ minWidth: 0, color: top ? C.amarelo : C.laranjaForte }}>{t}</span>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => setVerAssist((v) => !v)} aria-expanded={verAssist}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, width: "100%", marginTop: 18, padding: "12px 14px",
          borderRadius: 14, border: `1px dashed ${top ? "rgba(255,255,255,.3)" : C.linha}`, background: "transparent", color: top ? "#fff" : C.azul,
          fontSize: 13.5, fontWeight: 700, textAlign: "left" }}>
        <span>+ Assistência 24h ({assistencia.length} serviços)</span>
        <span style={{ display: "flex", transform: verAssist ? "rotate(180deg)" : "none", transition: "transform .3s" }}>{I.baixo}</span>
      </button>
      {verAssist && (
        <div style={{ display: "grid", gap: 6, padding: "12px 4px 0", animation: "shTroca .3s ease" }}>
          {assistencia.map((t) => (
            <div key={t} style={{ fontSize: 13, lineHeight: 1.45, color: top ? "rgba(255,255,255,.75)" : C.cinza, display: "flex", gap: 8 }}>
              <span style={{ color: C.laranja }}>•</span>{t}
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />
      <Botao tipo={top ? "laranja" : "azul"} cheio onClick={() => cotar({ tipo, plano: p.nome })} style={{ marginTop: 20, animation: top ? undefined : "none" }}>
        Quero o {p.nome}
      </Botao>
    </div>
  );

  return (
    <Surge efeito="foco" atraso={atraso} className="sh-plano" style={{ height: "100%" }}>
      {top ? (
        /* borda laranja girando em volta do plano mais completo */
        <div style={{ position: "relative", height: "100%", borderRadius: 28, padding: 2.5, overflow: "hidden",
          boxShadow: "0 26px 60px rgba(11,31,92,.35)", WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}>
          <span aria-hidden="true" style={{ position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%",
            background: `conic-gradient(from 0deg, ${C.laranja}, transparent 30%, ${C.azulVivo} 50%, transparent 70%, ${C.amarelo})`,
            animation: "shGira 5s linear infinite" }} />
          {corpo}
        </div>
      ) : corpo}
    </Surge>
  );
}

/* ---------------------------------------------------------------------
   5 · COMO FUNCIONA — a linha enche conforme a pessoa rola
   --------------------------------------------------------------------- */
function ComoFunciona() {
  const larga = useTelaLarga();
  const [ref, visto] = useVisto();
  const passos = [
    { t: "Você me chama", d: "Pelo formulário deste catálogo ou direto no WhatsApp. Com a placa, eu já começo." },
    { t: "Cotação explicada", d: "Monto os valores e te mostro a diferença entre os planos, com calma e sem letra miúda." },
    { t: "Vistoria e adesão", d: "Eu te acompanho em cada etapa, do cadastro até a proteção ficar ativa." },
    { t: "Protegido e acompanhado", d: "Depois da adesão eu continuo aqui. Precisou, é só me chamar." },
  ];
  return (
    <Secao id="como" fundo={C.gelo}>
      <div style={{ textAlign: "center" }}>
        <Rotulo centro>Simples assim</Rotulo>
        <Titulo centro>Da cotação à <span style={{ color: C.azul }}>proteção ativa</span></Titulo>
      </div>
      <div ref={ref} style={{ position: "relative", marginTop: 40, display: "grid", gridTemplateColumns: larga ? "repeat(4,1fr)" : "1fr", gap: larga ? 20 : 26 }}>
        {/* a linha que liga os passos e vai enchendo */}
        <div aria-hidden="true" style={larga
          ? { position: "absolute", top: 27, left: "12.5%", right: "12.5%", height: 4, borderRadius: 4, background: C.linha }
          : { position: "absolute", top: 20, bottom: 20, left: 26, width: 4, borderRadius: 4, background: C.linha }}>
          <div style={{ borderRadius: 4, background: `linear-gradient(90deg, ${C.azul}, ${C.laranja})`,
            ...(larga ? { height: "100%", width: visto ? "100%" : "0%", transition: "width 2.2s cubic-bezier(.4,0,.2,1) .2s" }
              : { width: "100%", height: visto ? "100%" : "0%", transition: "height 2.2s cubic-bezier(.4,0,.2,1) .2s",
                background: `linear-gradient(180deg, ${C.azul}, ${C.laranja})` }) }} />
        </div>
        {passos.map((p, k) => (
          <div key={p.t} style={{ position: "relative", display: larga ? "block" : "flex", gap: 16, textAlign: larga ? "center" : "left", minWidth: 0,
            opacity: visto ? 1 : 0, transition: `opacity .6s ease ${0.3 + k * 0.45}s` }}>
            <span style={{ flex: "0 0 56px", width: 56, height: 56, margin: larga ? "0 auto 14px" : 0, borderRadius: 18, display: "grid", placeItems: "center",
              background: k === passos.length - 1 ? `linear-gradient(135deg, ${C.laranja}, ${C.amarelo})` : `linear-gradient(135deg, ${C.azul}, ${C.azulVivo})`,
              color: k === passos.length - 1 ? C.noite : "#fff", fontSize: 20, fontWeight: 800, transform: "rotate(-8deg)",
              boxShadow: "0 12px 26px rgba(18,56,209,.25)", position: "relative" }}>
              <span style={{ transform: "rotate(8deg)" }}>{k + 1}</span>
            </span>
            <div style={{ minWidth: 0, paddingTop: larga ? 0 : 4 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{p.t}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: C.cinza, marginTop: 4 }}>{p.d}</div>
            </div>
          </div>
        ))}
      </div>
    </Secao>
  );
}

/* ---------------------------------------------------------------------
   6 · ASSISTÊNCIA 24H — o relógio com o ponteiro girando
   --------------------------------------------------------------------- */
function Relogio24() {
  return (
    <div style={{ position: "relative", width: "min(250px, 62vw)", margin: "0 auto" }}>
      <div style={{ position: "relative", paddingTop: "100%" }}>
        <svg viewBox="0 0 200 200" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} aria-hidden="true">
          <circle cx="100" cy="100" r="94" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" />
          {Array.from({ length: 24 }).map((_, k) => {
            const a = (k * 15 * Math.PI) / 180;
            const forte = k % 6 === 0;
            const r1 = 88, r2 = forte ? 74 : 81;
            return <line key={k} x1={100 + r1 * Math.sin(a)} y1={100 - r1 * Math.cos(a)} x2={100 + r2 * Math.sin(a)} y2={100 - r2 * Math.cos(a)}
              stroke={forte ? C.laranja : "rgba(255,255,255,.45)"} strokeWidth={forte ? 3 : 1.5} strokeLinecap="round" />;
          })}
          <g style={{ transformOrigin: "100px 100px", animation: "shGira 6s linear infinite" }}>
            <path d="M100 100 L100 30" stroke={C.laranja} strokeWidth="4" strokeLinecap="round" />
            <path d="M100 100 L100 30 A70 70 0 0 0 39.4 65" fill="rgba(247,162,27,.16)" stroke="none" />
          </g>
          <g style={{ transformOrigin: "100px 100px", animation: "shGira 72s linear infinite" }}>
            <path d="M100 100 L148 100" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          </g>
          <circle cx="100" cy="100" r="7" fill={C.laranja} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "18%", textAlign: "center", fontSize: "clamp(26px,7vw,34px)", fontWeight: 800, color: "#fff" }}>24h</div>
      </div>
    </div>
  );
}

function Assistencia({ c }) {
  const larga = useTelaLarga();
  const foto = fotoDoEspaco(c, "assistencia");
  const servicos = [
    { i: I.guincho, t: "Guincho" }, { i: I.combustivel, t: "Pane seca" }, { i: I.bateria, t: "Carga de bateria" },
    { i: I.pneu, t: "Troca de pneu" }, { i: I.chave, t: "Chaveiro" }, { i: I.cama, t: "Hospedagem" },
    { i: I.taxi, t: "Táxi ou Uber" }, { i: I.casa, t: "Retorno ao domicílio" },
  ];
  return (
    <Secao id="assistencia" fundo={`radial-gradient(110% 80% at 50% 0%, ${C.azul} 0%, ${C.marinho} 50%, ${C.noite} 100%)`} escuro>
      <div style={{ display: larga ? "grid" : "block", gridTemplateColumns: ".8fr 1.2fr", gap: 50, alignItems: "center" }}>
        <Surge efeito="foco" style={{ marginBottom: larga ? 0 : 30 }}><Relogio24 /></Surge>
        <div style={{ minWidth: 0 }}>
          <Rotulo escuro>Assistência 24 horas</Rotulo>
          <Titulo escuro>Imprevisto não <span className="sh-laranja-texto">marca hora</span></Titulo>
          <Texto escuro>
            Pneu furado de madrugada, bateria arriada no estacionamento, pane na estrada: a assistência da Shield atende
            24 horas por dia, todos os dias. Precisou, é só ligar ou abrir o aplicativo.
          </Texto>
          <a href={telefone0800(c.central)} className="sh-toque"
            style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 8, padding: "12px 20px 12px 12px", borderRadius: 18, textDecoration: "none",
              background: "#fff", color: C.tinta, boxShadow: "0 14px 30px rgba(0,0,0,.25)" }}>
            <span style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.laranja}, ${C.amarelo})`, color: C.noite }}>{I.telefone}</span>
            <span><span style={{ display: "block", fontSize: 12, color: C.cinza, fontWeight: 600 }}>Central Shield</span>
              <b style={{ fontSize: 19 }}>{c.central}</b></span>
          </a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(46%,150px),1fr))", gap: 12, marginTop: 40 }}>
        {servicos.map((s, k) => (
          <Surge key={s.t} efeito="foco" atraso={k * 70} style={{ display: "flex", alignItems: "center", gap: 11, padding: "15px 14px", borderRadius: 18, minWidth: 0,
            background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.13)" }}>
            <span style={{ flex: "0 0 auto", color: C.amarelo, display: "flex" }}>{s.i}</span>
            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, minWidth: 0 }}>{s.t}</span>
          </Surge>
        ))}
      </div>
      {foto && <FotoEspaco src={foto} alt="Assistência 24h Shield" proporcao="16/9" style={{ marginTop: 26 }} />}
      <Nota escuro>Serviços e limites de cada assistência conforme o plano contratado e o tipo de veículo.</Nota>
    </Secao>
  );
}

/* ---------------------------------------------------------------------
   7 · APLICATIVO SHIELD
   --------------------------------------------------------------------- */
function Aplicativo({ c }) {
  const larga = useTelaLarga();
  const foto = fotoDoEspaco(c, "app");
  const recursos = [
    { i: I.relogio24, t: "Assistência 24h", d: "Acione a assistência direto pelo celular." },
    { i: I.boleto, t: "Mensalidades", d: "Veja se está tudo em dia e o seu histórico." },
    { i: I.doc, t: "Documentos", d: "Os documentos da sua proteção sempre à mão." },
    { i: I.alerta, t: "Furto e roubo", d: "Um caminho rápido para avisar se acontecer." },
    { i: I.ferramenta, t: "Oficinas", d: "Encontre as oficinas da rede." },
    { i: I.presente, t: "Vantagens", d: "Benefícios e indicação de amigos." },
  ];
  return (
    <Secao id="app" fundo={C.branco}>
      <div style={{ display: larga && foto ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "center" }}>
        <div style={{ minWidth: 0 }}>
          <Rotulo>Aplicativo do associado</Rotulo>
          <Titulo>A Shield na palma da sua <span style={{ color: C.azul }}>mão</span></Titulo>
          <Texto>Como associado, você tem um aplicativo completo para acompanhar tudo sem precisar ligar para ninguém.</Texto>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 10, marginTop: 20 }}>
            {recursos.map((r, k) => (
              <Surge key={r.t} efeito="lado" atraso={k * 80} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 14, borderRadius: 18,
                background: C.gelo, minWidth: 0 }}>
                <span style={{ flex: "0 0 auto", color: C.azul, display: "flex" }}>{r.i}</span>
                <span style={{ minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: 14.5 }}>{r.t}</b>
                  <span style={{ fontSize: 13, color: C.cinza, lineHeight: 1.5 }}>{r.d}</span>
                </span>
              </Surge>
            ))}
          </div>
          {(c.link_android || c.link_iphone) && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
              {c.link_android && <Botao tipo="contorno" href={c.link_android} icone={I.play} style={{ animation: "none" }}>Google Play</Botao>}
              {c.link_iphone && <Botao tipo="contorno" href={c.link_iphone} icone={I.apple} style={{ animation: "none" }}>App Store</Botao>}
            </div>
          )}
        </div>
        {foto && (
          <div style={{ position: "relative", marginTop: larga ? 0 : 34, padding: larga ? "0 4%" : "0 4%" }}>
            <div aria-hidden="true" style={{ position: "absolute", top: "8%", left: "10%", right: "10%", bottom: "8%", borderRadius: "50%",
              background: `radial-gradient(circle, rgba(43,91,255,.35), transparent 70%)`, filter: "blur(20px)" }} />
            <div style={{ animation: "shBoia 6s ease-in-out infinite" }}>
              <FotoEspaco src={foto} alt="Aplicativo Shield" proporcao="4/5" raio={28} style={{ background: C.noite }} />
            </div>
          </div>
        )}
      </div>
    </Secao>
  );
}

/* ---------------------------------------------------------------------
   8 · A SEDE — a localização dentro da lente (mecanismo 17.10 da Vértice,
   refeito em azul e laranja)
   --------------------------------------------------------------------- */
function MapaDesenhado() {
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} aria-hidden="true">
      <rect width="400" height="400" fill="#0E2470" />
      <g stroke="#1C3A9E" strokeWidth="14" fill="none" strokeLinecap="round">
        <path d="M-20 250 C80 230 160 210 420 160" />
        <path d="M120 -20 C140 120 170 260 150 420" />
        <path d="M-20 90 C120 110 260 70 420 100" strokeWidth="9" />
        <path d="M260 -20 C250 120 290 260 330 420" strokeWidth="9" />
      </g>
      <rect x="168" y="168" width="118" height="78" rx="10" fill="#112C86" stroke={C.laranja} strokeOpacity=".5" />
      <text x="227" y="212" textAnchor="middle" fill={C.amarelo} fillOpacity=".8" fontFamily="Poppins, sans-serif" fontSize="10" letterSpacing="2.5">SHIELD</text>
    </svg>
  );
}

function LenteMapa({ c, busca }) {
  const [ref, visto] = useVisto();
  const [carregou, setCarregou] = useState(false);
  const src = `https://www.google.com/maps?q=${encodeURIComponent(busca)}&z=16&output=embed`;
  const R = 238;
  const anel = `${c.empresa} · ${c.endereco} · ${c.bairro} · `.toUpperCase();
  const marcas = [];
  for (let k = 0; k < 120; k++) {
    const a = (k * 3 * Math.PI) / 180;
    const forte = k % 10 === 0, media = k % 5 === 0;
    const r1 = 297, r2 = r1 - (forte ? 16 : media ? 11 : 6);
    marcas.push(<line key={k} x1={300 + r1 * Math.cos(a)} y1={300 - r1 * Math.sin(a)} x2={300 + r2 * Math.cos(a)} y2={300 - r2 * Math.sin(a)}
      stroke={forte ? C.laranja : C.azulClaro} strokeOpacity={forte ? 0.95 : media ? 0.6 : 0.3} strokeWidth={forte ? 1.8 : 1} />);
  }
  return (
    <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: 470, margin: "0 auto" }}>
      <div style={{ position: "relative", width: "100%", paddingTop: "100%" }}>
        <div style={{ position: "absolute", top: "6%", right: "6%", bottom: "6%", left: "6%", borderRadius: "50%",
          boxShadow: "0 0 120px rgba(43,91,255,.35), 0 40px 80px rgba(0,0,0,.45)" }} />
        <div style={{ position: "absolute", top: "15%", left: "15%", width: "70%", height: "70%", borderRadius: "50%", overflow: "hidden",
          background: "#0E2470", WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}>
          <MapaDesenhado />
          {visto && (
            <iframe title={`Mapa: ${c.empresa}`} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" tabIndex={-1}
              onLoad={() => setCarregou(true)}
              style={{ position: "absolute", top: "-20%", left: "-20%", width: "140%", height: "140%", border: 0, pointerEvents: "none",
                opacity: carregou ? 1 : 0, transition: "opacity 1.2s ease",
                filter: "grayscale(1) sepia(1) hue-rotate(185deg) saturate(2.4) brightness(.62) contrast(1.15)" }} />
          )}
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: "50%",
            background: "radial-gradient(circle at 50% 50%, transparent 52%, rgba(7,18,51,.8) 100%)" }} />
          <div style={{ position: "absolute", top: "50%", left: "8%", right: "8%", height: 1, background: "rgba(255,201,77,.25)" }} />
          <div style={{ position: "absolute", left: "50%", top: "8%", bottom: "8%", width: 1, background: "rgba(255,201,77,.25)" }} />
        </div>
        <svg viewBox="0 0 600 600" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }} aria-hidden="true">
          <defs>
            <path id="shAnelMapa" d={`M300,300 m-${R},0 a${R},${R} 0 1,1 ${R * 2},0 a${R},${R} 0 1,1 -${R * 2},0`} />
            <linearGradient id="shAroMapa" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={C.amarelo} /><stop offset=".5" stopColor={C.laranja} /><stop offset="1" stopColor={C.laranjaForte} />
            </linearGradient>
          </defs>
          <circle cx="300" cy="300" r="298" fill="none" stroke={C.azulClaro} strokeOpacity=".3" />
          {marcas}
          <g style={{ transformOrigin: "300px 300px", animation: "shGira 90s linear infinite" }}>
            <text fill="#fff" fillOpacity=".85" fontSize="14" fontFamily="Poppins, sans-serif" fontWeight="600" letterSpacing="3">
              <textPath href="#shAnelMapa" textLength={Math.round(2 * Math.PI * R) - 4} lengthAdjust="spacing">{anel}</textPath>
            </text>
          </g>
          <circle cx="300" cy="300" r="229" fill="none" stroke={C.azulClaro} strokeOpacity=".35" />
          <circle cx="300" cy="300" r="216" fill="none" stroke="url(#shAroMapa)" strokeWidth="10" />
          <circle cx="300" cy="300" r="210" fill="none" stroke={C.noite} strokeOpacity=".7" strokeWidth="2" />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", pointerEvents: "none" }}>
          {[0, 1].map((k) => (
            <span key={k} style={{ position: "absolute", top: 0, left: 0, width: 70, height: 70, borderRadius: "50%", border: `1.5px solid ${C.amarelo}`,
              animation: `shOnda 2.6s ease-out ${k * 1.3}s infinite` }} />
          ))}
          {/* pino em forma de escudo */}
          <svg viewBox="0 0 56 70" width="46" height="58" style={{ position: "absolute", left: -23, top: -56, filter: "drop-shadow(0 8px 10px rgba(0,0,0,.5))" }}>
            <path d="M28 2l24 9v18c0 17-11 30-24 39C15 59 4 46 4 29V11z" fill={C.laranja} stroke={C.noite} strokeWidth="2.4" />
            <path d="M18 31l7 7 13-14" fill="none" stroke={C.noite} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <a href={linkMapa(busca)} target="_blank" rel="noopener noreferrer" aria-label={`Abrir a localização da ${c.empresa} no Google Maps`}
          style={{ position: "absolute", top: "15%", left: "15%", width: "70%", height: "70%", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: "3%", right: "-1%", display: "flex", alignItems: "center", gap: 8, padding: "8px 13px", borderRadius: 999,
          background: "#fff", color: C.tinta, fontSize: 12.5, fontWeight: 700, boxShadow: "0 10px 24px rgba(0,0,0,.3)" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: C.whats, animation: "shPisca 1.8s infinite" }} />
          Central 24h
        </div>
      </div>
    </div>
  );
}

function Sede({ c, zap }) {
  const larga = useTelaLarga();
  const busca = `${c.endereco.replace(/·/g, ",")}, ${c.bairro.replace(/·/g, ",").replace(/–/g, "-")}`;
  return (
    <Secao id="sede" fundo={`linear-gradient(180deg, ${C.noite}, ${C.marinho})`} escuro>
      <div style={{ display: "grid", gridTemplateColumns: larga ? "1fr 1fr" : "1fr", gap: larga ? 60 : 40, alignItems: "center" }}>
        <div style={{ order: larga ? 2 : 1 }}><Surge efeito="foco"><LenteMapa c={c} busca={busca} /></Surge></div>
        <div style={{ order: larga ? 1 : 2, minWidth: 0 }}>
          <Rotulo escuro>Onde estamos</Rotulo>
          <Titulo escuro>Uma sede de verdade, <span className="sh-laranja-texto">aqui em Uberlândia</span></Titulo>
          <Surge efeito="foco" atraso={100} style={{ display: "flex", gap: 14, alignItems: "flex-start", margin: "6px 0 24px" }}>
            <span style={{ color: C.laranja, marginTop: 2, display: "flex" }}>{I.mapa}</span>
            <div style={{ fontSize: "clamp(17px,4.4vw,20px)", lineHeight: 1.5 }}>{c.endereco}<br />
              <span style={{ color: "rgba(255,255,255,.65)" }}>{c.bairro}</span></div>
          </Surge>
          <Texto escuro>
            Prefere conversar pessoalmente? Me avise pelo WhatsApp e combinamos um horário na sede. Se for mais prático,
            faço todo o atendimento pelo celular.
          </Texto>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <Botao href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(busca)}`} icone={I.rota} style={{ animation: "none" }}>Como chegar</Botao>
            <Botao tipo="claro" href={zap} icone={<span style={{ display: "flex", color: C.whats }}>{I.whats}</span>}>WhatsApp</Botao>
            {c.instagram && <Botao tipo="claro" href={linkInstagram(c.instagram)} icone={I.insta}>Instagram</Botao>}
          </div>
        </div>
      </div>
    </Secao>
  );
}

/* ---------------------------------------------------------------------
   9 · ENCERRAMENTO
   --------------------------------------------------------------------- */
function Final({ c, cotar, zap }) {
  const larga = useTelaLarga();
  const foto = fotoDoEspaco(c, "final");
  const contatos = [
    { i: I.whats, t: foneFmt(c.whatsapp), s: "WhatsApp e ligação", href: zap, cor: C.whats },
    c.instagram && { i: I.insta, t: `@${c.instagram.replace(/^@/, "")}`, s: "Instagram", href: linkInstagram(c.instagram), cor: "#D6249F" },
    { i: I.telefone, t: c.central, s: "Central Shield 24h", href: telefone0800(c.central), cor: C.laranjaForte },
  ].filter(Boolean);
  return (
    <Secao id="cotacao" fundo={C.gelo}>
      <div style={{ position: "relative", borderRadius: 34, overflow: "hidden", padding: "clamp(26px,6vw,54px)",
        background: `linear-gradient(135deg, ${C.azul} 0%, ${C.marinho} 70%)`, color: "#fff", boxShadow: "0 40px 80px rgba(11,31,92,.3)" }}>
        <Listras cor="rgba(255,255,255,.06)" topo="20%" />
        <div style={{ position: "relative", display: larga && foto ? "grid" : "block", gridTemplateColumns: "1.2fr .8fr", gap: 40, alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <Rotulo escuro>Vamos conversar?</Rotulo>
            <Titulo escuro>Seu veículo protegido.<br /><span className="sh-laranja-texto">Você tranquilo.</span></Titulo>
            <Texto escuro>
              A cotação é rápida, sem compromisso e explicada do começo ao fim. Me conte qual é o seu veículo e eu te mostro o plano
              que faz sentido para você.
            </Texto>
            <div style={{ marginTop: 22 }}><Botao grande cheio={!larga} onClick={() => cotar()} icone={I.escudo}>Quero minha cotação</Botao></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 10, marginTop: 26 }}>
              {contatos.map((k) => (
                <a key={k.s} href={k.href} target="_blank" rel="noopener noreferrer" className="sh-toque"
                  style={{ display: "flex", alignItems: "center", gap: 11, padding: 12, borderRadius: 16, textDecoration: "none",
                    background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.16)", minWidth: 0 }}>
                  <span style={{ flex: "0 0 40px", height: 40, borderRadius: 12, display: "grid", placeItems: "center", background: "#fff", color: k.cor }}>{k.i}</span>
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: "block", fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.t}</b>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>{k.s}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
          {foto && (
            <div style={{ marginTop: larga ? 0 : 30 }}>
              <FotoEspaco src={foto} alt={c.nome} proporcao="3/4" raio={26} style={{ border: "4px solid rgba(255,255,255,.9)" }}>
                <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, padding: "10px 14px", borderRadius: 16, background: "rgba(7,18,51,.78)",
                  backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", color: "#fff" }}>
                  <b style={{ display: "block", fontSize: 15 }}>{c.nome}</b>
                  <span style={{ fontSize: 12.5, color: C.amarelo, fontWeight: 600 }}>{c.cargo} · Shield</span>
                </div>
              </FotoEspaco>
            </div>
          )}
        </div>
      </div>
    </Secao>
  );
}

/* ---------------------------------------------------------------------
   AVISO · proteção para quem não tem CNH
   --------------------------------------------------------------------- */
function SemCNH({ c }) {
  const larga = useTelaLarga();
  const link = linkWhats(c.whatsapp, "Olá, Geovanne! Quero saber como funciona a proteção veicular para quem não tem CNH.");
  return (
    <Secao id="sem-cnh" fundo={C.gelo} style={{ paddingTop: "clamp(48px,9vw,80px)", paddingBottom: "clamp(48px,9vw,80px)" }}>
      <Surge efeito="foco">
        <div style={{ position: "relative", borderRadius: 30, overflow: "hidden", background: C.branco, border: `1.5px solid ${C.linha}`,
          boxShadow: "0 24px 56px rgba(11,31,92,.12)", padding: "clamp(22px,5vw,44px)",
          display: "grid", gridTemplateColumns: larga ? "auto 1fr auto" : "1fr", gap: larga ? 36 : 20, alignItems: "center" }}>
          <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 7, background: `linear-gradient(180deg, ${C.laranja}, ${C.laranjaForte})` }} />
          <span style={{ width: 72, height: 72, borderRadius: 22, display: "grid", placeItems: "center", color: "#fff",
            background: `linear-gradient(135deg, ${C.azul}, ${C.marinho})`, boxShadow: "0 14px 30px rgba(18,56,209,.3)" }}>
            <span style={{ transform: "scale(1.5)", display: "flex" }}>{I.carro}</span>
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.2, color: C.azul, textTransform: "uppercase", marginBottom: 8 }}>Informação importante</div>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(22px,5.6vw,32px)", lineHeight: 1.15, fontWeight: 800, letterSpacing: -0.5, color: C.tinta }}>
              Não tem CNH? <span className="sh-laranja-texto">Não se preocupe!</span>
            </h2>
            <p style={{ margin: "0 0 10px", fontSize: "clamp(15px,3.9vw,17px)", lineHeight: 1.65, color: C.cinza }}>
              A Shield Proteção Veicular também protege veículos de associados que não possuem CNH.
            </p>
            <p style={{ margin: 0, fontSize: "clamp(14px,3.7vw,16px)", lineHeight: 1.65, color: C.tinta }}>
              <b>Existem condições e regras específicas para essa situação.</b> Consulte o regulamento da Shield e fale comigo,
              o Geovanne, seu consultor: eu te explico direitinho como funciona a proteção para quem não possui CNH.
            </p>
          </div>
          <div><Botao href={link} tipo="whats" cheio={!larga} icone={I.whats} style={{ animation: "none" }}>Falar com o Geovanne</Botao></div>
        </div>
      </Surge>
    </Secao>
  );
}

function Rodape({ c }) {
  return (
    <footer style={{ background: C.noite, color: "rgba(255,255,255,.66)", textAlign: "center",
      padding: "46px 18px calc(120px + env(safe-area-inset-bottom,0px))" }}>
      <img src={LOGO} alt={c.empresa} style={{ height: 54, width: "auto", margin: "0 auto", borderRadius: 10 }} />
      <div style={{ fontSize: 13, lineHeight: 1.65, maxWidth: 620, margin: "18px auto 0" }}>
        {c.nome} · {c.cargo} da {c.empresa}. A Shield é uma associação de proteção veicular: coberturas,
        limites e condições conforme o plano contratado e o regulamento da associação.
      </div>
      <div style={{ fontSize: 12.5, marginTop: 22, color: "rgba(255,255,255,.5)" }}>
        Programa feito por <b style={{ color: "rgba(255,255,255,.85)" }}>{CREDITO_NOME}</b> — {CREDITO_FONE}
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------------
   Barra fixa embaixo: aparece depois da abertura (pelo portal, para
   nenhum pai com animação prender ela no meio da página)
   --------------------------------------------------------------------- */
function Doca({ c, cotar, zap, escondida }) {
  const [mostra, setMostra] = useState(false);
  useEffect(() => {
    const ver = () => setMostra(window.scrollY > Math.min(520, window.innerHeight * 0.7));
    ver();
    window.addEventListener("scroll", ver, { passive: true });
    return () => window.removeEventListener("scroll", ver);
  }, []);
  const ativa = mostra && !escondida;
  const foto = fotoDoEspaco(c, "abertura");
  return createPortal(
    <div style={{ position: "fixed", left: 12, right: 12, bottom: "calc(12px + env(safe-area-inset-bottom,0px))", zIndex: 90, display: "flex", justifyContent: "center",
      pointerEvents: "none", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", maxWidth: 520, padding: 8, borderRadius: 999,
        background: "rgba(7,18,51,.92)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.14)",
        boxShadow: "0 18px 40px rgba(7,18,51,.45)", color: "#fff",
        opacity: ativa ? 1 : 0, transform: ativa ? "none" : "translateY(120%)", pointerEvents: ativa ? "auto" : "none",
        transition: "opacity .35s ease, transform .45s cubic-bezier(.2,.8,.2,1)" }}>
        <span style={{ flex: "0 0 44px", width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: `2px solid ${C.laranja}`, background: C.azul }}>
          {foto && <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 18%" }} />}
        </span>
        <span style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <b style={{ display: "block", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nome.split(" ")[0]}</b>
          <span style={{ display: "block", fontSize: 11.5, color: C.amarelo, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.cargo}</span>
        </span>
        <a href={zap} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp" className="sh-toque"
          style={{ flex: "0 0 44px", width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", background: C.whats, color: "#fff" }}>{I.whats}</a>
        <button onClick={() => cotar()} className="sh-toque"
          style={{ flex: "0 0 auto", height: 44, padding: "0 18px", borderRadius: 999, border: "none", fontWeight: 700, fontSize: 14,
            background: `linear-gradient(100deg, ${C.laranja}, ${C.laranjaForte})`, color: C.noite }}>Cotação</button>
      </div>
    </div>,
    document.body
  );
}

/* =====================================================================
   FORMULÁRIO DE COTAÇÃO — em três etapas: você · veículo · detalhes
   ===================================================================== */
const MAX_VEICULOS = 5;
const GUARDA = "sh_formulario";

function lerGuardado() {
  try { return JSON.parse(localStorage.getItem(GUARDA) || "{}") || {}; } catch { return {}; }
}

/* fica fora do Formulario: declarado dentro, o teclado fecharia a cada letra */
function CampoForm({ rotulo, children, dica, falta }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 7, color: falta ? C.vermelho : C.tinta }}>{rotulo}</label>
      {children}
      {dica && <div style={{ fontSize: 12.5, color: C.cinza, marginTop: 7, lineHeight: 1.5 }}>{dica}</div>}
    </div>
  );
}

function Pergunta({ n, p, valor, mudar, falta }) {
  return (
    <div id={`perg-${p.id}`} style={{ borderRadius: 20, padding: 16, marginBottom: 14, background: "#fff",
      border: `1.5px solid ${falta ? C.vermelho : C.linha}`, boxShadow: falta ? "0 0 0 4px rgba(224,72,72,.1)" : "none" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ flex: "0 0 26px", height: 26, borderRadius: 8, display: "grid", placeItems: "center", transform: "rotate(-8deg)",
          background: C.azul, color: "#fff", fontSize: 12.5, fontWeight: 700 }}>{n}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{p.titulo}{p.obrigatoria ? <span style={{ color: C.laranjaForte }}> *</span> : ""}</div>
          {p.nota && <div style={{ fontSize: 12.5, color: C.cinza, marginTop: 4, lineHeight: 1.5 }}>{p.nota}</div>}
        </div>
      </div>
      {p.tipo === "opcoes" ? (
        <div style={{ display: "grid", gap: 8 }}>
          {(p.opcoes || []).map((o) => {
            const sel = valor === o;
            return (
              <button key={o} type="button" onClick={() => mudar(sel && !p.obrigatoria ? "" : o)} className="sh-toque"
                style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", padding: "13px 14px", borderRadius: 14,
                  fontSize: 14.5, fontWeight: sel ? 700 : 500, border: `1.5px solid ${sel ? C.azul : C.linha}`,
                  background: sel ? "rgba(18,56,209,.07)" : "#fff", color: C.tinta }}>
                <span style={{ flex: "0 0 20px", height: 20, borderRadius: "50%", border: `2px solid ${sel ? C.azul : "#B8C3DD"}`, display: "grid", placeItems: "center" }}>
                  {sel && <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.azul }} />}
                </span>
                {o}
              </button>
            );
          })}
        </div>
      ) : p.tipo === "textolongo" ? (
        <textarea className="sh-campo" rows={3} value={valor || ""} onChange={(e) => mudar(e.target.value)} placeholder={p.exemplo || ""} style={{ resize: "vertical" }} />
      ) : (
        <input className="sh-campo" value={valor || ""} inputMode={p.tipo === "numero" ? "numeric" : undefined}
          onChange={(e) => mudar(p.tipo === "numero" ? e.target.value.replace(/[^\d.,]/g, "") : e.target.value)} placeholder={p.exemplo || ""} />
      )}
    </div>
  );
}

function Formulario({ aberto, inicial, c, fechar }) {
  const larga = useTelaLarga();
  const [altura, setAltura] = useState(null);
  const [etapa, setEtapa] = useState(0);
  const [d, setD] = useState({ nome: "", whatsapp: "", cidade: "" });
  const [veiculos, setVeiculos] = useState([{ tipo: "carro", placa: "" }]);
  const [resp, setResp] = useState({});
  const [erro, setErro] = useState("");
  const [faltam, setFaltam] = useState([]);
  const [indo, setIndo] = useState(false);
  const [pronto, setPronto] = useState("");
  const corpoRef = useRef(null);

  useVoltar(aberto, fechar);
  useTravaFundo(aberto);

  /* teclado do iPhone: a janela encolhe junto e o botão fica à vista */
  useEffect(() => {
    if (!aberto || !window.visualViewport) return;
    const vv = window.visualViewport;
    const aj = () => setAltura(Math.round(vv.height));
    aj();
    vv.addEventListener("resize", aj);
    vv.addEventListener("scroll", aj);
    return () => { vv.removeEventListener("resize", aj); vv.removeEventListener("scroll", aj); };
  }, [aberto]);

  /* ao abrir: volta o que a pessoa já tinha digitado neste navegador, mais o que veio do botão do plano */
  useEffect(() => {
    if (!aberto) return;
    const g = lerGuardado();
    setD({ nome: g.nome || "", whatsapp: g.whatsapp || "", cidade: g.cidade || "" });
    const v = Array.isArray(g.veiculos) && g.veiculos.length ? g.veiculos : [{ tipo: "carro", placa: "" }];
    setVeiculos(inicial.tipo ? [{ ...v[0], tipo: inicial.tipo }, ...v.slice(1)] : v);
    const r = g.resp && typeof g.resp === "object" ? g.resp : {};
    const temPlano = c.perguntas.find((p) => p.id === "plano" && (p.opcoes || []).includes(inicial.plano));
    setResp(temPlano ? { ...r, plano: inicial.plano } : r);
    setEtapa(0); setErro(""); setFaltam([]); setIndo(false); setPronto("");
  }, [aberto]); // eslint-disable-line

  /* guarda no navegador enquanto digita */
  useEffect(() => {
    if (!aberto) return;
    try { localStorage.setItem(GUARDA, JSON.stringify({ ...d, veiculos, resp })); } catch { /* sem espaço: tudo bem */ }
  }, [aberto, d, veiculos, resp]);

  useEffect(() => { if (corpoRef.current) corpoRef.current.scrollTop = 0; }, [etapa]);

  const mudaVeic = (k, campo, valor) => setVeiculos((l) => l.map((v, j) => (j === k ? { ...v, [campo]: valor } : v)));
  const visiveis = c.perguntas.filter((p) => perguntaVisivel(p, resp));

  const conferir = (e) => {
    if (e === 0) {
      if (d.nome.trim().replace(/\s+/g, " ").length < 2) return "Escreva o seu nome.";
      if (!foneOk(d.whatsapp)) return "Confira o WhatsApp: DDD + número. Ex.: (34) 9 9999-1234.";
      if (!d.cidade.trim()) return "Escreva a sua cidade.";
    }
    if (e === 1) {
      const ruim = veiculos.find((v) => !placaOk(placaLimpa(v.placa)));
      if (ruim) return "A placa tem 7 letras e números. Ex.: ABC1D23 ou ABC1234.";
    }
    return "";
  };
  const avancar = () => {
    const m = conferir(etapa);
    if (m) return setErro(m);
    setErro(""); setEtapa((x) => x + 1);
  };

  const enviar = async () => {
    const falt = visiveis.filter((p) => p.obrigatoria && !String(resp[p.id] || "").trim()).map((p) => p.id);
    setFaltam(falt);
    if (falt.length) {
      setErro("Falta responder a pergunta marcada em vermelho.");
      const el = document.getElementById(`perg-${falt[0]}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErro(""); setIndo(true);
    const dados = { nome: d.nome.trim().replace(/\s+/g, " "), whatsapp: foneLimpo(d.whatsapp), cidade: d.cidade.trim().replace(/\s+/g, " ") };
    const lista = veiculos.map((v) => ({ tipo: v.tipo, placa: placaLimpa(v.placa) }));
    await api.registrarCotacao({ ...dados, veiculos: lista, respostas: respostasParaGuardar(c, resp) });
    const link = linkWhats(c.whatsapp, mensagemCotacao(c, dados, lista, resp));
    setPronto(link);
    setIndo(false);
    window.open(link, "_blank", "noopener");
  };

  if (!aberto) return null;

  const ETAPAS = ["Você", "Veículo", "Detalhes"];
  const progresso = (
    <div style={{ padding: larga ? "0 22px 16px" : "0 16px 14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
        {ETAPAS.map((t, k) => (
          <div key={t} style={{ minWidth: 0 }}>
            <div style={{ height: 5, borderRadius: 5, background: "rgba(255,255,255,.18)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: pronto || k < etapa ? "100%" : k === etapa ? "50%" : "0%", borderRadius: 5,
                background: `linear-gradient(90deg, ${C.laranja}, ${C.amarelo})`, transition: "width .5s cubic-bezier(.2,.8,.2,1)" }} />
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 6, color: k <= etapa ? "#fff" : "rgba(255,255,255,.5)" }}>{k + 1}. {t}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const cabecalho = (
    <div style={{ flex: "0 0 auto", color: "#fff", background: `linear-gradient(135deg, ${C.azul}, ${C.marinho})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: larga ? "18px 16px 14px 22px" : "calc(10px + env(safe-area-inset-top,0px)) 10px 12px" }}>
        {!larga && <button onClick={fechar} aria-label="Voltar" style={{ width: 42, height: 42, flex: "0 0 42px", display: "grid", placeItems: "center", border: "none", background: "transparent", color: "#fff" }}>{I.voltar}</button>}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Sua cotação</div>
          <div style={{ fontSize: 12.5, color: C.amarelo }}>{c.nome} · Shield Proteção Veicular</div>
        </div>
        {larga && <button onClick={fechar} aria-label="Fechar" style={{ width: 42, height: 42, flex: "0 0 42px", display: "grid", placeItems: "center", border: "none", background: "transparent", color: "#fff" }}>{I.x}</button>}
      </div>
      {progresso}
    </div>
  );

  const corpo = pronto ? (
    <div style={{ textAlign: "center", padding: "30px 6px" }}>
      <div style={{ width: 84, height: 84, margin: "0 auto 18px", borderRadius: 26, display: "grid", placeItems: "center", transform: "rotate(-8deg)",
        background: `linear-gradient(135deg, ${C.laranja}, ${C.amarelo})`, color: C.noite }}>
        <span style={{ transform: "rotate(8deg) scale(1.6)", display: "flex" }}>{I.check}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>Pedido enviado!</div>
      <div style={{ fontSize: 15, color: C.cinza, lineHeight: 1.6, margin: "10px auto 0", maxWidth: 380 }}>
        O seu WhatsApp abriu com a mensagem pronta. É só tocar em enviar, e eu te respondo com a cotação.
      </div>
    </div>
  ) : etapa === 0 ? (
    <>
      <p style={{ margin: "0 0 20px", fontSize: 14.5, color: C.cinza, lineHeight: 1.6 }}>
        Leva menos de um minuto. No fim, o seu WhatsApp abre com tudo escrito para mim.
      </p>
      <CampoForm rotulo="Seu nome">
        <input className="sh-campo" value={d.nome} onChange={(e) => setD((x) => ({ ...x, nome: e.target.value }))} placeholder="Ex.: Maria Souza" autoComplete="name" />
      </CampoForm>
      <CampoForm rotulo="Seu WhatsApp">
        <input className="sh-campo" inputMode="tel" value={d.whatsapp} onChange={(e) => setD((x) => ({ ...x, whatsapp: foneDigitando(e.target.value) }))}
          placeholder="Ex.: (34) 9 9999-1234" autoComplete="tel" />
      </CampoForm>
      <CampoForm rotulo="Sua cidade">
        <input className="sh-campo" value={d.cidade} onChange={(e) => setD((x) => ({ ...x, cidade: e.target.value }))} placeholder="Ex.: Uberlândia" autoComplete="address-level2" />
      </CampoForm>
    </>
  ) : etapa === 1 ? (
    <>
      <div style={{ borderRadius: 16, padding: "13px 14px", marginBottom: 16, display: "flex", gap: 11, alignItems: "flex-start",
        background: "rgba(247,162,27,.12)", border: "1px solid rgba(247,162,27,.45)" }}>
        <span style={{ flex: "0 0 auto", color: C.laranjaForte, display: "flex", marginTop: 1 }}>{I.escudo}</span>
        <span style={{ fontSize: 13.5, lineHeight: 1.55, minWidth: 0 }}>
          <b>Se puder, informe a placa.</b> <span style={{ color: C.cinza }}>É por ela que eu vejo o modelo e o ano e passo o valor certinho.
            Sem a placa eu te atendo do mesmo jeito, só vou pedir depois.</span>
        </span>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {veiculos.map((v, k) => (
          <div key={k} style={{ borderRadius: 20, padding: 14, border: `1px solid ${C.linha}`, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azul }}>Veículo {k + 1}</span>
              {veiculos.length > 1 && (
                <button type="button" aria-label={`Tirar veículo ${k + 1}`} onClick={() => setVeiculos((l) => l.filter((_, j) => j !== k))}
                  style={{ width: 36, height: 36, borderRadius: 12, display: "grid", placeItems: "center", border: "none", background: C.gelo, color: C.cinza }}>{I.lixo}</button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {TIPOS.map((t) => {
                const sel = v.tipo === t.v;
                return (
                  <button key={t.v} type="button" onClick={() => mudaVeic(k, "tipo", t.v)} className="sh-toque"
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "12px 4px", borderRadius: 14, fontSize: 13, fontWeight: 700, minWidth: 0,
                      border: `1.5px solid ${sel ? C.azul : C.linha}`, background: sel ? C.azul : "#fff", color: sel ? "#fff" : C.tinta }}>
                    {ICONE_TIPO[t.v]}{t.l}
                  </button>
                );
              })}
            </div>
            <input className="sh-campo" value={v.placa} style={{ marginTop: 10, letterSpacing: 1.5, textTransform: "uppercase" }}
              onChange={(e) => mudaVeic(k, "placa", placaLimpa(e.target.value))} maxLength={7}
              placeholder="Placa — ex.: ABC1D23" autoCapitalize="characters" autoComplete="off" />
          </div>
        ))}
      </div>
      {veiculos.length < MAX_VEICULOS && (
        <button type="button" onClick={() => setVeiculos((l) => [...l, { tipo: "carro", placa: "" }])}
          style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 999, fontSize: 14, fontWeight: 700,
            border: `1.5px dashed ${C.azul}`, background: "transparent", color: C.azul }}>
          {I.mais}Adicionar outro veículo
        </button>
      )}
    </>
  ) : (
    <>
      {visiveis.length === 0 ? (
        <div style={{ fontSize: 14.5, color: C.cinza, lineHeight: 1.6 }}>Tudo pronto. Toque em enviar para abrir o WhatsApp.</div>
      ) : visiveis.map((p, k) => (
        <Pergunta key={p.id} n={k + 1} p={p} valor={resp[p.id]} falta={faltam.includes(p.id)}
          mudar={(v) => { setResp((r) => ({ ...r, [p.id]: v })); setFaltam((f) => f.filter((x) => x !== p.id)); }} />
      ))}
    </>
  );

  const rodape = (
    <div style={{ display: "grid", gap: 10 }}>
      {erro && <div style={{ color: C.vermelho, fontSize: 14, fontWeight: 600 }}>{erro}</div>}
      {pronto ? (
        <>
          <Botao tipo="whats" cheio grande href={pronto} icone={I.whats}>Abrir o WhatsApp de novo</Botao>
          <button type="button" onClick={fechar} style={{ border: "none", background: "transparent", color: C.cinza, fontWeight: 600, padding: 8 }}>Voltar ao catálogo</button>
        </>
      ) : (
        <div style={{ display: "flex", gap: 10 }}>
          {etapa > 0 && (
            <button type="button" onClick={() => { setErro(""); setEtapa((x) => x - 1); }} aria-label="Voltar uma etapa" className="sh-toque"
              style={{ flex: "0 0 56px", height: 56, borderRadius: 999, border: `1.5px solid ${C.linha}`, background: "#fff", color: C.tinta, display: "grid", placeItems: "center" }}>{I.voltar}</button>
          )}
          {etapa < 2 ? (
            <Botao cheio grande tipo="azul" onClick={avancar} style={{ flex: 1 }}>Continuar <span style={{ display: "flex" }}>{I.seta}</span></Botao>
          ) : (
            <Botao cheio grande onClick={enviar} disabled={indo} style={{ flex: 1 }} icone={I.whats}>{indo ? "Enviando…" : `Enviar para o ${c.nome.split(" ")[0]}`}</Botao>
          )}
        </div>
      )}
    </div>
  );

  if (!larga) {
    return createPortal(
      <div className="tela" style={{ zIndex: 120, background: C.gelo, display: "flex", flexDirection: "column", fontFamily: FONT, color: C.tinta,
        height: altura ? `${altura}px` : undefined, animation: "shTroca .2s ease" }}>
        {cabecalho}
        <div ref={corpoRef} key={etapa} style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: 18, animation: "shTroca .3s ease" }}>{corpo}</div>
        <div style={{ flex: "0 0 auto", background: "#fff", borderTop: `1px solid ${C.linha}`, padding: "12px 16px calc(12px + env(safe-area-inset-bottom,0px))" }}>{rodape}</div>
      </div>,
      document.body
    );
  }
  return createPortal(
    <div className="tela" onMouseDown={(e) => { if (e.target === e.currentTarget) fechar(); }}
      style={{ zIndex: 120, background: "rgba(7,18,51,.66)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        backdropFilter: "blur(4px)", fontFamily: FONT, color: C.tinta, animation: "shTroca .2s ease" }}>
      <div style={{ background: C.gelo, borderRadius: 28, width: "100%", maxWidth: 580, maxHeight: "calc(100dvh - 48px)", display: "flex", flexDirection: "column",
        overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.45)" }}>
        {cabecalho}
        <div ref={corpoRef} key={etapa} style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: 22, animation: "shTroca .3s ease" }}>{corpo}</div>
        <div style={{ flex: "0 0 auto", background: "#fff", borderTop: `1px solid ${C.linha}`, padding: "14px 22px" }}>{rodape}</div>
      </div>
    </div>,
    document.body
  );
}
