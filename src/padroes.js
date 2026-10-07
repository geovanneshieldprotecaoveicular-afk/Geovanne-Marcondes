/* =====================================================================
   GEOVANNE MARCONDES · SHIELD — o que o app e o catálogo usam juntos
   Dados padrão, planos, fotos do catálogo, formulário, mensagens.
   O que o Geovanne muda em Ajustes fica no banco e passa por cima destes.

   PLANOS: tirados das próprias artes da Shield (prints do site, 06/10/2026).
   Não inventar cobertura, valor nem prazo. Caminhão segue os mesmos planos
   do carro (confirmado pelo Miguel). Usar "proteção veicular", "associado",
   "mensalidade" — nunca "seguro", "seguradora" nem "apólice".
   ===================================================================== */

export const CREDITO_NOME = "Miguel Borges";
export const CREDITO_FONE = "(34) 9 9188-1557";

/* ---------------- Os planos da Shield ---------------- */
const COB_BASE = [
  "Roubo e furto qualificado",
  "Colisão",
  "Incêndio após colisão",
  "Fenômenos naturais: granizo, alagamento e queda de árvore",
];

const ASSIST_CARRO = [
  "Guincho de 600 km (300 de ida e 300 de volta)",
  "Guincho sem limite de km em caso de colisão",
  "Pane seca",
  "Carga de bateria",
  "Troca de pneu",
  "Retorno ao domicílio",
  "Hospedagem",
  "Táxi ou Uber",
  "Chaveiro e guarda do veículo",
];

const ASSIST_MOTO = [
  "Guincho de 200 km (100 de ida e 100 de volta)",
  "Guincho sem limite de km em caso de colisão",
  "Pane seca",
  "Troca de pneu",
  "Retorno ao domicílio",
  "Hospedagem",
  "Táxi ou Uber",
];

const PLANOS_CARRO = [
  {
    nome: "Black",
    resumo: "O essencial, com assistência 24h completa.",
    coberturas: [...COB_BASE, "Acidente pessoal por passageiro (APP)"],
    extras: [],
  },
  {
    nome: "Gold",
    resumo: "Tudo do Black, e você também protegido diante de terceiros.",
    coberturas: [...COB_BASE, "Acidente pessoal por passageiro (APP)"],
    extras: ["Danos materiais a terceiros até R$ 50.000,00"],
  },
  {
    nome: "Exclusive",
    resumo: "A proteção mais completa da Shield.",
    fita: "MAIS COMPLETO",
    coberturas: [...COB_BASE, "Acidente pessoal por passageiro (APP)"],
    extras: [
      "Danos materiais a terceiros até R$ 100.000,00",
      "Vidros, faróis e lanternas",
      "Carro reserva por 15 dias",
      "Coparticipação reduzida",
    ],
  },
];

export const PLANOS = {
  carro: { titulo: "Carro", planos: PLANOS_CARRO, assistencia: ASSIST_CARRO },
  moto: {
    titulo: "Moto",
    assistencia: ASSIST_MOTO,
    planos: [
      { nome: "Black", resumo: "Especial motos: o essencial, com assistência 24h.", coberturas: COB_BASE, extras: [] },
      { nome: "Gold", resumo: "Especial motos: tudo do Black, mais terceiros.", fita: "MAIS COMPLETO", coberturas: COB_BASE,
        extras: ["Danos materiais a terceiros até R$ 30.000,00"] },
    ],
  },
  caminhao: { titulo: "Caminhão", planos: PLANOS_CARRO, assistencia: ASSIST_CARRO },
};

export const NOMES_PLANO = ["Black", "Gold", "Exclusive"];

export const TIPOS = [
  { v: "carro", l: "Carro" },
  { v: "moto", l: "Moto" },
  { v: "caminhao", l: "Caminhão" },
];
export const nomeTipo = (v) => (TIPOS.find((t) => t.v === v) || {}).l || v || "";

/* ---------------- Os espaços de foto do catálogo ----------------
   Cada espaço guarda UMA foto. O Geovanne sobe pela aba Fotos do app,
   da galeria do celular. "padrao" = foto que já vem no código (public/),
   usada enquanto ele não escolher outra. Sem foto nenhuma, o catálogo
   esconde só a moldura daquele lugar e o texto continua.              */
