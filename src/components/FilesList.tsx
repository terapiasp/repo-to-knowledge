import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2 } from "lucide-react";

interface FileItem {
  name: string;
  path: string;
  content?: string;
  size?: number;
}

interface FilesListProps {
  files: FileItem[];
  onConsolidate: () => void;
  consolidating: boolean;
  onDownload: () => void;
  consolidated: boolean;
}

export function FilesList({ 
  files, 
  onConsolidate, 
  consolidating, 
  onDownload, 
  consolidated 
}: FilesListProps) {
  if (files.length === 0) return null;

  const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Arquivos Encontrados</h3>
          <p className="text-sm text-muted-foreground">
            {files.length} arquivos • {formatSize(totalSize)}
          </p>
        </div>
        <Badge variant="secondary" className="bg-accent/20 text-accent">
          Documentação
        </Badge>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
        {files.map((file, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
          >
            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {file.path}
              </p>
            </div>
            {file.size && (
              <span className="text-xs text-muted-foreground">
                {formatSize(file.size)}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={onConsolidate}
          disabled={consolidating || consolidated}
          className="flex-1 bg-gradient-primary hover:opacity-90"
        >
          {consolidating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Consolidando...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Consolidar Arquivos
            </>
          )}
        </Button>

        {consolidated && (
          <Button 
            onClick={onDownload}
            variant="secondary"
            className="bg-accent hover:bg-accent/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
      </div>
    </Card>
  );
}