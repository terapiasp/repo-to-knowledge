import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Globe, Search, Key, ExternalLink } from "lucide-react";
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
  const [isTestingKey, setIsTestingKey] = useState(false);
  const { toast } = useToast();

  const websiteProvider = new WebsiteProvider();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se a API key está configurada
    const savedApiKey = websiteProvider.getApiKey();
    if (!savedApiKey) {
      toast({
        title: "API Key necessária",
        description: "Configure sua API key do Firecrawl primeiro",
        variant: "destructive",
      });
      setShowApiKeyDialog(true);
      return;
    }

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

    setIsTestingKey(true);
    
    try {
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
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao validar API key",
        variant: "destructive",
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const hasApiKey = !!websiteProvider.getApiKey();

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
            <Button 
              variant={hasApiKey ? "outline" : "default"} 
              size="sm"
              className={hasApiKey ? "" : "bg-primary text-primary-foreground animate-pulse"}
            >
              <Key className="w-4 h-4 mr-2" />
              {hasApiKey ? "Configurada" : "API Key"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Firecrawl API Key</DialogTitle>
              <DialogDescription>
                Para fazer crawl de websites, você precisa de uma API key do Firecrawl.
                <br />
                <a 
                  href="https://firecrawl.dev" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary underline inline-flex items-center gap-1 mt-2"
                >
                  Obtenha sua chave gratuita aqui
                  <ExternalLink className="w-3 h-3" />
                </a>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="fc-xxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-secondary border-border"
                disabled={isTestingKey}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveApiKey} 
                  className="flex-1"
                  disabled={isTestingKey}
                >
                  {isTestingKey ? "Validando..." : "Salvar API Key"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowApiKeyDialog(false)}
                  disabled={isTestingKey}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!hasApiKey && (
        <div className="mb-4 p-3 bg-muted/50 border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">
            ⚠️ Configure sua API key do Firecrawl para usar esta funcionalidade
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            URL do Website
          </label>
          <Input
            type="url"
            placeholder="https://docs.supabase.com"
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
          disabled={!url.trim() || loading || !hasApiKey}
          className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200"
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Processando..." : "Extrair Documentação"}
        </Button>
      </form>
    </Card>
  );
}