export const FOTOS_CATALOGO = [
  { id: "abertura", titulo: "Abertura", onde: "A primeira tela do catálogo, dentro do círculo que gira com o seu nome. Também vai na barra de baixo.",
    dica: "Foto sua, em pé, de frente. A que você usa no WhatsApp funciona muito bem.", proporcao: "3/4", padrao: "/fotos/geovanne.jpg" },
  { id: "sobre", titulo: "Quem sou eu", onde: "Ao lado do texto “Prazer, eu sou o Geovanne”.",
    dica: "Outra foto sua: atendendo, na sede, com a camisa da Shield ou num evento.", proporcao: "4/5" },
  { id: "shield", titulo: "A Shield", onde: "Na parte que apresenta a empresa.",
    dica: "A sede, a fachada, a equipe ou o escudo iluminado.", proporcao: "4/3" },
  { id: "carro", titulo: "Carro", onde: "Na seção de proteção para carros.",
    dica: "Um carro bonito, de preferência deitado (horizontal).", proporcao: "4/3" },
  { id: "moto", titulo: "Moto", onde: "Na seção de proteção para motos.", dica: "Uma moto, de preferência deitada (horizontal).", proporcao: "4/3" },
  { id: "caminhao", titulo: "Caminhão", onde: "Na seção de proteção para caminhões.", dica: "Um caminhão na estrada ou no pátio.", proporcao: "4/3" },
  { id: "assistencia", titulo: "Assistência 24h", onde: "Na seção da assistência 24 horas.",
    dica: "Guincho, atendimento na estrada ou a central.", proporcao: "4/3" },
  { id: "app", titulo: "Aplicativo Shield", onde: "Na seção do aplicativo do associado.",
    dica: "As telas do app (sem nome nem placa de associado).", proporcao: "4/5", padrao: "/fotos/app-shield.jpg" },
  { id: "final", titulo: "Encerramento", onde: "No fim do catálogo, junto com o botão de cotação.",
    dica: "Mais uma foto sua, sorrindo, para fechar com proximidade.", proporcao: "3/4" },
];

/* ---------------- Textos do catálogo (editáveis em Ajustes) ---------------- */
export const QUADROS_SOBRE = [
  { t: "Atendimento de perto", d: "Você fala direto comigo, do primeiro contato até depois da ativação. Nada de robô, nada de fila." },
  { t: "Destaque da equipe", d: "Entre os destaques do ranking da equipe externa da Shield, porque cada cliente é tratado como único." },
  { t: "Resposta rápida", d: "Cotação pela placa, explicada com calma e sem letra miúda. Você entende tudo antes de decidir." },
  { t: "Espírito de equipe", d: "Do basquete eu trouxe o que levo para o atendimento: disciplina, foco e jogar junto com você." },
];

export const MOTIVOS = [
  { t: "Bateu? Foi roubado?", d: "Você não fica sozinho: tem sempre um profissional orientando o que fazer, passo a passo, até resolver." },
  { t: "Mensalidade como assinatura", d: "Pague mês a mês, no boleto ou no cartão de crédito, sem prender o limite do seu cartão." },
  { t: "Plano do seu jeito", d: "Mudou a sua realidade? Dá para trocar de plano. O importante é não deixar o patrimônio desprotegido." },
  { t: "Suporte todos os dias", d: "Equipe de prontidão 24 horas, sete dias por semana, para orientar e acionar o que for preciso." },
  { t: "Associação que investe", d: "Uma estrutura sólida em Uberlândia, que investe em treinamento para você ter o respaldo que merece." },
];

/* ---------------- O formulário de cotação ----------------
   Nome, WhatsApp, cidade e veículos (tipo + placa) são fixos no catálogo.
   Estas são as perguntas a mais, editáveis em Ajustes → Formulário.
   tipo: "opcoes" | "texto" | "numero" | "textolongo"
   mostrar_se: só aparece quando outra pergunta tem aquela resposta
   rotulo: o nome curto que vai na mensagem do WhatsApp              */
