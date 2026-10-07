import { useState, useEffect } from "react";
import * as api from "./api.js";
import {
  PERGUNTAS_PADRAO, TIPOS_PERGUNTA, MENSAGENS, CONFIG_PADRAO, QUADROS_SOBRE, MOTIVOS, soDigitos, foneFmt, foneOk, foneLimpo, foneDigitando,
  dinheiro, fmtData, nomeTipo,
} from "./padroes.js";
import {
  C, S, ICONES, Modal, Botao, LARANJA, Campo, Interruptor, Chips, Selo, Carregando, Vazio, Credito, Linha, tamanho,
} from "./ui.jsx";

/* =====================================================================
   AJUSTES — tudo o que o Geovanne muda sem mexer em código
   ===================================================================== */

/* rascunho que volta ao valor salvo toda vez que a janela abre */
function useRascunho(aberto, valor) {
  const [r, setR] = useState(valor);
  useEffect(() => { if (aberto) setR(valor); }, [aberto]); // eslint-disable-line
  return [r, setR];
}

function useSalvar(acoes, fechar) {
  const [salvando, setSalvando] = useState(false);
  const salvar = async (parcial, msg = "Salvo") => {
    setSalvando(true);
    try { await acoes.salvarConfig(parcial); acoes.avisar(msg); fechar(); }
    catch (e) { acoes.avisar(api.msgErro(e), "erro"); }
    setSalvando(false);
  };
  return [salvar, salvando];
}

export default function Ajustes({ cfg, acoes, sessao }) {
  const [aberto, setAberto] = useState("");
  const abrir = (id) => setAberto(id);
  const fechar = () => setAberto("");
  const p = { cfg, acoes, fechar };
  const ehIphone = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalado = window.matchMedia && (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone);

  return (
    <div>
      <h1 style={S.h1}>Ajustes</h1>
      <div style={{ fontSize: 13, color: C.suave, margin: "0 2px 6px", overflowWrap: "anywhere" }}>{sessao.user?.email}</div>

      <div style={S.titSecao}>Você e a Shield</div>
      <div style={{ ...S.card, overflow: "hidden" }}>
        <Linha primeira icone={ICONES.pessoa} titulo="Meus dados" sub={`${cfg.nome} · ${cfg.cargo} · ${foneFmt(cfg.whatsapp)}`} aoTocar={() => abrir("eu")} />
        <Linha icone={ICONES.predio} titulo="Dados da Shield" sub={`Central ${cfg.central} · ${cfg.endereco}`} aoTocar={() => abrir("shield")} />
      </div>

      <div style={S.titSecao}>Catálogo</div>
      <div style={{ ...S.card, overflow: "hidden" }}>
        <Linha primeira icone={ICONES.texto} titulo="Textos do catálogo" sub="Frase da abertura, sobre você, quadros e os motivos da Shield" aoTocar={() => abrir("textos")} />
        <Linha icone={ICONES.formulario} titulo="Formulário de cotação" sub={`${cfg.perguntas.length} pergunta(s) além de nome, WhatsApp, cidade e veículo`} aoTocar={() => abrir("formulario")} />
        <Linha icone={ICONES.mensagem} titulo="Mensagens do WhatsApp" sub="Cotação, resposta, boas-vindas e divulgação" aoTocar={() => abrir("mensagens")} />
      </div>

      <div style={S.titSecao}>Celular e sistema</div>
      <div style={{ ...S.card, overflow: "hidden" }}>
        <Linha primeira icone={ICONES.celular} titulo="Instalar na tela inicial" sub={instalado ? "Este aparelho já abre pelo ícone" : "Passo a passo para iPhone e Android"} aoTocar={() => abrir("instalar")}
          direita={instalado ? <Selo tipo="ok">instalado</Selo> : null} />
        <Linha icone={ICONES.disco} titulo="Espaço das fotos" sub="Quanto do 1 GB grátis já foi usado" aoTocar={() => abrir("espaco")} />
        <Linha icone={ICONES.lixo} titulo="Lixeira" sub="Clientes, ganhos e cotações excluídos" aoTocar={() => abrir("lixeira")} />
      </div>

      <div style={S.titSecao}>Minha conta</div>
      <div style={{ ...S.card, overflow: "hidden" }}>
        <Linha primeira icone={ICONES.pessoa} titulo="Trocar minha senha" aoTocar={() => abrir("senha")} />
        <Linha icone={ICONES.catalogo} titulo="Abrir o catálogo" sub={`${window.location.origin}/catalogo/`} aoTocar={() => window.open("/catalogo/", "_blank")} />
        <Linha icone={ICONES.sair} titulo="Sair do app" aoTocar={() => { if (window.confirm("Sair do app?")) api.logout(); }} />
      </div>

      <Credito />

      <MeusDados aberto={aberto === "eu"} {...p} />
      <DadosShield aberto={aberto === "shield"} {...p} />
      <Textos aberto={aberto === "textos"} {...p} />
      <EditorFormulario aberto={aberto === "formulario"} {...p} />
      <Mensagens aberto={aberto === "mensagens"} {...p} />
      <Instalar aberto={aberto === "instalar"} fechar={fechar} ehIphone={ehIphone} />
      <Espaco aberto={aberto === "espaco"} fechar={fechar} acoes={acoes} />
      <Lixeira aberto={aberto === "lixeira"} fechar={fechar} acoes={acoes} />
      <Senha aberto={aberto === "senha"} fechar={fechar} acoes={acoes} />
    </div>
  );
}

