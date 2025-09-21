import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitHubInput } from "./GitHubInput";
import { WebsiteInput } from "./WebsiteInput";
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
        <WebsiteInput onSubmit={handleWebsiteSubmit} loading={loading} />
      </TabsContent>
    </Tabs>
  );
}