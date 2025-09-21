import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitHubInput } from "./GitHubInput";
import { Github, Globe } from "lucide-react";
import { DocumentationSource } from "@/types/documentation";

interface DocumentationTabsProps {
  onSubmit: (source: DocumentationSource, url: string) => void;
  loading: boolean;
}

export function DocumentationTabs({ onSubmit, loading }: DocumentationTabsProps) {
  const [activeTab, setActiveTab] = useState<DocumentationSource>("github");

  const handleGitHubSubmit = (url: string) => {
    onSubmit("github", url);
  };

  const handleWebsiteSubmit = (url: string) => {
    onSubmit("website", url);
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentationSource)} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="github" className="flex items-center gap-2">
          <Github className="w-4 h-4" />
          GitHub
        </TabsTrigger>
        <TabsTrigger value="website" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Website
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="github">
        <GitHubInput onSubmit={handleGitHubSubmit} loading={loading} />
      </TabsContent>
      
      <TabsContent value="website">
        <div className="p-6 bg-gradient-card shadow-card border-border rounded-lg">
          <div className="text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Website Documentation</h3>
            <p className="text-muted-foreground mb-4">
              Funcionalidade em desenvolvimento. Use a aba GitHub por enquanto.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}