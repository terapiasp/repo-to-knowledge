import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Loader2 } from "lucide-react";

interface ProgressItem {
  fileName: string;
  filePath: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface ProgressViewerProps {
  progress: number;
  currentFile: string;
  files: ProgressItem[];
  totalFiles: number;
}

export function ProgressViewer({ progress, currentFile, files, totalFiles }: ProgressViewerProps) {
  return (
    <Card className="p-6 bg-gradient-card shadow-card border-border animate-fade-in">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Processando Repositório</h3>
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}% completo • {files.filter(f => f.status === 'completed').length} de {totalFiles} arquivos
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">Progresso</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Current File */}
        {currentFile && (
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span className="text-sm font-medium text-foreground">Processando:</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 truncate">{currentFile}</p>
          </div>
        )}

        {/* Files List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Arquivos Encontrados</h4>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {files.map((file, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-2 rounded-md transition-all duration-200 ${
                  file.status === 'completed' ? 'bg-green-500/10 border border-green-500/20' :
                  file.status === 'processing' ? 'bg-accent/10 border border-accent/20 scale-in' :
                  file.status === 'error' ? 'bg-destructive/10 border border-destructive/20' :
                  'bg-muted/50'
                }`}
              >
                {file.status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
                {file.status === 'processing' && (
                  <Loader2 className="w-4 h-4 text-accent animate-spin flex-shrink-0" />
                )}
                {file.status === 'error' && (
                  <FileText className="w-4 h-4 text-destructive flex-shrink-0" />
                )}
                {file.status === 'pending' && (
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {file.filePath}
                  </p>
                </div>

                <Badge 
                  variant={
                    file.status === 'completed' ? 'default' :
                    file.status === 'processing' ? 'secondary' :
                    file.status === 'error' ? 'destructive' :
                    'outline'
                  }
                  className="text-xs"
                >
                  {file.status === 'completed' ? 'OK' :
                   file.status === 'processing' ? 'Lendo...' :
                   file.status === 'error' ? 'Erro' :
                   'Aguardando'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}