import { useState, useEffect, useMemo } from "react";
import * as api from "./api.js";
import {
  mesclarConfig, dinheiro, normalizar, soDigitos, foneFmt, foneOk, foneLimpo, foneDigitando, placaLimpa, placaOk,
  primeiroNome, nomeBonito, juntarLista, aplicar, linkCompartilhar, nomeTipo, TIPOS, NOMES_PLANO, FOTOS_CATALOGO, fotoDoEspaco,
  MENSAGENS, hojeIso, isoDe, deIso, fmtData, fmtDataHora, mesDe, nomeMes, nomeMesCurto, addMes,
} from "./padroes.js";
import {
  C, CSS, FONT, ICONES, ICONE_TIPO, S, Modal, Botao, LARANJA, BotaoWhats, Campo, Chips, Selo, Carregando, Vazio, Credito,
  Numero, BotaoCopiar, useTelaLarga, useAviso, parseValor, valorParaCampo,
} from "./ui.jsx";
import Ajustes from "./Ajustes.jsx";

/* =====================================================================
   APP — GEOVANNE MARCONDES · EXECUTIVO DE VENDAS · SHIELD
   Início · Clientes · Ganhos · Cotações · Fotos · Ajustes

   Ele NÃO é gestor: não há consultores, carteira de boletos nem regra
   de gestor. O que interessa é: quem ele protegeu (clientes/adesões),
   quanto ganhou no mês (bruto), quem pediu cotação pelo catálogo e as
   fotos do catálogo. O recorrente ainda não tem regra: por enquanto é
   lançado à mão em Ganhos → Outros ganhos.
   ===================================================================== */

const LOGO = "/logo.jpg";
const linkCatalogo = () => `${window.location.origin}/catalogo`;

export default function App() {
  const [sessao, setSessao] = useState(undefined);
  useEffect(() => {
    api.getSession().then(setSessao).catch(() => setSessao(null));
    return api.onAuth(setSessao);
  }, []);
  return (
    <>
      <style>{CSS}</style>
      {sessao === undefined ? (
        <div className="tela" style={{ background: C.noite, display: "grid", placeItems: "center" }}>
          <div className="sh-roda" style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(255,255,255,.15)", borderTopColor: C.laranja }} />
        </div>
      ) : sessao ? <Painel sessao={sessao} /> : <Login />}
    </>
  );
}

/* ---------------------------------------------------------------------
   Login
   --------------------------------------------------------------------- */
function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [indo, setIndo] = useState(false);
  const entrar = async (e) => {
    e.preventDefault();
    setErro(""); setIndo(true);
    try { await api.login(email, senha); }
    catch (err) { setErro(/invalid/i.test(err?.message || "") ? "E-mail ou senha incorretos." : "Não foi possível entrar. Confira a internet e tente de novo."); }
    finally { setIndo(false); }
  };
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT,
      background: `radial-gradient(120% 70% at 80% 0%, ${C.azulVivo} 0%, ${C.azul} 30%, ${C.marinho} 70%, ${C.noite} 100%)`,
      padding: "calc(28px + env(safe-area-inset-top,0px)) 16px calc(8px + env(safe-area-inset-bottom,0px))" }}>
      <div style={{ flex: 1, width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <img src={LOGO} alt="Shield Proteção Veicular" width="588" height="330"
          style={{ display: "block", width: "70%", height: "auto", margin: "0 auto 26px", borderRadius: 18, boxShadow: "0 24px 60px rgba(0,0,0,.4)" }} />
        <form onSubmit={entrar} style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 20px 50px rgba(0,0,0,.35)" }}>
          <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 16 }}>Entrar no app</div>
          <label style={S.rotulo}>E-mail</label>
          <input className="sh-campo" type="email" autoComplete="username" inputMode="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
          <label style={{ ...S.rotulo, marginTop: 14 }}>Senha</label>
          <input className="sh-campo" type="password" autoComplete="current-password" value={senha}
            onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" required />
          {erro && <div style={{ color: C.vermelho, fontSize: 14, fontWeight: 600, marginTop: 12 }}>{erro}</div>}
          <Botao type="submit" cheio disabled={indo} {...LARANJA} style={{ marginTop: 18 }} onClick={undefined}>{indo ? "Entrando…" : "Entrar"}</Botao>
        </form>
        <a href="/catalogo" style={{ color: C.amarelo, textAlign: "center", marginTop: 18, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          Ver o catálogo →
        </a>
      </div>
      <Credito claro />
    </div>
  );
}

/* ---------------------------------------------------------------------
   Painel (depois do login)
   --------------------------------------------------------------------- */
const ABAS = [
  { id: "inicio", l: "Início", i: ICONES.inicio },
  { id: "clientes", l: "Clientes", i: ICONES.clientes },
  { id: "ganhos", l: "Ganhos", i: ICONES.ganhos },
  { id: "cotacoes", l: "Cotações", i: ICONES.cotacoes },
  { id: "fotos", l: "Fotos do catálogo", curto: "Fotos", i: ICONES.fotos },
  { id: "ajustes", l: "Ajustes", i: ICONES.ajustes },
];

/* ordem das listas: mais recente primeiro */
const porAdesao = (a, b) => (b.data_adesao || "").localeCompare(a.data_adesao || "") || (b.criado || "").localeCompare(a.criado || "");
const porData = (a, b) => (b.data || "").localeCompare(a.data || "") || (b.criado || "").localeCompare(a.criado || "");
const trocar = (lista, item, ordem) => {
  const l = lista.some((x) => x.id === item.id) ? lista.map((x) => (x.id === item.id ? item : x)) : [item, ...lista];
  return ordem ? [...l].sort(ordem) : l;
};

