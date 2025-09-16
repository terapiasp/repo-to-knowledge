import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GitBranch, Folder, Search } from "lucide-react";

interface GitHubInputProps {
  onSubmit: (url: string, path: string) => void;
  loading: boolean;
}

export function GitHubInput({ onSubmit, loading }: GitHubInputProps) {
  const [url, setUrl] = useState("");
  const [path, setPath] = useState("docs");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim(), path.trim());
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
          <GitBranch className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">GitHub Repository</h2>
          <p className="text-sm text-muted-foreground">Consolidar documentação em arquivo único</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            URL do Repositório
          </label>
          <Input
            type="url"
            placeholder="https://github.com/usuario/repositorio"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-secondary border-border focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Pasta de Documentação
          </label>
          <Input
            type="text"
            placeholder="docs"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="bg-secondary border-border focus:ring-primary"
          />
        </div>

        <Button 
          type="submit" 
          disabled={!url.trim() || loading}
          className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200"
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Processando..." : "Buscar Arquivos"}
        </Button>
      </form>
    </Card>
  );
}