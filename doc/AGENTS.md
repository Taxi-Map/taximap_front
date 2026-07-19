# Táxi Map Project - Rules for AI Agents

Este ficheiro (`doc/AGENTS.md`) define as regras arquiteturais, convenções de código e diretrizes de desenvolvimento para o projeto "Táxi Map". **Qualquer IA ou agente de desenvolvimento deve seguir estritamente estas regras.**

## 1. Stack Tecnológico
- **Frontend:** React 19, TypeScript, Vite
- **Estilos:** Tailwind CSS v4 complementando o Design System base (`index.css`)
- **Internacionalização:** `i18next` + `react-i18next` (ficheiros JSON em `src/locales/`)
- **Gestão de Estado/API:** `@tanstack/react-query` + `axios` (Cliente configurado em `src/lib/api-client.ts`)
- **CMS:** Keystatic (configurado em `keystatic.config.ts`)

## 2. Arquitetura de Pastas (Baseada em Features)
Este projeto adota uma arquitetura estruturada por domínios (features) para garantir escalabilidade.

- `src/components/ui/` - Componentes visuais "burros" e partilhados (ex: `Button`, `Input`).
  - Regra de Colocalização: `Button/Button.tsx`, `Button/types.ts`, `Button/Button.test.tsx` (quando aplicável).
- `src/features/` - Domínios de negócio (ex: `auth`, `taxi-requests`).
  - Dentro de uma feature:
    - `/api/` - Ficheiros de comunicação (chamadas ao `api-client.ts` e _hooks_ do React Query).
    - `/components/` - Componentes específicos da feature (Containers e Presentations isolados).
    - `/types/` - Tipos de domínio e schemas (ex: Zod).
- `src/lib/` - Integrações com bibliotecas externas (`api-client.ts`, `firebase.ts`, etc).
- `src/pages/` - Páginas (Rotas).
- `src/locales/` - Traduções.

## 3. Diretrizes de UI (Frontend UI Engineering)
- Componentes não devem exceder 200 linhas.
- Componentes UI Genéricos NUNCA devem ter pedidos (requests) diretamente ao servidor. O consumo de dados é responsabilidade dos componentes do tipo "Container" ou páginas, através de hooks do React Query.
- Evitar _prop drilling_ acentuado (> 3 níveis). Se necessário, reestruture o DOM ou use Zustand/Context API para estado global pontual.
- Use sempre as classes do Tailwind para espaçamentos (`p-4`, `gap-4`) - **não invente espaçamentos customizados** a não ser que previstos no Design System.

## 4. Consumo de APIs (Code Review & Quality)
- Evitar criar funções _fetch_ espalhadas pelos componentes.
- A configuração da API está centralizada no `api-client.ts` (`axios`).
- Toda a leitura/escrita de servidor em componentes React deve usar hooks como `useQuery` e `useMutation` (TanStack Query) para tratar automaticamente os estados `loading`, `error` e cache.
- Não deixe código "morto" (`// remover no futuro`). Remova-o.

## 5. Internacionalização (i18n)
- Todos os textos da interface devem ser traduzidos, sem _hardcode_ nos componentes. 
- Use o hook `const { t } = useTranslation();` para injetar o texto correto.

**Se for pedido para adicionar uma nova funcionalidade ao projeto, verifique sempre se cabe dentro de uma `feature` existente ou se exige criar uma nova.**
