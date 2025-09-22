# Docs Consolidator

Uma aplicação moderna para consolidar documentação de repositórios GitHub e websites em um único arquivo markdown otimizado para IA.

## 🚀 Funcionalidades

- **Extração do GitHub**: Busca e processa todos os arquivos de um repositório
- **Scraping de Websites**: Utiliza Firecrawl API para extrair conteúdo de sites
- **Consolidação Inteligente**: Une todos os arquivos em um único markdown formatado
- **Interface Moderna**: UI responsiva com design system completo
- **Progress Tracking**: Acompanha o progresso da extração em tempo real

## 🛠 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router DOM
- **HTTP Client**: Fetch API nativo
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- API Key do Firecrawl (para funcionalidade de websites)

## 🔧 Configuração do Desenvolvimento

### 1. Clone o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd docs-consolidator
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as APIs (opcional)
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Adicione sua Firecrawl API key (opcional)
# A aplicação funciona sem ela, mas você precisará inserir a key na interface
```

### 4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

### 5. Acesse a aplicação
Abra [http://localhost:8080](http://localhost:8080) no seu navegador.

## 🔑 Configuração da API Firecrawl

1. Acesse [firecrawl.dev](https://firecrawl.dev) e crie uma conta
2. Obtenha sua API key gratuita (500 créditos/mês)
3. Na aplicação, clique na aba "Website" → "API Key"
4. Cole sua chave e clique em "Salvar"

## 🏗 Arquitetura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # shadcn/ui components
│   ├── DocumentationTabs.tsx
│   ├── FilesList.tsx
│   └── ...
├── services/           # Lógica de negócio
│   ├── providers/      # Provedores de dados
│   └── DocumentationService.ts
├── types/              # Definições TypeScript
├── hooks/              # Custom hooks
├── pages/              # Páginas da aplicação
└── lib/                # Utilitários
```

## 🤝 Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork: `git clone <sua-url>`
3. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

### Convenções de Commit
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação, ponto e vírgula, etc
- `refactor:` refatoração de código
- `test:` adição de testes

## 📚 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Linting com ESLint
```

## 🔧 Desenvolvimento com Lovable

Este projeto foi criado com [Lovable](https://lovable.dev) e suporta edição bidirecional:

- **No Lovable**: Mudanças são automaticamente sincronizadas com o GitHub
- **Localmente**: Commits são refletidos no Lovable automaticamente

### Acesso ao Lovable
**URL**: https://lovable.dev/projects/d302ef21-51cd-4960-8701-f117c0dfe096

## 🚢 Deploy

### Via Lovable (Recomendado)
1. Acesse o projeto no Lovable
2. Clique em "Share" → "Publish"
3. Seu site estará disponível imediatamente

### Deploy Manual
O projeto é uma SPA padrão e pode ser deployado em qualquer provedor:
- Vercel
- Netlify  
- GitHub Pages
- Cloudflare Pages

## 📖 Documentação Adicional

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guia detalhado de contribuição
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura técnica detalhada
- [Lovable Docs](https://docs.lovable.dev/) - Documentação oficial do Lovable

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para mais detalhes.

## 🆘 Suporte

- **Issues**: Use as GitHub Issues para reportar bugs ou sugerir features
- **Discussões**: Use GitHub Discussions para perguntas gerais
- **Lovable**: Acesse o projeto diretamente no Lovable para edições rápidas
