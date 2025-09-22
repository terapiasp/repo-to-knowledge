import { DocumentationProvider, FileContent, ProgressCallback } from '@/types/documentation';

interface FirecrawlCrawlResponse {
  success: boolean;
  jobId?: string;
  error?: string;
}

interface FirecrawlStatusResponse {
  success: boolean;
  status: 'scraping' | 'completed' | 'failed';
  data?: Array<{
    markdown: string;
    metadata: {
      title: string;
      sourceURL: string;
      statusCode: number;
    };
  }>;
  error?: string;
}

export class WebsiteProvider implements DocumentationProvider {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static FIRECRAWL_API_BASE = 'https://api.firecrawl.dev/v0';

  getApiKey(): string | null {
    return localStorage.getItem(WebsiteProvider.API_KEY_STORAGE_KEY);
  }

  setApiKey(apiKey: string): void {
    localStorage.setItem(WebsiteProvider.API_KEY_STORAGE_KEY, apiKey);
  }

  async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${WebsiteProvider.FIRECRAWL_API_BASE}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
          pageOptions: {
            onlyMainContent: true,
            includeHtml: false
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao testar API key:', error);
      return false;
    }
  }

  async getAllFiles(websiteUrl: string, callbacks?: ProgressCallback): Promise<FileContent[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key do Firecrawl não configurada. Configure a chave primeiro.');
    }

    try {
      callbacks?.onProgress(10);
      callbacks?.onCurrentFile('Iniciando crawl', websiteUrl);

      // Iniciar o crawl
      const crawlResponse = await fetch(`${WebsiteProvider.FIRECRAWL_API_BASE}/crawl`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: websiteUrl,
          crawlerOptions: {
            limit: 50,
          },
          pageOptions: {
            onlyMainContent: true,
            includeHtml: false,
            screenshot: false,
          }
        })
      });

      if (!crawlResponse.ok) {
        throw new Error(`Erro HTTP: ${crawlResponse.status}`);
      }

      const crawlData: FirecrawlCrawlResponse = await crawlResponse.json();
      
      if (!crawlData.jobId) {
        throw new Error(crawlData.error || 'Falha ao iniciar crawl do website');
      }

      // Aguardar o job completar
      let attempts = 0;
      const maxAttempts = 60; // 10 minutos máximo
      const jobId = crawlData.jobId;

      callbacks?.onProgress(20);

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Aguarda 10 segundos
        
        const statusResponse = await fetch(`${WebsiteProvider.FIRECRAWL_API_BASE}/crawl/status/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          }
        });

        if (statusResponse.ok) {
          const statusData: FirecrawlStatusResponse = await statusResponse.json();
          
          if (statusData.status === 'completed' && statusData.data) {
            callbacks?.onProgress(80);
            return this.processPages(statusData.data, callbacks);
          } else if (statusData.status === 'failed') {
            throw new Error(statusData.error || 'Crawl falhou');
          }
          
          // Atualizar progresso baseado no tempo decorrido
          const progress = Math.min(20 + (attempts / maxAttempts) * 60, 70);
          callbacks?.onProgress(progress);
          callbacks?.onCurrentFile(`Processando... (${attempts + 1}/${maxAttempts})`, websiteUrl);
        }
        
        attempts++;
      }

      throw new Error('Timeout: Crawl demorou mais que o esperado');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao processar o website');
    }
  }

  private async processPages(pages: any[], callbacks?: ProgressCallback): Promise<FileContent[]> {
    const fileContents: FileContent[] = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const progress = 80 + (i / pages.length) * 20;
      
      try {
        const urlPath = new URL(page.metadata?.sourceURL || '').pathname;
        const fileName = urlPath.split('/').filter(Boolean).pop() || 'index';
        const safeName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-') + '.md';
        
        callbacks?.onProgress(progress);
        callbacks?.onCurrentFile(safeName, page.metadata?.sourceURL || '');

        if (page.markdown && page.markdown.trim()) {
          fileContents.push({
            name: safeName,
            path: page.metadata?.sourceURL || '',
            content: `# ${page.metadata?.title || fileName}\n\n${page.markdown}`,
            size: page.markdown.length
          });

          callbacks?.onFileComplete(safeName, page.metadata?.sourceURL || '');
        } else {
          callbacks?.onFileError(safeName, page.metadata?.sourceURL || '', 'Conteúdo vazio');
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

  generateFileName(url: string): string {
    try {
      const urlObj = new URL(url);
      let siteName = urlObj.hostname.replace('www.', '');
      
      // Remove common TLDs and clean up
      siteName = siteName.split('.')[0];
      
      const today = new Date().toISOString().split('T')[0];
      return `${siteName}-docs-${today}.md`;
    } catch (error) {
      const today = new Date().toISOString().split('T')[0];
      return `website-docs-${today}.md`;
    }
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