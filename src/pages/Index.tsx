import { useState } from "react";
import { DocumentationTabs } from "@/components/DocumentationTabs";
import { FilesList } from "@/components/FilesList";
import { ProgressViewer } from "@/components/ProgressViewer";
import { DocumentationService } from "@/services/DocumentationService";
import { useToast } from "@/hooks/use-toast";
import { Book, Github } from "lucide-react";
import { DocumentationSource } from "@/types/documentation";

interface FileItem {
  name: string;
  path: string;
  content?: string;
  size?: number;
}

interface ProgressItem {
  fileName: string;
  filePath: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

const Index = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [consolidating, setConsolidating] = useState(false);
  const [consolidated, setConsolidated] = useState(false);
  const [consolidatedContent, setConsolidatedContent] = useState("");
  const [currentSource, setCurrentSource] = useState<DocumentationSource>("github");
  
  // Progress states
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [progressFiles, setProgressFiles] = useState<ProgressItem[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  
  const { toast } = useToast();

  const handleSubmit = async (source: DocumentationSource, url: string) => {
    setCurrentSource(source);
    setLoading(true);
    setFiles([]);
    setConsolidated(false);
    setConsolidatedContent("");
    setProgress(0);
    setCurrentFile("");
    setProgressFiles([]);
    setTotalFiles(0);

    try {
      const fetchedFiles = await DocumentationService.getAllFiles(source, url, {
        onProgress: (progressValue) => {
          setProgress(progressValue);
        },
        onCurrentFile: (fileName, filePath) => {
          setCurrentFile(filePath);
          setProgressFiles(prev => {
            const newFiles = [...prev];
            const existingIndex = newFiles.findIndex(f => f.filePath === filePath);
            
            if (existingIndex >= 0) {
              newFiles[existingIndex].status = 'processing';
            } else {
              newFiles.push({
                fileName,
                filePath,
                status: 'processing'
              });
            }
            
            setTotalFiles(newFiles.length);
            return newFiles;
          });
        },
        onFileComplete: (fileName, filePath) => {
          setProgressFiles(prev => 
            prev.map(f => 
              f.filePath === filePath 
                ? { ...f, status: 'completed' as const }
                : f
            )
          );
        },
        onFileError: (fileName, filePath, error) => {
          setProgressFiles(prev => 
            prev.map(f => 
              f.filePath === filePath 
                ? { ...f, status: 'error' as const }
                : f
            )
          );
        }
      });
      
      setFiles(fetchedFiles);
      setCurrentFile("");
      
      toast({
        title: "Sucesso!",
        description: `${fetchedFiles.length} arquivos encontrados`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConsolidate = async () => {
    setConsolidating(true);
    
    try {
      // Filter files that have content
      const validFiles = files.filter(file => file.content) as Required<FileItem>[];
      
      if (validFiles.length === 0) {
        throw new Error("Nenhum arquivo válido para consolidar");
      }
      
      const content = DocumentationService.consolidateFiles(currentSource, validFiles);
      setConsolidatedContent(content);
      setConsolidated(true);
      
      toast({
        title: "Consolidação completa!",
        description: "Arquivo pronto para download",
      });
    } catch (error) {
      toast({
        title: "Erro na consolidação",
        description: error instanceof Error ? error.message : "Erro ao processar os arquivos",
        variant: "destructive",
      });
    } finally {
      setConsolidating(false);
    }
  };

  const handleDownload = () => {
    if (consolidatedContent) {
      const filename = `documentacao-consolidada-${new Date().toISOString().split('T')[0]}.md`;
      DocumentationService.downloadFile(consolidatedContent, filename);
      
      toast({
        title: "Download iniciado!",
        description: "Arquivo salvo com sucesso",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                repo to knowledge
              </h1>
              <p className="text-muted-foreground">
                Consolide documentação de GitHub e websites em arquivo único para IA
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <DocumentationTabs onSubmit={handleSubmit} loading={loading} />
        
        {loading && (
          <ProgressViewer 
            progress={progress}
            currentFile={currentFile}
            files={progressFiles}
            totalFiles={totalFiles}
          />
        )}
        
        <FilesList
          files={files}
          onConsolidate={handleConsolidate}
          consolidating={consolidating}
          onDownload={handleDownload}
          consolidated={consolidated}
        />

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t border-border/50">
          <div className="flex items-center justify-center gap-2">
            <Github className="w-4 h-4" />
            Ferramenta para consolidação de documentação GitHub e Websites
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;