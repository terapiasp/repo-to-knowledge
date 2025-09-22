# Guia de Desenvolvimento

Este guia contém informações específicas para desenvolvedores trabalhando no projeto Docs Consolidator.

## 🚀 Setup Rápido

```bash
# Clone e setup
git clone <repo-url>
cd docs-consolidator
npm install
cp .env.example .env.local
npm run dev
```

## 🛠 Ferramentas de Desenvolvimento

### VS Code (Recomendado)

#### Extensões Essenciais
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",           // Tailwind IntelliSense
    "ms-vscode.vscode-typescript-next",    // TypeScript
    "esbenp.prettier-vscode",              // Prettier
    "dbaeumer.vscode-eslint",              // ESLint
    "ms-vscode.vscode-json",               // JSON IntelliSense
    "formulahendry.auto-rename-tag",       // Auto Rename Tag
    "christian-kohler.path-intellisense"   // Path IntelliSense
  ]
}
```

#### Configurações (.vscode/settings.json)
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Scripts NPM

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run dev:host         # Servidor acessível externamente

# Build e Deploy
npm run build            # Build de produção
npm run preview          # Preview do build local
npm run build:analyze    # Análise do bundle

# Qualidade de Código
npm run lint             # ESLint
npm run lint:fix         # ESLint com correções automáticas
npm run type-check       # Verificação de tipos TypeScript

# Utilitários
npm run clean            # Limpa arquivos de build
npm run deps:check       # Verifica dependências desatualizadas
```

## 🏗 Desenvolvimento de Features

### 1. Workflow de Feature

```bash
# 1. Atualizar main
git checkout main
git pull origin main

# 2. Criar branch para feature
git checkout -b feat/nome-da-feature

# 3. Desenvolver
# ... fazer alterações ...

# 4. Commit seguindo convenções
git add .
git commit -m "feat: adiciona nova funcionalidade X"

# 5. Push e PR
git push origin feat/nome-da-feature
# Abrir PR no GitHub
```

### 2. Estrutura de Componentes

```tsx
// src/components/NovoComponente.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NovoComponenteProps {
  className?: string;
  variant?: 'default' | 'alternate';
  children?: React.ReactNode;
}

const NovoComponente: React.FC<NovoComponenteProps> = ({ 
  className,
  variant = 'default',
  children 
}) => {
  return (
    <div className={cn(
      'base-classes',
      variant === 'alternate' && 'alternate-classes',
      className
    )}>
      {children}
    </div>
  );
};

export default NovoComponente;
```

### 3. Adicionando um Novo Provider

```typescript
// 1. Definir interface (se necessário)
// src/types/documentation.ts
export interface NovoProviderConfig {
  apiKey?: string;
  baseUrl?: string;
}

// 2. Implementar provider
// src/services/providers/NovoProvider.ts
import { DocumentationProvider } from '@/types/documentation';

export class NovoProvider implements DocumentationProvider {
  constructor(private config: NovoProviderConfig = {}) {}

  async getAllFiles(url: string, callbacks?: ProgressCallback): Promise<FileContent[]> {
    // Implementação
  }

  consolidateFiles(files: FileContent[]): string {
    // Implementação
  }

  downloadFile(content: string, filename: string): void {
    // Implementação
  }
}

// 3. Registrar no DocumentationService
// src/services/DocumentationService.ts
import { NovoProvider } from './providers/NovoProvider';

private static providers: Map<DocumentationSource, DocumentationProvider> = new Map([
  ['github', new GitHubProvider()],
  ['website', new WebsiteProvider()],
  ['novo', new NovoProvider()], // Adicionar aqui
]);
```

## 🎨 Styling e UI

### Design System

```css
/* src/index.css - Tokens customizados */
:root {
  /* Cores específicas do projeto */
  --docs-primary: 220 91% 56%;
  --docs-secondary: 220 14% 96%;
  
  /* Gradientes personalizados */
  --gradient-docs: linear-gradient(135deg, 
    hsl(var(--docs-primary)), 
    hsl(var(--docs-primary) / 0.8)
  );
}
```

### Componentes UI Customizados

```tsx
// Exemplo: Personalizando um componente shadcn
// src/components/ui/docs-card.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const docsCardVariants = cva(
  'border border-border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        highlighted: 'border-primary bg-primary/5',
        error: 'border-destructive bg-destructive/5'
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface DocsCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof docsCardVariants> {}

const DocsCard: React.FC<DocsCardProps> = ({ 
  className, 
  variant, 
  size, 
  ...props 
}) => {
  return (
    <Card 
      className={cn(docsCardVariants({ variant, size }), className)} 
      {...props} 
    />
  );
};
```

## 🔧 APIs e Integrações

### Estrutura de API Services