export const PERGUNTAS_PADRAO = [
  {
    id: "plano", titulo: "Qual plano chamou a sua atenção?", rotulo: "Plano de interesse", tipo: "opcoes", obrigatoria: false,
    opcoes: ["Black", "Gold", "Exclusive", "Ainda não sei, quero ajuda"],
    nota: "Pode marcar “quero ajuda”: eu te explico a diferença e indico o que faz sentido para você.",
  },
  {
    id: "uso", titulo: "Como o veículo é usado no dia a dia?", rotulo: "Uso", tipo: "opcoes", obrigatoria: false,
    opcoes: ["Uso pessoal", "Trabalho ou aplicativo", "Transporte de carga"],
  },
  {
    id: "protecao", titulo: "Ele já tem alguma proteção hoje?", rotulo: "Proteção atual", tipo: "opcoes", obrigatoria: false,
    opcoes: ["Não tem nenhuma", "Tem, mas quero comparar"],
  },
  {
    id: "retorno", titulo: "Como você prefere o meu retorno?", rotulo: "Retorno", tipo: "opcoes", obrigatoria: true,
    opcoes: ["Mensagem no WhatsApp", "Ligação"],
  },
  {
    id: "obs", titulo: "Quer me contar mais alguma coisa?", rotulo: "Observação", tipo: "textolongo", obrigatoria: false,
    exemplo: "Ex.: o carro é financiado, quero saber do carro reserva, prefiro falar depois das 18h…",
  },
];

export const TIPOS_PERGUNTA = [
  { v: "opcoes", l: "Escolher uma opção" },
  { v: "texto", l: "Resposta curta" },
  { v: "numero", l: "Número" },
  { v: "textolongo", l: "Resposta longa" },
];

/* ---------------- Mensagens do WhatsApp ---------------- */
export const MENSAGENS = {
  msg_cotacao: {
    titulo: "Pedido de cotação (catálogo)",
    quando: "É a mensagem que o cliente te manda quando termina o formulário do catálogo.",
    campos: ["{nome}", "{dados}", "{veiculos}", "{respostas}"],
    texto: "Olá, Geovanne! 👋\n\nVim pelo seu catálogo e quero fazer uma cotação de proteção veicular.\n\n{dados}\n\n{veiculos}\n\n{respostas}\n\nAguardo o seu contato!",
  },
  msg_resposta: {
    titulo: "Responder uma cotação",
    quando: "É o que você manda ao tocar em Responder, na aba Cotações.",
    campos: ["{primeiro_nome}", "{veiculos}"],
    texto: "Olá, {primeiro_nome}! 👋\n\nAqui é o Geovanne, Executivo de Vendas da Shield Proteção Veicular.\n\nRecebi o seu pedido de cotação{veiculos} e já estou preparando os valores para você.\n\nPrefere que eu te ligue ou mando tudo por aqui mesmo?",
  },
  msg_boas_vindas: {
    titulo: "Boas-vindas ao novo associado",
    quando: "É o que você manda ao tocar em Boas-vindas, no cadastro do cliente.",
    campos: ["{primeiro_nome}", "{veiculo}", "{plano}", "{central}"],
    texto: "Olá, {primeiro_nome}! Seja muito bem-vindo(a) à Shield Proteção Veicular! 🛡️\n\nA proteção do seu {veiculo}{plano} já está encaminhada. Qualquer coisa que precisar, pode contar comigo por aqui.\n\nCentral Shield: {central}\nBaixe também o app Shield: mensalidades, documentos e assistência 24h na palma da mão.\n\nObrigado pela confiança! 🤝",
  },
  msg_geral: {
    titulo: "Botões de WhatsApp do catálogo",
    quando: "É a mensagem dos botões de WhatsApp soltos no catálogo (contato e rodapé).",
    campos: [],
    texto: "Olá, Geovanne! Vim pelo seu catálogo e gostaria de atendimento.",
  },
  msg_divulgar: {
    titulo: "Divulgar o catálogo",
    quando: "É o texto do botão Divulgar o catálogo, no Início do app.",
    campos: ["{link}"],
    texto: "Proteja o seu carro, moto ou caminhão com a Shield Proteção Veicular 🛡️\nAssistência 24h e um plano para cada necessidade. Faça a sua cotação comigo: {link}",
  },
};

