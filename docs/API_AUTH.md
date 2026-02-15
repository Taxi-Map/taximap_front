# API de Autenticação - Documentação para Frontend

## Visão Geral

A API suporta três formas de autenticação:
- **Cadastro/Login local** — email e password
- **OAuth2 com Google** — login social
- **OAuth2 com Facebook** — login social

Os dados são persistidos em **MongoDB**. Após autenticação, é retornado um **token JWT** (validade: 7 dias).

**Base URL:** `http://localhost:3000`

---

## Vinculação de Contas

O sistema unifica contas pelo **email**. Um único utilizador pode ter múltiplos métodos de login:

| Cenário | Comportamento |
|---------|---------------|
| Utilizador sem conta entra com Google | Conta criada automaticamente com `providers: ['google']` |
| Mesmo email faz cadastro local depois | Método local vinculado: `providers: ['google', 'local']` |
| Mesmo email entra com Facebook depois | Facebook vinculado: `providers: ['google', 'local', 'facebook']` |
| Utilizador local entra com Google (mesmo email) | Google vinculado à conta existente |

**Regra: 1 email = 1 conta. Métodos de login são vinculados, nunca duplicados.**

---

## Tabela de Endpoints

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `POST` | `/auth/register` | Não | Criar conta com email/password |
| `POST` | `/auth/login` | Não | Login com email/password |
| `GET` | `/auth/google` | Não | Iniciar login com Google (redirect) |
| `GET` | `/auth/google/redirect` | Não | Callback do Google |
| `GET` | `/auth/facebook` | Não | Iniciar login com Facebook (redirect) |
| `GET` | `/auth/facebook/redirect` | Não | Callback do Facebook |
| `GET` | `/auth/profile` | JWT | Obter perfil do utilizador |
| `PUT` | `/auth/profile` | JWT | Actualizar perfil |
| `GET` | `/auth/cloudinary-signature` | JWT | Obter assinatura para upload de foto |
| `GET` | `/auth/verify` | JWT | Verificar validade do token |
| `GET` | `/auth/logout` | Não | Logout (redirect) |
| `GET` | `/auth/users` | Não | Listar utilizadores (dev only) |
| `POST` | `/auth/seed-admin` | Não* | Criar primeiro admin (requer `ADMIN_SEED_SECRET`) |
| `POST` | `/auth/promover-admin` | JWT + Admin | Promover utilizador a admin |
| `POST` | `/auth/remover-admin` | JWT + Admin | Remover papel de admin de um utilizador |

---

## Schema do Utilizador (MongoDB)

```typescript
{
  _id: string,              // ID do MongoDB
  firstName: string,        // Nome
  lastName: string,         // Apelido
  email: string,            // Email (único)
  picture: string,          // URL da foto (Cloudinary)
  verified: boolean,        // Email verificado
  phoneNumber: string,      // Telefone (ex: +244923456789)
  providers: string[],      // ['google', 'facebook', 'local']
  role: string,             // 'user' | 'admin' (default: 'user')
  googleId: string,         // ID do Google
  facebookId: string,       // ID do Facebook
  createdAt: Date,          // Data de criação
  updatedAt: Date,          // Última actualização
}
```

**Nota:** O campo `password` nunca é retornado nas respostas.

---

## Endpoints em Detalhe

### 1. POST /auth/register

Cria conta com email e password. Se já existir conta OAuth com o mesmo email, vincula o método local.

**Body:**
```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "password": "MinhaPass1!"
}
```

**Validação da Password:**
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial (`@$!%*?&#^()_-+=`)

**Resposta (201):**
```json
{
  "sucesso": true,
  "mensagem": "Conta criada com sucesso",
  "dados": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "email": "joao@email.com",
      "firstName": "João",
      "lastName": "Silva",
      "provider": "local"
    }
  }
}
```

**Erros:**

Email já tem conta local (409):
```json
{ "statusCode": 409, "message": "Já existe uma conta com este email" }
```

Validação falhou (400):
```json
{
  "statusCode": 400,
  "message": [
    "A password deve conter pelo menos: 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial"
  ],
  "error": "Bad Request"
}
```

---

### 2. POST /auth/login

