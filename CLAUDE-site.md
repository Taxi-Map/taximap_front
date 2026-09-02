# Táxi Map — Site Institucional (Marketing/Landing Page)

> Este ficheiro é para o repositório do **site público** do Táxi Map (não o produto
> Empresas/Particulares em si — esse tem o seu próprio `CLAUDE.md` de arquitetura).
> Objetivo deste site: ser o cartão de visita da empresa para investidores, empresas
> de táxi parceiras, imprensa e futuros utilizadores — ao nível visual de uma startup
> YC americana, não de um site institucional angolano genérico.

## O que é o Táxi Map (resumo para quem só vê este repo)

Plataforma tecnológica angolana que digitaliza a mobilidade urbana em Luanda. O ponto
mais importante a não confundir: **o Táxi Map não é um serviço de táxi privado sob
chamada (TVDE)**. Não se pede um táxi através da app. A plataforma permite acompanhar
em tempo real a posição e a rota dos táxis/candongueiros **públicos** que já circulam
nas ruas, para o passageiro saber quando vão passar e planear a viagem com
antecedência. Isto é uma clarificação de posicionamento crítica — todo o copy do site
(sobretudo o hero) deve reforçar "acompanhar em tempo real", nunca "chamar um táxi".

Dois públicos, duas ofertas:
- **Táxi Map Particulares** — app de passageiro (ainda "brevemente", não lançada):
  rotas e posições em tempo real dos candongueiros, planeamento multimodal
  (caminhada + transporte), alertas da comunidade, otimizado para baixa
  conectividade/funcionamento offline.
- **Táxi Map Empresas** — gestão de frota para operadores de táxi/candongueiro:
  mapa de operação em tempo real, gestão de motoristas, registo/manutenção de
  viaturas, relatórios de desempenho, alertas de ocorrências, histórico +
  exportação de dados. Está em **programa piloto** (candidatura aberta), não em
  uso geral ainda. Um segundo produto, "Clientes corporativos" (transporte
  seguro para colaboradores/executivos, faturação centralizada), está "em
  desenho, brevemente".

## Auditoria do site atual (Set 2026) — o que existe hoje, página a página

O site vive em **taximap.ao**, com navegação por separadores no topo: Particulares |
Empresas | Institucional | Parceiros, mais "Apoio ao cliente" e seletor de idioma
(PT). Debaixo dessa barra há uma segunda barra branca com o logótipo (pin + van) e
navegação secundária que muda consoante o separador ativo.

### Página Particulares
1. **Hero:** foto de produtos de merchandising (saco, garrafa térmica, hoodie, tudo
   cinza-chumbo com o logótipo Táxi Map em azul-claro) com um cartão sobreposto
   "Linha de produtos Táxi Map" + CTA "Comprar agora". **Não mostra o produto
   real** (mapa/app) em lado nenhum.
2. **Secção app:** mockup de telemóvel (retângulo azul-marinho escuro) com texto
   "Táxi Map - Passageiros / BREVEMENTE" — não é um screenshot real da app. Ao lado,
   título "Mobilidade inteligente na palma da sua mão" + 4 bullets (rotas em tempo
   real, planeamento multimodal, alertas da comunidade, baixa conectividade) +
   badges de loja desativados ("Disponível... Brevemente").
3. **"Como funciona o Táxi Map"** — 3 passos numerados 01/02/03 em cartões claros:
   Defina o destino → Acompanhe em tempo real → Viaje com tranquilidade. (Uso
   correto de numeração — é mesmo uma sequência.)
4. **"Comunidade activa e alertas em tempo real"** — mockup de um widget "Feed de
   alertas ao vivo" (lista com pontos de estado verde/amarelo/vermelho, timestamps
   tipo "Há 10 min", contagem de confirmações). Ao lado, 3 bullets + uma linha de
   estatísticas explicitamente rotulada **"Metas do 1º ano em Luanda"**: +10k
   alertas estimados/mês, 99% meta de precisão dos dados, +5k utilizadores ativos
   previstos. Correto: são metas, não tração real — manter esta honestidade em
   qualquer redesign.
5. **FAQ** — a primeira pergunta, já aberta por defeito, é a clarificação "não é
   TVDE" acima descrita. Restantes: gratuito para passageiros?, como saber o
   candongueiro certo?, funciona com pouca ligação?, como funcionam os alertas?,
   já está disponível em todas as províncias?
6. **Footer:** logótipo, 3 colunas (Particulares / Empresas / Contactos), redes
   sociais (FB, IG, LinkedIn, YouTube).

### Página Empresas
1. **Hero:** a mesma foto de merchandising da página Particulares (reutilizada,
   sem adaptação ao público B2B).
