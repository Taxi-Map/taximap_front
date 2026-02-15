# API de TM Coins e Contribuições — TaxiMap Luanda

## Contexto

Este documento descreve como o frontend deve consumir os endpoints de TM Coins, contribuições e pagamentos. **Todos os endpoints estão implementados e funcionais.**

**Base URL:** `http://localhost:3000` (desenvolvimento)  
**Autenticação:** Bearer Token JWT (header `Authorization: Bearer <token>`)

---

## 1. Autenticação Inicial — Seed Admin

### POST /auth/seed-admin

Cria o primeiro administrador do sistema. **Usar apenas uma vez no setup inicial.**

```http
POST /auth/seed-admin
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@taximap.ao",
  "password": "SenhaForte123!",
  "firstName": "Admin",
  "lastName": "TaxiMap",
  "seedSecret": "VALOR_DA_ENV_ADMIN_SEED_SECRET"
}
```

> ⚠️ O campo é `seedSecret` (não `segredo`)

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Administrador criado com sucesso",
  "dados": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@taximap.ao",
      "role": "admin",
      "firstName": "Admin",
      "lastName": "TaxiMap"
    }
  }
}
```

**Uso no frontend:**
```typescript
const response = await fetch('/auth/seed-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@taximap.ao',
    password: 'SenhaForte123!',
    firstName: 'Admin',
    lastName: 'TaxiMap',
    seedSecret: 'segredo-do-env'
  })
});
const { dados } = await response.json();
// Guardar dados.accessToken no localStorage/authContext
```

---

## 2. Perfil do Utilizador — Campos de TM Coins

### GET /auth/profile

Retorna o perfil completo do utilizador **incluindo saldo de TM Coins**.

```http
GET /auth/profile
Authorization: Bearer <JWT>
```

**Resposta:**
```json
{
  "sucesso": true,
  "dados": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "picture": "https://cloudinary.com/...",
    "verified": true,
    "phoneNumber": "+244923456789",
    "providers": ["google", "local"],
    "role": "user",
    "tmCoins": 2500,
    "totalContribuicoes": 12,
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

**Actualizar interface AuthUser no frontend:**
```typescript
export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  verified: boolean;
  phoneNumber?: string;
  providers: string[];
  role: 'user' | 'admin';
  tmCoins: number;           // NOVO
  totalContribuicoes: number; // NOVO
}
```

---

## 3. Saldo de TM Coins

### GET /auth/meu-saldo

Endpoint dedicado para obter apenas o saldo (útil para actualizar sem recarregar todo o perfil).

```http
GET /auth/meu-saldo
Authorization: Bearer <JWT>
```

**Resposta:**
```json
{
  "sucesso": true,
  "dados": {
    "tmCoins": 2500,
    "totalContribuicoes": 12,
    "valorKz": 250
  }
}
```

> 💡 **Conversão:** 10 TM Coins = 1 Kz

**Uso no frontend:**
```typescript
const fetchSaldo = async () => {
  const res = await authFetch('/auth/meu-saldo');
  const { dados } = await res.json();
  setTmCoins(dados.tmCoins);
  // dados.valorKz já vem calculado (tmCoins / 10)
};
```

---

## 4. Histórico de Contribuições

### GET /rotas/minhas-contribuicoes

Lista todas as contribuições (paragens e linhas) do utilizador.

```http
GET /rotas/minhas-contribuicoes?pagina=1&porPagina=20
Authorization: Bearer <JWT>
```

**Query Params:**
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `pagina` | number | 1 | Página actual |
| `porPagina` | number | 20 | Itens por página (max: 100) |

**Resposta:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "_id": "65f1234567890abcdef12345",
      "userId": "507f1f77bcf86cd799439011",
      "tipo": "paragem",
      "nome": "Paragem Mutamba",
      "referenciaId": 121,
      "tmCoinsGanhos": 25,
      "status": "aprovada",
      "createdAt": "2026-02-14T10:30:00.000Z",
      "aprovadoEm": "2026-02-15T14:00:00.000Z",
      "aprovadoPor": "507f1f77bcf86cd799439099"
    },
    {
      "_id": "65f1234567890abcdef12346",
      "userId": "507f1f77bcf86cd799439011",
      "tipo": "linha",
      "nome": "Viana - Zango",
      "referenciaId": 15,
      "tmCoinsGanhos": 100,
      "status": "pendente",
      "createdAt": "2026-02-10T08:00:00.000Z"
    }
  ],
  "paginacao": {
    "pagina": 1,
    "porPagina": 20,
    "total": 12,
    "totalPaginas": 1
  }
}
```

**Status possíveis:**
- `pendente` — Aguardando aprovação do admin
- `aprovada` — Aprovada, TM Coins creditados
- `rejeitada` — Rejeitada pelo admin

**Uso no frontend:**
```typescript
interface Contribuicao {
  _id: string;
  tipo: 'paragem' | 'linha';
  nome: string;
  referenciaId: number;
  tmCoinsGanhos: number;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  createdAt: string;
  aprovadoEm?: string;
}

