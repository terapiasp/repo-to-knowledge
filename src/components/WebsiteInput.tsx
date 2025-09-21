import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Globe, Search, Key } from "lucide-react";
import { WebsiteProvider } from "@/services/providers/WebsiteProvider";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface WebsiteInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export function WebsiteInput({ onSubmit, loading }: WebsiteInputProps) {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const { toast } = useToast();

  const websiteProvider = new WebsiteProvider();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma API key válida",
        variant: "destructive",
      });
      return;
    }

    const isValid = await websiteProvider.testApiKey(apiKey.trim());
    if (isValid) {
      websiteProvider.setApiKey(apiKey.trim());
      setShowApiKeyDialog(false);
      setApiKey("");
      toast({
        title: "Sucesso!",
        description: "API key configurada com sucesso",
      });
    } else {
      toast({
        title: "Erro",
        description: "API key inválida. Verifique e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Website Documentation</h2>
            <p className="text-sm text-muted-foreground">Extrair documentação de qualquer website</p>
          </div>
        </div>
        
        <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Key className="w-4 h-4 mr-2" />
              API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Firecrawl API Key</DialogTitle>
              <DialogDescription>
                Para fazer crawl de websites, você precisa de uma API key do Firecrawl.
                Obtenha sua chave gratuita em: <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-primary underline">firecrawl.dev</a>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="fc-xxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-secondary border-border"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveApiKey} className="flex-1">
                  Salvar API Key
                </Button>
                <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            URL do Website
          </label>
          <Input
            type="url"
            placeholder="https://docs.example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-secondary border-border focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Todas as páginas de documentação do site serão indexadas automaticamente
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={!url.trim() || loading}
          className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200"
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Processando..." : "Extrair Documentação"}
        </Button>
      </form>
    </Card>
  );
}