2. **"Para quem é o Táxi Map Empresas"** — 2 cartões azuis lado a lado: "Empresas
   de táxi e operadores de frota" (tag "DISPONÍVEL PARA PROGRAMA PILOTO", CTA
   "Candidatar a empresa piloto") e "Clientes corporativos" (tag "EM DESENHO,
   BREVEMENTE", CTA "Ajudar a moldar o produto").
3. **"Porque escolher o Táxi Map"** (tag "POSICIONAMENTO ÚNICO") — grelha 2×2 de
   cartões azuis, copy específico e bom, vale preservar:
   - *Feito para Angola, não adaptado a Angola* — conectividade instável, rotas
     informais de candongueiro, funcionamento pensado para internet lenta.
   - *Sem custo de equipamento para começar* — sem rastreador GPS dedicado
     (140-90 USD/viatura); o telemóvel do motorista já serve.
   - *Uma rede de confiança, não só um mapa* — o ativo difícil de copiar é o
     conhecimento das rotas/operadores, não o mapa em si.
   - *Preparado para crescer com a tua frota* — arquitetura pensada desde o
     dia 1 para escalar de 5 para milhares de viaturas e outras províncias.
4. **"Ferramentas para a gestão da tua frota"** (fundo cinza-claro) — grelha 2×3
   de cartões azuis: mapa de operação em tempo real, gestão de motoristas,
   registo/manutenção de viaturas, relatórios de desempenho, alertas de
   ocorrências, histórico + exportação de dados.
5. **Faixa CTA escura com estrelas** — fundo quase-preto/azul-noite com padrão de
   estrelas subtil, cartão centrado: "Queres ser uma das primeiras empresas a
   testar o Táxi Map?" + CTAs "Candidatar a empresa piloto" / "Falar com a
   equipa". **Este é o único momento visual distinto do site inteiro** — todo o
   resto usa o mesmo kit de cartões azuis claros sobre fundo branco.
6. **FAQ** — reutiliza exatamente as mesmas perguntas da página Particulares
   (incluindo "posso chamar um táxi?"), não adaptadas ao público empresarial.
   Gap de conteúdo a resolver — uma empresa a candidatar-se ao piloto tem
   perguntas diferentes (preço, integração, dados, suporte).
7. **Footer:** igual ao da página Particulares.

## Gaps prioritários a resolver na próxima versão

Por ordem de impacto:

1. **O hero não vende o produto.** Substituir a foto de merchandising por um mapa
   real/interativo (mesmo que com dados de demonstração) a mostrar candongueiros a
   mover-se em Luanda — é o momento "ah, é isto que faz" que falta ao site inteiro.
   O merchandising pode continuar a existir, mas numa página/secção própria
   ("Loja"), não como a primeira coisa que se vê.
2. **Kit de cartões azuis repetido em quase tudo.** Reservar o tratamento de
   cartão sólido azul para uma única família de conteúdo (ex: só a grelha de
   ferramentas), e dar às outras secções (diferenciais, ofertas) uma estrutura
   visual distinta — para além disso, todos os ícones estão dentro de círculos
   brancos idênticos independentemente do conteúdo.
3. **A faixa escura com estrelas é a única assinatura visual do site — evoluí-la,
   não substituí-la.** Trocar as estrelas genéricas por um mapa 3D real/estilizado
   de Luanda à noite com pontos de GPS a pulsar. É o mesmo instinto que quem fez o
   site já teve (fundo escuro = momento especial), só falta ligá-lo ao produto real.
4. **FAQ da página Empresas devia ser diferente da FAQ de Particulares.** Reaproveitar
   a mesma lista de perguntas para dois públicos diferentes é uma lacuna de conteúdo,
   não só de design.
5. **Nenhum ecrã real da app.** O mockup "BREVEMENTE" é um placeholder aceitável
   enquanto a app não está pronta, mas assim que houver protótipos de UI, substituir.

## Direção de design — plano de tokens (seguir a skill frontend-design)

**Manter da marca atual (não reinventar do zero):**
- Família de azul já estabelecida: azul-claro de destaque (top bar / acentos,
  próximo de `#7EC4EC`) e azul médio dos cartões (`#4E9FD1`–`#5AA8DC`
  aproximadamente — confirmar hex exato com o ficheiro de marca).
- Tipografia display arredondada/geométrica já usada nos títulos ("Como funciona
  o Táxi Map", "Quem Somos") — tom amigável, consistente com o pitch deck.
  Mantê-la para o público Particulares; para Empresas/Institucional/Investidores,
  considerar reduzir o peso/tamanho ou introduzir uma segunda voz mais neutra
  para reforçar seriedade técnica sem trocar de marca.
- A honestidade dos números ("Metas do 1º ano", não tração inventada) e a
  clarificação "não é TVDE" — são acertos de copy, preservar sempre.

**O que mudar (evitar os tells de design genérico da skill):**
- Cartões azuis idênticos com o mesmo raio/sombra em toda a parte → dar
  hierarquia visual diferente a diferentes tipos de conteúdo.
- Ícones em círculos brancos repetidos sem variação → ok para uma secção, não
  para cinco secções seguidas.
- Hero sem o produto real → hero com mapa vivo.

**Direção proposta para o(s) momento(s) de assinatura:**
- **Hero (Particulares e home):** MapLibre GL com um mapa real/estilizado de
  Luanda, `pitch` ligeiro, pontos de candongueiro a mover-se em rotas de
  demonstração (claramente dados de exemplo, nunca apresentados como reais).
  Tipografia grande por cima, alinhada à esquerda.
- **Faixa CTA escura (já existe, evoluir):** trocar o padrão de estrelas por uma
  vista do mapa de Luanda à noite, com pins/rotas a "acender" — usa o mesmo
  instinto de "momento especial em fundo escuro" que o site já tem, só ligado
  ao produto.
- **Widget "Feed de alertas ao vivo":** já é uma boa ideia — evoluir de mockup
  estático para componente interativo real (mesmo que com dados de exemplo).

## Elemento 3D/mapa — o que construir e como

1. **Mapa 3D interativo no hero** — MapLibre GL JS com `pitch` e extrusão de
   edifícios (`fill-extrusion`, dados OSM), tiles self-hosted (consistente com a
   arquitetura já decidida no produto — não pagar Mapbox/Google). Pins de
   candongueiro animados em rotas de demonstração de Luanda.
2. **Arcos de rota animados sobre o mapa** — `deck.gl` (ArcLayer/TripsLayer) para
   mostrar linhas de rota a "acender" entre bairros na faixa CTA escura.
3. **Objeto 3D de assinatura (opcional)** — um candongueiro estilizado em
   baixo-poli via Three.js/React Three Fiber, só se o tempo permitir — nunca à
   custa do mapa, que é o herói real.
4. **Nunca sacrificar velocidade por 3D decorativo.** Parte da audiência real
   (empresas de táxi angolanas, jornalistas locais) tem ligação lenta — o próprio
   site já promete isto ("otimizado para baixa conectividade"), por isso o site
   tem de o demonstrar na prática. Lazy-load mapa/3D depois do primeiro paint
   do texto.

## Stack técnico recomendado

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **Mapa:** MapLibre GL JS (mesma escolha do produto), tiles self-hosted via
  OpenMapTiles/Martin quando possível; tiles públicos OSM aceitáveis para o MVP
  do site.
- **Camadas de dados sobre o mapa:** `deck.gl` para arcos/rotas animadas.
- **3D adicional (se usado):** `three.js` via `@react-three/fiber` + `@react-three/drei`.
- **Animação de UI:** Framer Motion — um momento orquestrado no load do hero, não
  hover-fade em cada cartão.
- **Hospedagem:** Vercel, ou o mesmo Hetzner/AWS af-south-1 do resto do stack.

## Conteúdo e copy

- Reaproveitar o copy já bom da página Empresas (os 4 diferenciais) — só mudar o
  enquadramento visual.
- Escrever FAQ próprio para a página Empresas (preço, integração, dados,
  suporte) em vez de reutilizar a FAQ de Particulares.
- CTA sempre em verbo ativo e específico — já é o caso ("Candidatar a empresa
  piloto", não "Saber mais") — manter esse padrão em qualquer secção nova.
- Nunca inventar números de tração que não existem — ver `CLAUDE.md` do produto:
  hoje não há empresas nem passageiros ativos. Seguir o padrão já usado no site
  ("Metas do 1º ano", claramente rotulado como meta).

## Convenções para o Claude Code neste repositório

1. Antes de gerar qualquer componente visual, seguir o processo de duas
   passagens da skill `frontend-design`: plano de tokens primeiro, revisão
   crítica contra este brief, só depois código.
2. Não partir do zero — este documento descreve o site real em produção;
   qualquer redesign parte da estrutura de informação já validada (separadores
   Particulares/Empresas/Institucional/Parceiros, FAQ, footer), só corrige os
   gaps listados acima.
3. Consistência de marca: mesmo azul, mesmo logótipo, mesma voz entre o site e
   a app — não podem parecer de empresas diferentes.
4. Mobile-first a sério — testar sempre em viewport estreito.
5. Performance antes de espetáculo — mapa/3D carrega depois do texto principal.
6. Nenhum dado de tração inventado — seguir o padrão "metas" já usado no site.