const fetchContribuicoes = async (pagina = 1) => {
  const res = await authFetch(`/rotas/minhas-contribuicoes?pagina=${pagina}`);
  const { dados, paginacao } = await res.json();
  setContributions(dados);
  setTotalPages(paginacao.totalPaginas);
};
```

---

## 5. Sistema de Ganho de TM Coins

### Ganho Automático

Os TM Coins são creditados **automaticamente quando o admin aprova** a contribuição:

| Tipo | TM Coins |
|------|----------|
| Paragem aprovada | +25 |
| Linha aprovada | +100 |

**Fluxo:**
1. User cria paragem/linha → `status: 'pendente'`
2. Admin aprova → coins creditados automaticamente
3. Status muda para `'aprovada'`

> O frontend não precisa chamar nenhum endpoint especial. Basta criar a paragem/linha normalmente.

### Criar Paragem (já existente, agora com contribuição)

```http
POST /rotas/paragem
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "nome": "Paragem Nova",
  "latitude": -8.8147,
  "longitude": 13.2302
}
```

A contribuição é criada automaticamente com `status: 'pendente'`.

### Criar Linha (já existente, agora com contribuição)

```http
POST /rotas/linha
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "nome": "Linha Nova",
  "descricao": "De X para Y",
  "paragemIds": [1, 5, 12, 18]
}
```

---

## 6. Solicitar Pagamento (Levantamento)

### POST /auth/solicitar-pagamento

Converte TM Coins em pagamento real via operadora móvel.

```http
POST /auth/solicitar-pagamento
Authorization: Bearer <JWT>
Content-Type: application/json
```

**Body:**
```json
{
  "metodo": "unitel",
  "valorKz": 500,
  "telefone": "+244923456789"
}
```

**Valores aceites por operadora:**

| Operadora | Valores (Kz) |
|-----------|--------------|
| `africell` | 200, 500, 1000 |
| `unitel` | 300, 400, 500, 800, 1000 |
| `express` | 1000, 2000, 5000 |

**Conversão:** Para levantar 500 Kz, o user precisa de 5000 TM Coins (10 coins = 1 Kz).

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": {
    "_id": "65f9876543210fedcba98765",
    "userId": "507f1f77bcf86cd799439011",
    "metodo": "unitel",
    "valorKz": 500,
    "tmCoinsDebitados": 5000,
    "telefone": "+244923456789",
    "status": "pendente",
    "createdAt": "2026-02-15T22:00:00.000Z"
  },
  "mensagem": "Pedido de pagamento de 500 Kz criado. Será processado em breve."
}
```

**Erros comuns:**
```json
// 400 - Saldo insuficiente
{
  "statusCode": 400,
  "message": "Saldo insuficiente. Tens 2500 TM Coins mas precisas de 5000 para 500 Kz"
}

// 400 - Valor inválido
{
  "statusCode": 400,
  "message": "Valor inválido para unitel. Valores aceites: 300, 400, 500, 800, 1000 Kz"
}
```

**Uso no frontend:**
```typescript
const solicitarPagamento = async (metodo: string, valorKz: number, telefone: string) => {
  try {
    const res = await authFetch('/auth/solicitar-pagamento', {
      method: 'POST',
      body: JSON.stringify({ metodo, valorKz, telefone })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }
    
    const { dados, mensagem } = await res.json();
    showToast(mensagem, 'success');
    
    // Actualizar saldo (coins já foram debitados)
    await fetchSaldo();
    
    return dados;
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  }
};
```

