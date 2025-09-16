interface GitHubFile {
  name: string;
  path: string;
  download_url: string;
  type: 'file' | 'dir';
  size: number;
}

interface FileContent {
  name: string;
  path: string;
  content: string;
  size: number;
}

export class GitHubService {
  private static extractRepoInfo(url: string): { owner: string; repo: string } | null {
    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return null;
      
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, '')
      };
    } catch {
      return null;
    }
  }

  private static async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) return response;
        if (response.status === 403) {
          throw new Error('Rate limit do GitHub atingido. Tente novamente em alguns minutos.');
        }
        if (i === retries - 1) throw new Error(`Erro HTTP: ${response.status}`);
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Falha após múltiplas tentativas');
  }

  static async getAllFiles(repoUrl: string): Promise<FileContent[]> {
    const repoInfo = this.extractRepoInfo(repoUrl);
    if (!repoInfo) {
      throw new Error('URL inválida. Use o formato: https://github.com/usuario/repositorio');
    }

    const { owner, repo } = repoInfo;
    
    try {
      // Get all files recursively using Git Trees API
      const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
      const response = await this.fetchWithRetry(treeUrl);
      const data = await response.json();

      if (!data.tree) {
        throw new Error('Não foi possível acessar a árvore do repositório');
      }

      // Filter for documentation files
      const docFiles = data.tree.filter((item: any) => 
        item.type === 'blob' && 
        /\.(md|txt|rst|mdx|adoc|markdown)$/i.test(item.path)
      );

      if (docFiles.length === 0) {
        throw new Error('Nenhum arquivo de documentação encontrado no repositório');
      }

      // Fetch content for each file
      const fileContents: FileContent[] = [];
      const rawBaseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/`;
      
      for (const file of docFiles) {
        try {
          const contentResponse = await this.fetchWithRetry(rawBaseUrl + file.path);
          const content = await contentResponse.text();
          
          const fileName = file.path.split('/').pop() || file.path;
          
          fileContents.push({
            name: fileName,
            path: file.path,
            content,
            size: file.size || content.length
          });
        } catch (error) {
          console.warn(`Erro ao baixar ${file.path}:`, error);
        }
      }

      return fileContents.sort((a, b) => a.path.localeCompare(b.path));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao acessar o repositório GitHub');
    }
  }

  static consolidateFiles(files: FileContent[]): string {
    const header = `# Documentação Consolidada\n\n`;
    const timestamp = `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    const summary = `Total de arquivos: ${files.length}\n\n`;
    const separator = '---\n\n';

    let consolidated = header + timestamp + summary + separator;

    files.forEach((file, index) => {
      consolidated += `## ${index + 1}. ${file.name}\n\n`;
      consolidated += `**Caminho:** ${file.path}\n\n`;
      consolidated += file.content + '\n\n';
      consolidated += separator;
    });

    return consolidated;
  }

  static downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}