function Painel({ sessao }) {
  const telaLarga = useTelaLarga();
  const [avisar, avisoEl] = useAviso();
  const [perfil, setPerfil] = useState(undefined);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState("inicio");
  const [form, setForm] = useState(null);   // null · { cliente } · { inicial, cotacao }

  const carregar = async () => {
    setErro("");
    try {
      const [p, d] = await Promise.all([api.meuPerfil(sessao.user.id), api.carregarPainel()]);
      setPerfil(p); setDados(d);
    } catch (e) { setErro(api.msgErro(e)); if (perfil === undefined) setPerfil(null); }
  };
  useEffect(() => { carregar(); }, []); // eslint-disable-line

  const cfg = useMemo(() => mesclarConfig(dados && dados.config), [dados]);
  const irPara = (id) => { setAba(id); window.scrollTo(0, 0); };
  const patch = (fn) => setDados((d) => (d ? fn(d) : d));

  const acoes = {
    avisar,
    novoCliente: () => setForm({ inicial: {} }),
    editarCliente: (c) => setForm({ cliente: c }),
    virarCliente: (o, v) => {
      const plano = (o.respostas || []).map((r) => r.resposta).find((r) => NOMES_PLANO.includes(r)) || "";
      setForm({ inicial: { nome: nomeBonito(o.nome), whatsapp: o.whatsapp, cidade: o.cidade, tipo: (v && v.tipo) || "carro", placa: (v && v.placa) || "", plano, cotacao_id: o.id }, cotacao: o });
    },
    async salvarCliente(c, cotacao) {
      const salvo = await api.salvarCliente(c);
      patch((d) => ({ ...d, clientes: trocar(d.clientes, salvo, porAdesao) }));
      if (cotacao && cotacao.status !== "fechou") {
        try { const o = await api.alterarCotacao(cotacao.id, { status: "fechou", cliente_id: salvo.id }); patch((d) => ({ ...d, cotacoes: trocar(d.cotacoes, o) })); }
        catch { /* a adesão já foi salva; a situação da cotação muda à mão */ }
      }
      avisar(c.id ? "Cliente salvo" : "Adesão cadastrada");
      return salvo;
    },
    async alterarCliente(c, campos, msg) {
      try {
        const salvo = await api.alterarCliente(c.id, campos);
        patch((d) => ({ ...d, clientes: trocar(d.clientes, salvo, porAdesao) }));
        if (msg) avisar(msg);
        return salvo;
      } catch (e) { avisar(api.msgErro(e), "erro"); return null; }
    },
    async excluirCliente(c) {
      await api.mandarParaLixeira("sh_clientes", c.id);
      patch((d) => ({ ...d, clientes: d.clientes.filter((x) => x.id !== c.id) }));
      avisar("Foi para a lixeira (Ajustes → Lixeira)");
    },
    async salvarGanho(g) {
      const salvo = await api.salvarGanho(g);
      patch((d) => ({ ...d, ganhos: trocar(d.ganhos, salvo, porData) }));
      avisar("Ganho salvo");
      return salvo;
    },
    async excluirGanho(g) {
      await api.mandarParaLixeira("sh_ganhos", g.id);
      patch((d) => ({ ...d, ganhos: d.ganhos.filter((x) => x.id !== g.id) }));
      avisar("Foi para a lixeira (Ajustes → Lixeira)");
    },
    async alterarCotacao(o, campos, msg) {
      try {
        const salvo = await api.alterarCotacao(o.id, campos);
        patch((d) => ({ ...d, cotacoes: trocar(d.cotacoes, salvo) }));
        if (msg) avisar(msg);
      } catch (e) { avisar(api.msgErro(e), "erro"); }
    },
    async excluirCotacao(o) {
      await api.mandarParaLixeira("sh_cotacoes", o.id);
      patch((d) => ({ ...d, cotacoes: d.cotacoes.filter((x) => x.id !== o.id) }));
      avisar("Foi para a lixeira (Ajustes → Lixeira)");
    },
    async recarregarCotacoes() {
      try { const l = await api.listarCotacoes(); patch((d) => ({ ...d, cotacoes: l })); avisar("Atualizado"); }
      catch (e) { avisar(api.msgErro(e), "erro"); }
    },
    async salvarConfig(parcial) {
      const antigos = (dados && dados.config) || {};
      const novos = { ...antigos, ...parcial };
      await api.salvarConfig(novos, antigos);
      patch((d) => ({ ...d, config: novos }));
    },
    restaurado: carregar,
  };

  const admin = perfil && perfil.role === "admin";
  if ((perfil === null || (perfil && !admin)) && !erro) {
    return (
      <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: C.noite, color: "#fff", textAlign: "center", fontFamily: FONT }}>
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Acesso ainda não liberado</div>
          <div style={{ opacity: 0.8, fontSize: 15, marginBottom: 22, lineHeight: 1.5 }}>Esta conta ({sessao.user?.email}) entrou, mas ainda não tem permissão.</div>
          <Botao {...LARANJA} onClick={() => api.logout()}>Sair</Botao>
        </div>
      </div>
    );
  }

  const conteudo = erro ? (
    <div style={{ ...S.card, padding: 22, textAlign: "center" }}>
      <div style={{ fontWeight: 700, marginBottom: 14 }}>{erro}</div>
      <Botao onClick={carregar}>Tentar de novo</Botao>
    </div>
  ) : !dados || perfil === undefined ? (
    <Carregando />
  ) : aba === "inicio" ? (
    <Inicio dados={dados} cfg={cfg} acoes={acoes} irPara={irPara} />
  ) : aba === "clientes" ? (
    <Clientes dados={dados} cfg={cfg} acoes={acoes} />
  ) : aba === "ganhos" ? (
    <Ganhos dados={dados} cfg={cfg} acoes={acoes} />
  ) : aba === "cotacoes" ? (
    <Cotacoes dados={dados} cfg={cfg} acoes={acoes} />
  ) : aba === "fotos" ? (
    <Fotos cfg={cfg} acoes={acoes} />
  ) : (
    <Ajustes cfg={cfg} acoes={acoes} sessao={sessao} />
  );

  const janelas = dados && (
    <FormCliente aberto={!!form} cliente={form && form.cliente} inicial={form && form.inicial} cotacao={form && form.cotacao}
      cfg={cfg} acoes={acoes} aoFechar={() => setForm(null)} />
  );
  const novas = dados ? dados.cotacoes.filter((o) => o.status === "novo").length : 0;

  if (telaLarga) {
    return (
      <div style={{ display: "flex", minHeight: "100dvh", fontFamily: FONT }}>
        <aside style={{ position: "sticky", top: 0, height: "100dvh", width: 260, flex: "0 0 260px", display: "flex",
          flexDirection: "column", background: `linear-gradient(180deg, ${C.azul}, ${C.marinho} 55%, ${C.noite})`, color: "#fff" }}>
          <div style={{ padding: "22px 18px 16px" }}>
            <img src={LOGO} alt="Shield Proteção Veicular" style={{ display: "block", width: "100%", borderRadius: 14 }} />
            <div style={{ fontSize: 12.5, opacity: 0.65, marginTop: 14 }}>Olá,</div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{cfg.nome}</div>
            <div style={{ fontSize: 12.5, color: C.amarelo, fontWeight: 600 }}>{cfg.cargo}</div>
          </div>
          <nav style={{ padding: "6px 12px", display: "grid", gap: 4 }}>
            {ABAS.map((a) => (
              <button key={a.id} onClick={() => irPara(a.id)} className="sh-toque"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: "none",
                  fontSize: 15, fontWeight: 700, textAlign: "left",
                  background: aba === a.id ? "rgba(247,162,27,.2)" : "transparent", color: aba === a.id ? C.amarelo : "rgba(255,255,255,.82)" }}>
                {a.i}<span style={{ flex: 1 }}>{a.l}</span>
                {a.id === "cotacoes" && novas > 0 && <Selo tipo="laranja">{novas}</Selo>}
              </button>
            ))}
            <a href="/catalogo" target="_blank" rel="noopener noreferrer" className="sh-toque"
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                color: "rgba(255,255,255,.82)", textDecoration: "none" }}>{ICONES.catalogo}Ver o catálogo</a>
          </nav>
          <div style={{ marginTop: "auto" }}><Credito claro /></div>
        </aside>
        <main style={{ flex: 1, minWidth: 0, padding: "28px 32px 40px" }}>
          <div key={aba} className="sh-aba" style={{ maxWidth: 1000, margin: "0 auto" }}>{conteudo}</div>
        </main>
        {janelas}
        {avisoEl}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", fontFamily: FONT }}>
      <header style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", gap: 12, color: "#fff",
        background: `linear-gradient(135deg, ${C.azul}, ${C.marinho})`, padding: "calc(10px + env(safe-area-inset-top,0px)) 16px 12px" }}>
        <img src="/emblema.png" alt="" width="40" height="40" style={{ borderRadius: 12, flex: "0 0 40px" }} />
        <div style={{ minWidth: 0, lineHeight: 1.2, flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cfg.nome}</div>
          <div style={{ fontSize: 12, color: C.amarelo, fontWeight: 600 }}>{cfg.cargo} · Shield</div>
        </div>
        <a href="/catalogo" target="_blank" rel="noopener noreferrer" aria-label="Ver o catálogo"
          style={{ ...S.btnIcone, color: "#fff", border: "1px solid rgba(255,255,255,.35)" }}>{ICONES.catalogo}</a>
      </header>

      <main style={{ padding: "16px 16px calc(96px + env(safe-area-inset-bottom,0px))" }}>
        <div key={aba} className="sh-aba">{conteudo}</div>
      </main>

      <nav style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30, display: "flex", background: "#fff",
        borderTop: `1px solid ${C.borda}`, padding: "6px 4px calc(6px + env(safe-area-inset-bottom,0px))", boxShadow: "0 -4px 16px rgba(11,31,92,.06)" }}>
        {ABAS.map((a) => (
          <button key={a.id} onClick={() => irPara(a.id)}
            style={{ position: "relative", flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "7px 1px", border: "none", background: "transparent", borderRadius: 12, fontWeight: 700,
              fontSize: "clamp(9px, 2.6vw, 11px)", color: aba === a.id ? C.azul : "#97A2BC" }}>
            <span style={{ display: "grid", placeItems: "center", width: 40, height: 26, borderRadius: 999,
              background: aba === a.id ? C.azulFundo : "transparent" }}>{a.i}</span>
            <span style={{ maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.curto || a.l}</span>
            {a.id === "cotacoes" && novas > 0 && (
              <span style={{ position: "absolute", top: 2, left: "calc(50% + 8px)", minWidth: 17, height: 17, padding: "0 4px", borderRadius: 999,
                background: C.laranja, color: C.noite, fontSize: 10.5, fontWeight: 800, display: "grid", placeItems: "center" }}>{novas}</span>
            )}
          </button>
        ))}
      </nav>
      {janelas}
      {avisoEl}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Contas de dinheiro (ganho bruto)
   --------------------------------------------------------------------- */
/* o ganho bruto de um intervalo: adesões (pela data da adesão) + outros ganhos (pela data) */
function somar(dados, de, ate) {
  const dentro = (s) => s && s >= de && s <= ate;
  const ades = dados.clientes.filter((c) => dentro(c.data_adesao));
  const extras = dados.ganhos.filter((g) => dentro(g.data));
  const vAdes = ades.reduce((s, c) => s + Number(c.valor || 0), 0);
  const vExtras = extras.reduce((s, g) => s + Number(g.valor || 0), 0);
  const recebido = ades.filter((c) => c.recebido).reduce((s, c) => s + Number(c.valor || 0), 0)
    + extras.filter((g) => g.recebido).reduce((s, g) => s + Number(g.valor || 0), 0);
  return { ades, extras, vAdes, vExtras, bruto: vAdes + vExtras, recebido, aReceber: vAdes + vExtras - recebido };
}
const limitesDoMes = (comp) => { const [a, m] = comp.split("-").map(Number); return [`${comp}-01`, isoDe(new Date(a, m, 0))]; };

/* ---------------------------------------------------------------------
   Início
   --------------------------------------------------------------------- */
function Inicio({ dados, cfg, acoes, irPara }) {
  const hoje = hojeIso();
  const comp = mesDe(hoje);
  const [de, ate] = limitesDoMes(comp);
  const mes = somar(dados, de, ate);
  const anterior = somar(dados, ...limitesDoMes(addMes(comp, -1)));
  const ativos = dados.clientes.filter((c) => c.situacao === "ativo").length;
  const novas = dados.cotacoes.filter((o) => o.status === "novo");
  const aReceber = dados.clientes.filter((c) => !c.recebido && Number(c.valor) > 0)
    .sort((a, b) => (a.data_receber || "9999").localeCompare(b.data_receber || "9999"));
  const totalAReceber = aReceber.reduce((s, c) => s + Number(c.valor || 0), 0);
  const msgDivulgar = aplicar(cfg.msg_divulgar || MENSAGENS.msg_divulgar.texto, { link: linkCatalogo() });
  const variacao = anterior.bruto > 0 ? Math.round(((mes.bruto - anterior.bruto) / anterior.bruto) * 100) : null;

  return (
    <div>
      <div style={{ padding: "4px 2px 2px" }}>
        <div style={{ fontSize: 12, letterSpacing: 2.5, color: C.laranjaForte, textTransform: "uppercase", fontWeight: 700 }}>{nomeMes(comp)}</div>
        <h1 style={{ ...S.h1, fontSize: 24, marginTop: 4 }}>Olá, {primeiroNome(cfg.nome)} 👋</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 14 }}>
        <Numero rotulo="Ganho bruto do mês" valor={dinheiro(mes.bruto)} destaque aoTocar={() => irPara("ganhos")}
          sub={variacao === null ? `${mes.ades.length} adesão(ões)` : `${variacao >= 0 ? "▲" : "▼"} ${Math.abs(variacao)}% sobre o mês passado`} />
        <Numero rotulo="Adesões no mês" valor={String(mes.ades.length)} sub={`${ativos} cliente(s) ativo(s)`} aoTocar={() => irPara("clientes")} />
        <Numero rotulo="A receber" valor={dinheiro(totalAReceber)} cor={totalAReceber > 0 ? C.ambar : C.texto}
          sub={aReceber.length ? `${aReceber.length} adesão(ões)` : "nada pendente"} aoTocar={() => irPara("ganhos")} />
        <Numero rotulo="Cotações novas" valor={String(novas.length)} cor={novas.length ? C.laranjaForte : C.texto}
          sub="vindas do catálogo" aoTocar={() => irPara("cotacoes")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginTop: 12 }}>
        <Botao {...LARANJA} icone={ICONES.mais} onClick={acoes.novoCliente}>Nova adesão</Botao>
        <a href={linkCompartilhar(msgDivulgar)} target="_blank" rel="noopener noreferrer" className="sh-toque"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, borderRadius: 12, background: C.whats,
            color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>{ICONES.whats}Divulgar o catálogo</a>
        <BotaoCopiarLink />
      </div>

      {novas.length > 0 && (
        <>
          <div style={S.titSecao}>Cotações esperando resposta</div>
          <div style={{ display: "grid", gap: 10 }}>
            {novas.slice(0, 4).map((o) => <CartaoCotacao key={o.id} o={o} cfg={cfg} acoes={acoes} compacto />)}
            {novas.length > 4 && <Botao contorno onClick={() => irPara("cotacoes")}>Ver todas ({novas.length})</Botao>}
          </div>
        </>
      )}

      {aReceber.length > 0 && (
        <>
          <div style={S.titSecao}>Adesões a receber</div>
          <div style={{ display: "grid", gap: 10 }}>
            {aReceber.slice(0, 5).map((c) => <LinhaCliente key={c.id} c={c} cfg={cfg} acoes={acoes} hoje={hoje} />)}
          </div>
        </>
      )}

      {!novas.length && !aReceber.length && !dados.clientes.length && (
        <div style={{ marginTop: 16 }}>
          <Vazio texto="Tudo pronto para começar. Cadastre a primeira adesão, ou divulgue o catálogo para as cotações chegarem aqui." />
        </div>
      )}

      <AcessosCatalogo />
    </div>
  );
}