---

## 7. Histórico de Pagamentos

### GET /auth/meus-pagamentos

Lista todos os pedidos de pagamento do utilizador.

```http
GET /auth/meus-pagamentos?pagina=1&porPagina=20
Authorization: Bearer <JWT>
```

**Resposta:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "_id": "65f9876543210fedcba98765",
      "userId": "507f1f77bcf86cd799439011",
      "metodo": "unitel",
      "valorKz": 500,
      "tmCoinsDebitados": 5000,
      "telefone": "+244923456789",
      "status": "processado",
      "createdAt": "2026-02-15T22:00:00.000Z",
      "processadoEm": "2026-02-16T10:30:00.000Z",
      "processadoPor": "507f1f77bcf86cd799439099"
    },
    {
      "_id": "65f9876543210fedcba98766",
      "metodo": "africell",
      "valorKz": 200,
      "tmCoinsDebitados": 2000,
      "telefone": "+244912345678",
      "status": "pendente",
      "createdAt": "2026-02-14T18:00:00.000Z"
    }
  ],
  "paginacao": {
    "pagina": 1,
    "porPagina": 20,
    "total": 2,
    "totalPaginas": 1
  }
}
```

**Status possíveis:**
- `pendente` — Aguardando processamento do admin
- `processado` — Pagamento enviado com sucesso
- `cancelado` — Pagamento cancelado (coins devolvidos)

---

## 8. Resumo de Endpoints

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `POST` | `/auth/seed-admin` | — | Criar primeiro admin |
| `GET` | `/auth/profile` | JWT | Perfil com tmCoins |
| `GET` | `/auth/meu-saldo` | JWT | Saldo de TM Coins |
| `POST` | `/auth/solicitar-pagamento` | JWT | Pedir levantamento |
| `GET` | `/auth/meus-pagamentos` | JWT | Histórico de pagamentos |
| `GET` | `/rotas/minhas-contribuicoes` | JWT | Histórico de contribuições |
| `POST` | `/rotas/paragem` | JWT | Criar paragem (gera contribuição) |
| `POST` | `/rotas/linha` | JWT | Criar linha (gera contribuição) |

---

## 9. Valores de Referência

```typescript
// Constantes úteis para o frontend
const TM_COINS = {
  POR_PARAGEM: 25,
  POR_LINHA: 100,
  POR_KZ: 10,  // 10 coins = 1 Kz
};

const VALORES_OPERADORA = {
  africell: [200, 500, 1000],
  unitel: [300, 400, 500, 800, 1000],
  express: [1000, 2000, 5000],
};

// Calcular coins necessários
const coinsNecessarios = (valorKz: number) => valorKz * TM_COINS.POR_KZ;

// Calcular valor em Kz
const valorEmKz = (coins: number) => Math.floor(coins / TM_COINS.POR_KZ);
```

---

## 10. Exemplo Completo — ProfilePage

```typescript
// hooks/useTmCoins.ts
export const useTmCoins = () => {
  const [saldo, setSaldo] = useState(0);
  const [contribuicoes, setContribuicoes] = useState<Contribuicao[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [saldoRes, contribRes, pagRes] = await Promise.all([
        authFetch('/auth/meu-saldo'),
        authFetch('/rotas/minhas-contribuicoes?porPagina=5'),
        authFetch('/auth/meus-pagamentos?porPagina=5'),
      ]);

      const saldoData = await saldoRes.json();
      const contribData = await contribRes.json();
      const pagData = await pagRes.json();

      setSaldo(saldoData.dados.tmCoins);
      setContribuicoes(contribData.dados);
      setPagamentos(pagData.dados);
    } finally {
      setLoading(false);
    }
  };

  const solicitarPagamento = async (metodo: string, valorKz: number, telefone: string) => {
    const res = await authFetch('/auth/solicitar-pagamento', {
      method: 'POST',
      body: JSON.stringify({ metodo, valorKz, telefone }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }

    // Refresh após pagamento
    await fetchAll();
    return res.json();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { saldo, contribuicoes, pagamentos, loading, solicitarPagamento, refresh: fetchAll };
};
```
