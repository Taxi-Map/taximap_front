# Especificações de Imagens para a Sessão Hero (Contentful)

Este documento estabelece as diretrizes de dimensão, proporção e formato das imagens a serem cadastradas no Contentful para a sessão **Hero** do projeto TaxiMap.

---

## 1. Especificações Técnicas das Imagens

| Parâmetro | Valor Recomendado |
| :--- | :--- |
| **Dimensão Ideal (Desktop)** | **`1920px × 1080px`** (Full HD) ou **`1920px × 900px`** |
| **Dimensão Mínima** | `1440px × 800px` |
| **Proporção (Aspect Ratio)** | **16:9** ou **16:10** (Preenchimento Total de Tela) |
| **Área de Segurança (Safe Zone)** | `1200px × 600px` (centralizado) |
| **Formatos Suportados** | WebP (recomendado), JPG, PNG |
| **Tamanho Máximo do Ficheiro** | < 600 KB (para rápida otimização e carregamento) |

---

## 2. Comportamento de Tela Cheia (Full Screen Viewport)

A sessão Hero foi configurada para ocupar **100% da altura visível da tela** (`calc(100dvh - header)`):

- **Experiência Visual**: Ao carregar o site, o utilizador vê apenas o cabeçalho e o banner Hero cobrindo totalmente a janela de visualização.
- **Conteúdo Abaixo**: Qualquer conteúdo subsequente (como o Footer ou novas sessões) fica posicionado "abaixo da dobra" (*below the fold*) e só se torna visível quando o utilizador faz scroll.

---

## 3. Área de Segurança (Safe Zone)

- **O que é a Safe Zone?** É a área central da imagem (`1200px × 600px`) onde todo o conteúdo visual importante (pessoas, veículos, logótipos ou elementos principais) deve estar concentrado.
- Devido ao comportamento responsivo de tela cheia, as extremidades da imagem adaptam-se para preencher qualquer monitor, laptop ou telemóvel.

---

## 4. Recomendações para os Gestores de Conteúdo (CMS)

1. **Criação do Artefacto**: Ao criar banners no Figma, Photoshop ou Canva, exporte imagens na proporção panorâmica de alta resolução **1920px × 1080px** (16:9).
2. **Exportação Otimizada**: Exporte a imagem em formato **WebP** ou **JPG otimizado** para manter alta qualidade visual sem comprometer a velocidade da página.
3. **Contraste de Texto**: O Hero aplica uma camada sutil de sobreposição linear escura (`linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1))`). Garanta que a imagem tenha um bom contraste com os elementos sobrepostos.
