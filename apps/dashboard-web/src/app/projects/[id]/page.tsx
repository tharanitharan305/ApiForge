"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, ArrowLeft } from "lucide-react";
import { ApiTable } from "@/components/api-table";
import { CreateApiDialog } from "@/components/create-api-dialog";
import { ExportDialog } from "@/components/export-dialog";
import { api } from "@/lib/api";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [apis, setApis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projectData, apisData] = await Promise.all([
        api.projects.get(projectId),
        api.apis.list(projectId),
      ]);
      setProject(projectData);
      setApis(apisData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApi = async (data: any) => {
    try {
      await api.apis.create(projectId, data);
      setCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create API:", error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const config = JSON.parse(text);
      await api.export.import(projectId, config);
      loadData();
    } catch (error) {
      console.error("Failed to import config:", error);
      alert("Failed to import config. Please check the file format.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{project?.name}</h1>
              {project?.description && (
                <p className="text-muted-foreground">{project.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              <label>
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Config
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <Button
                variant="outline"
                onClick={() => setExportDialogOpen(true)}
                disabled={apis.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export SDK
              </Button>

              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add API
              </Button>
            </div>
          </div>
        </div>

        {apis.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold mb-2">No APIs yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first API endpoint to get started
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add API
            </Button>
          </div>
        ) : (
          <ApiTable apis={apis} projectId={projectId} onUpdate={loadData} />
        )}
      </div>

      <CreateApiDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateApi}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        projectId={projectId}
      />
    </div>
  );
}
