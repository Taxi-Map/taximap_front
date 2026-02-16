# Admin Endpoints — Especificação Backend

> Endpoints de admin necessários para o painel de gestão. Todos requerem JWT + `role: 'admin'`.

---

## 1. Paragens Pendentes

### `GET /rotas/paragens-pendentes`

- **Auth:** JWT + Admin
- **Descrição:** Listar todas as paragens com `status: 'pendente'`
- **Response:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "paragem": { "id": 1, "nome": "...", "latitude": -8.83, "longitude": 13.23 },
      "metadata": {
        "status": "pendente",
        "criadoPor": "userId ou email",
        "criadoEm": "2024-02-15T10:00:00Z"
      }
    }
  ]
}
```

---

## 2. Linhas Pendentes

### `GET /rotas/linhas-pendentes`

- **Auth:** JWT + Admin
- **Descrição:** Listar todas as linhas com `status: 'pendente'`
- **Response:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "linha": { "id": 1, "nome": "...", "descricao": "..." },
      "percurso": [ { "id": 1, "nome": "...", "latitude": -8.83, "longitude": 13.23 } ],
      "metadata": {
        "status": "pendente",
        "criadoPor": "userId",
        "criadoEm": "2024-02-15T10:00:00Z"
      }
    }
  ]
}
```

---

## 3. Aprovar / Rejeitar

> Já documentados na API_ROTAS.md. Confirmar implementação:

| Método | Endpoint | Efeito |
|--------|----------|--------|
| `POST` | `/rotas/aprovar-paragem?id=X` | Muda status → `aprovada`, cria contribuição, credita TM Coins |
| `POST` | `/rotas/rejeitar-paragem?id=X` | Muda status → `rejeitada` |
| `POST` | `/rotas/aprovar-linha?id=X` | Muda status → `aprovada`, cria contribuição, credita TM Coins |
| `POST` | `/rotas/rejeitar-linha?id=X` | Muda status → `rejeitada` |

---

## 4. Gestão de Pagamentos (Admin)

### `GET /auth/pagamentos-pendentes`

- **Auth:** JWT + Admin
- **Descrição:** Listar **todas** as solicitações de pagamento (com filtro por status)
- **Query params:** `pagina`, `porPagina`, `status` (opcional: `pendente`, `processado`, `cancelado`)
- **Response:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "_id": "...",
      "userId": "...",
      "metodo": "unitel",
      "valorKz": 500,
      "tmCoinsDebitados": 5000,
      "telefone": "923456789",
      "status": "pendente",
      "createdAt": "2024-02-15T10:00:00Z"
    }
  ],
  "paginacao": { "pagina": 1, "porPagina": 20, "total": 5 }
}
```

### `POST /auth/processar-pagamento?id=X`

- **Auth:** JWT + Admin
- **Descrição:** Marcar pagamento como processado
- **Response:** `{ "sucesso": true, "mensagem": "Pagamento processado" }`

### `POST /auth/cancelar-pagamento?id=X`

- **Auth:** JWT + Admin
- **Descrição:** Cancelar pagamento e devolver TM Coins ao utilizador
- **Response:** `{ "sucesso": true, "mensagem": "Pagamento cancelado, TM Coins devolvidos" }`

---

## 5. Gestão de Utilizadores (Admin)

### `GET /auth/utilizadores`

- **Auth:** JWT + Admin
- **Descrição:** Listar todos os utilizadores com pesquisa opcional
- **Query params:** `pagina`, `porPagina`, `search` (pesquisa por nome ou email)
- **Response:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "_id": "...",
      "email": "user@example.com",
      "firstName": "João",
      "lastName": "Silva",
      "picture": "https://...",
      "role": "user",
      "tmCoins": 1500,
      "totalContribuicoes": 12,
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ],
  "total": 150,
  "paginacao": { "pagina": 1, "porPagina": 50, "total": 150 }
}
```

### `POST /auth/alterar-role`

- **Auth:** JWT + Admin
- **Descrição:** Alterar o papel de um utilizador (user → staff → admin)
- **Body:**
```json
{
  "userId": "...",
  "novoRole": "staff"
}
```
- **Validação:** Não permitir que o admin altere o próprio papel
- **Roles válidos:** `user`, `staff`, `admin`
- **Response:** `{ "sucesso": true, "mensagem": "Papel alterado para staff" }`

---

## 6. Sistema de Roles

| Role | Pode aprovar/rejeitar | Painel Admin | Gestão de Pagamentos | Gestão de Utilizadores |
|------|----------------------|--------------|---------------------|------------------------|
| `user` | ❌ | ❌ | ❌ | ❌ |
| `staff` | ✅ | ✅ (só Pendentes + Histórico) | ❌ | ❌ |
| `admin` | ✅ | ✅ (tudo) | ✅ | ✅ |

> O campo `role` do modelo User deve aceitar: `'user' | 'staff' | 'admin'`

---

## Resumo de Endpoints

| Método | Rota | Auth |
|--------|------|------|
| `GET` | `/rotas/paragens-pendentes` | JWT + Admin/Staff |
| `GET` | `/rotas/linhas-pendentes` | JWT + Admin/Staff |
| `POST` | `/rotas/aprovar-paragem?id=X` | JWT + Admin/Staff |
| `POST` | `/rotas/rejeitar-paragem?id=X` | JWT + Admin/Staff |
| `POST` | `/rotas/aprovar-linha?id=X` | JWT + Admin/Staff |
| `POST` | `/rotas/rejeitar-linha?id=X` | JWT + Admin/Staff |
| `GET` | `/auth/pagamentos-pendentes` | JWT + Admin |
| `POST` | `/auth/processar-pagamento?id=X` | JWT + Admin |
| `POST` | `/auth/cancelar-pagamento?id=X` | JWT + Admin |
| `GET` | `/auth/utilizadores` | JWT + Admin |
| `POST` | `/auth/alterar-role` | JWT + Admin |