Login com email e password.

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "MinhaPass1!"
}
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Login efectuado com sucesso",
  "dados": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "email": "joao@email.com",
      "firstName": "João",
      "lastName": "Silva",
      "picture": "https://res.cloudinary.com/...",
      "provider": "local"
    }
  }
}
```

**Erro (401):**
```json
{ "statusCode": 401, "message": "Email ou password incorrectos" }
```

---

### 3. GET /auth/google

Redireciona para a página de login do Google.

```typescript
window.location.href = 'http://localhost:3000/auth/google';
```

Após login, redireciona para:
```
http://localhost:5173/auth/callback?token=<JWT>&provider=google
```

---

### 4. GET /auth/facebook

Redireciona para a página de login do Facebook.

```typescript
window.location.href = 'http://localhost:3000/auth/facebook';
```

Após login, redireciona para:
```
http://localhost:5173/auth/callback?token=<JWT>&provider=facebook
```

---

### 5. GET /auth/profile

Obtém o perfil do utilizador autenticado.

**Header:** `Authorization: Bearer <JWT>`

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "picture": "https://res.cloudinary.com/dxz84pkza/image/upload/...",
    "verified": true,
    "phoneNumber": "+244923456789",
    "providers": ["google", "local"],
    "googleId": "123456789",
    "createdAt": "2026-02-07T12:00:00.000Z",
    "updatedAt": "2026-02-07T13:00:00.000Z"
  }
}
```

**Erro (401):**
```json
{ "statusCode": 401, "message": "Token de autenticação inválido ou expirado" }
```

---

### 6. PUT /auth/profile

Actualiza os dados do perfil. **Apenas o próprio utilizador pode actualizar os seus dados** (verificado pelo JWT).

**Header:** `Authorization: Bearer <JWT>`

**Body (todos os campos são opcionais):**
```json
{
  "firstName": "João",
  "lastName": "Santos",
  "phoneNumber": "+244923456789",
  "picture": "https://res.cloudinary.com/dxz84pkza/image/upload/v123/taxi_map/avatars/abc.jpg"
}
```

**Validações:**
- `phoneNumber`: formato `+244923456789` (9 a 15 dígitos, com ou sem `+`)
- `picture`: deve ser uma URL válida

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Perfil actualizado com sucesso",
  "dados": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "firstName": "João",
    "lastName": "Santos",
    "email": "joao@email.com",
    "picture": "https://res.cloudinary.com/...",
    "verified": true,
    "phoneNumber": "+244923456789",
    "providers": ["google", "local"],
    "createdAt": "2026-02-07T12:00:00.000Z",
    "updatedAt": "2026-02-07T14:00:00.000Z"
  }
}
```

---

### 7. GET /auth/cloudinary-signature

Gera assinatura para upload directo no Cloudinary a partir do browser. **A API key fica protegida no backend.**

**Header:** `Authorization: Bearer <JWT>`

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": {
    "timestamp": 1707307200,
    "signature": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
    "cloudName": "dxz84pkza",
    "apiKey": "582754943988428",
    "folder": "taxi_map/avatars"
  }
}
```

---

### 8. GET /auth/verify

Verifica se o token JWT é válido.

**Header:** `Authorization: Bearer <JWT>`

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": {
    "valid": true,
    "userId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "email": "joao@email.com",
    "providers": ["google", "local"]
  }
}
```

---

### 9. GET /auth/logout

Redireciona para `http://localhost:5173/login?logout=true`. O token deve ser removido no frontend.

---

### 10. GET /auth/users (Dev Only)

Lista todos os utilizadores registados.

**Resposta:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "firstName": "João",
      "lastName": "Silva",
      "email": "joao@email.com",
      "providers": ["google", "local"],
      "verified": true
    }
  ],
  "total": 1
}
```

---

## Implementação no Frontend

### Tipos TypeScript

```typescript
// src/types/auth.ts

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  verified: boolean;
  phoneNumber?: string;
  providers: ('google' | 'facebook' | 'local')[];
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  sucesso: boolean;
  mensagem: string;
  dados: {
    accessToken: string;
    user: User;
  };
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  picture?: string;
}

export interface CloudinarySignature {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  folder: string;
}
```

---

### Serviço de Autenticação

```typescript
// src/services/authService.ts
import type { AuthResponse, RegisterData, LoginData, UpdateProfileData, User } from '../types/auth';

const API_URL = 'http://localhost:3000';

