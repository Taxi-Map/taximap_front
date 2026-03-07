# API de Rotas - Documentação para Frontend

## Visão Geral

Esta API calcula rotas de táxi (candongueiro) em Luanda, incluindo:
- Rotas directas (apenas táxi)
- Rotas com caminhada (táxi + trechos a pé)
- Múltiplas alternativas
- **Selecção automática de paragem** a partir de coordenadas GPS
- **Sistema de aprovação** de linhas criadas por utilizadores
- **Controlo de acesso** por papéis (admin/user)

---

## Autenticação nos Endpoints

| Endpoint | Método | Auth | Papel |
|----------|--------|------|-------|
| `/rotas/caminho-mais-curto` | GET | Nenhuma | — |
| `/rotas/caminho-mais-curto-coords` | GET | Nenhuma | — |
| `/rotas/paragens` | GET | Opcional (JWT) | Sem token → só aprovadas; com token → ver abaixo |
| `/rotas/linhas` | GET | Opcional (JWT) | Sem token → só aprovadas; com token → ver abaixo |
| `/rotas/paragem?id=` | GET | Opcional (JWT) | Sem token → só aprovadas; pendentes visíveis a admin/staff ou dono |
| `/rotas/linha?id=` | GET | Opcional (JWT) | Sem token → só aprovadas; pendentes visíveis a admin/staff ou dono |
| `/rotas/todas-paragens` | GET | JWT | Admin/Staff — todas as paragens com status |
| `/rotas/todas-linhas` | GET | JWT | Admin/Staff — todas as linhas com percurso populado |
| `/rotas/paragem` | POST | JWT | Qualquer (user=pendente, admin=aprovada) |
| `/rotas/paragem` | PUT/DELETE | JWT | Admin=todas; User=só as suas pendentes |
| `/rotas/linha` | POST | JWT | Qualquer (user=pendente, admin=aprovada) |
| `/rotas/linha` | PUT/DELETE | JWT | Admin=todas; User=só as suas pendentes |
| `/rotas/linhas-pendentes` | GET | JWT | Admin/Staff |
| `/rotas/paragens-pendentes` | GET | JWT | Admin/Staff |
| `/rotas/aprovar-linha?id=` | POST | JWT | Admin/Staff |
| `/rotas/rejeitar-linha?id=` | POST | JWT | Admin/Staff |
| `/rotas/minhas-linhas` | GET | JWT | Qualquer |
| `/rotas/aprovar-paragem?id=` | POST | JWT | Admin/Staff |
| `/rotas/rejeitar-paragem?id=` | POST | JWT | Admin/Staff |
| `/rotas/minhas-paragens` | GET | JWT | Qualquer |

---

## Endpoints

### 1. Calcular Caminho Mais Curto (por ID)

```
GET /rotas/caminho-mais-curto?origem={id}&destino={id}&alternativas={n}
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `origem` | number | ✅ | ID da paragem de origem |
| `destino` | number | ✅ | ID da paragem de destino |
| `alternativas` | number | ❌ | Número máximo de alternativas (default: 3) |

**Exemplo:**
```
GET /rotas/caminho-mais-curto?origem=4&destino=19
```

---

### 2. Calcular Caminho a partir de Coordenadas GPS ⭐ NOVO

```
GET /rotas/caminho-mais-curto-coords?userLat={lat}&userLng={lng}&destino={id}&alternativas={n}
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `userLat` | number | ✅ | Latitude do utilizador |
| `userLng` | number | ✅ | Longitude do utilizador |
| `destino` | number | ✅ | ID da paragem de destino |
| `alternativas` | number | ❌ | Número máximo de alternativas (default: 3) |

**Exemplo:**
```
GET /rotas/caminho-mais-curto-coords?userLat=-8.898&userLng=13.215&destino=22
```

**Lógica:**
1. Backend encontra as 10 paragens mais próximas das coordenadas do user
2. Para cada paragem, calcula a rota até ao destino
3. Escolhe a paragem que resulta na **menor distância total** (caminhada + táxi)
4. Retorna a rota com informação da paragem sugerida

**Resposta Adicional:**
```typescript
interface ResultadoRotas {
  // ... campos existentes ...
  paragemOrigemSugerida?: Paragem;  // ⭐ Paragem escolhida pelo backend
  distanciaAteParagem?: number;      // ⭐ Distância em metros até à paragem
}
```

---

## Estrutura da Resposta

