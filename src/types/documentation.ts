export interface FileContent {
  name: string;
  path: string;
  content: string;
  size: number;
}

export interface ProgressCallback {
  onProgress: (progress: number) => void;
  onCurrentFile: (fileName: string, filePath: string) => void;
  onFileComplete: (fileName: string, filePath: string) => void;
  onFileError: (fileName: string, filePath: string, error: string) => void;
}

export interface DocumentationProvider {
  getAllFiles(source: string, callbacks?: ProgressCallback): Promise<FileContent[]>;
  consolidateFiles(files: FileContent[]): string;
  downloadFile(content: string, filename: string): void;
}

export type DocumentationSource = 'github' | 'website' | 'notion';

export interface DocumentationConfig {
  source: DocumentationSource;
  url: string;
  options?: {
    maxDepth?: number;
    excludePatterns?: string[];
    includePatterns?: string[];
  };
}