"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileJson, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

interface ImportPostmanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImportPostmanDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportPostmanDialogProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setPreview(null);

    try {
      const text = await selectedFile.text();
      const collection = JSON.parse(text);

      // Basic validation
      if (!collection.info || !collection.item) {
        throw new Error("Invalid Postman collection format");
      }

      // Create preview
      const itemCount = Array.isArray(collection.item) ? collection.item.length : 0;
      setPreview({
        name: collection.info.name || "Unnamed Collection",
        description: collection.info.description || "",
        itemCount,
      });
    } catch (err: any) {
      setError(err.message || "Failed to parse JSON file");
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setWarnings([]);

    try {
      const result = await api.import.postman(file);
      
      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        const warningMessages = result.warnings.map((w: any) => w.message || String(w));
        setWarnings(warningMessages);
      }
      
      // Success - redirect to the new project
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
      
      // Navigate to the newly created project
      if (result.projectId) {
        router.push(`/projects/${result.projectId}`);
      }
    } catch (err: any) {
      console.error("Import failed:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to import Postman collection"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setWarnings([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Postman Collection</DialogTitle>
          <DialogDescription>
            Upload a Postman Collection v2.1 JSON file to create a new project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              id="postman-file-input"
              disabled={loading}
            />
            <label
              htmlFor="postman-file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="rounded-full bg-primary/10 p-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {file ? file.name : "Choose a file"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Postman Collection v2.1 JSON
                </p>
              </div>
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{preview.name}</p>
                  {preview.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {preview.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Contains {preview.itemCount} item{preview.itemCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Import Failed</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    Import Warnings ({warnings.length})
                  </p>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {warnings.map((warning, idx) => (
                      <li key={idx} className="list-disc list-inside">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <FileJson className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">What will be imported:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Project structure and collections</li>
                  <li>API endpoints with methods and URLs</li>
                  <li>Request headers and body schemas</li>
                  <li>Query parameters and authentication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? "Importing..." : "Import Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
