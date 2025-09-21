import { DocumentationProvider, FileContent, ProgressCallback } from '@/types/documentation';

export class WebsiteProvider implements DocumentationProvider {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';

  private getApiKey(): string | null {
    return localStorage.getItem(WebsiteProvider.API_KEY_STORAGE_KEY);
  }

  setApiKey(apiKey: string): void {
    localStorage.setItem(WebsiteProvider.API_KEY_STORAGE_KEY, apiKey);
  }

  async testApiKey(apiKey: string): Promise<boolean> {
    // Para simplicidade, apenas verifica se a chave não está vazia
    // Em uma implementação completa, faria uma chamada de teste para a API
    return apiKey.trim().length > 0;
  }

  async getAllFiles(websiteUrl: string, callbacks?: ProgressCallback): Promise<FileContent[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key do Firecrawl não configurada. Configure a chave primeiro.');
    }

    try {
      callbacks?.onProgress(10);
      callbacks?.onCurrentFile('Iniciando crawl', websiteUrl);

      // Fazer uma chamada direta para a API do Firecrawl usando fetch
      const response = await fetch('https://api.firecrawl.dev/v0/crawl', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: websiteUrl,
          crawlerOptions: {
            limit: 50,
            excludes: ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.pdf'],
          },
          pageOptions: {
            onlyMainContent: true,
            includeHtml: false,
            screenshot: false,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Falha ao fazer crawl do website');
      }

      // Aguardar o job completar
      let jobId = data.jobId;
      let crawlResult = null;
      let attempts = 0;
      const maxAttempts = 30; // 5 minutos máximo

      callbacks?.onProgress(30);

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Aguarda 10 segundos
        
        const statusResponse = await fetch(`https://api.firecrawl.dev/v0/crawl/status/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'completed') {
            crawlResult = statusData;
            break;
          } else if (statusData.status === 'failed') {
            throw new Error('Crawl falhou');
          }
          
          const progress = Math.min(30 + (attempts / maxAttempts) * 40, 70);
          callbacks?.onProgress(progress);
        }
        
        attempts++;
      }

      if (!crawlResult || !crawlResult.data) {
        throw new Error('Timeout ou falha no crawl');
      }

      callbacks?.onProgress(80);

      const fileContents: FileContent[] = [];
      const pages = crawlResult.data;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const progress = 80 + (i / pages.length) * 20;
        
        // Create a filename from the URL
        try {
          const urlPath = new URL(page.metadata?.sourceURL || websiteUrl).pathname;
          const fileName = urlPath.split('/').filter(Boolean).pop() || 'index';
          const safeName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-') + '.md';
          
          callbacks?.onProgress(progress);
          callbacks?.onCurrentFile(safeName, page.metadata?.sourceURL || websiteUrl);

          if (page.markdown && page.markdown.trim()) {
            fileContents.push({
              name: safeName,
              path: page.metadata?.sourceURL || websiteUrl,
              content: `# ${page.metadata?.title || fileName}\n\n${page.markdown}`,
              size: page.markdown.length
            });

            callbacks?.onFileComplete(safeName, page.metadata?.sourceURL || websiteUrl);
          } else {
            callbacks?.onFileError(safeName, page.metadata?.sourceURL || websiteUrl, 'Conteúdo vazio');
          }
        } catch (error) {
          console.warn('Erro ao processar página:', error);
        }
      }

      callbacks?.onProgress(100);

      if (fileContents.length === 0) {
        throw new Error('Nenhum conteúdo válido encontrado no website');
      }

      return fileContents.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao processar o website');
    }
  }

  consolidateFiles(files: FileContent[]): string {
    const header = `# Documentação Consolidada do Website\n\n`;
    const timestamp = `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    const summary = `Total de páginas: ${files.length}\n\n`;
    const separator = '---\n\n';

    let consolidated = header + timestamp + summary + separator;

    files.forEach((file, index) => {
      consolidated += `## ${index + 1}. ${file.name}\n\n`;
      consolidated += `**URL:** ${file.path}\n\n`;
      consolidated += file.content + '\n\n';
      consolidated += separator;
    });

    return consolidated;
  }

  downloadFile(content: string, filename: string): void {
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