```typescript
interface RespostaCaminhoMaisCurto {
  sucesso: boolean;
  dados: ResultadoRotas;
}
```

### ResultadoRotas

```typescript
interface ResultadoRotas {
  analise: AnaliseRota;              // Análise da distância e recomendações
  principal: ResultadoCaminho | null; // Rota principal (null se deve ir a pé)
  alternativas: ResultadoCaminho[];   // Rotas alternativas
  totalRotasEncontradas: number;      // Total de rotas encontradas
  incluiCaminhada: boolean;           // true se a rota inclui trechos a pé
  
  // ⭐ NOVOS CAMPOS (apenas no endpoint coords)
  paragemOrigemSugerida?: Paragem;   // Paragem escolhida pelo backend
  distanciaAteParagem?: number;       // Distância em metros até à paragem
}
```

### AnaliseRota

```typescript
interface AnaliseRota {
  distanciaDirecta: number;     // Distância em linha recta (km)
  distanciaPercurso: number;    // Distância total do percurso (km)
  factorDesvio: number;         // Quanto maior, mais desvio (1.0 = directo)
  podeIrAPe: boolean;           // Se pode ir a pé (< 500m)
  distanciaAPeMetros: number;   // Distância a pé em metros
  avisos: string[];             // Avisos para o utilizador (com emojis)
}
```

### ResultadoCaminho

```typescript
interface ResultadoCaminho {
  // Campos existentes
  segmentos: SegmentoViagem[];    // Lista de segmentos de táxi
  numeroTaxis: number;            // Número de táxis necessários
  distanciaTotal: number;         // Distância total em km
  paragensTotal: number;          // Total de paragens
  descricaoPercurso: string[];    // Descrição passo a passo (com emojis)
  
  // Campos opcionais (aparecem quando incluiCaminhada=true)
  caminhadaInicial?: SegmentoCaminhada;  // Trecho a pé no início
  caminhadaFinal?: SegmentoCaminhada;    // Trecho a pé no fim (ou intermediário)
  origemReal?: Paragem;                   // Paragem original de partida
  destinoReal?: Paragem;                  // Paragem original de destino
}
```

### SegmentoViagem

```typescript
interface SegmentoViagem {
  linha: Linha;                   // Informação da linha de táxi
  paragensPercurso: Paragem[];    // Paragens neste segmento
  distancia: number;              // Distância deste segmento em km
}
```

### SegmentoCaminhada

```typescript
interface SegmentoCaminhada {
  tipo: 'caminhada';              // Sempre 'caminhada'
  paragemOrigem: Paragem;         // De onde começa a caminhar
  paragemDestino: Paragem;        // Até onde caminha
  distanciaMetros: number;        // Distância em metros
  descricao: string;              // Ex: "🚶 Caminhe 40m de X até Y"
}
```

### Paragem

```typescript
interface Paragem {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
}
```

### Linha

```typescript
interface Linha {
  id: number;
  nome: string;
  descricao: string;
  status?: 'aprovada' | 'pendente' | 'rejeitada';  // presente em endpoints de gestão
  criadoPor?: string;   // userId do criador
  criadoEm?: string;    // data de criação (ISO)
}
```

---

## Exemplos de Resposta

### Exemplo 1: Rota Directa (sem caminhada)

```json
{
  "sucesso": true,
  "dados": {
    "analise": {
      "distanciaDirecta": 4.18,
      "distanciaPercurso": 4.29,
      "factorDesvio": 1.03,
      "podeIrAPe": false,
      "distanciaAPeMetros": 4175,
      "avisos": []
    },
    "principal": {
      "segmentos": [
        {
          "linha": {
            "id": 5,
            "nome": "Belas shopping-Vila do Gamek",
            "descricao": "Linha Belas shopping até Vila do Gamek"
          },
          "paragensPercurso": [
            { "id": 4, "nome": "Belas shopping", "latitude": -8.922, "longitude": 13.185 },
            { "id": 10, "nome": "Siac talatona", "latitude": -8.915, "longitude": 13.198 },
            { "id": 11, "nome": "Prometeus Talatona", "latitude": -8.910, "longitude": 13.200 },
            { "id": 3, "nome": "Vila do Gamek (Paragem Pedalé)", "latitude": -8.898, "longitude": 13.214 }
          ],
          "distancia": 4.29
        }
      ],
      "numeroTaxis": 1,
      "distanciaTotal": 4.29,
      "paragensTotal": 4,
      "descricaoPercurso": [
        "🚖 Táxi 1: Apanha o táxi \"Belas shopping-Vila do Gamek\"",
        "   Percurso: Belas shopping → Siac talatona → Prometeus Talatona → Vila do Gamek (Paragem Pedalé)",
        "   Distância: 4.29 km"
      ]
    },
    "alternativas": [],
    "totalRotasEncontradas": 1,
    "incluiCaminhada": false
  }
}
```

