import { DocumentationProvider, DocumentationSource, FileContent, ProgressCallback } from '@/types/documentation';
import { GitHubProvider } from './providers/GitHubProvider';
import { WebsiteProvider } from './providers/WebsiteProvider';

export class DocumentationService {
  private static providers: Map<DocumentationSource, DocumentationProvider> = new Map([
    ['github', new GitHubProvider()],
    ['website', new WebsiteProvider()]
  ]);

  static getProvider(source: DocumentationSource): DocumentationProvider {
    const provider = this.providers.get(source);
    if (!provider) {
      throw new Error(`Provider não encontrado para fonte: ${source}`);
    }
    return provider;
  }

  static async getAllFiles(
    source: DocumentationSource,
    url: string,
    callbacks?: ProgressCallback
  ): Promise<FileContent[]> {
    const provider = this.getProvider(source);
    return provider.getAllFiles(url, callbacks);
  }

  static consolidateFiles(source: DocumentationSource, files: FileContent[]): string {
    const provider = this.getProvider(source);
    return provider.consolidateFiles(files);
  }

  static downloadFile(content: string, filename: string): void {
    // Use the first available provider for download (they all implement the same logic)
    const provider = this.providers.get('github')!;
    provider.downloadFile(content, filename);
  }

  static detectSource(url: string): DocumentationSource {
    if (url.includes('github.com')) {
      return 'github';
    }
    return 'website';
  }
}