```typescript
// src/services/api/BaseApiService.ts
export abstract class BaseApiService {
  protected baseUrl: string;
  protected headers: Record<string, string>;

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// src/services/api/GitHubApiService.ts
export class GitHubApiService extends BaseApiService {
  constructor(token?: string) {
    super('https://api.github.com', {
      ...(token && { Authorization: `token ${token}` }),
      Accept: 'application/vnd.github.v3+json'
    });
  }

  async getRepository(owner: string, repo: string) {
    return this.request(`/repos/${owner}/${repo}`);
  }
}
```

### Tratamento de Erros

```typescript
// src/lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Uso nos services
try {
  const data = await apiService.getData();
} catch (error) {
  if (error instanceof ApiError) {
    // Tratamento específico para erros de API
  } else if (error instanceof ValidationError) {
    // Tratamento para erros de validação
  } else {
    // Erro genérico
  }
}
```

## 🧪 Testing (Setup Futuro)

### Estrutura de Testes

```typescript
// __tests__/services/DocumentationService.test.ts
import { DocumentationService } from '@/services/DocumentationService';
import { GitHubProvider } from '@/services/providers/GitHubProvider';

// Mock dos providers
jest.mock('@/services/providers/GitHubProvider');

describe('DocumentationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFiles', () => {
    it('should extract files from GitHub provider', async () => {
      // Setup
      const mockFiles = [
        { name: 'README.md', path: 'README.md', content: '# Test' }
      ];
      
      const mockProvider = new GitHubProvider() as jest.Mocked<GitHubProvider>;
      mockProvider.getAllFiles.mockResolvedValue(mockFiles);

      // Execute
      const result = await DocumentationService.getAllFiles('github', 'test/repo');

      // Assert
      expect(result).toEqual(mockFiles);
      expect(mockProvider.getAllFiles).toHaveBeenCalledWith('test/repo', undefined);
    });
  });
});
```

## 🚀 Deploy e Ambiente

### Build de Produção

```bash
# Build otimizado
npm run build

# Análise do bundle
npm run build:analyze

# Preview local do build
npm run preview
```

### Variáveis de Ambiente

```bash
# Desenvolvimento (.env.local)
VITE_FIRECRAWL_API_KEY=fc-dev-key
VITE_DEBUG_MODE=true

# Produção (.env.production)
VITE_FIRECRAWL_API_KEY=fc-prod-key
VITE_DEBUG_MODE=false
VITE_SENTRY_DSN=https://sentry-dsn
```

### Deploy via Lovable

1. **Push para GitHub**: Mudanças são sincronizadas automaticamente
2. **Deploy no Lovable**: Vá para Share → Publish
3. **Custom Domain**: Project → Settings → Domains

## 🐛 Debugging

### Console Logs

```typescript
// Desenvolvimento - logs detalhados
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// Produção - apenas erros críticos
if (error instanceof CriticalError) {
  console.error('Critical error:', error);
}
```

### Network Debugging

```typescript
// Interceptar requests para debugging
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch request:', args[0]);
  const response = await originalFetch(...args);
  console.log('Fetch response:', response.status);
  return response;
};
```

### React DevTools

- **Components**: Inspecionar hierarquia de componentes
- **Profiler**: Medir performance de renderização
- **State**: Monitorar mudanças de estado

## 📦 Dependências

### Atualizando Dependências

```bash
# Verificar atualizações disponíveis
npm outdated

# Atualizar dependências menores
npm update

# Atualizar dependências principais (cuidado!)
npm install react@latest react-dom@latest

# Verificar vulnerabilidades
npm audit
npm audit fix
```

### Adicionando Novas Dependências

```bash
# Dependência de produção
npm install nova-lib

# Dependência de desenvolvimento
npm install -D nova-dev-lib

# Tipos TypeScript
npm install -D @types/nova-lib
```

## 🔍 Performance

### Bundle Analysis

```bash
# Gerar relatório de bundle
npm run build:analyze

# Métricas importantes:
# - Bundle size < 500KB
# - Chunks apropriados
# - Tree-shaking efetivo
```

### Otimizações de Performance

```typescript
// Lazy loading de componentes
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Memoização de cálculos custosos
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Callbacks estáveis
const stableCallback = useCallback((id: string) => {
  handleAction(id);
}, [handleAction]);
```

## 📚 Recursos de Desenvolvimento

### Links Úteis

- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Vite Documentation](https://vitejs.dev/)

### Cheat Sheets

- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/cheatsheets)
- [Git Commands](https://education.github.com/git-cheat-sheet-education.pdf)

## 🆘 Troubleshooting

### Problemas Comuns

1. **Build falha**: Verificar tipos TypeScript
2. **CSS não carrega**: Verificar imports e paths
3. **API não funciona**: Verificar CORS e API keys
4. **Hot reload quebra**: Reiniciar dev server

### Logs Úteis

```bash
# Logs do Vite
npm run dev -- --debug

# Logs de build
npm run build -- --debug

# Limpeza completa
rm -rf node_modules dist .vite
npm install
```

---

**💡 Dica**: Mantenha este guia atualizado conforme o projeto evolui!