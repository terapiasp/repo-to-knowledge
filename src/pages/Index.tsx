import { useState } from "react";
import { GitHubInput } from "@/components/GitHubInput";
import { FilesList } from "@/components/FilesList";
import { GitHubService } from "@/services/githubService";
import { useToast } from "@/hooks/use-toast";
import { Book, Github } from "lucide-react";

interface FileItem {
  name: string;
  path: string;
  content?: string;
  size?: number;
}

const Index = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [consolidating, setConsolidating] = useState(false);
  const [consolidated, setConsolidated] = useState(false);
  const [consolidatedContent, setConsolidatedContent] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (url: string) => {
    setLoading(true);
    setFiles([]);
    setConsolidated(false);
    setConsolidatedContent("");

    try {
      const fetchedFiles = await GitHubService.getAllFiles(url);
      setFiles(fetchedFiles);
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
      
      const content = GitHubService.consolidateFiles(validFiles);
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
      GitHubService.downloadFile(consolidatedContent, filename);
      
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
                Docs Consolidator
              </h1>
              <p className="text-muted-foreground">
                Consolide documentação do GitHub em arquivo único para IA
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <GitHubInput onSubmit={handleSubmit} loading={loading} />
        
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
            Ferramenta para consolidação de documentação GitHub
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;