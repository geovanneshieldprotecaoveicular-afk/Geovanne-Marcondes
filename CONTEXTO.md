# CONTEXTO — Geovanne Marcondes · Shield Proteção Veicular

> **Para o Claude (ou quem for continuar):** leia tudo antes de propor mudanças, junto com o
> PADRAO-APLICATIVOS.md. Ao terminar cada mudança, atualize o "Histórico" e as seções que mudaram.
>
> Última atualização: 06/10/2026  

## 1. O que é e para quem

App e catálogo do **Geovanne Marcondes**, **Executivo de Vendas** da **Shield Proteção Veicular**
(associação de proteção veicular de Uberlândia-MG). Ele é vendedor, **não é gestor**: não tem
equipe, consultores nem carteira de boletos para controlar.

- **App** (com login), no endereço principal: clientes/adesões, ganho mensal bruto, cotações que
  chegam pelo catálogo, acessos ao catálogo, fotos do catálogo e ajustes.
- **Catálogo público** (sem login), em **`/catalogo`**: apresenta o Geovanne e a Shield, mostra os
  planos e manda o pedido de cotação pelo WhatsApp.

**ATENÇÃO — concorrência:** o Ricardo Silva (Universo AGV, outro app nosso) e o Geovanne se conhecem
e as empresas são concorrentes. **O catálogo do Geovanne não pode lembrar o do Ricardo.** Ver seção 6.

## 2. Onde fica cada coisa

- **Código:** GitHub, repositório PRIVADO (nome a definir), versão `main`.
- **Publicação:** Cloudflare Workers. O `name` do `wrangler.toml` está `geovanne-shield`: tem que ser
  igual ao nome do Worker no painel (costuma ser o nome do repositório). Build `npm run build` · Deploy `npx wrangler deploy`.
- **Banco, login e fotos:** Supabase, projeto **qmemmdseddyiskqczoyt** (`src/config.js` já preenchido em 07/10). SQL: https://supabase.com/dashboard/project/qmemmdseddyiskqczoyt/sql/new
- **Bucket:** `geovanne` (público). Fotos que ele sobe pelo app: pasta `catalogo/`.
- **WhatsApp do Geovanne:** (34) 8426-7938 (conta Business, sem o 9 extra; o link usa 553484267938).
- **Instagram:** @gemarcondes77 · Instagram da Shield: @shieldprotecao.
- **Shield:** central 0800 967 7000 · sede Av. João Naves de Ávila, 775 · Loja 02 · Aparecida · Uberlândia.
  App Shield no Google Play: `br.com.shieldprotecao`. Link da App Store: falta (Ajustes → Dados da Shield).

## 3. Tecnologia e arquivos

React 18 + Vite 5, JS puro, estilos inline, ícones SVG à mão. Fonte **Poppins** (o Ricardo usa Montserrat).

- `src/main.jsx` — "catalogo" no endereço abre o Catálogo; o resto abre o App. Cada um carrega só o seu código.
- `src/config.js` — endereço e chave pública do Supabase (**preencher**).
- `src/api.js` — TODAS as chamadas ao banco. Encolhe a foto antes de subir, apaga arquivo de verdade.
- `src/padroes.js` — o que app e catálogo usam juntos: **planos da Shield**, espaços de foto do catálogo,
  textos padrão, formulário padrão, mensagens do WhatsApp, telefone/placa, datas no horário de Brasília.
- `src/ui.jsx` — peças do app: Modal (portal, dvh, teclado, trava do fundo com contador), botões, campos.
- `src/App.jsx` — Login, Início, Clientes (+ cadastro), Ganhos (+ outros ganhos), Cotações, Fotos do catálogo.
- `src/Ajustes.jsx` — todas as telas de Ajustes.
- `src/Catalog.jsx` — o catálogo público inteiro (tem cópia própria da trava e do voltar, e a `Guarda`).
- `public/logo.jpg` — a logo da Shield **como veio** (588×330, é a única que existe).
- `public/favicon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` —
  **a foto do Geovanne** (rosto e ombros, quadrado 95,70 de 500×500 px da `fotos/geovanne.jpg`), pedido do
  Miguel em 07/10. Script: `Desktop\shild\ferramentas-de-teste\icones-foto.ps1`.
- `public/emblema.png` — o escudo recortado da logo (sem redesenhar), usado no topo do app e em Meus dados.
- `public/fotos/geovanne.jpg` — foto dele na frente do escudo (recortada do post do Instagram).
- `public/fotos/app-shield.jpg` — telas do app Shield **sem o nome, a foto e a placa do associado**
  (no original aparecia "Pedro Calvet Domingos"; foi coberto, e a saudação virou "Olá, associado!").

## 4. Banco

Scripts, na ordem:

1. `sh_01_estrutura.sql` — perfis, ajustes, clientes, outros ganhos, cotações, acessos, bucket e permissões.