export const authService = {
  // ===== TOKEN =====
  getToken: (): string | null => localStorage.getItem('auth_token'),
  setToken: (token: string) => localStorage.setItem('auth_token', token),
  isAuthenticated: (): boolean => !!localStorage.getItem('auth_token'),

  authHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
    };
  },

  // ===== CADASTRO =====
  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    this.setToken(result.dados.accessToken);
    return result;
  },

  // ===== LOGIN LOCAL =====
  async login(data: LoginData): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    this.setToken(result.dados.accessToken);
    return result;
  },

  // ===== LOGIN SOCIAL =====
  loginWithGoogle: () => { window.location.href = `${API_URL}/auth/google`; },
  loginWithFacebook: () => { window.location.href = `${API_URL}/auth/facebook`; },

  // ===== PERFIL =====
  async getProfile(): Promise<User | null> {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: this.authHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.dados;
  },

  // ===== ACTUALIZAR PERFIL =====
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.authHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result.dados;
  },

  // ===== VERIFICAR TOKEN =====
  async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        headers: this.authHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ===== LOGOUT =====
  logout() {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  },
};
```

---

### Serviço de Upload Cloudinary

O upload da imagem é feito **directamente do browser para o Cloudinary**, sem passar pelo backend. Apenas a assinatura vem do backend (para proteger a API key).

```
Browser                    Backend                 Cloudinary
  │                          │                         │
  │ 1. GET /auth/            │                         │
  │    cloudinary-signature  │                         │
  │ ────────────────────────►│                         │
  │                          │                         │
  │ 2. { signature,          │                         │
  │    apiKey, timestamp }   │                         │
  │ ◄────────────────────────│                         │
  │                          │                         │
  │ 3. POST upload (com assinatura)                    │
  │ ──────────────────────────────────────────────────►│
  │                          │                         │
  │ 4. { secure_url }        │                         │
  │ ◄──────────────────────────────────────────────────│
  │                          │                         │
  │ 5. PUT /auth/profile     │                         │
  │    { picture: url }      │                         │
  │ ────────────────────────►│  (guarda URL na BD)     │
```

```typescript
// src/services/cloudinaryService.ts
import type { CloudinarySignature } from '../types/auth';

const API_URL = 'http://localhost:3000';

export const cloudinaryService = {
  /**
   * Buscar assinatura do backend
   */
  async getSignature(token: string): Promise<CloudinarySignature> {
    const res = await fetch(`${API_URL}/auth/cloudinary-signature`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data.dados;
  },

  /**
   * Upload directo do browser para o Cloudinary
   * Retorna a URL da imagem
   */
  async uploadImage(file: File): Promise<string> {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Não autenticado');

    // 1. Buscar assinatura
    const { timestamp, signature, cloudName, apiKey, folder } =
      await this.getSignature(token);

    // 2. Montar FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    // 3. Upload directo para Cloudinary
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData },
    );
    const result = await res.json();
    if (!res.ok) throw result;

    return result.secure_url;
  },
};
```

---

### Página de Callback OAuth

```typescript
// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_provider', provider || '');
      navigate('/');
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate]);

  return <div>A autenticar...</div>;
};
```

---

### Página de Login

```typescript
// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </form>

      <hr />
      <button onClick={() => authService.loginWithGoogle()}>Login com Google</button>
      <button onClick={() => authService.loginWithFacebook()}>Login com Facebook</button>

      <p>Não tem conta? <a href="/register">Criar conta</a></p>
    </div>
  );
};
```

---

### Página de Cadastro

```typescript
// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(form);
      navigate('/');
    } catch (err: any) {
      const msg = Array.isArray(err.message)
        ? err.message.join(', ')
        : err.message || 'Erro ao criar conta';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Criar Conta</h1>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleRegister}>
        <input name="firstName" placeholder="Primeiro Nome"
          value={form.firstName} onChange={handleChange} required />
        <input name="lastName" placeholder="Último Nome"
          value={form.lastName} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email"
          value={form.email} onChange={handleChange} required />
        <input name="password" type="password" minLength={8}
          placeholder="Password (mín. 8, maiúscula, minúscula, número, especial)"
          value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>
          {loading ? 'A criar...' : 'Criar Conta'}
        </button>
      </form>

      <p>Já tem conta? <a href="/login">Entrar</a></p>
    </div>
  );
};
```

---

### Página de Perfil (com upload de foto)

```typescript
// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { cloudinaryService } from '../services/cloudinaryService';
import type { User } from '../types/auth';

