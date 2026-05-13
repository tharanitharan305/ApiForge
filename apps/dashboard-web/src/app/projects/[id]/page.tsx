"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, ArrowLeft, FolderPlus, Folder, FileJson } from "lucide-react";
import { ApiTable } from "@/components/api-table";
import { CreateApiDialog } from "@/components/create-api-dialog-v2";
import { CreateCollectionDialog } from "@/components/create-collection-dialog";
import { ExportDialog } from "@/components/export-dialog";
import { api } from "@/lib/api";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createApiDialogOpen, setCreateApiDialogOpen] = useState(false);
  const [createCollectionDialogOpen, setCreateCollectionDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projectData, collectionsData] = await Promise.all([
        api.projects.get(projectId),
        api.collections.list(projectId),
      ]);
      setProject(projectData);
      setCollections(collectionsData);
      
      // Auto-select first collection if none selected
      if (!selectedCollection && collectionsData.length > 0) {
        setSelectedCollection(collectionsData[0]);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (data: any) => {
    try {
      const newCollection = await api.collections.create(projectId, data);
      setCreateCollectionDialogOpen(false);
      await loadData();
      setSelectedCollection(newCollection);
    } catch (error: any) {
      console.error("Failed to create collection:", error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Failed to create collection: ${JSON.stringify(errorMessage)}`);
    }
  };

  const handleCreateApi = async (data: any) => {
    if (!selectedCollection) {
      alert("Please select a collection first");
      return;
    }

    try {
      // Create API in the selected collection using collection-based endpoint
      await api.apis.createInCollection(selectedCollection.id, data);
      setCreateApiDialogOpen(false);
      await loadData();
    } catch (error: any) {
      console.error("Failed to create API:", error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Failed to create API: ${JSON.stringify(errorMessage)}`);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm("Are you sure you want to delete this collection? All APIs in this collection will be deleted.")) {
      return;
    }
    try {
      await api.collections.delete(projectId, collectionId);
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
      loadData();
    } catch (error) {
      console.error("Failed to delete collection:", error);
      alert("Failed to delete collection");
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

  const handleExportPostman = async () => {
    try {
      const postmanCollection = await api.export.exportPostman(projectId);
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(postmanCollection, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.name || "collection"}.postman_collection.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export Postman collection:", error);
      alert("Failed to export Postman collection");
    }
  };

  const totalApis = collections.reduce((sum, c) => sum + (c.apis?.length || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* LEFT SIDEBAR - Collections */}
      <div className="w-64 border-r bg-muted/10 p-4 flex flex-col">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 justify-start"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-4">
          <h2 className="font-bold text-lg mb-1 truncate" title={project?.name}>
            {project?.name}
          </h2>
          <p className="text-xs text-muted-foreground">
            {collections.length} collections • {totalApis} APIs
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              COLLECTIONS
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateCollectionDialogOpen(true)}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">
                No collections yet
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateCollectionDialogOpen(true)}
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Collection
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCollection?.id === collection.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {collection.name}
                      </div>
                      <div className="text-xs opacity-70 truncate">
                        {collection.basePath} • {collection.apis?.length || 0} APIs
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t space-y-2">
          <label className="block">
            <Button variant="outline" size="sm" className="w-full" asChild>
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
            size="sm"
            className="w-full"
            onClick={() => setExportDialogOpen(true)}
            disabled={totalApis === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export SDK
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleExportPostman}
            disabled={totalApis === 0}
          >
            <FileJson className="mr-2 h-4 w-4" />
            Export Postman
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT - Collection Details */}
      <div className="flex-1 flex flex-col">
        {selectedCollection ? (
          <>
            {/* Collection Header */}
            <div className="border-b bg-background p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="h-6 w-6 text-primary" />
                    <h1 className="text-3xl font-bold">{selectedCollection.name}</h1>
                  </div>
                  {selectedCollection.description && (
                    <p className="text-muted-foreground mb-3">
                      {selectedCollection.description}
                    </p>
                  )}
                  
                  {/* URL Preview */}
                  <div className="bg-muted/50 rounded-md p-3 font-mono text-sm">
                    <div className="text-xs text-muted-foreground mb-1">
                      Collection Base URL:
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-600">
                        {project?.localBaseUrl || "http://localhost:3000"}
                      </span>
                      <span className="text-green-600 font-semibold">
                        {selectedCollection.basePath}
                      </span>
                      <span className="text-muted-foreground">/[endpoint]</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCollection(selectedCollection.id)}
                  >
                    Delete Collection
                  </Button>
                  <Button
                    onClick={() => setCreateApiDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add API
                  </Button>
                </div>
              </div>
            </div>

            {/* APIs List */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedCollection.apis && selectedCollection.apis.length > 0 ? (
                <ApiTable
                  apis={selectedCollection.apis}
                  projectId={projectId}
                  project={project}
                  collection={selectedCollection}
                  onUpdate={loadData}
                />
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No APIs in this collection
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first API endpoint to {selectedCollection.name}
                  </p>
                  <Button onClick={() => setCreateApiDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add API
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FolderPlus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {collections.length === 0
                  ? "Create your first collection"
                  : "Select a collection"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {collections.length === 0
                  ? "Collections help organize your APIs into logical groups"
                  : "Choose a collection from the sidebar to view its APIs"}
              </p>
              {collections.length === 0 && (
                <Button onClick={() => setCreateCollectionDialogOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create Collection
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateApiDialog
        open={createApiDialogOpen}
        onOpenChange={setCreateApiDialogOpen}
        onSubmit={handleCreateApi}
        collection={selectedCollection}
        project={project}
      />

      <CreateCollectionDialog
        open={createCollectionDialogOpen}
        onOpenChange={setCreateCollectionDialogOpen}
        onSubmit={handleCreateCollection}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        projectId={projectId}
      />
    </div>
  );
}