Tabelas (tudo com prefixo `sh_`):

- `sh_perfis` — `role` `admin`/`func`. **O primeiro usuário criado vira admin**; os outros ficam sem acesso.
- `sh_config` (id = 1) — `dados` jsonb com **só o que ele mudou**; o resto vem de `padroes.js`.
  Inclui `fotos` = `{ abertura: url, carro: url, … }`.
- `sh_clientes` — cada adesão é um veículo: nome, WhatsApp, cidade, tipo, placa, modelo, plano,
  `data_adesao`, `valor` (quanto ele ganhou), `recebido`, `data_receber`, `situacao` (ativo/cancelado),
  `avisado_em` (boas-vindas), `cotacao_id`, `excluida` (lixeira).
- `sh_ganhos` — outros ganhos: `tipo` recorrente / bônus / premiação / outro, `valor`, `data`, `recebido`.
- `sh_cotacoes` — pedidos do catálogo: dados, `veiculos` [{tipo, placa}], `respostas` [{rotulo, resposta}],
  `status` novo / contato / fechou / não fechou, `cliente_id`.
- `sh_visitas` — acessos (código sorteado, sem dado pessoal).

O público só lê `sh_config` e só grava pela função `sh_registrar_cotacao` (que ignora o segundo
toque em "enviar" do mesmo número em 3 minutos). Tudo o mais é só do admin.

## 5. O que cada tela faz

**App** (barra de baixo com 6 abas; "Fotos do catálogo" aparece como "Fotos")
- **Início:** ganho bruto do mês (com a variação sobre o mês passado), adesões do mês, a receber, cotações
  novas; Nova adesão, Divulgar o catálogo (mensagem editável), Copiar link; cotações esperando resposta;
  adesões a receber; acessos ao catálogo.
- **Clientes:** faixa com ativos por tipo, busca (nome, placa, modelo, cidade, telefone), filtros por
  situação, tipo e plano. Cartão: plano, placa com Copiar, valor, recebido/a receber/atrasado,
  Boas-vindas no WhatsApp (marca "enviada", com estornar), Marcar recebido (com estorno).
  Cadastro: cliente, veículo (moto só tem Black e Gold), adesão (data, quanto ganhou, recebimento),
  cancelar/reativar e mandar para a lixeira.
- **Ganhos:** período (semana, mês, mês passado, ano, datas), ganho bruto, recebido, a receber,
  divisão por tipo, gráfico mês a mês (6 colunas no celular, 12 no computador), lista de adesões e de
  outros ganhos. Aviso do recorrente.
- **Cotações:** recebidas, novas, quantas fecharam (%), filtros por situação; cartão com veículos e as
  respostas; Responder no WhatsApp (passa para "em contato"); **Virar cliente** (um botão por veículo)
  abre o cadastro preenchido, com o plano de interesse, e ao salvar a cotação vira "fechou". Acessos embaixo.
- **Fotos do catálogo:** os 9 espaços, cada um com o lugar onde aparece, dica e formato; Escolher da
  galeria / Trocar / Tirar (ou Voltar à padrão).
- **Ajustes:** Meus dados · Dados da Shield · Textos do catálogo · Formulário de cotação · Mensagens do
  WhatsApp · Instalar na tela inicial · Espaço das fotos · Lixeira · Trocar senha · Abrir catálogo · Sair.

**Catálogo**, na ordem: abertura (lente) → faixa de coberturas → Quem sou eu → A Shield + motivos →
Planos (chave Carro/Moto/Caminhão) → Como funciona → Assistência 24h → Aplicativo → Sede (lente com
mapa) → Encerramento → Rodapé. Barra fixa embaixo depois da abertura. Formulário em 3 etapas.

## 6. Regras deste cliente

- **Identidade própria, diferente do Ricardo.** Ricardo: fundo escuro, dourado, Montserrat, foto em tela
  cheia com zoom, textos que sobem, botão verde redondo. Geovanne: **azul royal e laranja da Shield,
  Poppins, seções claras e azuis alternadas**, a **lente** com a foto dele (nome girando, aro laranja em
  arcos, selos flutuando), títulos em **cortina**, cartões que entram **desfocados**, **faixa inclinada**
  de coberturas correndo, chave Carro/Moto/Caminhão que troca os planos, Exclusive com **borda girando**,
  linha do "como funciona" que **enche**, relógio 24h, **lente do mapa** (mecanismo 17.10 da Vértice em
  azul/laranja, com pino em forma de escudo), **barra fixa** com a foto dele, formulário em **etapas**.
  Antes de mudar o visual, conferir que não ficou parecido com o do Ricardo.