export const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const profile = await authService.getProfile();
    if (profile) {
      setUser(profile);
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
  };

  // Upload de foto
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await cloudinaryService.uploadImage(file);
      const updated = await authService.updateProfile({ picture: imageUrl });
      setUser(updated);
      setMessage('Foto actualizada!');
    } catch {
      setMessage('Erro ao carregar foto');
    } finally {
      setUploading(false);
    }
  };

  // Actualizar dados
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile(form);
      setUser(updated);
      setMessage('Perfil actualizado com sucesso!');
    } catch (err: any) {
      setMessage(err.message || 'Erro ao actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div>A carregar...</div>;

  return (
    <div>
      <h1>Meu Perfil</h1>
      {message && <p>{message}</p>}

      {/* Foto */}
      <div>
        <img src={user.picture || '/default-avatar.png'} alt="Foto"
          width={100} height={100} style={{ borderRadius: '50%' }} />
        <input type="file" accept="image/*"
          onChange={handlePhotoChange} disabled={uploading} />
        {uploading && <span>A carregar foto...</span>}
      </div>

      {/* Dados */}
      <form onSubmit={handleSave}>
        <div>
          <label>Primeiro Nome</label>
          <input value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div>
          <label>Último Nome</label>
          <input value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
        <div>
          <label>Telefone</label>
          <input value={form.phoneNumber} placeholder="+244923456789"
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
        </div>

        <p>Email: {user.email} (não editável)</p>
        <p>Métodos de login: {user.providers?.join(', ')}</p>

        <button type="submit" disabled={saving}>
          {saving ? 'A guardar...' : 'Guardar Alterações'}
        </button>
      </form>
    </div>
  );
};
```

---

### Hook de Autenticação

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const profile = await authService.getProfile();
        setUser(profile);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout: authService.logout,
  };
};
```

---

## Endpoints de Administração

### 11. POST /auth/seed-admin

Cria o **primeiro administrador** do sistema. Só funciona se não existir nenhum admin. Requer um segredo definido na variável de ambiente `ADMIN_SEED_SECRET`.

**Body:**
```json
{
  "email": "admin@exemplo.com",
  "password": "SenhaSegura1!",
  "firstName": "Admin",
  "lastName": "Principal",
  "seedSecret": "o_segredo_definido_no_env"
}
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Administrador criado com sucesso",
  "dados": {
    "id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "email": "admin@exemplo.com",
    "role": "admin"
  }
}
```

**Erros:**

Segredo inválido (403):
```json
{ "statusCode": 403, "message": "Segredo de seed inválido" }
```

Já existe admin (400):
```json
{ "statusCode": 400, "message": "Já existe pelo menos um administrador no sistema" }
```

---

### 12. POST /auth/promover-admin?email=xxx

Promove um utilizador existente a administrador. **Apenas admins** podem usar este endpoint.

**Header:** `Authorization: Bearer <JWT>` (token de admin)

**Parâmetros Query:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|------------------|
| `email` | string | ✅ | Email do utilizador a promover |

**Exemplo:**
```
POST /auth/promover-admin?email=joao@email.com
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Utilizador joao@email.com promovido a administrador"
}
```

**Erros:**

Não é admin (403):
```json
{ "statusCode": 403, "message": "Forbidden resource" }
```

Utilizador não encontrado (400):
```json
{ "statusCode": 400, "message": "Utilizador não encontrado" }
```

---

### 13. POST /auth/remover-admin?email=xxx

Remove o papel de admin de um utilizador. **Apenas admins** podem usar este endpoint. Não é possível remover o próprio papel de admin.

**Header:** `Authorization: Bearer <JWT>` (token de admin)

**Parâmetros Query:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|------------------|
| `email` | string | ✅ | Email do admin a remover |

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Papel de administrador removido de joao@email.com"
}
```

**Erros:**

Tentar remover a si próprio (403):
```json
{ "statusCode": 403, "message": "Não podes remover o teu próprio papel de admin" }
```

---

## Sistema de Papéis (Roles)

| Papel | Descrição |
|-------|:---------|
| `user` | Papel padrão. Pode criar linhas (ficam pendentes), editar/eliminar as suas linhas pendentes |
| `admin` | Pode aprovar/rejeitar linhas, gerir paragens, promover/remover admins |

### JWT Payload

O token JWT agora inclui o campo `role`:
```typescript
interface JwtPayload {
  sub: string;       // userId
  email: string;
  providers: string[];
  role: string;      // 'user' | 'admin'
}
```

### Como criar o primeiro admin

1. Definir `ADMIN_SEED_SECRET` no ficheiro `.env`
2. Chamar `POST /auth/seed-admin` com o segredo
3. Usar o token do admin para promover outros utilizadores

---

### Rotas React Router

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthCallback } from './pages/AuthCallback';
import { ProfilePage } from './pages/ProfilePage';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>A carregar...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>{/* Página principal */}</ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```