### Exemplo 2: Rota com Caminhada Intermediária ⭐

```json
{
  "sucesso": true,
  "dados": {
    "analise": {
      "distanciaDirecta": 2.05,
      "distanciaPercurso": 6.52,
      "factorDesvio": 3.18,
      "podeIrAPe": false,
      "distanciaAPeMetros": 2052,
      "avisos": [
        "🚶 Esta rota inclui um trecho a pé."
      ]
    },
    "principal": {
      "segmentos": [
        {
          "linha": {
            "id": 5,
            "nome": "Belas shopping-Vila do Gamek",
            "descricao": "Linha Belas shopping até Vila do Gamek"
          },
          "paragensPercurso": [
            { "id": 4, "nome": "Belas shopping", "latitude": -8.922, "longitude": 13.185 },
            { "id": 10, "nome": "Siac talatona", "latitude": -8.915, "longitude": 13.198 },
            { "id": 11, "nome": "Prometeus Talatona", "latitude": -8.910, "longitude": 13.200 },
            { "id": 3, "nome": "Vila do Gamek (Paragem Pedalé)", "latitude": -8.898, "longitude": 13.214 }
          ],
          "distancia": 4.29
        },
        {
          "linha": {
            "id": 9,
            "nome": "Vila Dangereux-Banixa",
            "descricao": "Linha Vila Dangereux até Dangereux Banixa"
          },
          "paragensPercurso": [
            { "id": 18, "nome": "Vila do Gamek - Dangereux", "latitude": -8.898, "longitude": 13.214 },
            { "id": 20, "nome": "Rotunda da fubú - Dangereux", "latitude": -8.921, "longitude": 13.221 },
            { "id": 19, "nome": "Dangereux Banixa", "latitude": -8.929, "longitude": 13.202 }
          ],
          "distancia": 2.19
        }
      ],
      "numeroTaxis": 2,
      "distanciaTotal": 6.52,
      "paragensTotal": 6,
      "descricaoPercurso": [
        "🚖 Táxi: Apanha o táxi \"Belas shopping-Vila do Gamek\"",
        "   Percurso: Belas shopping → Siac talatona → Prometeus Talatona → Vila do Gamek (Paragem Pedalé)",
        "   Distância: 4.29 km",
        "🚶 Caminhe 40m de \"Vila do Gamek (Paragem Pedalé)\" até \"Vila do Gamek - Dangereux\"",
        "🚖 Táxi: Apanha o táxi \"Vila Dangereux-Banixa\"",
        "   Percurso: Vila do Gamek - Dangereux → Rotunda da fubú - Dangereux → Dangereux Banixa",
        "   Distância: 2.19 km"
      ],
      "caminhadaFinal": {
        "tipo": "caminhada",
        "paragemOrigem": {
          "id": 3,
          "nome": "Vila do Gamek (Paragem Pedalé)",
          "latitude": -8.898,
          "longitude": 13.214
        },
        "paragemDestino": {
          "id": 18,
          "nome": "Vila do Gamek - Dangereux",
          "latitude": -8.898,
          "longitude": 13.214
        },
        "distanciaMetros": 40,
        "descricao": "🚶 Caminhe 40m de \"Vila do Gamek (Paragem Pedalé)\" até \"Vila do Gamek - Dangereux\""
      },
      "origemReal": {
        "id": 4,
        "nome": "Belas shopping",
        "latitude": -8.922,
        "longitude": 13.185
      },
      "destinoReal": {
        "id": 19,
        "nome": "Dangereux Banixa",
        "latitude": -8.929,
        "longitude": 13.202
      }
    },
    "alternativas": [],
    "totalRotasEncontradas": 1,
    "incluiCaminhada": true
  }
}
```

### Exemplo 3: Destino Próximo (Ir a Pé)