function BotaoCopiarLink() {
  const [ok, setOk] = useState(false);
  const copiar = async () => {
    try { await navigator.clipboard.writeText(linkCatalogo()); } catch { window.prompt("Copie o link:", linkCatalogo()); return; }
    setOk(true); setTimeout(() => setOk(false), 2200);
  };
  return <Botao contorno cor={C.azul} icone={ok ? ICONES.check : ICONES.link} onClick={copiar}>{ok ? "Link copiado" : "Copiar link do catálogo"}</Botao>;
}

/* ---------------------------------------------------------------------
   Quantas pessoas abriram o catálogo
   --------------------------------------------------------------------- */
function AcessosCatalogo() {
  const [d, setD] = useState(null);
  const [erro, setErro] = useState(false);
  const larga = useTelaLarga();
  useEffect(() => { api.getCatalogStats().then(setD).catch(() => setErro(true)); }, []);
  if (erro) return null;
  const dias = (d && d.porDia) || [];
  /* 7 colunas no celular, 14 no computador: 14 datas não cabem em 360 px */
  const serie = dias.slice(larga || window.innerWidth >= 640 ? -14 : -7);
  const maior = Math.max(1, ...serie.map((x) => x.n));
  return (
    <>
      <div style={S.titSecao}>Acessos ao catálogo</div>
      {!d ? <Carregando texto="Contando…" /> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10 }}>
            <Numero rotulo="Hoje" valor={String(d.hoje)} />
            <Numero rotulo="7 dias" valor={String(d.d7)} />
            <Numero rotulo="30 dias" valor={String(d.d30)} />
            <Numero rotulo="Desde o começo" valor={String(d.total)} destaque />
          </div>
          {serie.length > 1 && (
            <div style={{ ...S.card, padding: 16, marginTop: 10 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 120 }}>
                {serie.map((x) => (
                  <div key={x.dia} style={{ flex: "1 1 0", minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                    <div style={{ fontSize: 10, color: C.suave, fontWeight: 700, marginBottom: 4 }}>{x.n || ""}</div>
                    <div style={{ width: "100%", borderRadius: "6px 6px 0 0", minHeight: x.n ? 4 : 2, height: `${(x.n / maior) * 100}%`,
                      background: x.n ? `linear-gradient(180deg, ${C.laranja}, ${C.azul})` : C.borda }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {serie.map((x) => (
                  <div key={x.dia} style={{ flex: "1 1 0", minWidth: 0, overflow: "hidden", textAlign: "center", fontSize: 10, color: C.suave, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {x.dia.slice(8, 10)}/{x.dia.slice(5, 7)}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ ...S.card, padding: 14, marginTop: 10, fontSize: 12.5, color: C.suave, lineHeight: 1.55 }}>
            Guarda só um código sorteado que fica no navegador de quem visita, para saber se é a mesma pessoa voltando.
            Sem nome, telefone, endereço de internet nem localização. A mesma pessoa só conta de novo depois de 30 minutos.
          </div>
        </>
      )}
    </>
  );
}

/* ---------------------------------------------------------------------
   Clientes (cada adesão é um veículo protegido)
   --------------------------------------------------------------------- */
function mensagemBoasVindas(c, cfg) {
  return aplicar(cfg.msg_boas_vindas || MENSAGENS.msg_boas_vindas.texto, {
    primeiro_nome: primeiroNome(c.nome),
    veiculo: c.modelo ? `${nomeTipo(c.tipo).toLowerCase()} ${c.modelo}` : nomeTipo(c.tipo).toLowerCase(),
    plano: c.plano ? `, no plano ${c.plano},` : "",
    central: cfg.central,
  }).replace(/,,/g, ",");
}

function LinhaCliente({ c, cfg, acoes, hoje }) {
  const [salvando, setSalvando] = useState(false);
  const atrasado = !c.recebido && c.data_receber && c.data_receber < hoje;
  const receber = async (e) => {
    e.stopPropagation();
    if (salvando) return;
    if (c.recebido && !window.confirm(`Desfazer o recebimento da adesão de ${c.nome}?`)) return;
    setSalvando(true);
    await acoes.alterarCliente(c, { recebido: !c.recebido, recebido_em: c.recebido ? null : hojeIso() }, c.recebido ? "Recebimento desfeito" : "Marcado como recebido");
    setSalvando(false);
  };
  return (
    <div onClick={() => acoes.editarCliente(c)} role="button" tabIndex={0} className="sh-toque"
      style={{ ...S.card, padding: 14, cursor: "pointer", opacity: c.situacao === "cancelado" ? 0.6 : 1 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 }}>
        <span style={{ width: 42, height: 42, flex: "0 0 42px", borderRadius: 13, display: "grid", placeItems: "center", background: C.azulFundo, color: C.azul }}>
          {ICONE_TIPO[c.tipo] || ICONES.carro}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{c.nome}</div>
            {c.plano ? <Selo tipo={c.plano}>{c.plano}</Selo> : null}
          </div>
          <div style={{ fontSize: 13, color: C.suave, marginTop: 4, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 10px" }}>
            {c.placa && <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <b style={{ color: C.texto, letterSpacing: 0.8 }}>{c.placa}</b><BotaoCopiar texto={c.placa} rotulo="Copiar" />
            </span>}
            {c.modelo && <span>{c.modelo}</span>}
            <span>{fmtData(c.data_adesao)}</span>
            {Number(c.valor) > 0 && <b style={{ color: C.texto }}>{dinheiro(c.valor)}</b>}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 7 }}>
            {c.situacao === "cancelado" && <Selo tipo="erro">Cancelado</Selo>}
            {Number(c.valor) > 0 && (c.recebido ? <Selo tipo="ok">Recebido</Selo>
              : atrasado ? <Selo tipo="erro">Atrasado · {fmtData(c.data_receber)}</Selo>
                : <Selo tipo="aviso">A receber{c.data_receber ? ` · ${fmtData(c.data_receber)}` : ""}</Selo>)}
          </div>
          {c.avisado_em && (
            <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: C.verde }}>
              <span style={{ display: "flex", transform: "scale(.7)", margin: "-4px" }}>{ICONES.check}</span>
              Boas-vindas enviadas {fmtData(c.avisado_em.slice(0, 10))}
              <button onClick={(e) => { e.stopPropagation(); acoes.alterarCliente(c, { avisado_em: null }, "Marca de boas-vindas estornada"); }}
                style={{ border: "none", background: "transparent", color: C.suave, fontSize: 12, fontWeight: 700, textDecoration: "underline", padding: "2px 4px" }}>estornar</button>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {foneOk(c.whatsapp) && (
          <BotaoWhats fone={c.whatsapp} msg={mensagemBoasVindas(c, cfg)} style={c.avisado_em ? { background: "#8FD9AE" } : undefined}
            aoAbrir={() => { if (!c.avisado_em) acoes.alterarCliente(c, { avisado_em: new Date().toISOString() }); }}>
            {c.avisado_em ? "Mandar de novo" : "Boas-vindas"}
          </BotaoWhats>
        )}
        {Number(c.valor) > 0 && (
          <Botao pequeno onClick={receber} disabled={salvando} icone={ICONES.check} cor={c.recebido ? C.verde : C.azul} contorno={c.recebido} style={{ flex: "1 1 auto" }}>
            {salvando ? "Salvando…" : c.recebido ? "Estornar recebido" : "Marcar recebido"}
          </Botao>
        )}
      </div>
    </div>
  );
}

function Clientes({ dados, cfg, acoes }) {
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState("ativo");
  const [tipo, setTipo] = useState("");
  const [plano, setPlano] = useState("");
  const [limite, setLimite] = useState(40);
  const hoje = hojeIso();
  const lista = dados.clientes;

  const visiveis = useMemo(() => {
    const q = normalizar(busca);
    const qd = soDigitos(busca);
    return lista.filter((c) => {
      if (situacao && c.situacao !== situacao) return false;
      if (tipo && c.tipo !== tipo) return false;
      if (plano === "sem" ? c.plano : plano && c.plano !== plano) return false;
      if (!q) return true;
      return normalizar(c.nome).includes(q) || normalizar(c.placa).includes(q.replace(/[^a-z0-9]/g, "")) || normalizar(c.modelo).includes(q)
        || normalizar(c.cidade).includes(q) || (qd.length >= 4 && soDigitos(c.whatsapp).includes(qd));
    });
  }, [lista, busca, situacao, tipo, plano]);

  const conta = (f) => lista.filter(f).length;
  const ativos = lista.filter((c) => c.situacao === "ativo");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <h1 style={S.h1}>Clientes</h1>
        <Botao pequeno icone={ICONES.mais} {...LARANJA} onClick={acoes.novoCliente}>Nova adesão</Botao>
      </div>

      {/* uma faixa só com os quatro números: em quatro cartões soltos o último caía sozinho na linha de baixo */}
      <div style={{ ...S.card, display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", overflow: "hidden", marginBottom: 12 }}>
        {[{ l: "Ativos", n: ativos.length, i: ICONES.escudo }, ...TIPOS.map((t) => ({ l: t.l, n: ativos.filter((c) => c.tipo === t.v).length, i: ICONE_TIPO[t.v] }))].map((x, k) => (
          <div key={x.l} style={{ minWidth: 0, padding: "12px 6px", textAlign: "center", borderLeft: k ? `1px solid ${C.borda}` : "none",
            background: k ? "#fff" : `linear-gradient(135deg, ${C.azul}, ${C.marinho})`, color: k ? C.texto : "#fff" }}>
            <div style={{ display: "flex", justifyContent: "center", color: k ? C.azul : C.amarelo, transform: "scale(.85)" }}>{x.i}</div>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{x.n}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: k ? C.suave : "rgba(255,255,255,.75)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.l}</div>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", marginBottom: 10 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.suave, display: "flex" }}>{ICONES.busca}</span>
        <input className="sh-campo" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, placa, modelo ou telefone" style={{ paddingLeft: 42 }} />
      </div>
      <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
        <Chips rolar valor={situacao} mudar={setSituacao} opcoes={[
          { v: "ativo", l: `Ativos ${ativos.length}` }, { v: "cancelado", l: `Cancelados ${conta((c) => c.situacao === "cancelado")}` }, { v: "", l: `Todos ${lista.length}` },
        ]} />
        <Chips rolar valor={tipo} mudar={setTipo} permitirVazio opcoes={TIPOS.map((t) => ({ v: t.v, l: t.l }))} />
        <Chips rolar valor={plano} mudar={setPlano} permitirVazio opcoes={[...NOMES_PLANO.map((p) => ({ v: p, l: `Plano ${p}` })), { v: "sem", l: "Sem plano anotado" }]} />
      </div>

      {visiveis.length === 0 ? (
        <Vazio texto={lista.length === 0 ? "Nenhum cliente ainda. Toque em Nova adesão para cadastrar o primeiro." : "Nada encontrado com esses filtros."} />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {visiveis.slice(0, limite).map((c) => <LinhaCliente key={c.id} c={c} cfg={cfg} acoes={acoes} hoje={hoje} />)}
          {visiveis.length > limite && <Botao contorno onClick={() => setLimite((n) => n + 40)}>Mostrar mais ({visiveis.length - limite})</Botao>}
        </div>
      )}
    </div>
  );
}

const ERRO_FONE = "Confira o WhatsApp: DDD + número, com 10 ou 11 dígitos. Ex.: (34) 9 9999-1234.";

function FormCliente({ aberto, cliente, inicial, cotacao, cfg, acoes, aoFechar }) {
  const novo = !cliente;
  const [d, setD] = useState({});
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setErro(""); setSalvando(false);
    const base = cliente || { ...inicial };
    setD({
      nome: base.nome || "", whatsapp: base.whatsapp ? foneDigitando(foneLimpo(base.whatsapp)) : "", cidade: base.cidade || "",
      tipo: base.tipo || "carro", placa: base.placa || "", modelo: base.modelo || "", plano: base.plano || "",
      data_adesao: base.data_adesao || hojeIso(), valor: valorParaCampo(base.valor),
      recebido: !!base.recebido, data_receber: base.data_receber || "", obs: base.obs || "", cotacao_id: base.cotacao_id || null,
    });
  }, [aberto]); // eslint-disable-line

  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  const planosDoTipo = d.tipo === "moto" ? ["Black", "Gold"] : NOMES_PLANO;

  const salvar = async () => {
    const nome = String(d.nome || "").trim().replace(/\s+/g, " ");
    if (nome.length < 2) return setErro("Preencha o nome do cliente.");
    if (d.whatsapp && !foneOk(d.whatsapp)) return setErro(ERRO_FONE);
    const placa = placaLimpa(d.placa);
    if (!placaOk(placa)) return setErro("A placa tem 7 letras e números. Ex.: ABC1D23 ou ABC1234.");
    const valor = d.valor === "" ? 0 : parseValor(d.valor);
    if (valor === null || valor < 0) return setErro("Confira quanto você ganhou nesta adesão. Ex.: 150,00");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.data_adesao || "")) return setErro("Escolha a data da adesão.");
    setErro(""); setSalvando(true);
    try {
      await acoes.salvarCliente({
        ...(cliente ? { id: cliente.id } : {}),
        nome, whatsapp: foneLimpo(d.whatsapp), cidade: d.cidade.trim(), tipo: d.tipo, placa, modelo: d.modelo.trim(),
        plano: planosDoTipo.includes(d.plano) ? d.plano : "", data_adesao: d.data_adesao, valor,
        recebido: !!d.recebido, recebido_em: d.recebido ? (cliente && cliente.recebido_em) || hojeIso() : null,
        data_receber: d.recebido ? null : d.data_receber || null, obs: d.obs.trim(), cotacao_id: d.cotacao_id,
      }, novo ? cotacao : null);
      aoFechar();
    } catch (e) { setErro(api.msgErro(e)); setSalvando(false); }
  };

  const cancelar = async () => {
    const cancelado = cliente.situacao === "cancelado";
    if (!cancelado && !window.confirm(`Marcar ${cliente.nome} como cancelado? Ele sai da lista de ativos, mas o histórico continua.`)) return;
    setSalvando(true);
    const ok = await acoes.alterarCliente(cliente, cancelado ? { situacao: "ativo", cancelado_em: null } : { situacao: "cancelado", cancelado_em: hojeIso() },
      cancelado ? "Cliente reativado" : "Marcado como cancelado");
    setSalvando(false);
    if (ok) aoFechar();
  };
  const excluir = async () => {
    if (!window.confirm(`Mandar ${cliente.nome} para a lixeira?\n\nDá para restaurar depois em Ajustes → Lixeira.`)) return;
    setSalvando(true);
    try { await acoes.excluirCliente(cliente); aoFechar(); }
    catch (e) { setErro(api.msgErro(e)); setSalvando(false); }
  };

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={novo ? "Nova adesão" : cliente.nome} sub={novo ? (cotacao ? "Vinda de uma cotação do catálogo" : "Cliente e veículo") : "Editar cliente"}
      rodape={
        <div style={{ display: "grid", gap: 8 }}>
          {erro && <div style={{ color: C.vermelho, fontWeight: 600, fontSize: 14 }}>{erro}</div>}
          <Botao cheio {...LARANJA} onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : novo ? "Cadastrar adesão" : "Salvar"}</Botao>
        </div>
      }>
      <div style={S.titSecao}>O cliente</div>
      <Campo n={1} rotulo="Nome do cliente">
        <input className="sh-campo" value={d.nome || ""} onChange={(e) => set("nome", e.target.value)} placeholder="Ex.: Maria Aparecida Souza" autoComplete="off" />
      </Campo>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0 12px" }}>
        <Campo n={2} rotulo="WhatsApp">
          <input className="sh-campo" value={d.whatsapp || ""} onChange={(e) => set("whatsapp", foneDigitando(e.target.value))} placeholder="Ex.: (34) 9 9999-1234" inputMode="tel" autoComplete="off" />
        </Campo>
        <Campo n={3} rotulo="Cidade">
          <input className="sh-campo" value={d.cidade || ""} onChange={(e) => set("cidade", e.target.value)} placeholder="Ex.: Uberlândia" />
        </Campo>
      </div>

      <div style={S.titSecao}>O veículo</div>
      <Campo n={4} rotulo="Tipo">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {TIPOS.map((t) => {
            const sel = d.tipo === t.v;
            return (
              <button key={t.v} type="button" onClick={() => set("tipo", t.v)} className="sh-toque"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 12, fontWeight: 700, fontSize: 13.5, minWidth: 0,
                  border: `1.5px solid ${sel ? C.azul : C.borda}`, background: sel ? C.azul : "#fff", color: sel ? "#fff" : C.texto }}>
                {ICONE_TIPO[t.v]}{t.l}
              </button>
            );
          })}
        </div>
      </Campo>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "0 12px" }}>
        <Campo n={5} rotulo="Placa">
          <input className="sh-campo" value={d.placa || ""} onChange={(e) => set("placa", placaLimpa(e.target.value))} maxLength={7}
            placeholder="Ex.: ABC1D23" autoCapitalize="characters" autoComplete="off" style={{ letterSpacing: 1 }} />
        </Campo>
        <Campo n={6} rotulo="Modelo">
          <input className="sh-campo" value={d.modelo || ""} onChange={(e) => set("modelo", e.target.value)} placeholder="Ex.: Onix 1.0 2020" />
        </Campo>
      </div>
      <Campo n={7} rotulo="Plano" dica={d.tipo === "moto" ? "Para motos a Shield tem Black e Gold." : undefined}>
        <Chips opcoes={planosDoTipo} valor={d.plano} mudar={(v) => set("plano", v)} permitirVazio />
      </Campo>

      <div style={S.titSecao}>A adesão</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Campo n={8} rotulo="Data da adesão">
          <input className="sh-campo" type="date" value={d.data_adesao || ""} onChange={(e) => set("data_adesao", e.target.value)} />
        </Campo>
        <Campo n={9} rotulo="Quanto você ganhou">
          <input className="sh-campo" value={d.valor || ""} onChange={(e) => set("valor", e.target.value)} placeholder="Ex.: 150,00" inputMode="decimal" />
        </Campo>
      </div>
      <Campo n={10} rotulo="Recebimento" dica="É o ganho bruto desta adesão. Entra no ganho do mês da data da adesão.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ v: true, l: "Já recebi" }, { v: false, l: "Ainda vou receber" }].map((o) => {
            const sel = !!d.recebido === o.v;
            return (
              <button key={o.l} type="button" onClick={() => set("recebido", o.v)} className="sh-toque"
                style={{ padding: "11px 6px", borderRadius: 12, fontWeight: 700, fontSize: 13.5, minWidth: 0,
                  border: `1.5px solid ${sel ? C.azul : C.borda}`, background: sel ? C.azul : "#fff", color: sel ? "#fff" : C.texto }}>{o.l}</button>
            );
          })}
        </div>
        {!d.recebido && (
          <>
            <label style={{ ...S.rotulo, marginTop: 12 }}>Quando deve cair (opcional)</label>
            <input className="sh-campo" type="date" value={d.data_receber || ""} onChange={(e) => set("data_receber", e.target.value)} />
            <div style={S.dica}>Passou dessa data sem marcar como recebido, a adesão aparece como atrasada.</div>
          </>
        )}
      </Campo>
      <Campo n={11} rotulo="Observação (opcional)">
        <textarea className="sh-campo" rows={3} value={d.obs || ""} onChange={(e) => set("obs", e.target.value)} placeholder="Ex.: indicação do João, carro financiado" style={{ resize: "vertical" }} />
      </Campo>

      {!novo && (
        <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
          <Botao cheio contorno cor={cliente.situacao === "cancelado" ? C.verde : C.ambar} icone={cliente.situacao === "cancelado" ? ICONES.desfazer : ICONES.alerta}
            onClick={cancelar} disabled={salvando}>
            {cliente.situacao === "cancelado" ? "Reativar cliente" : "Marcar como cancelado"}
          </Botao>
          <Botao cheio contorno cor={C.vermelho} icone={ICONES.lixo} onClick={excluir} disabled={salvando}>Mandar para a lixeira</Botao>
        </div>
      )}
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   Ganhos — o bruto do mês: adesões + outros ganhos
   --------------------------------------------------------------------- */
