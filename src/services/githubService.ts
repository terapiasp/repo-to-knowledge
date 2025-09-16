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

  static async getFiles(repoUrl: string, folderPath: string): Promise<FileContent[]> {
    const repoInfo = this.extractRepoInfo(repoUrl);
    if (!repoInfo) {
      throw new Error('URL inválida. Use o formato: https://github.com/usuario/repositorio');
    }

    const { owner, repo } = repoInfo;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

    try {
      const response = await this.fetchWithRetry(apiUrl);
      const files: GitHubFile[] = await response.json();

      if (!Array.isArray(files)) {
        throw new Error('Pasta não encontrada ou não é um diretório');
      }

      // Filter for documentation files
      const docFiles = files.filter(file => 
        file.type === 'file' && 
        /\.(md|txt|rst|mdx|adoc)$/i.test(file.name)
      );

      if (docFiles.length === 0) {
        throw new Error('Nenhum arquivo de documentação encontrado na pasta especificada');
      }

      // Fetch content for each file
      const fileContents: FileContent[] = [];
      
      for (const file of docFiles) {
        try {
          const contentResponse = await this.fetchWithRetry(file.download_url);
          const content = await contentResponse.text();
          
          fileContents.push({
            name: file.name,
            path: file.path,
            content,
            size: file.size
          });
        } catch (error) {
          console.warn(`Erro ao baixar ${file.name}:`, error);
        }
      }

      return fileContents.sort((a, b) => a.name.localeCompare(b.name));
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