/* ---------------- Dados padrão ---------------- */
export const CONFIG_PADRAO = {
  nome: "Geovanne Marcondes",
  cargo: "Executivo de Vendas",
  whatsapp: "3484267938",
  instagram: "gemarcondes77",
  empresa: "Shield Proteção Veicular",
  central: "0800 967 7000",
  endereco: "Av. João Naves de Ávila, 775 · Loja 02",
  bairro: "Aparecida · Uberlândia – MG",
  link_android: "https://play.google.com/store/apps/details?id=br.com.shieldprotecao",
  link_iphone: "",
  frase: "Proteger além do seu veículo: proteger também a sua tranquilidade.",
  sobre:
    "Sou Executivo de Vendas da Shield Proteção Veicular, aqui em Uberlândia. Meu trabalho é encontrar a proteção certa para o seu carro, moto ou caminhão e continuar do seu lado depois da adesão, sempre que você precisar.",
  quadros: QUADROS_SOBRE,
  motivos: MOTIVOS,
  fotos: {},              // { abertura: url, carro: url, ... } — as que ele escolheu no app
  perguntas: PERGUNTAS_PADRAO,
  msg_cotacao: MENSAGENS.msg_cotacao.texto,
  msg_resposta: MENSAGENS.msg_resposta.texto,
  msg_boas_vindas: MENSAGENS.msg_boas_vindas.texto,
  msg_geral: MENSAGENS.msg_geral.texto,
  msg_divulgar: MENSAGENS.msg_divulgar.texto,
};

/* junta o que está no banco com os padrões (campo vazio no banco = usa o padrão) */
export function mesclarConfig(dados) {
  const d = dados && typeof dados === "object" ? dados : {};
  const c = { ...CONFIG_PADRAO };
  Object.keys(d).forEach((k) => {
    if (d[k] !== undefined && d[k] !== null && d[k] !== "") c[k] = d[k];
  });
  if (!Array.isArray(c.perguntas)) c.perguntas = PERGUNTAS_PADRAO;
  if (!Array.isArray(c.quadros) || !c.quadros.length) c.quadros = QUADROS_SOBRE;
  if (!Array.isArray(c.motivos) || !c.motivos.length) c.motivos = MOTIVOS;
  if (!c.fotos || typeof c.fotos !== "object") c.fotos = {};
  return c;
}

/* endereço da foto de um espaço: a escolhida no app, senão a padrão do código, senão nada */
export function fotoDoEspaco(cfg, id) {
  const escolhida = cfg && cfg.fotos && cfg.fotos[id];
  if (escolhida) return escolhida;
  const e = FOTOS_CATALOGO.find((x) => x.id === id);
  return (e && e.padrao) || "";
}

/* ---------------- Texto, dinheiro, telefone, placa ---------------- */
export const normalizar = (s) =>
  String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export const dinheiro = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const soDigitos = (s) => String(s || "").replace(/\D/g, "");
/* o número salvo sem o 55; o link do WhatsApp põe o 55 na frente */
export const foneLimpo = (s) => {
  let d = soDigitos(s);
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  return d;
};
export const foneOk = (s) => { const d = foneLimpo(s); return d.length === 10 || d.length === 11; };
export const foneCompleto = (s) => { const d = foneLimpo(s); return d.length === 10 || d.length === 11 ? "55" + d : d; };
export const foneFmt = (s) => {
  const d = foneLimpo(s);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return s || "";
};
/* enquanto digita */
export const foneDigitando = (s) => {
  const d = soDigitos(s).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
};

/* placa no Brasil tem 7 caracteres (ABC1234 ou ABC1D23) */
export const placaLimpa = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
export const placaOk = (p) => !p || p.length === 7;