```json
{
  "sucesso": true,
  "dados": {
    "analise": {
      "distanciaDirecta": 0.35,
      "distanciaPercurso": 0,
      "factorDesvio": 1,
      "podeIrAPe": true,
      "distanciaAPeMetros": 350,
      "avisos": [
        "🚶 As paragens estão a apenas 350m de distância. Pode ir a pé!"
      ]
    },
    "principal": null,
    "alternativas": [],
    "totalRotasEncontradas": 0,
    "incluiCaminhada": false
  }
}
```

### Exemplo 4: Sem Rota Disponível

```json
{
  "sucesso": true,
  "dados": {
    "analise": {
      "distanciaDirecta": 5.2,
      "distanciaPercurso": 0,
      "factorDesvio": 1,
      "podeIrAPe": false,
      "distanciaAPeMetros": 5200,
      "avisos": [
        "❌ Não foi encontrada nenhuma rota de táxi entre estas paragens.",
        "💡 Não existem paragens próximas que permitam fazer a conexão a pé."
      ]
    },
    "principal": null,
    "alternativas": [],
    "totalRotasEncontradas": 0,
    "incluiCaminhada": false
  }
}
```

---

## Lógica de Apresentação no Frontend

### 1. Verificar se há rota

```javascript
if (dados.principal === null) {
  if (dados.analise.podeIrAPe) {
    // Mostrar: "Pode ir a pé! Distância: X metros"
  } else {
    // Mostrar avisos de erro
  }
}
```

### 2. Verificar tipo de rota

```javascript
if (dados.incluiCaminhada) {
  // Rota mista: táxi + caminhada
  // Destacar os trechos a pé com ícone 🚶
} else {
  // Rota apenas de táxi
}
```

### 3. Renderizar Descrição do Percurso

O campo `descricaoPercurso` já vem formatado com emojis:
- `🚖` = Segmento de táxi
- `🚶` = Segmento a pé
- `🔄` = Transbordo (trocar de táxi)

```javascript
dados.principal.descricaoPercurso.forEach(passo => {
  // Renderizar cada passo
  console.log(passo);
});
```

### 4. Mostrar Avisos

```javascript
dados.analise.avisos.forEach(aviso => {
  // Renderizar avisos (já têm emojis)
  // ⚠️ = Alerta
  // ❌ = Erro
  // 💡 = Dica
  // 🚶 = Informação sobre caminhada
});
```

### 5. Destacar Caminhada no Mapa

Se `dados.incluiCaminhada === true`, usar os campos:

```javascript
// Caminhada no início
if (dados.principal.caminhadaInicial) {
  const { paragemOrigem, paragemDestino, distanciaMetros } = dados.principal.caminhadaInicial;
  // Desenhar linha tracejada entre paragemOrigem e paragemDestino
}

// Caminhada no fim ou intermediária
if (dados.principal.caminhadaFinal) {
  const { paragemOrigem, paragemDestino, distanciaMetros } = dados.principal.caminhadaFinal;
  // Desenhar linha tracejada entre paragemOrigem e paragemDestino
}
```

---

## Outros Endpoints

### Listar Paragens
```
GET /rotas/paragens
GET /rotas/paragens?incluirPendentes=true
Authorization: Bearer <JWT>  (opcional)
```

**Comportamento por papel:**
| Token | `incluirPendentes` | Resultado |
|-------|--------------------|-----------|
| Nenhum | qualquer | Apenas paragens **aprovadas** |
| User normal | `false` ou ausente | Apenas paragens **aprovadas** |
| User normal | `true` | Aprovadas + **as suas próprias** pendentes |
| Admin/Staff | `true` | **Todas** as paragens (aprovadas + pendentes) |

**⚠️ Nota:** O query param `incluirPendentes=true` sem token é ignorado — devolve apenas aprovadas.

**Formato de resposta (paragem com status):**
```typescript
interface ParagemComStatus {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  status?: 'aprovada' | 'pendente' | 'rejeitada';
  criadoPor?: string;
  criadoEm?: string;
}
```

### Listar Linhas
```
GET /rotas/linhas
GET /rotas/linhas?incluirPendentes=true
Authorization: Bearer <JWT>  (opcional)
```

**Comportamento por papel:**
| Token | `incluirPendentes` | Resultado |
|-------|--------------------|-----------|
| Nenhum | qualquer | Apenas linhas **aprovadas** |
| User normal | `false` ou ausente | Apenas linhas **aprovadas** |
| User normal | `true` | Aprovadas + **as suas próprias** pendentes (com percurso) |
| Admin/Staff | `true` | **Todas** as linhas com percurso populado |