- **Planos** (das artes do site da Shield, 06/10/2026):
  - Carro e caminhão: **Black** (roubo e furto qualificado, colisão, incêndio após colisão, fenômenos
    naturais, APP), **Gold** (+ terceiros até R$ 50 mil), **Exclusive** (terceiros até R$ 100 mil,
    vidros/faróis/lanternas, carro reserva 15 dias, coparticipação reduzida).
    Assistência: guincho 600 km (300+300), sem limite em colisão, pane seca, bateria, pneu, retorno,
    hospedagem, táxi/Uber, chaveiro e guarda.
  - Moto: **Black** e **Gold** (+ terceiros até R$ 30 mil). Guincho 200 km (100+100), sem limite em
    colisão, pane seca, pneu, retorno, hospedagem, táxi/Uber.
  - Caminhão = carro (confirmado pelo Miguel).
  - O nome do plano é **Exclusive**, não "executivo".
- **Não mostrar números da Shield** (associados, assistências, valores pagos): os do site são de 2023/24.
- **Textos escritos do zero**, sem copiar o site da Shield, mas sem sair do que a empresa é. "Pague como
  a Netflix" virou "mensalidade como assinatura".
- Usar "proteção veicular", "associado", "mensalidade" — nunca "seguro", "seguradora", "apólice".
- **Recorrente: regra ainda não definida.** Por enquanto é lançado à mão em Ganhos → Outros ganhos →
  Recorrente. Quando a regra vier, criar o cálculo (provavelmente sobre os clientes ativos) com a regra
  guardada com DATA (seção 13 do padrão).
- Ganho bruto do mês = adesões pela `data_adesao` + outros ganhos pela `data`.
- Placa opcional no catálogo, com aviso de que a cotação é pela placa.

## 7. Cuidados de celular e armadilhas deste projeto

- Tudo do padrão: border-box, trava de largura, `viewport-fit=cover`, dvh, 16px nos campos, Modal com
  portal, troca de aba só com opacidade, voltar do celular fechando janelas, campos fora dos formulários,
  `encolherImagem`, `removerArquivos` ao trocar/tirar foto, medidor e limpeza, lixeira, web.whatsapp no computador.
- **Títulos em cortina:** o `clip-path` esconde o elemento todo, e o Chrome então não avisa o
  IntersectionObserver. Por isso o `Surge` observa uma caixa por fora do título. Não juntar de novo.
- Sem foto num espaço, a moldura some (não fica buraco). `fotoDoEspaco` usa: a escolhida no app → a padrão
  do código (`public/fotos`) → nada.
- Se o Supabase não responder, o catálogo abre com os textos padrão (nunca tela branca).
- `Catalog.jsx` passa de 1.500 linhas: subir arrastando a pasta (ou Upload files), nunca colar no editor do GitHub pelo celular.

## 8. O que falta

- Criar Supabase/GitHub/Cloudflare **no nome do Geovanne**, rodar o SQL, preencher `src/config.js`.
- Criar o usuário dele (Create new user, Auto Confirm) e desligar o cadastro público.
- Fotos dos espaços: Quem sou eu, A Shield, Carro, Moto, Caminhão, Assistência, Encerramento.
- Link do app Shield na App Store.
- **Regra do recorrente.**
- Testar no iPhone e no Android: cotação de teste, foto pela galeria, adesão, Virar cliente.

## 9. Histórico

- **06/10/2026** — Primeira versão completa. Base: padrão de aplicativos (todas as lições), mecanismos da
  Vértice (formulário editável, lente, padroes.js, Guarda) e o catálogo do Ricardo só como referência de
  conteúdo — o visual foi feito diferente de propósito (concorrência). Fotos do app Shield com o nome do
  associado cobertos. Números da Shield fora (datados). Testado no navegador: app inteiro com banco de
  teste, formulário de 3 etapas até a mensagem do WhatsApp.

- **07/10/2026** — Publicado no Cloudflare Pages (conta do Geovanne), projeto `geovanne-shield`, por upload direto da pasta `SITE-PRONTO-cloudflare` (`npx wrangler pages deploy`). O GitHub ainda não está ligado ao Cloudflare. Ícone do app trocado do escudo para a foto do Geovanne.

- **07/10/2026 (tarde)** — O Geovanne instalou o app pelo Worker ligado ao GitHub (https://geovannemarcondes.geovanneshieldprotecaoveicular.workers.dev), que estava com código antigo: ícone do escudo e `/catalogo` dando 404. Correções: o catálogo virou uma **página de verdade** (`catalogo/index.html` + duas entradas no `vite.config.js`), os links do app apontam para `/catalogo/`, os ícones ganharam **nome novo** (`icone-geovanne-*.png`, o celular guardava o antigo pelo nome) e o `wrangler.toml` passou a `name = "geovannemarcondes"` (o nome do Worker). Publicado direto no Worker e no Pages com `wrangler`. **Falta subir a pasta inteira no GitHub**, senão o próximo build do GitHub volta o código antigo.