/* ---------------------------------------------------------------------
   Meus dados (aparecem no catálogo e no app)
   --------------------------------------------------------------------- */
function MeusDados({ aberto, cfg, acoes, fechar }) {
  const [r, setR] = useRascunho(aberto, { nome: cfg.nome, cargo: cfg.cargo, whatsapp: foneDigitando(foneLimpo(cfg.whatsapp)), instagram: cfg.instagram });
  const [salvar, salvando] = useSalvar(acoes, fechar);
  const set = (k, v) => setR((x) => ({ ...x, [k]: v }));
  const ok = () => {
    if (r.nome.trim().length < 2) return acoes.avisar("Preencha o seu nome.", "erro");
    if (!foneOk(r.whatsapp)) return acoes.avisar("Confira o WhatsApp: DDD + número. Ex.: (34) 8426-7938.", "erro");
    salvar({ nome: r.nome.trim().replace(/\s+/g, " "), cargo: r.cargo.trim(), whatsapp: foneLimpo(r.whatsapp), instagram: r.instagram.replace(/^@/, "").trim() });
  };
  return (
    <Modal aberto={aberto} aoFechar={fechar} titulo="Meus dados" sub="Aparecem no catálogo e no app"
      rodape={<Botao cheio {...LARANJA} onClick={ok} disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</Botao>}>
      <Campo n={1} rotulo="Nome" dica="O primeiro nome aparece em destaque na abertura do catálogo e o sobrenome em laranja embaixo.">
        <input className="sh-campo" value={r.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex.: Geovanne Marcondes" />
      </Campo>
      <Campo n={2} rotulo="Função">
        <Chips opcoes={["Executivo de Vendas", "Consultor de Vendas", "Consultor Shield"]} valor={r.cargo} mudar={(v) => set("cargo", v)} />
        <input className="sh-campo" value={r.cargo} onChange={(e) => set("cargo", e.target.value)} placeholder="Ou escreva outra" style={{ marginTop: 10 }} />
      </Campo>
      <Campo n={3} rotulo="WhatsApp que recebe as cotações" dica="É para este número que o catálogo manda as mensagens.">
        <input className="sh-campo" inputMode="tel" value={r.whatsapp} onChange={(e) => set("whatsapp", foneDigitando(e.target.value))} placeholder="Ex.: (34) 8426-7938" />
      </Campo>
      <Campo n={4} rotulo="Instagram">
        <input className="sh-campo" value={r.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="Ex.: gemarcondes77" />
      </Campo>
      <div style={{ borderRadius: 16, padding: "14px 16px", color: "#fff", background: `linear-gradient(135deg, ${C.azul}, ${C.marinho})`, display: "flex", alignItems: "center", gap: 12 }}>
        <img src="/emblema.png" alt="" width="42" height="42" style={{ borderRadius: 12 }} />
        <div style={{ minWidth: 0, lineHeight: 1.25 }}>
          <div style={{ fontWeight: 800 }}>{r.nome || "—"}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.amarelo }}>{r.cargo} · Shield</div>
        </div>
      </div>
    </Modal>
  );
}

