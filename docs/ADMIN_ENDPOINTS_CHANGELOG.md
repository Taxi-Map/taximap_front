# Admin Endpoints — Changelog para Frontend

> Novos endpoints e alterações implementados no backend. Data: 16/02/2026

---

## Correcções Importantes (16/02/2026 - Actualização)

### Persistência de Paragens/Linhas Pendentes

- `GET /rotas/minhas-paragens` agora retorna **metadata completo** (incluindo `criadoPor`, `criadoEm`)
- `GET /rotas/minhas-linhas` agora retorna **metadata completo** 
- Os dados de paragens/linhas pendentes são **persistidos** em JSON e restaurados ao reiniciar o servidor

### Novos Aliases de Endpoints

Para compatibilidade com o frontend, foram adicionados aliases:

| Endpoint Original | Alias |
|-------------------|-------|
| `PUT /rotas/paragem?id=X` | `PUT /rotas/editar-paragem?id=X` |
| `DELETE /rotas/paragem?id=X` | `DELETE /rotas/apagar-paragem?id=X` |
| `PUT /rotas/linha?id=X` | `PUT /rotas/editar-linha?id=X` |
| `DELETE /rotas/linha?id=X` | `DELETE /rotas/apagar-linha?id=X` |

### Resposta de GET /rotas/minhas-paragens

```json
{
  "sucesso": true,
  "dados": [
    {
      "paragem": {
        "id": 61,
        "nome": "Paragem Teste",
        "latitude": -8.844644,
        "longitude": 13.236634,
        "status": "pendente",
        "criadoPor": "user-id",
        "criadoEm": "2026-02-16T09:47:35.928Z"
      },
      "metadata": {
        "status": "pendente",
        "criadoPor": "user-id",
        "criadoEm": "2026-02-16T09:47:35.928Z"
      }
    }
  ],
  "total": 1
}
```

### Regras de Edição/Eliminação

- **User comum**: pode editar/apagar apenas paragens/linhas **pendentes** que **ele próprio criou**
- **Staff**: pode editar/apagar qualquer paragem/linha
- **Admin**: pode editar/apagar qualquer paragem/linha

---

## Sistema de Roles (Actualizado)

O campo `role` agora aceita 3 valores:

| Role | Descrição |
|------|-----------|
| `user` | Papel padrão. Pode criar paragens/linhas (ficam pendentes) |
| `staff` | Pode aprovar/rejeitar paragens e linhas |
| `admin` | Acesso total: aprovações + gestão de pagamentos + gestão de utilizadores |

### Permissões por Role

| Funcionalidade | user | staff | admin |
|----------------|:----:|:-----:|:-----:|
| Criar paragens/linhas | ✅ | ✅ | ✅ |
| Aprovar/rejeitar paragens | ❌ | ✅ | ✅ |
| Aprovar/rejeitar linhas | ❌ | ✅ | ✅ |
| Gestão de pagamentos | ❌ | ❌ | ✅ |
| Gestão de utilizadores | ❌ | ❌ | ✅ |

---

## Endpoints de Aprovação (staff + admin)

Estes endpoints já existiam mas agora aceitam tanto `admin` como `staff`:

| Método | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/rotas/paragens-pendentes` | JWT + admin/staff |
| `POST` | `/rotas/aprovar-paragem?id=X` | JWT + admin/staff |
| `POST` | `/rotas/rejeitar-paragem?id=X` | JWT + admin/staff |
| `GET` | `/rotas/linhas-pendentes` | JWT + admin/staff |
| `POST` | `/rotas/aprovar-linha?id=X` | JWT + admin/staff |
| `POST` | `/rotas/rejeitar-linha?id=X` | JWT + admin/staff |

---

## Novos Endpoints de Admin

### 1. Gestão de Pagamentos

#### `GET /auth/pagamentos-pendentes`

Lista todos os pagamentos do sistema.

**Auth:** JWT + admin  
**Query params:**
- `pagina` (opcional, default: 1)
- `porPagina` (opcional, default: 20, max: 100)
- `status` (opcional: `pendente`, `processado`, `cancelado`)

**Response:**
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
      "createdAt": "2026-02-15T10:00:00Z"
    }
  ],
  "paginacao": {
    "pagina": 1,
    "porPagina": 20,
    "total": 5
  }
}
```

---

#### `POST /auth/processar-pagamento?id=X`

Marca um pagamento como processado.

**Auth:** JWT + admin  
**Query params:** `id` (ID do pagamento, obrigatório)

**Response:**
```json
{
  "sucesso": true,
  "mensagem": "Pagamento processado"
}
```

---

#### `POST /auth/cancelar-pagamento?id=X`

Cancela um pagamento pendente e devolve os TM Coins ao utilizador.

**Auth:** JWT + admin  
**Query params:** `id` (ID do pagamento, obrigatório)

**Response:**
```json
{
  "sucesso": true,
  "mensagem": "Pagamento cancelado, TM Coins devolvidos"
}
```

**Nota:** Só funciona para pagamentos com `status: 'pendente'`.

---

### 2. Gestão de Utilizadores

#### `GET /auth/utilizadores`

Lista todos os utilizadores com pesquisa opcional.

**Auth:** JWT + admin  
**Query params:**
- `pagina` (opcional, default: 1)
- `porPagina` (opcional, default: 50, max: 100)
- `search` (opcional: pesquisa por nome ou email)

**Response:**
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
      "createdAt": "2026-01-10T10:00:00Z"
    }
  ],
  "total": 150,
  "paginacao": {
    "pagina": 1,
    "porPagina": 50,
    "total": 150
  }
}
```

---

#### `POST /auth/alterar-role`

Altera o papel de um utilizador.

**Auth:** JWT + admin  
**Body:**
```json
{
  "userId": "65abc123...",
  "novoRole": "staff"
}
```

**Valores válidos para `novoRole`:** `user`, `staff`, `admin`

**Response:**
```json
{
  "sucesso": true,
  "mensagem": "Papel alterado para staff"
}
```

**Validações:**
- ❌ Admin não pode alterar o próprio papel (retorna 403)
- ❌ Role inválido retorna 400

---

## Resumo de Todos os Endpoints Admin

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/rotas/paragens-pendentes` | admin/staff | Listar paragens pendentes |
| `POST` | `/rotas/aprovar-paragem?id=X` | admin/staff | Aprovar paragem |
| `POST` | `/rotas/rejeitar-paragem?id=X` | admin/staff | Rejeitar paragem |
| `GET` | `/rotas/linhas-pendentes` | admin/staff | Listar linhas pendentes |
| `POST` | `/rotas/aprovar-linha?id=X` | admin/staff | Aprovar linha |
| `POST` | `/rotas/rejeitar-linha?id=X` | admin/staff | Rejeitar linha |
| `GET` | `/auth/pagamentos-pendentes` | admin | Listar pagamentos |
| `POST` | `/auth/processar-pagamento?id=X` | admin | Processar pagamento |
| `POST` | `/auth/cancelar-pagamento?id=X` | admin | Cancelar pagamento |
| `GET` | `/auth/utilizadores` | admin | Listar utilizadores |
| `POST` | `/auth/alterar-role` | admin | Alterar role |

---

## Códigos de Erro

| Código | Significado |
|--------|-------------|
| 400 | Parâmetros inválidos ou em falta |
| 401 | Token JWT inválido ou ausente |
| 403 | Sem permissão (role insuficiente) |
| 404 | Recurso não encontrado |

---

## Exemplo de Header de Autenticação

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