function periodos() {
  const h = deIso(hojeIso());
  const seg = new Date(h); seg.setDate(h.getDate() - ((h.getDay() + 6) % 7));
  const dom = new Date(seg); dom.setDate(seg.getDate() + 6);
  return [
    { id: "semana", l: "Esta semana", de: isoDe(seg), ate: isoDe(dom) },
    { id: "mes", l: "Este mês", de: isoDe(new Date(h.getFullYear(), h.getMonth(), 1)), ate: isoDe(new Date(h.getFullYear(), h.getMonth() + 1, 0)) },
    { id: "anterior", l: "Mês passado", de: isoDe(new Date(h.getFullYear(), h.getMonth() - 1, 1)), ate: isoDe(new Date(h.getFullYear(), h.getMonth(), 0)) },
    { id: "ano", l: "Este ano", de: `${h.getFullYear()}-01-01`, ate: `${h.getFullYear()}-12-31` },
    { id: "livre", l: "Escolher datas" },
  ];
}

function BarraPeriodo({ periodo, setPeriodo }) {
  const lista = useMemo(periodos, []);
  const trocarP = (id) => {
    if (id !== "livre") { const f = lista.find((x) => x.id === id); setPeriodo({ id, de: f.de, ate: f.ate }); return; }
    setPeriodo((p) => ({ ...p, id: "livre" }));
  };
  return (
    <div style={{ ...S.card, padding: 12, marginBottom: 12 }}>
      <Chips rolar valor={periodo.id} mudar={trocarP} opcoes={lista.map((x) => ({ v: x.id, l: x.l }))} />
      {periodo.id === "livre" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          <div style={{ minWidth: 0 }}><label style={S.rotulo}>De</label>
            <input className="sh-campo" type="date" value={periodo.de} onChange={(e) => e.target.value && setPeriodo((p) => ({ ...p, de: e.target.value }))} /></div>
          <div style={{ minWidth: 0 }}><label style={S.rotulo}>Até</label>
            <input className="sh-campo" type="date" value={periodo.ate} onChange={(e) => e.target.value && setPeriodo((p) => ({ ...p, ate: e.target.value }))} /></div>
        </div>
      ) : (
        <div style={{ marginTop: 10, fontSize: 13, color: C.suave, fontWeight: 600, textAlign: "center" }}>{fmtData(periodo.de)} até {fmtData(periodo.ate)}</div>
      )}
    </div>
  );
}