**⚠️ Importante (admin/staff):** Quando `incluirPendentes=true`, a resposta muda de formato:
```typescript
// Formato normal (sem incluirPendentes)
{ sucesso: true, dados: Linha[] }

// Formato com incluirPendentes=true (admin/staff ou dono)
{ sucesso: true, dados: Array<{ linha: Linha; percurso: Paragem[] }> }
```

### Obter Paragem por ID
```
GET /rotas/paragem?id={id}
Authorization: Bearer <JWT>  (opcional)
```
Paragens aprovadas são públicas. Paragens pendentes/rejeitadas só são visíveis para admin/staff ou o utilizador que as criou (requer token JWT).

### Obter Linha por ID (com percurso)
```
GET /rotas/linha?id={id}
Authorization: Bearer <JWT>  (opcional)
```
Linhas aprovadas são públicas. Linhas pendentes/rejeitadas só são visíveis para admin/staff ou o utilizador que as criou (requer token JWT).

**Resposta:**
```json
{
  "sucesso": true,
  "dados": {
    "linha": { "id": 1, "nome": "...", "descricao": "...", "status": "aprovada" },
    "percurso": [
      { "id": 1, "nome": "Paragem A", "latitude": -8.9, "longitude": 13.2 }
    ]
  }
}
```

### Todas as Paragens (Admin/Staff)
```
GET /rotas/todas-paragens
Authorization: Bearer <JWT> (admin ou staff obrigatório)
```
Retorna todas as paragens (aprovadas + pendentes + rejeitadas) com `status`, `criadoPor` e `criadoEm`.

### Todas as Linhas com Percurso (Admin/Staff)
```
GET /rotas/todas-linhas
Authorization: Bearer <JWT> (admin ou staff obrigatório)
```
Retorna todas as linhas com o percurso **completamente populado** (objetos Paragem com coordenadas), incluindo linhas pendentes.

**Resposta:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "linha": {
        "id": 17,
        "nome": "Teste linha",
        "descricao": "Opcional",
        "status": "pendente",
        "criadoPor": "65a1b2c3d4e5f6a7b8c9d0e1",
        "criadoEm": "2026-02-15T10:30:00.000Z"
      },
      "percurso": [
        { "id": 63, "nome": "Paragem X", "latitude": -8.91, "longitude": 13.22 },
        { "id": 64, "nome": "Paragem Y", "latitude": -8.92, "longitude": 13.23 }
      ]
    }
  ]
}

---

## Endpoints CRUD (Autenticação Obrigatória)

### Paragens (Autenticação Obrigatória)

#### Criar Paragem
```
POST /rotas/paragem
Header: Authorization: Bearer <JWT>
Body: { "nome": string, "latitude": number, "longitude": number }
```

**Comportamento por papel:**
| Papel | Resultado |
|-------|-----------|
| `admin` | Paragem criada e **aprovada directamente** (entra logo nas rotas) |
| `user` | Paragem criada como **pendente** (aguarda aprovação do admin) |

**Resposta (201) — Admin:**
```json
{
  "sucesso": true,
  "dados": { "id": 120, "nome": "Nova Paragem", "latitude": -8.9, "longitude": 13.2, "status": "aprovada" },
  "mensagem": "Paragem criada e aprovada com sucesso"
}
```

**Resposta (201) — User:**
```json
{
  "sucesso": true,
  "dados": { "id": 121, "nome": "Paragem Bairro Novo", "latitude": -8.95, "longitude": 13.25, "status": "pendente" },
  "mensagem": "Paragem criada e enviada para aprovação. Um administrador irá revê-la."
}
```

#### Actualizar Paragem
```
PUT /rotas/paragem?id={id}
Header: Authorization: Bearer <JWT>
Body: { "nome"?: string, "latitude"?: number, "longitude"?: number }
```

**Permissões:**
| Papel | Permissão |
|-------|-----------|
| `admin` | Pode editar qualquer paragem |
| `user` | Só pode editar paragens **pendentes** que **criou** |

**Erros de permissão (403):**
```json
{ "statusCode": 403, "message": "Apenas administradores podem editar paragens aprovadas" }
{ "statusCode": 403, "message": "Só pode editar paragens que criou" }
```

#### Eliminar Paragem
```
DELETE /rotas/paragem?id={id}
Header: Authorization: Bearer <JWT>
```

**Permissões:** Mesma lógica que actualizar — admin pode eliminar qualquer paragem; user só pode eliminar as suas pendentes.