function DadosShield({ aberto, cfg, acoes, fechar }) {
  const [r, setR] = useRascunho(aberto, { central: cfg.central, endereco: cfg.endereco, bairro: cfg.bairro, link_android: cfg.link_android, link_iphone: cfg.link_iphone });
  const [salvar, salvando] = useSalvar(acoes, fechar);
  const set = (k, v) => setR((x) => ({ ...x, [k]: v }));
  const ok = () => {
    if (soDigitos(r.central).length < 8) return acoes.avisar("Confira o número da central.", "erro");
    const link = (s) => { const t = String(s || "").trim(); return t && !/^https?:\/\//i.test(t) ? `https://${t}` : t; };
    salvar({ central: r.central.trim(), endereco: r.endereco.trim(), bairro: r.bairro.trim(), link_android: link(r.link_android), link_iphone: link(r.link_iphone) });
  };
  return (
    <Modal aberto={aberto} aoFechar={fechar} titulo="Dados da Shield" sub="Central, sede e aplicativo"
      rodape={<Botao cheio {...LARANJA} onClick={ok} disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</Botao>}>
      <Campo n={1} rotulo="Central / assistência" dica="Aparece na seção da assistência 24h, no fim do catálogo e na mensagem de boas-vindas.">
        <input className="sh-campo" inputMode="tel" value={r.central} onChange={(e) => set("central", e.target.value)} placeholder="Ex.: 0800 967 7000" />
      </Campo>
      <Campo n={2} rotulo="Endereço da sede" dica="Use · para separar, como está. É o que aparece girando em volta do mapa.">
        <input className="sh-campo" value={r.endereco} onChange={(e) => set("endereco", e.target.value)} placeholder="Ex.: Av. João Naves de Ávila, 775 · Loja 02" />
      </Campo>
      <Campo n={3} rotulo="Bairro e cidade">
        <input className="sh-campo" value={r.bairro} onChange={(e) => set("bairro", e.target.value)} placeholder="Ex.: Aparecida · Uberlândia – MG" />
      </Campo>
      <Campo n={4} rotulo="Link do app Shield no Google Play">
        <input className="sh-campo" value={r.link_android} onChange={(e) => set("link_android", e.target.value)} placeholder="https://play.google.com/…" />
      </Campo>
      <Campo n={5} rotulo="Link do app Shield na App Store (iPhone)" dica="Abra o app Shield na App Store, toque em Compartilhar → Copiar link, e cole aqui. Vazio, o botão da App Store não aparece.">
        <input className="sh-campo" value={r.link_iphone} onChange={(e) => set("link_iphone", e.target.value)} placeholder="https://apps.apple.com/…" />
      </Campo>
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   Textos do catálogo
   --------------------------------------------------------------------- */
function Textos({ aberto, cfg, acoes, fechar }) {
  const copia = () => ({ frase: cfg.frase, sobre: cfg.sobre, quadros: cfg.quadros.map((q) => ({ ...q })), motivos: cfg.motivos.map((q) => ({ ...q })) });
  const [r, setR] = useRascunho(aberto, copia());
  const [salvar, salvando] = useSalvar(acoes, fechar);
  const mudarItem = (lista, i, k, v) => setR((x) => ({ ...x, [lista]: x[lista].map((q, j) => (j === i ? { ...q, [k]: v } : q)) }));
  const original = () => {
    if (window.confirm("Voltar todos os textos ao original?")) {
      setR({ frase: CONFIG_PADRAO.frase, sobre: CONFIG_PADRAO.sobre, quadros: QUADROS_SOBRE.map((q) => ({ ...q })), motivos: MOTIVOS.map((q) => ({ ...q })) });
    }
  };
  const ok = () => {
    const limpa = (l) => l.map((q) => ({ t: q.t.trim(), d: q.d.trim() })).filter((q) => q.t || q.d);
    salvar({ frase: r.frase.trim(), sobre: r.sobre.trim(), quadros: limpa(r.quadros), motivos: limpa(r.motivos) }, "Textos salvos");
  };
  const bloco = (lista, titulo, dica) => (
    <>
      <div style={S.titSecao}>{titulo}</div>
      {dica && <div style={{ ...S.dica, margin: "-4px 2px 10px" }}>{dica}</div>}
      {r[lista].map((q, i) => (
        <div key={i} style={{ ...S.card, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <span style={{ flex: "0 0 26px", height: 26, borderRadius: 8, background: C.azul, color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
            <input className="sh-campo" value={q.t} onChange={(e) => mudarItem(lista, i, "t", e.target.value)} placeholder="Título" style={{ fontWeight: 700 }} />
          </div>
          <textarea className="sh-campo" rows={3} value={q.d} onChange={(e) => mudarItem(lista, i, "d", e.target.value)} placeholder="Texto" style={{ resize: "vertical", lineHeight: 1.5 }} />
          {r[lista].length > 2 && (
            <button type="button" onClick={() => setR((x) => ({ ...x, [lista]: x[lista].filter((_, j) => j !== i) }))}
              style={{ border: "none", background: "transparent", color: C.vermelho, fontSize: 12.5, fontWeight: 700, padding: "8px 0 0" }}>tirar este</button>
          )}
        </div>
      ))}
      {r[lista].length < 6 && (
        <Botao pequeno contorno cor={C.azul} icone={ICONES.mais} onClick={() => setR((x) => ({ ...x, [lista]: [...x[lista], { t: "", d: "" }] }))}>Acrescentar</Botao>
      )}
    </>
  );
  return (
    <Modal aberto={aberto} aoFechar={fechar} titulo="Textos do catálogo" largo
      rodape={<Botao cheio {...LARANJA} onClick={ok} disabled={salvando}>{salvando ? "Salvando…" : "Salvar textos"}</Botao>}>
      <Campo n={1} rotulo="Frase da abertura" dica="Aparece embaixo do seu nome, na primeira tela.">
        <textarea className="sh-campo" rows={2} value={r.frase} onChange={(e) => setR((x) => ({ ...x, frase: e.target.value }))} style={{ resize: "vertical", lineHeight: 1.5 }} />
      </Campo>
      <Campo n={2} rotulo="“Prazer, eu sou o…” — o texto sobre você">
        <textarea className="sh-campo" rows={4} value={r.sobre} onChange={(e) => setR((x) => ({ ...x, sobre: e.target.value }))} style={{ resize: "vertical", lineHeight: 1.5 }} />
      </Campo>
      {bloco("quadros", "Quadros sobre você", "Ficam embaixo do texto sobre você. Ex.: atendimento, destaque no ranking, basquete.")}
      {bloco("motivos", "Motivos para ser Shield", "O carrossel numerado na parte da empresa.")}
      <div style={{ marginTop: 18 }}><Botao pequeno contorno cor={C.suave} onClick={original}>Voltar aos textos originais</Botao></div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   Formulário de cotação (as perguntas além de nome, WhatsApp, cidade e veículo)
   --------------------------------------------------------------------- */
const nomeTipoPergunta = (t) => (TIPOS_PERGUNTA.find((x) => x.v === t) || {}).l || t;

function EditorFormulario({ aberto, cfg, acoes, fechar }) {
  const [lista, setLista] = useRascunho(aberto, cfg.perguntas.map((p) => ({ ...p, opcoes: [...(p.opcoes || [])] })));
  const [editando, setEditando] = useState(null);
  const [salvar, salvando] = useSalvar(acoes, fechar);
  const mover = (i, d) => { const l = [...lista]; const j = i + d; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; setLista(l); };
  const tirar = (p) => {
    if (!window.confirm(`Tirar a pergunta "${p.titulo}"?`)) return;
    setLista(lista.filter((x) => x.id !== p.id).map((x) => (x.mostrar_se && x.mostrar_se.pergunta === p.id ? { ...x, mostrar_se: null } : x)));
  };
  const gravarPergunta = (p) => { setLista((l) => (l.some((x) => x.id === p.id) ? l.map((x) => (x.id === p.id ? p : x)) : [...l, p])); setEditando(null); };
  const original = () => { if (window.confirm("Voltar ao formulário original? As suas mudanças somem.")) setLista(PERGUNTAS_PADRAO.map((p) => ({ ...p }))); };
  const titulo = (id) => (lista.find((x) => x.id === id) || {}).titulo || "?";

  return (
    <Modal aberto={aberto} aoFechar={fechar} titulo="Formulário de cotação" sub="O cliente responde antes de enviar pelo WhatsApp" largo
      rodape={<Botao cheio {...LARANJA} onClick={() => salvar({ perguntas: lista }, "Formulário salvo")} disabled={salvando}>{salvando ? "Salvando…" : "Salvar formulário"}</Botao>}>
      <div style={{ ...S.card, padding: 14, fontSize: 13.5, color: C.suave, lineHeight: 1.6, marginBottom: 12 }}>
        O formulário tem três etapas. As duas primeiras são fixas: <b style={{ color: C.texto }}>nome, WhatsApp, cidade</b> e <b style={{ color: C.texto }}>veículo com a placa</b>.
        Estas aqui são a terceira etapa, “Detalhes”. A ordem daqui é a ordem do catálogo, e as respostas vão escritas na mensagem do WhatsApp e na aba Cotações.
      </div>
      {lista.length === 0 && <Vazio texto="Nenhuma pergunta extra: a cotação vai só com os dados e o veículo." />}
      {lista.map((p, i) => (
        <div key={p.id} style={{ ...S.card, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ flex: "0 0 26px", height: 26, borderRadius: 8, background: C.azul, color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.35 }}>{p.titulo}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                <Selo tipo="neutro">{nomeTipoPergunta(p.tipo)}</Selo>
                {p.obrigatoria ? <Selo tipo="laranja">obrigatória</Selo> : <Selo tipo="neutro">opcional</Selo>}
                {p.mostrar_se && p.mostrar_se.pergunta && (
                  <span style={{ padding: "4px 9px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: C.ambarFundo, color: C.ambar, lineHeight: 1.4 }}>
                    só aparece se “{titulo(p.mostrar_se.pergunta)}” for “{p.mostrar_se.resposta}”
                  </span>
                )}
              </div>
              {(p.opcoes || []).length > 0 && <div style={{ fontSize: 12.5, color: C.suave, marginTop: 6, lineHeight: 1.5 }}>{p.opcoes.join(" · ")}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            <Botao pequeno contorno cor={C.texto} icone={ICONES.editar} onClick={() => setEditando(p)}>Editar</Botao>
            <Botao pequeno contorno cor={C.texto} onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir">{ICONES.cima}</Botao>
            <Botao pequeno contorno cor={C.texto} onClick={() => mover(i, 1)} disabled={i === lista.length - 1} aria-label="Descer">{ICONES.baixo}</Botao>
            <Botao pequeno contorno cor={C.vermelho} icone={ICONES.lixo} onClick={() => tirar(p)}>Tirar</Botao>
          </div>
        </div>
      ))}
      <Botao cheio contorno cor={C.azul} icone={ICONES.mais} onClick={() => setEditando({ id: `p${Date.now()}`, titulo: "", rotulo: "", tipo: "opcoes", opcoes: [], obrigatoria: false, novo: true })}>
        Nova pergunta
      </Botao>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <Botao pequeno contorno cor={C.suave} onClick={original}>Voltar ao formulário original</Botao>
        <Botao pequeno contorno cor={C.suave} icone={ICONES.catalogo} onClick={() => window.open("/catalogo/", "_blank")}>Ver o catálogo</Botao>
      </div>
      <EditarPergunta p={editando} lista={lista} aoFechar={() => setEditando(null)} gravar={gravarPergunta} avisar={acoes.avisar} />
    </Modal>
  );
}

function EditarPergunta({ p, lista, aoFechar, gravar, avisar }) {
  const [r, setR] = useState(null);
  useEffect(() => { setR(p ? { ...p, _opcoes: (p.opcoes || []).join("\n"), mostrar_se: p.mostrar_se || null } : null); }, [p]);
  if (!p || !r) return null;
  const set = (k, v) => setR((x) => ({ ...x, [k]: v }));
  const temOpcoes = r.tipo === "opcoes";
  const candidatas = lista.filter((x) => x.id !== r.id && x.tipo === "opcoes" && (x.opcoes || []).length);
  const condicao = r.mostrar_se && r.mostrar_se.pergunta ? lista.find((x) => x.id === r.mostrar_se.pergunta) : null;
  const ok = () => {
    if (!r.titulo.trim()) return avisar("Escreva a pergunta.", "erro");
    const opcoes = r._opcoes.split("\n").map((x) => x.trim()).filter(Boolean);
    if (temOpcoes && opcoes.length < 2) return avisar("Coloque pelo menos duas opções, uma por linha.", "erro");
    const { _opcoes, novo, ...resto } = r;
    gravar({ ...resto, titulo: r.titulo.trim(), rotulo: (r.rotulo || "").trim() || r.titulo.trim(), opcoes: temOpcoes ? opcoes : [],
      mostrar_se: r.mostrar_se && r.mostrar_se.pergunta && r.mostrar_se.resposta ? r.mostrar_se : null });
  };
  return (
    <Modal aberto={!!p} aoFechar={aoFechar} titulo={p.novo ? "Nova pergunta" : "Editar pergunta"} rodape={<Botao cheio {...LARANJA} onClick={ok}>Pronto</Botao>}>
      <Campo n={1} rotulo="A pergunta">
        <input className="sh-campo" value={r.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex.: O veículo é financiado?" />
      </Campo>
      <Campo n={2} rotulo="Nome curto na mensagem do WhatsApp" dica="Ex.: “Como o veículo é usado no dia a dia?” vai na mensagem como “Uso: Trabalho”.">
        <input className="sh-campo" value={r.rotulo || ""} onChange={(e) => set("rotulo", e.target.value)} placeholder="Ex.: Financiado" />
      </Campo>
      <Campo n={3} rotulo="Tipo de resposta">
        <Chips opcoes={TIPOS_PERGUNTA} valor={r.tipo} mudar={(v) => set("tipo", v)} />
      </Campo>
      {temOpcoes ? (
        <Campo n={4} rotulo="Opções (uma por linha)">
          <textarea className="sh-campo" rows={5} value={r._opcoes} onChange={(e) => set("_opcoes", e.target.value)} style={{ resize: "vertical", lineHeight: 1.5 }} placeholder={"Ex.:\nSim\nNão"} />
        </Campo>
      ) : (
        <Campo n={4} rotulo="Exemplo dentro do campo" dica="Aparece clarinho no campo, antes de a pessoa digitar.">
          <input className="sh-campo" value={r.exemplo || ""} onChange={(e) => set("exemplo", e.target.value)} placeholder="Ex.: Ex.: Onix 2020" />
        </Campo>
      )}
      <Campo n={5} rotulo="Explicação embaixo da pergunta (opcional)">
        <textarea className="sh-campo" rows={2} value={r.nota || ""} onChange={(e) => set("nota", e.target.value)} style={{ resize: "vertical" }} />
      </Campo>
      <Interruptor ligado={!!r.obrigatoria} mudar={(v) => set("obrigatoria", v)} rotulo="Resposta obrigatória" dica="Ligado, o cliente só envia depois de responder." />
      {candidatas.length > 0 && (
        <Campo rotulo="Quando mostrar esta pergunta">
          <Chips opcoes={["Sempre", ...candidatas.map((x) => x.titulo)]} valor={condicao ? condicao.titulo : "Sempre"}
            mudar={(t) => { const q = candidatas.find((x) => x.titulo === t); set("mostrar_se", q ? { pergunta: q.id, resposta: "" } : null); }} />
          {condicao && (
            <div style={{ marginTop: 12 }}>
              <div style={S.rotulo}>Só quando a resposta for:</div>
              <Chips opcoes={condicao.opcoes} valor={r.mostrar_se.resposta} mudar={(v) => set("mostrar_se", { pergunta: condicao.id, resposta: v })} />
            </div>
          )}
        </Campo>
      )}
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   Mensagens do WhatsApp, editáveis
   --------------------------------------------------------------------- */
const EXPLICA = {
  msg_cotacao: "{nome} o nome do cliente · {dados} nome, WhatsApp e cidade · {veiculos} os veículos com a placa · {respostas} as respostas do formulário.",
  msg_resposta: "{primeiro_nome} o primeiro nome do cliente · {veiculos} os veículos da cotação.",
  msg_boas_vindas: "{primeiro_nome} o primeiro nome · {veiculo} o tipo e o modelo · {plano} o plano, quando anotado · {central} o número da central.",
  msg_divulgar: "{link} o endereço do catálogo.",
};

function Mensagens({ aberto, cfg, acoes, fechar }) {
  const [id, setId] = useState(null);
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const m = id ? MENSAGENS[id] : null;
  const abrirMsg = (k) => { setTexto(cfg[k] || MENSAGENS[k].texto); setId(k); };
  const gravar = async () => {
    setSalvando(true);
    try { await acoes.salvarConfig({ [id]: texto }); acoes.avisar("Mensagem salva"); setId(null); }
    catch (e) { acoes.avisar(api.msgErro(e), "erro"); }
    setSalvando(false);
  };
  return (
    <Modal aberto={aberto} aoFechar={fechar} titulo="Mensagens do WhatsApp">
      <div style={{ ...S.card, padding: 14, fontSize: 13.5, color: C.suave, lineHeight: 1.55, marginBottom: 12 }}>
        Toque numa mensagem para mudar o texto. As palavras entre chaves, como <b style={{ color: C.texto }}>{"{primeiro_nome}"}</b>, são trocadas na hora de enviar.
      </div>
      <div style={{ ...S.card, overflow: "hidden" }}>
        {Object.entries(MENSAGENS).map(([k, v], i) => (
          <Linha key={k} primeira={!i} titulo={v.titulo} sub={v.quando} aoTocar={() => abrirMsg(k)}
            direita={cfg[k] && cfg[k] !== v.texto ? <Selo tipo="laranja">editada</Selo> : null} />
        ))}
      </div>
      <Modal aberto={!!m} aoFechar={() => setId(null)} titulo={m ? m.titulo : ""} sub="Mensagem do WhatsApp"
        rodape={
          <div style={{ display: "grid", gap: 8 }}>
            <Botao cheio {...LARANJA} onClick={gravar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar mensagem"}</Botao>
            <Botao cheio contorno cor={C.suave} onClick={() => { if (window.confirm("Voltar ao texto original?")) setTexto(m.texto); }}>Voltar ao texto original</Botao>
          </div>
        }>
        {m && (
          <>
            <div style={{ ...S.card, padding: 14, marginBottom: 14, fontSize: 13.5, color: C.suave, lineHeight: 1.5 }}>{m.quando}</div>
            <label style={S.rotulo}>Texto da mensagem</label>
            <textarea className="sh-campo" rows={10} value={texto} onChange={(e) => setTexto(e.target.value)} style={{ resize: "vertical", lineHeight: 1.5 }} />
            {m.campos.length > 0 && (
              <>
                <div style={{ ...S.rotulo, marginTop: 16 }}>Toque para inserir no fim do texto</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {m.campos.map((c) => (
                    <button key={c} type="button" onClick={() => setTexto((t) => t + c)} style={{ padding: "8px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700,
                      border: `1.5px solid ${C.borda}`, background: "#fff", color: C.azul }}>{c}</button>
                  ))}
                </div>
              </>
            )}
            <div style={{ ...S.card, padding: 14, marginTop: 16, fontSize: 12.5, color: C.suave, lineHeight: 1.6 }}>
              {EXPLICA[id] && <><b style={{ color: C.texto }}>O que cada um vale:</b> {EXPLICA[id]}<br /></>}
              Se os emojis chegarem errados no WhatsApp do computador, apague-os aqui. Pelo celular eles funcionam normalmente.
            </div>
          </>
        )}
      </Modal>
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   Instalar na tela inicial (os dois passo a passo sempre à vista)
   --------------------------------------------------------------------- */
function Instalar({ aberto, fechar, ehIphone }) {
  const grupos = [
    { id: "iphone", titulo: "No iPhone", deste: ehIphone, passos: [
      <>Abra este app pelo <b>Safari</b>. Pelo Chrome do iPhone não funciona.</>,
      <>Toque no botão <b>Compartilhar</b>, o quadrado com a seta para cima.</>,
      <>Role a lista e escolha <b>Adicionar à Tela de Início</b>.</>,
      <>Toque em <b>Adicionar</b>, no canto de cima.</>,
      <>Daí em diante, abra sempre pelo ícone do escudo na tela do celular.</>,
    ] },
    { id: "android", titulo: "No Android", deste: !ehIphone, passos: [
      <>Abra este app pelo <b>Chrome</b>.</>,
      <>Toque nos <b>três pontinhos</b> no canto de cima.</>,
      <>Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</>,
      <>Confirme em <b>Instalar</b>.</>,
      <>Daí em diante, abra sempre pelo ícone do escudo na tela do celular.</>,
    ] },
  ].sort((a, b) => (b.deste ? 1 : 0) - (a.deste ? 1 : 0));
  return (
    <Modal aberto={aberto} aoFechar={fechar} titulo="Instalar na tela inicial" sub="O app abre como um aplicativo, em tela cheia">
      {grupos.map((g) => (
        <div key={g.id} style={{ ...S.card, padding: 16, fontSize: 14, lineHeight: 1.6, marginBottom: 10, border: `1.5px solid ${g.deste ? C.laranja : C.borda}` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 800, marginBottom: 8 }}>
            <span style={{ color: C.azul, display: "flex" }}>{ICONES.celular}</span>{g.titulo}
            {g.deste && <span style={{ marginLeft: "auto" }}><Selo tipo="laranja">ESTE CELULAR</Selo></span>}
          </div>
          <ol style={{ margin: 0, paddingLeft: 20, color: C.suave, display: "grid", gap: 4 }}>
            {g.passos.map((p, k) => <li key={k}>{p}</li>)}
          </ol>
        </div>
      ))}
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   Espaço das fotos (o 1 GB grátis do Supabase)
   --------------------------------------------------------------------- */
const LIMITE_BYTES = 1024 * 1024 * 1024;
const PASTAS = { catalogo: "Fotos do catálogo" };
function Espaco({ aberto, fechar, acoes }) {
  const [arquivos, setArquivos] = useState(null);
  const [usados, setUsados] = useState(null);
  const [limpando, setLimpando] = useState(false);
  const carregar = async () => {
    setArquivos(null);
    try { const [a, u] = await Promise.all([api.listarArquivos(), api.arquivosEmUso()]); setArquivos(a); setUsados(u); }
    catch (e) { acoes.avisar(api.msgErro(e), "erro"); setArquivos([]); setUsados(new Set()); }
  };
  useEffect(() => { if (aberto) carregar(); }, [aberto]); // eslint-disable-line

  const total = (arquivos || []).reduce((s, a) => s + Number(a.tamanho || 0), 0);
  const pct = Math.min(100, (total / LIMITE_BYTES) * 100);
  const cor = pct >= 85 ? C.vermelho : pct >= 70 ? C.ambar : C.verde;
  const umaHora = Date.now() - 3600 * 1000;
  /* sem uso = está na pasta do app, nenhum espaço do catálogo aponta para ele e subiu há mais de uma hora
     (a hora protege a foto que acabou de subir e ainda está sendo salva) */
  const orfaos = (arquivos || []).filter((a) => Object.keys(PASTAS).includes(String(a.nome).split("/")[0])
    && !(usados && usados.has(a.nome)) && new Date(a.criado).getTime() < umaHora);
  const peso = orfaos.reduce((s, a) => s + Number(a.tamanho || 0), 0);
  const limpar = async () => {
    if (!window.confirm(`Apagar ${orfaos.length} arquivo(s) sem uso e liberar ${tamanho(peso)}?\n\nNenhum lugar do catálogo usa esses arquivos. Isto não tem volta.`)) return;
    setLimpando(true);
    const n = await api.apagarCaminhos(orfaos.map((a) => a.nome));
    acoes.avisar(n ? `${n} arquivo(s) apagado(s)` : "Nada foi apagado. Confira a permissão de apagar no bucket.", n ? "ok" : "erro");
    await carregar();
    setLimpando(false);
  };
  return (
    <Modal aberto={aberto} aoFechar={fechar} titulo="Espaço das fotos" sub="Plano grátis do Supabase: 1 GB">
      {arquivos === null ? <Carregando texto="Medindo…" /> : (
        <>
          <div style={{ ...S.card, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{tamanho(total)} de 1 GB</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: cor }}>{pct.toFixed(1)}%</span>
            </div>
            <div style={{ height: 10, borderRadius: 999, background: "#E8ECF5", overflow: "hidden", margin: "8px 0 12px" }}>
              <div style={{ height: "100%", borderRadius: 999, width: `${Math.max(1, pct)}%`, background: cor }} />
            </div>
            <div style={{ fontSize: 13, color: C.suave }}>{(arquivos || []).length} arquivo(s) no total</div>
            {pct >= 70 && (
              <div style={{ background: pct >= 85 ? C.vermelhoFundo : C.ambarFundo, color: cor, borderRadius: 12, padding: "12px 14px", marginTop: 12, fontSize: 13.5, fontWeight: 700, lineHeight: 1.5 }}>
                {pct >= 85 ? "O espaço está acabando. Apague fotos que não usa mais, ou o envio de novas vai começar a falhar." : "O espaço já passou de 70%. Vale olhar o que dá para apagar."}
              </div>
            )}
          </div>
          <div style={{ ...S.card, padding: 16, marginTop: 10 }}>
            {orfaos.length ? (
              <>
                <div style={{ fontSize: 13.5, color: C.suave, lineHeight: 1.55, marginBottom: 12 }}>
                  Encontrei <b style={{ color: C.texto }}>{orfaos.length} arquivo(s) sem uso</b>, somando {tamanho(peso)}: fotos que subiram e não ficaram em nenhum lugar do catálogo.
                </div>
                <Botao cheio contorno cor={C.vermelho} icone={ICONES.lixo} onClick={limpar} disabled={limpando}>{limpando ? "Apagando…" : `Limpar arquivos sem uso (${tamanho(peso)})`}</Botao>
              </>
            ) : <div style={{ fontSize: 13.5, color: C.suave }}>Nenhum arquivo sem uso. Está tudo limpo.</div>}
          </div>
          <div style={S.dica}>As fotos já encolhem sozinhas antes de subir, e a foto trocada é apagada na hora. A logo e os ícones ficam no código e não gastam este espaço.</div>
        </>
      )}
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   Lixeira — o excluir deixou de ser sem volta
   --------------------------------------------------------------------- */
const TABELAS = [
  { t: "sh_clientes", l: "Clientes", nome: (x) => x.nome, sub: (x) => [nomeTipo(x.tipo), x.placa, Number(x.valor) > 0 ? dinheiro(x.valor) : ""].filter(Boolean).join(" · ") },
  { t: "sh_ganhos", l: "Outros ganhos", nome: (x) => x.descricao || "Ganho", sub: (x) => `${fmtData(x.data)} · ${dinheiro(x.valor)}` },
  { t: "sh_cotacoes", l: "Cotações", nome: (x) => x.nome, sub: (x) => foneFmt(x.whatsapp) },
];
function Lixeira({ aberto, fechar, acoes }) {
  const [l, setL] = useState(null);
  const [ocupado, setOcupado] = useState(null);
  const carregar = async () => {
    setL(null);
    try { const r = await api.listarLixeira(); setL({ sh_clientes: r.clientes, sh_ganhos: r.ganhos, sh_cotacoes: r.cotacoes }); }
    catch (e) { acoes.avisar(api.msgErro(e), "erro"); setL({ sh_clientes: [], sh_ganhos: [], sh_cotacoes: [] }); }
  };
  useEffect(() => { if (aberto) carregar(); }, [aberto]); // eslint-disable-line
  const restaurar = async (tab, x) => {
    setOcupado(x.id);
    try { await api.restaurar(tab, x.id); await acoes.restaurado(); setL((v) => ({ ...v, [tab]: v[tab].filter((y) => y.id !== x.id) })); acoes.avisar("Restaurado"); }
    catch (e) { acoes.avisar(api.msgErro(e), "erro"); }
    setOcupado(null);
  };
  const apagar = async (tab, x, nome) => {
    if (!window.confirm(`Apagar "${nome}" DE VEZ?\n\nIsto não tem volta.`)) return;
    setOcupado(x.id);
    try { await api.apagarDeVez(tab, x.id); setL((v) => ({ ...v, [tab]: v[tab].filter((y) => y.id !== x.id) })); acoes.avisar("Apagado de vez"); }
    catch (e) { acoes.avisar(api.msgErro(e), "erro"); }
    setOcupado(null);
  };
  const vazia = l && TABELAS.every((t) => !l[t.t].length);
  return (
    <Modal aberto={aberto} aoFechar={fechar} titulo="Lixeira" sub="O que foi excluído fica aqui até você restaurar ou apagar de vez">
      {l === null ? <Carregando /> : vazia ? <Vazio texto="A lixeira está vazia." /> : TABELAS.filter((t) => l[t.t].length).map((t) => (
        <div key={t.t}>
          <div style={S.titSecao}>{t.l}</div>
          {l[t.t].map((x) => (
            <div key={x.id} style={{ ...S.card, padding: 12, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{t.nome(x)}</div>
              <div style={{ fontSize: 12.5, color: C.suave }}>{t.sub(x)} · excluído em {fmtData(String(x.excluida).slice(0, 10))}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <Botao pequeno onClick={() => restaurar(t.t, x)} disabled={ocupado === x.id} style={{ flex: "1 1 auto" }}>{ocupado === x.id ? "Aguarde…" : "Restaurar"}</Botao>
                <Botao pequeno contorno cor={C.vermelho} onClick={() => apagar(t.t, x, t.nome(x))} disabled={ocupado === x.id}>Apagar de vez</Botao>
              </div>
            </div>
          ))}
        </div>
      ))}
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   Trocar a senha
   --------------------------------------------------------------------- */
function Senha({ aberto, fechar, acoes }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [indo, setIndo] = useState(false);
  useEffect(() => { if (aberto) { setA(""); setB(""); } }, [aberto]);
  const ok = async () => {
    if (a.length < 6) return acoes.avisar("A senha precisa de pelo menos 6 caracteres.", "erro");
    if (a !== b) return acoes.avisar("As duas senhas não são iguais.", "erro");
    setIndo(true);
    try { await api.trocarSenha(a); acoes.avisar("Senha trocada"); fechar(); } catch (e) { acoes.avisar(api.msgErro(e), "erro"); }
    setIndo(false);
  };
  return (
    <Modal aberto={aberto} aoFechar={fechar} titulo="Trocar minha senha" rodape={<Botao cheio {...LARANJA} onClick={ok} disabled={indo}>{indo ? "Salvando…" : "Trocar senha"}</Botao>}>
      <Campo n={1} rotulo="Senha nova"><input className="sh-campo" type="password" autoComplete="new-password" value={a} onChange={(e) => setA(e.target.value)} placeholder="Pelo menos 6 caracteres" /></Campo>
      <Campo n={2} rotulo="Repita a senha nova"><input className="sh-campo" type="password" autoComplete="new-password" value={b} onChange={(e) => setB(e.target.value)} /></Campo>
    </Modal>
  );
}