const TIPOS_GANHO = [
  { v: "recorrente", l: "Recorrente" },
  { v: "bonus", l: "Bônus" },
  { v: "premiacao", l: "Premiação" },
  { v: "outro", l: "Outro" },
];
const nomeTipoGanho = (v) => (TIPOS_GANHO.find((t) => t.v === v) || {}).l || "Outro";

function Ganhos({ dados, cfg, acoes }) {
  const larga = useTelaLarga();
  const [periodo, setPeriodo] = useState(() => { const m = periodos()[1]; return { id: "mes", de: m.de, ate: m.ate }; });
  const [sub, setSub] = useState("adesoes");
  const [formGanho, setFormGanho] = useState(null);
  const hoje = hojeIso();
  const t = somar(dados, periodo.de, periodo.ate);

  /* gráfico mês a mês: 6 colunas no celular, 12 no computador */
  const n = larga ? 12 : 6;
  const compAtual = mesDe(hoje);
  const meses = Array.from({ length: n }, (_, k) => addMes(compAtual, k - n + 1)).map((comp) => {
    const s = somar(dados, ...limitesDoMes(comp));
    return { comp, ades: s.vAdes, extras: s.vExtras, total: s.bruto };
  });
  const maior = Math.max(1, ...meses.map((m) => m.total));
  const porTipo = TIPOS_GANHO.map((x) => ({ ...x, v2: t.extras.filter((g) => g.tipo === x.v).reduce((s, g) => s + Number(g.valor || 0), 0) })).filter((x) => x.v2 > 0);

  return (
    <div>
      <h1 style={{ ...S.h1, marginBottom: 12 }}>Ganhos</h1>
      <BarraPeriodo periodo={periodo} setPeriodo={setPeriodo} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
        <Numero rotulo="Ganho bruto" valor={dinheiro(t.bruto)} destaque sub={`${t.ades.length} adesão(ões)${t.extras.length ? ` + ${t.extras.length} outro(s)` : ""}`} />
        <Numero rotulo="Já recebido" valor={dinheiro(t.recebido)} cor={C.verde} fundo={C.verdeFundo} />
        <Numero rotulo="A receber" valor={dinheiro(t.aReceber)} cor={t.aReceber > 0 ? C.ambar : C.texto} fundo={t.aReceber > 0 ? C.ambarFundo : undefined} />
      </div>
      <div style={{ ...S.card, padding: 14, marginTop: 10, display: "grid", gap: 6, fontSize: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span style={{ color: C.suave }}>Adesões</span><b>{dinheiro(t.vAdes)}</b></div>
        {porTipo.map((x) => (
          <div key={x.v} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span style={{ color: C.suave }}>{x.l}</span><b>{dinheiro(x.v2)}</b></div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, borderTop: `1px solid ${C.borda}`, paddingTop: 8, marginTop: 2 }}>
          <span style={{ fontWeight: 700 }}>Total bruto</span><b style={{ color: C.azul }}>{dinheiro(t.bruto)}</b>
        </div>
      </div>

      <div style={S.titSecao}>Mês a mês</div>
      <div style={{ ...S.card, padding: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 150 }}>
          {meses.map((m) => (
            <div key={m.comp} style={{ flex: "1 1 0", minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
              <div style={{ fontSize: 9.5, color: C.suave, fontWeight: 700, textAlign: "center", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden" }}>
                {m.total ? (m.total >= 1000 ? `${(m.total / 1000).toFixed(1).replace(".", ",")} mil` : Math.round(m.total)) : ""}
              </div>
              <div style={{ height: `${(m.extras / maior) * 100}%`, background: C.laranja, borderRadius: m.ades ? "6px 6px 0 0" : "6px 6px 0 0", minHeight: m.extras ? 3 : 0 }} />
              <div style={{ height: `${(m.ades / maior) * 100}%`, borderRadius: m.extras ? 0 : "6px 6px 0 0", minHeight: m.total ? (m.ades ? 3 : 0) : 2,
                background: !m.total ? C.borda : m.comp === compAtual ? C.azul : "#7F9BEF" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {meses.map((m) => (
            <div key={m.comp} style={{ flex: "1 1 0", minWidth: 0, overflow: "hidden", textAlign: "center", fontSize: 10, color: m.comp === compAtual ? C.azul : C.suave, fontWeight: 700, whiteSpace: "nowrap" }}>
              {nomeMesCurto(m.comp)}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 12, color: C.suave, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: C.azul }} />Adesões</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: C.laranja }} />Outros ganhos</span>
        </div>
      </div>

      <div style={{ ...S.card, padding: 14, marginTop: 10, display: "flex", gap: 12, alignItems: "flex-start", background: C.laranjaFundo, border: `1px solid #F6D9A3` }}>
        <span style={{ color: C.laranjaForte, display: "flex", flex: "0 0 auto" }}>{ICONES.repetir}</span>
        <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>
          <b>Recorrente:</b> a regra ainda vai ser definida. Por enquanto, lance o valor que cair em <b>Outros ganhos → Recorrente</b>,
          que ele entra no ganho bruto do mês.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "22px 0 12px", flexWrap: "wrap" }}>
        <Chips valor={sub} mudar={setSub} opcoes={[{ v: "adesoes", l: `Adesões ${t.ades.length}` }, { v: "outros", l: `Outros ganhos ${t.extras.length}` }]} />
        {sub === "adesoes"
          ? <Botao pequeno icone={ICONES.mais} {...LARANJA} onClick={acoes.novoCliente}>Nova adesão</Botao>
          : <Botao pequeno icone={ICONES.mais} {...LARANJA} onClick={() => setFormGanho({})}>Lançar ganho</Botao>}
      </div>

      {sub === "adesoes" ? (
        t.ades.length === 0 ? <Vazio texto="Nenhuma adesão neste período." /> : (
          <div style={{ display: "grid", gap: 10 }}>
            {t.ades.map((c) => <LinhaCliente key={c.id} c={c} cfg={cfg} acoes={acoes} hoje={hoje} />)}
          </div>
        )
      ) : (
        t.extras.length === 0 ? <Vazio texto="Nenhum outro ganho neste período. Toque em Lançar ganho para anotar recorrente, bônus ou premiação." /> : (
          <div style={{ ...S.card, overflow: "hidden" }}>
            {t.extras.map((g, k) => (
              <button key={g.id} onClick={() => setFormGanho(g)} className="sh-toque"
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: 14, border: "none", background: "#fff",
                  borderTop: k ? `1px solid ${C.borda}` : "none", minWidth: 0 }}>
                <span style={{ flex: "0 0 40px", height: 40, borderRadius: 12, display: "grid", placeItems: "center", background: C.laranjaFundo, color: C.laranjaForte }}>{ICONES.ganhos}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: 14.5 }}>{nomeTipoGanho(g.tipo)}{g.descricao ? ` · ${g.descricao}` : ""}</b>
                  <span style={{ fontSize: 12.5, color: C.suave }}>{fmtData(g.data)} · {g.recebido ? "recebido" : "a receber"}</span>
                </span>
                <b style={{ whiteSpace: "nowrap", color: g.recebido ? C.verde : C.ambar }}>{dinheiro(g.valor)}</b>
              </button>
            ))}
          </div>
        )
      )}

      <FormGanho aberto={!!formGanho} ganho={formGanho && formGanho.id ? formGanho : null} acoes={acoes} aoFechar={() => setFormGanho(null)} />
    </div>
  );
}

function FormGanho({ aberto, ganho, acoes, aoFechar }) {
  const [d, setD] = useState({});
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  useEffect(() => {
    if (!aberto) return;
    setErro(""); setSalvando(false);
    setD(ganho ? { tipo: ganho.tipo, descricao: ganho.descricao, data: ganho.data, valor: valorParaCampo(ganho.valor), recebido: ganho.recebido }
      : { tipo: "recorrente", descricao: "", data: hojeIso(), valor: "", recebido: true });
  }, [aberto]); // eslint-disable-line
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  const salvar = async () => {
    const valor = parseValor(d.valor);
    if (valor === null || valor <= 0) return setErro("Preencha o valor. Ex.: 320,00");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.data || "")) return setErro("Escolha a data.");
    setErro(""); setSalvando(true);
    try { await acoes.salvarGanho({ ...(ganho ? { id: ganho.id } : {}), tipo: d.tipo, descricao: d.descricao.trim(), data: d.data, valor, recebido: !!d.recebido }); aoFechar(); }
    catch (e) { setErro(api.msgErro(e)); setSalvando(false); }
  };
  const excluir = async () => {
    if (!window.confirm("Mandar este ganho para a lixeira?")) return;
    setSalvando(true);
    try { await acoes.excluirGanho(ganho); aoFechar(); } catch (e) { setErro(api.msgErro(e)); setSalvando(false); }
  };
  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={ganho ? "Editar ganho" : "Lançar ganho"} sub="Recorrente, bônus, premiação…"
      rodape={<div style={{ display: "grid", gap: 8 }}>
        {erro && <div style={{ color: C.vermelho, fontWeight: 600, fontSize: 14 }}>{erro}</div>}
        <Botao cheio {...LARANJA} onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</Botao>
      </div>}>
      <Campo n={1} rotulo="Tipo"><Chips opcoes={TIPOS_GANHO} valor={d.tipo} mudar={(v) => set("tipo", v)} /></Campo>
      <Campo n={2} rotulo="Descrição (opcional)">
        <input className="sh-campo" value={d.descricao || ""} onChange={(e) => set("descricao", e.target.value)} placeholder="Ex.: recorrente de outubro, 3º lugar no ranking" />
      </Campo>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Campo n={3} rotulo="Data"><input className="sh-campo" type="date" value={d.data || ""} onChange={(e) => set("data", e.target.value)} /></Campo>
        <Campo n={4} rotulo="Valor"><input className="sh-campo" value={d.valor || ""} onChange={(e) => set("valor", e.target.value)} placeholder="Ex.: 320,00" inputMode="decimal" /></Campo>
      </div>
      <Campo n={5} rotulo="Recebimento"><Chips opcoes={[{ v: "sim", l: "Já recebi" }, { v: "nao", l: "Ainda vou receber" }]} valor={d.recebido ? "sim" : "nao"} mudar={(v) => set("recebido", v === "sim")} /></Campo>
      {ganho && <Botao cheio contorno cor={C.vermelho} icone={ICONES.lixo} onClick={excluir} disabled={salvando}>Mandar para a lixeira</Botao>}
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   Cotações vindas do catálogo
   --------------------------------------------------------------------- */
const SITUACOES = [
  { v: "novo", l: "Nova", tipo: "laranja" },
  { v: "contato", l: "Em contato", tipo: "azul" },
  { v: "fechou", l: "Fechou", tipo: "ok" },
  { v: "nao_fechou", l: "Não fechou", tipo: "neutro" },
];
const situacaoDe = (v) => SITUACOES.find((s) => s.v === v) || SITUACOES[0];

function mensagemResposta(o, cfg) {
  const veics = (o.veiculos || []).map((v) => (v.placa ? `${nomeTipo(v.tipo).toLowerCase()} ${v.placa}` : nomeTipo(v.tipo).toLowerCase()));
  return aplicar(cfg.msg_resposta || MENSAGENS.msg_resposta.texto, {
    primeiro_nome: primeiroNome(o.nome),
    veiculos: veics.length ? `, para o ${juntarLista(veics)}` : "",
  });
}

function CartaoCotacao({ o, cfg, acoes, compacto }) {
  const sit = situacaoDe(o.status);
  const veics = o.veiculos || [];
  const [aberto, setAberto] = useState(!compacto);
  return (
    <div style={{ ...S.card, padding: 14, borderLeft: `4px solid ${o.status === "novo" ? C.laranja : o.status === "fechou" ? C.verde : C.borda}` }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{nomeBonito(o.nome)}</div>
        <Selo tipo={sit.tipo}>{sit.l}</Selo>
      </div>
      <div style={{ fontSize: 13, color: C.suave, marginTop: 4, display: "flex", flexWrap: "wrap", gap: "2px 10px" }}>
        <span>{foneFmt(o.whatsapp)}</span>{o.cidade && <span>{o.cidade}</span>}<span>{fmtDataHora(o.criado)}</span>
      </div>
      {veics.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {veics.map((v, k) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: C.azulFundo, color: C.azul, fontSize: 12.5, fontWeight: 700 }}>
              <span style={{ display: "flex", transform: "scale(.7)", margin: "-4px" }}>{ICONE_TIPO[v.tipo]}</span>
              {nomeTipo(v.tipo)}{v.placa ? ` · ${v.placa}` : " · sem placa"}
            </span>
          ))}
        </div>
      )}
      {aberto && (o.respostas || []).length > 0 && (
        <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, background: C.fundo, display: "grid", gap: 4 }}>
          {o.respostas.map((r, k) => (
            <div key={k} style={{ fontSize: 13, lineHeight: 1.45 }}><span style={{ color: C.suave }}>{r.rotulo}:</span> <b style={{ fontWeight: 600 }}>{r.resposta}</b></div>
          ))}
        </div>
      )}
      {!aberto && (o.respostas || []).length > 0 && (
        <button onClick={() => setAberto(true)} style={{ border: "none", background: "transparent", color: C.azul, fontWeight: 700, fontSize: 12.5, padding: "8px 0 0" }}>
          Ver as respostas ({o.respostas.length})
        </button>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {foneOk(o.whatsapp) && (
          <BotaoWhats fone={o.whatsapp} msg={mensagemResposta(o, cfg)} aoAbrir={() => { if (o.status === "novo") acoes.alterarCotacao(o, { status: "contato" }); }}>Responder</BotaoWhats>
        )}
        {o.status !== "fechou" && (veics.length > 1 ? veics : [veics[0]]).map((v, k) => (
          <Botao key={k} pequeno contorno onClick={() => acoes.virarCliente(o, v)}>
            Virar cliente{veics.length > 1 ? ` · ${v.placa || nomeTipo(v.tipo)}` : ""}
          </Botao>
        ))}
      </div>
      {!compacto && (
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.suave, fontWeight: 600 }}>Marcar:</span>
          {SITUACOES.filter((s) => s.v !== o.status).map((s) => (
            <button key={s.v} onClick={() => acoes.alterarCotacao(o, { status: s.v }, `Marcada como “${s.l}”`)}
              style={{ padding: "6px 11px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, border: `1px solid ${C.borda}`, background: "#fff", color: C.texto }}>{s.l}</button>
          ))}
          <button onClick={() => { if (window.confirm(`Mandar a cotação de ${o.nome} para a lixeira?`)) acoes.excluirCotacao(o); }}
            style={{ marginLeft: "auto", border: "none", background: "transparent", color: C.suave, fontSize: 12.5, fontWeight: 700, textDecoration: "underline", padding: 4 }}>excluir</button>
        </div>
      )}
    </div>
  );
}

function Cotacoes({ dados, cfg, acoes }) {
  const [filtro, setFiltro] = useState("todos");
  const lista = dados.cotacoes;
  const conta = (v) => lista.filter((o) => o.status === v).length;
  const visiveis = lista.filter((o) => filtro === "todos" || o.status === filtro);
  const fechou = conta("fechou");
  const taxa = lista.length ? Math.round((fechou / lista.length) * 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
        <h1 style={S.h1}>Cotações</h1>
        <Botao pequeno contorno onClick={acoes.recarregarCotacoes}>Atualizar</Botao>
      </div>
      <div style={{ fontSize: 13.5, color: C.suave, marginBottom: 14, lineHeight: 1.5 }}>
        Quem preencheu o formulário do catálogo aparece aqui, mesmo que a conversa no WhatsApp não tenha acontecido.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10, marginBottom: 12 }}>
        <Numero rotulo="Recebidas" valor={String(lista.length)} destaque />
        <Numero rotulo="Novas" valor={String(conta("novo"))} cor={conta("novo") ? C.laranjaForte : C.texto} />
        <Numero rotulo="Fecharam" valor={String(fechou)} cor={C.verde} sub={lista.length ? `${taxa}% das cotações` : undefined} />
      </div>
      {lista.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Chips rolar valor={filtro} mudar={setFiltro} opcoes={[{ v: "todos", l: `Todas ${lista.length}` }, ...SITUACOES.map((s) => ({ v: s.v, l: `${s.l} ${conta(s.v)}` }))]} />
        </div>
      )}
      {visiveis.length === 0 ? (
        <Vazio texto={lista.length === 0 ? "Ninguém pediu cotação pelo catálogo ainda. Divulgue o link no Início." : "Nenhuma cotação nesta situação."} />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>{visiveis.map((o) => <CartaoCotacao key={o.id} o={o} cfg={cfg} acoes={acoes} />)}</div>
      )}
      <AcessosCatalogo />
    </div>
  );
}

