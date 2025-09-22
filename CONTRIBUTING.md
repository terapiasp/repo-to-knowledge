# Guia de Contribuição

Obrigado por considerar contribuir para o Docs Consolidator! Este guia irá ajudá-lo a entender como contribuir de forma efetiva.

## 🎯 Tipos de Contribuição

Bem-vindas são contribuições de:
- 🐛 **Correções de bugs**
- ✨ **Novas funcionalidades**
- 📚 **Melhorias na documentação**
- 🎨 **Melhorias na UI/UX**
- ⚡ **Otimizações de performance**
- 🧹 **Refatorações de código**

## 🚀 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- npm 9+
- Git
- Editor de código (VS Code recomendado)

### Setup Inicial
```bash
# 1. Fork o repositório no GitHub
# 2. Clone seu fork
git clone https://github.com/SEU_USERNAME/docs-consolidator.git
cd docs-consolidator

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/docs-consolidator.git

# 4. Instale dependências
npm install

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

## 📝 Processo de Desenvolvimento

### 1. Antes de começar
- Verifique se já existe uma issue para o que você quer trabalhar
- Se não existir, crie uma issue descrevendo o problema/feature
- Comente na issue que você pretende trabalhar nela

### 2. Criando uma branch
```bash
# Sempre crie branches a partir da main atualizada
git checkout main
git pull upstream main

# Crie uma branch descritiva
git checkout -b tipo/descricao-breve

# Exemplos:
git checkout -b feat/api-integration
git checkout -b fix/loading-state
git checkout -b docs/setup-guide
```

### 3. Fazendo alterações

#### Estrutura do Projeto
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   └── ...             # Componentes específicos
├── services/           # Lógica de negócio e APIs
│   ├── providers/      # Implementações de provedores
│   └── ...
├── types/              # Definições TypeScript
├── hooks/              # Custom React hooks
├── pages/              # Componentes de página
├── lib/                # Utilitários e helpers
└── assets/             # Recursos estáticos
```

#### Convenções de Código

**TypeScript**
- Use TypeScript para todos os arquivos
- Defina interfaces/types explícitos
- Evite `any` - use `unknown` quando necessário

```typescript
// ✅ Bom
interface UserData {
  id: string;
  name: string;
  email: string;
}

// ❌ Evitar
const userData: any = {...}
```

**React**
- Use hooks funcionais
- Componentes exportados como default
- Props com interface definida

```tsx
// ✅ Bom
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, onClick, children }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
```

**Styling**
- Use Tailwind CSS
- Prefira classes semânticas do design system
- Evite estilos inline

```tsx
// ✅ Bom
<div className="bg-card text-foreground p-4 rounded-lg">

// ❌ Evitar
<div style={{backgroundColor: '#fff', padding: '16px'}}>
```

#### Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: adiciona integração com Firecrawl API"
git commit -m "fix: corrige bug no loading state"
git commit -m "docs: atualiza README com instruções de setup"
git commit -m "style: ajusta spacing no header"
git commit -m "refactor: extrai lógica de API para service"
```

**Tipos de commit:**
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: documentação
- `style`: formatação, espaçamento, etc
- `refactor`: refatoração sem mudança de funcionalidade
- `test`: adição/modificação de testes
- `chore`: tarefas de manutenção

### 4. Testando suas alterações
```bash
# Execute o projeto localmente
npm run dev

# Verifique se o build funciona
npm run build

# Execute linting
npm run lint
```

### 5. Submetendo o Pull Request

```bash
# 1. Certifique-se que sua branch está atualizada
git checkout main
git pull upstream main
git checkout sua-branch
git rebase main

# 2. Push para seu fork
git push origin sua-branch

# 3. Abra um Pull Request no GitHub
```

## 📋 Template de Pull Request

```markdown
## Descrição
Breve descrição das mudanças realizadas.

## Tipo de mudança
- [ ] Bug fix (correção que resolve um problema)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação

## Como testar
1. Passos para reproduzir/testar
2. Comportamento esperado
3. Screenshots (se aplicável)

## Checklist
- [ ] Meu código segue as convenções do projeto
- [ ] Fiz uma self-review do meu código
- [ ] Comentei partes complexas do código
- [ ] Minhas mudanças não geram novos warnings
- [ ] Testei localmente e tudo funciona
```

## 🏗 Arquitetura e Padrões

### Estrutura de Componentes
```tsx
// Estrutura padrão de um componente
import React from 'react';
import { ComponentProps } from './types';
import './Component.styles'; // se necessário

interface ComponentProps {
  // Props bem definidas
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Lógica do componente
  
  return (
    <div className="component-wrapper">
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### Services e Providers
- Services contêm lógica de negócio
- Providers implementam interfaces específicas
- Use injeção de dependência quando apropriado

### Estado e Hooks
- Use `useState` para estado local
- `useEffect` para side effects
- Custom hooks para lógica reutilizável
- Context API para estado global quando necessário

## 🐛 Reportando Bugs

### Template de Issue para Bug
```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Role até '....'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Versão: [e.g. 22]

**Informações Adicionais**
Qualquer contexto adicional sobre o problema.
```

## ✨ Sugerindo Features

### Template de Issue para Feature
```markdown
**A feature está relacionada a um problema?**
Descrição do problema. Ex: "Fico frustrado quando [...]"

**Descreva a solução que você gostaria**
Descrição clara da feature desejada.

**Descreva alternativas consideradas**
Outras soluções ou features que você considerou.

**Informações Adicionais**
Contexto adicional, screenshots, etc.
```

## 📚 Recursos Úteis

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Lovable Documentation](https://docs.lovable.dev/)

## 🤔 Dúvidas?

- Abra uma **Discussion** no GitHub para perguntas gerais
- Crie uma **Issue** para bugs ou features específicas
- Entre em contato com os mantenedores

## 🙏 Reconhecimento

Todas as contribuições são valorizadas e reconhecidas. Contributors serão adicionados ao projeto automaticamente.

Obrigado por contribuir! 🎉