**Erros comuns:**
```json
{ "statusCode": 403, "message": "Apenas administradores podem eliminar paragens aprovadas" }
{ "statusCode": 409, "message": "A paragem está a ser usada por uma linha. Remova primeiro das linhas." }
```

### Linhas (Autenticação Obrigatória)

#### Criar Linha
```
POST /rotas/linha
Header: Authorization: Bearer <JWT>
Body: { "nome": string, "descricao": string, "paragemIds": number[] }
```

**Comportamento por papel:**
| Papel | Resultado |
|-------|-----------|
| `admin` | Linha criada e **aprovada directamente** (disponível no cálculo de rotas) |
| `user` | Linha criada como **pendente** (requer aprovação de admin) |

**Resposta (201) — Admin:**
```json
{
  "sucesso": true,
  "dados": { "linha": {...}, "percurso": [...], "pendente": false },
  "mensagem": "Linha criada e aprovada com sucesso"
}
```

**Resposta (201) — User:**
```json
{
  "sucesso": true,
  "dados": { "linha": {...}, "percurso": [...], "pendente": true },
  "mensagem": "Linha criada e enviada para aprovação. Um administrador irá revê-la."
}
```

#### Actualizar Linha
```
PUT /rotas/linha?id={id}
Header: Authorization: Bearer <JWT>
Body: { "nome"?: string, "descricao"?: string, "paragemIds"?: number[] }
```

**Permissões:**
| Papel | Permissão |
|-------|-----------|
| `admin` | Pode editar qualquer linha |
| `user` | Só pode editar linhas **pendentes** que **criou** |

**Erros de permissão (403):**
```json
{ "statusCode": 403, "message": "Apenas administradores podem editar linhas aprovadas" }
{ "statusCode": 403, "message": "Só pode editar linhas que criou" }
```

#### Eliminar Linha
```
DELETE /rotas/linha?id={id}
Header: Authorization: Bearer <JWT>
```

**Permissões:** Mesma lógica que actualizar — admin pode eliminar qualquer; user só as suas pendentes.

---

## Endpoints de Aprovação (Apenas Admin)

### Listar Linhas Pendentes
```
GET /rotas/linhas-pendentes
Header: Authorization: Bearer <JWT> (admin ou staff)
```

**⚠️ Importante:** O array `percurso` agora contém os **objetos completos** das paragens (id, nome, latitude, longitude), permitindo ao frontend desenhar a rota no mapa.

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": [
    {
      "linha": {
        "id": 17,
        "nome": "Nova Linha",
        "descricao": "...",
        "status": "pendente",
        "criadoPor": "65a1b2c3d4e5f6a7b8c9d0e1",
        "criadoEm": "2026-03-07T10:30:00.000Z"
      },
      "percurso": [
        { "id": 1, "nome": "Paragem A", "latitude": -8.9, "longitude": 13.2 },
        { "id": 2, "nome": "Paragem B", "latitude": -8.91, "longitude": 13.21 },
        { "id": 3, "nome": "Paragem C", "latitude": -8.92, "longitude": 13.22 }
      ],
      "metadata": {
        "status": "pendente",
        "criadoPor": "65a1b2c3d4e5f6a7b8c9d0e1",
        "criadoEm": "2026-03-07T10:30:00.000Z"
      }
    }
  ],
  "total": 1
}
```

### Aprovar Linha
```
POST /rotas/aprovar-linha?id={id}
Header: Authorization: Bearer <JWT> (admin)
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": null,
  "mensagem": "Linha aprovada com sucesso. Já está disponível no cálculo de rotas."
}
```

### Rejeitar Linha
```
POST /rotas/rejeitar-linha?id={id}
Header: Authorization: Bearer <JWT> (admin)
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": null,
  "mensagem": "Linha rejeitada e eliminada."
}
```

### Listar Paragens Pendentes
```
GET /rotas/paragens-pendentes
Header: Authorization: Bearer <JWT> (admin)
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": [
    {
      "paragem": { "id": 121, "nome": "Paragem Bairro Novo", "latitude": -8.95, "longitude": 13.25, "status": "pendente", "criadoPor": "65a1...", "criadoEm": "2026-02-15T10:30:00.000Z" },
      "metadata": {
        "status": "pendente",
        "criadoPor": "65a1...",
        "criadoEm": "2026-02-15T10:30:00.000Z"
      }
    }
  ],
  "total": 1
}
```

### Aprovar Paragem
```
POST /rotas/aprovar-paragem?id={id}
Header: Authorization: Bearer <JWT> (admin)
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": null,
  "mensagem": "Paragem aprovada com sucesso. Já está disponível no cálculo de rotas."
}
```

### Rejeitar Paragem
```
POST /rotas/rejeitar-paragem?id={id}
Header: Authorization: Bearer <JWT> (admin)
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": null,
  "mensagem": "Paragem rejeitada e eliminada."
}
```

**Erro (409) quando a paragem está em uso:**
```json
{
  "statusCode": 409,
  "message": "Não é possível rejeitar. A paragem está associada a uma linha."
}
```

---

## Minhas Linhas (Utilizador Autenticado)

### Listar Linhas do Utilizador
```
GET /rotas/minhas-linhas
Header: Authorization: Bearer <JWT>
```

Retorna todas as linhas criadas pelo utilizador autenticado, com o respectivo estado.

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": [
    {
      "linha": { "id": 15, "nome": "Nova Linha", "descricao": "..." },
      "percurso": [...],
      "status": "pendente"
    },
    {
      "linha": { "id": 12, "nome": "Outra Linha", "descricao": "..." },
      "percurso": [...],
      "status": "aprovada"
    }
  ],
  "total": 2
}
```