const LIGACOES = new Set(["de", "da", "do", "das", "dos", "e"]);
export const primeiroNome = (nome) => {
  const p = String(nome || "").trim().split(/\s+/)[0] || "";
  return p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : "";
};
export const nomeBonito = (nome) =>
  String(nome || "").trim().replace(/\s+/g, " ").toLowerCase().split(" ")
    .map((w, i) => (i > 0 && LIGACOES.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");

/* junta "carro, moto e caminhão" */
export const juntarLista = (l) => (l.length <= 1 ? l.join("") : `${l.slice(0, -1).join(", ")} e ${l[l.length - 1]}`);

/* No computador o WhatsApp instalado embaralha emoji: lá vai pelo WhatsApp Web. */
export const ehComputador = () =>
  !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && window.innerWidth >= 860;

export const linkWhats = (fone, msg) => {
  const n = foneCompleto(fone);
  if (!msg) return `https://wa.me/${n}`;
  const t = encodeURIComponent(msg);
  return ehComputador() ? `https://web.whatsapp.com/send?phone=${n}&text=${t}` : `https://wa.me/${n}?text=${t}`;
};
/* mensagem sem destinatário (divulgar para qualquer contato) */
export const linkCompartilhar = (msg) => {
  const t = encodeURIComponent(msg);
  return ehComputador() ? `https://web.whatsapp.com/send?text=${t}` : `https://wa.me/?text=${t}`;
};

export const linkInstagram = (u) => `https://instagram.com/${String(u || "").replace(/^@/, "")}`;
export const linkMapa = (busca) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busca)}`;
export const telefone0800 = (t) => `tel:${soDigitos(t)}`;

export const aplicar = (texto, dados) =>
  String(texto || "").replace(/\{(\w+)\}/g, (m, k) => (dados[k] !== undefined ? dados[k] : m));

/* ---------------- Formulário: quais perguntas aparecem ---------------- */
export function perguntaVisivel(p, respostas) {
  if (!p.mostrar_se || !p.mostrar_se.pergunta) return true;
  return respostas[p.mostrar_se.pergunta] === p.mostrar_se.resposta;
}

/* monta a mensagem de cotação que o cliente manda pelo WhatsApp */
export function mensagemCotacao(c, dados, veiculos, respostas) {
  const visiveis = c.perguntas.filter((p) => perguntaVisivel(p, respostas));
  const txtDados = [
    `*Nome:* ${dados.nome}`,
    `*WhatsApp:* ${foneFmt(dados.whatsapp)}`,
    dados.cidade ? `*Cidade:* ${dados.cidade}` : "",
  ].filter(Boolean).join("\n");
  const txtVeic = `*Veículo${veiculos.length > 1 ? "s" : ""}:*\n` + veiculos
    .map((v) => `• ${nomeTipo(v.tipo)}${v.placa ? ` — placa ${v.placa}` : " — placa a informar"}`).join("\n");
  const txtResp = visiveis
    .filter((p) => String(respostas[p.id] || "").trim())
    .map((p) => `• ${p.rotulo || p.titulo}: ${String(respostas[p.id]).trim()}`)
    .join("\n");
  return aplicar(c.msg_cotacao || MENSAGENS.msg_cotacao.texto, {
    nome: dados.nome,
    dados: txtDados,
    veiculos: txtVeic,
    respostas: txtResp,
  }).replace(/\n{3,}/g, "\n\n").trim();
}

/* as respostas do formulário, do jeito que ficam guardadas na cotação */
export function respostasParaGuardar(c, respostas) {
  return c.perguntas
    .filter((p) => perguntaVisivel(p, respostas) && String(respostas[p.id] || "").trim())
    .map((p) => ({ rotulo: p.rotulo || p.titulo, resposta: String(respostas[p.id]).trim().slice(0, 600) }));
}

/* ---------------- Datas (sempre no dia de Brasília) ---------------- */
export const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
export const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/* "hoje" no horário de Brasília, como AAAA-MM-DD */
export function hojeIso() {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return p.slice(0, 10);
}
const pad2 = (n) => String(n).padStart(2, "0");
export const isoDe = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const deIso = (s) => { const [a, m, d] = String(s || "").slice(0, 10).split("-").map(Number); return new Date(a, (m || 1) - 1, d || 1); };
export const fmtData = (s) => { if (!s) return ""; const [a, m, d] = String(s).slice(0, 10).split("-"); return `${d}/${m}/${a}`; };
export const fmtDataHora = (iso) => { const d = new Date(iso); return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
export const mesDe = (s) => String(s || "").slice(0, 7);            // "2026-10"
export const nomeMes = (comp) => { const [a, m] = comp.split("-").map(Number); return `${MESES[m - 1]} de ${a}`; };
export const nomeMesCurto = (comp) => { const [a, m] = comp.split("-").map(Number); return `${MESES_CURTOS[m - 1]}/${String(a).slice(2)}`; };
export const addMes = (comp, n) => { const [a, m] = comp.split("-").map(Number); const d = new Date(a, m - 1 + n, 1); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; };