/* ---------------------------------------------------------------------
   Fotos do catálogo — um espaço, uma foto, escolhida da galeria
   --------------------------------------------------------------------- */
function Fotos({ cfg, acoes }) {
  const [enviando, setEnviando] = useState("");
  const comFoto = FOTOS_CATALOGO.filter((e) => fotoDoEspaco(cfg, e.id)).length;

  const escolher = async (e, espaco) => {
    const arq = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!arq) return;
    if (!arq.type.startsWith("image/")) return acoes.avisar("Escolha uma foto (JPG, PNG ou WEBP).", "erro");
    setEnviando(espaco.id);
    let url = "";
    try {
      url = await api.enviarFoto(arq, "catalogo");
      /* salvarConfig apaga do servidor a foto antiga deste espaço */
      await acoes.salvarConfig({ fotos: { ...cfg.fotos, [espaco.id]: url } });
      acoes.avisar(`Foto de “${espaco.titulo}” atualizada`);
    } catch (err) {
      if (url) api.removerArquivos([url]).catch(() => {});   // subiu mas não salvou: não deixa lixo
      acoes.avisar(api.msgErro(err), "erro");
    }
    setEnviando("");
  };
  const tirar = async (espaco) => {
    const temPadrao = !!espaco.padrao;
    if (!window.confirm(temPadrao ? `Tirar a sua foto de “${espaco.titulo}” e voltar para a foto padrão?` : `Tirar a foto de “${espaco.titulo}”? Esse lugar do catálogo fica sem foto.`)) return;
    setEnviando(espaco.id);
    try {
      const f = { ...cfg.fotos };
      delete f[espaco.id];
      await acoes.salvarConfig({ fotos: f });
      acoes.avisar("Foto tirada");
    } catch (err) { acoes.avisar(api.msgErro(err), "erro"); }
    setEnviando("");
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <h1 style={S.h1}>Fotos do catálogo</h1>
        <a href="/catalogo" target="_blank" rel="noopener noreferrer" className="sh-toque"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${C.azul}`, color: C.azul,
            fontWeight: 700, fontSize: 13.5, textDecoration: "none", whiteSpace: "nowrap" }}>{ICONES.catalogo}Ver</a>
      </div>
      <div style={{ ...S.card, padding: 14, margin: "10px 0 14px", fontSize: 13.5, color: C.suave, lineHeight: 1.6 }}>
        Cada lugar do catálogo recebe <b style={{ color: C.texto }}>uma foto</b>. Toque em <b style={{ color: C.texto }}>Escolher da galeria</b> e pegue a foto do
        celular: ela encolhe sozinha antes de subir. Trocou a foto, a antiga é apagada do servidor. Lugar sem foto fica escondido no catálogo, sem buraco.
        <div style={{ marginTop: 8, fontWeight: 700, color: C.azul }}>{comFoto} de {FOTOS_CATALOGO.length} lugares com foto</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,290px),1fr))", gap: 12 }}>
        {FOTOS_CATALOGO.map((e, k) => {
          const propria = cfg.fotos[e.id];
          const src = fotoDoEspaco(cfg, e.id);
          const [a, b] = e.proporcao.split("/").map(Number);
          const ocupado = enviando === e.id;
          return (
            <div key={e.id} style={{ ...S.card, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", paddingTop: `${Math.min(100, (b / a) * 100)}%`, background: src ? C.noite : C.azulFundo }}>
                {src ? (
                  <img src={src} alt={e.titulo} loading="lazy" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, display: "grid", placeItems: "center", color: C.azul, textAlign: "center", padding: 14 }}>
                    <div><div style={{ display: "flex", justifyContent: "center", transform: "scale(1.6)", marginBottom: 12 }}>{ICONES.foto}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>Sem foto: este lugar está escondido</div></div>
                  </div>
                )}
                <span style={{ position: "absolute", top: 10, left: 10, minWidth: 28, height: 28, padding: "0 8px", borderRadius: 9, display: "grid", placeItems: "center",
                  background: C.laranja, color: C.noite, fontWeight: 800, fontSize: 13 }}>{k + 1}</span>
                <span style={{ position: "absolute", top: 10, right: 10 }}>
                  {propria ? <Selo tipo="ok">Sua foto</Selo> : src ? <Selo tipo="azul">Foto padrão</Selo> : <Selo tipo="aviso">Falta</Selo>}
                </span>
                {ocupado && (
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, background: "rgba(7,18,51,.65)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700 }}>
                    <div style={{ display: "grid", placeItems: "center", gap: 10 }}>
                      <div className="sh-roda" style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid rgba(255,255,255,.25)", borderTopColor: C.laranja }} />
                      Enviando…
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 800, fontSize: 15.5 }}>{e.titulo}</div>
                <div style={{ fontSize: 13, color: C.texto, marginTop: 3, lineHeight: 1.45 }}>{e.onde}</div>
                <div style={{ fontSize: 12.5, color: C.suave, marginTop: 6, lineHeight: 1.5 }}>Dica: {e.dica} Formato {e.proporcao.replace("/", " por ")} {a > b ? "(deitada)" : a < b ? "(em pé)" : "(quadrada)"}.</div>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <label className="sh-toque" style={{ flex: "1 1 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44, padding: "0 14px",
                    borderRadius: 12, background: C.azul, color: "#fff", fontWeight: 700, fontSize: 14, cursor: ocupado ? "default" : "pointer", opacity: enviando && !ocupado ? 0.5 : 1 }}>
                    {ICONES.foto}{src ? "Trocar foto" : "Escolher da galeria"}
                    <input type="file" accept="image/*" onChange={(ev) => escolher(ev, e)} disabled={!!enviando} style={{ display: "none" }} />
                  </label>
                  {propria && (
                    <Botao pequeno contorno cor={C.vermelho} onClick={() => tirar(e)} disabled={!!enviando} style={{ minHeight: 44 }}>
                      {e.padrao ? "Voltar à padrão" : "Tirar"}
                    </Botao>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