**Estados possíveis:** `pendente` | `aprovada` | `rejeitada`

---

## Minhas Paragens (Utilizador Autenticado)

### Listar Paragens do Utilizador
```
GET /rotas/minhas-paragens
Header: Authorization: Bearer <JWT>
```

Retorna todas as paragens criadas pelo utilizador autenticado, com o respectivo estado actual.

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": [
    {
      "paragem": { "id": 121, "nome": "Paragem Bairro Novo", "latitude": -8.95, "longitude": 13.25, "status": "pendente" },
      "status": "pendente"
    }
  ],
  "total": 1
}
```

**Estados possíveis:** `pendente` | `aprovada` | `rejeitada`

---

## Constantes Importantes

| Constante | Valor | Descrição |
|-----------|-------|-----------|
| `DISTANCIA_MAXIMA_A_PE_METROS` | 500m | Distância máxima para sugerir ir completamente a pé |
| `DISTANCIA_CAMINHADA_CONEXAO_METROS` | 600m | Distância máxima para conectar paragens a pé |
| `FACTOR_DESVIO_ALERTA` | 2.0 | Se rota faz >2x distância directa, mostra aviso |

---

## Exemplo: Resposta do Endpoint de Coordenadas

### Request
```
GET /rotas/caminho-mais-curto-coords?userLat=-8.8976&userLng=13.2155&destino=22
```

### Response
```json
{
  "sucesso": true,
  "dados": {
    "analise": {
      "distanciaDirecta": 4.07,
      "distanciaPercurso": 4.31,
      "factorDesvio": 1.06,
      "podeIrAPe": false,
      "distanciaAPeMetros": 4070,
      "avisos": [
        "🚶 Caminhe 115m até à paragem \"Vila do Gamek (Paragem Pedalé)\""
      ]
    },
    "principal": {
      "segmentos": [...],
      "numeroTaxis": 1,
      "distanciaTotal": 4.20,
      "paragensTotal": 3,
      "descricaoPercurso": [
        "🚖 Táxi 1: Apanha o táxi \"Vila do gamek - Golf 2\"",
        "   Percurso: Vila do Gamek (Paragem Pedalé) → Paragem do Nova Vida → Golf 2 Triângulo",
        "   Distância: 4.20 km"
      ]
    },
    "alternativas": [],
    "totalRotasEncontradas": 1,
    "incluiCaminhada": false,
    "paragemOrigemSugerida": {
      "id": 3,
      "nome": "Vila do Gamek (Paragem Pedalé)",
      "latitude": -8.89855029065921,
      "longitude": 13.214811054223516
    },
    "distanciaAteParagem": 115
  }
}
```

---

## Lógica de Uso no Frontend

### Usando Coordenadas (Recomendado)

```typescript
// routeService.ts
async getRouteFromCoords(
  userLat: number,
  userLng: number,
  destinationId: number,
  alternativas: number = 3
): Promise<RouteResponse | null> {
  const response = await fetch(
    `${API_URL}/rotas/caminho-mais-curto-coords?userLat=${userLat}&userLng=${userLng}&destino=${destinationId}&alternativas=${alternativas}`
  );
  return response.json();
}
```

### No Componente

```typescript
// MapPage.tsx
const handleCalculateRoute = async () => {
  // Obter localização do utilizador
  const position = await getCurrentPosition();
  
  // Backend escolhe a melhor paragem automaticamente
  const result = await routeService.getRouteFromCoords(
    position.coords.latitude,
    position.coords.longitude,
    selectedDestination.id
  );
  
  if (result.dados.paragemOrigemSugerida) {
    console.log(`Paragem sugerida: ${result.dados.paragemOrigemSugerida.nome}`);
    console.log(`Distância até paragem: ${result.dados.distanciaAteParagem}m`);
  }
};
```

---

## Changelog

### v4.0.0 (Março 2026)
- ✅ **`GET /rotas/linhas-pendentes`** — array `percurso` agora contém **objetos Paragem completos** (id, nome, latitude, longitude). Anteriormente vinha vazio para linhas pendentes, impedindo o mapa de desenhar a rota
- ✅ **`GET /rotas/todas-linhas`** — endpoint protegido (admin/staff) retorna todas as linhas com percurso completamente populado no formato `{ linha, percurso }[]`
- ✅ **`GET /rotas/linhas?incluirPendentes=true`** — agora seguro: admin/staff vêem tudo, utilizador normal vê apenas as suas próprias pendentes, pedido sem token devolve sempre só aprovadas
- ✅ **`GET /rotas/paragens?incluirPendentes=true`** — mesma lógica de visibilidade restrita aplicada
- ✅ **`GET /rotas/linha?id=` e `GET /rotas/paragem?id=`** — aceitam token JWT opcional; linhas/paragens pendentes agora acessíveis por admin/staff e pelo criador
- ✅ **`GET /rotas/todas-paragens`** — endpoint protegido para admin/staff listarem todas as paragens
- ✅ Novo guard `OptionalJwtAuthGuard` — permite autenticação opcional sem bloquear pedidos anónimos
- 🔒 Segurança: `incluirPendentes=true` sem token é ignorado (não expõe dados pendentes publicamente)

### v3.1.0 (Fevereiro 2026)
- ✅ CORS configurado para aceitar `https://192.168.0.172:5173` (acesso em rede local)
- ✅ `CORS_ORIGINS` configurável via variável de ambiente
- ✅ Linhas pendentes **nunca** escritas no `linhas.csv` / `percursos.csv` (só após aprovação)
- ✅ CSVs contêm apenas dados aprovados — sem poluição de qualidade
- ✅ **Autenticação obrigatória** em todos os endpoints CRUD (criar, editar, eliminar)
- ✅ **Paragens — fluxo com aprovação**: user pode criar/editar/eliminar as suas paragens pendentes; admin aprova/rejeita
- ✅ **Novos endpoints de paragens**: `GET /rotas/paragens-pendentes`, `POST /rotas/aprovar-paragem`, `POST /rotas/rejeitar-paragem`, `GET /rotas/minhas-paragens`
- ✅ **Linhas — sistema de aprovação**: linhas criadas por `user` ficam **pendentes**; admin aprova directamente
- ✅ **Novos endpoints de linhas**: `GET /rotas/linhas-pendentes`, `POST /rotas/aprovar-linha`, `POST /rotas/rejeitar-linha`, `GET /rotas/minhas-linhas`
- ✅ Permissões granulares: user só pode editar/eliminar aquilo que criou e ainda está pendente
- ✅ Linhas pendentes/rejeitadas **não entram** no cálculo de rotas

### v2.1.0 (Janeiro 2026)
- ✅ **Novo endpoint** `GET /rotas/caminho-mais-curto-coords` para cálculo a partir de GPS
- ✅ Novos campos `paragemOrigemSugerida` e `distanciaAteParagem` em `ResultadoRotas`
- ✅ Backend escolhe automaticamente a melhor paragem de origem
- ✅ Filtragem melhorada de alternativas (remove rotas que fazem muita volta)

### v2.0.0 (Janeiro 2026)
- ✅ Adicionado campo `incluiCaminhada` em `ResultadoRotas`
- ✅ Adicionados campos `caminhadaInicial`, `caminhadaFinal`, `origemReal`, `destinoReal` em `ResultadoCaminho`
- ✅ Nova interface `SegmentoCaminhada`
- ✅ Suporte a rotas com caminhada intermediária (táxi → caminhar → táxi)
- ✅ Descrições de percurso incluem trechos a pé com emoji 🚶
