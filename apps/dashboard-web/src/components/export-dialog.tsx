"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import { api } from "@/lib/api";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const LANGUAGES = [
  { id: "dart", label: "Dart / Flutter" },
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
];

export function ExportDialog({
  open,
  onOpenChange,
  projectId,
}: ExportDialogProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "typescript",
  ]);
  const [exporting, setExporting] = useState(false);

  const toggleLanguage = (languageId: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(languageId)
        ? prev.filter((id) => id !== languageId)
        : [...prev, languageId]
    );
  };

  const handleExport = async () => {
    if (selectedLanguages.length === 0) {
      alert("Please select at least one language");
      return;
    }

    setExporting(true);
    try {
      const blob = await api.export.generate(projectId, selectedLanguages);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "apiforge-sdk.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to export:", error);
      alert("Failed to export SDK");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export SDK</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-3 block">Select Languages</Label>
            <div className="space-y-3">
              {LANGUAGES.map((language) => (
                <div key={language.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={language.id}
                    checked={selectedLanguages.includes(language.id)}
                    onCheckedChange={() => toggleLanguage(language.id)}
                  />
                  <label
                    htmlFor={language.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {language.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={exporting}
            >
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exporting}>
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "Exporting..." : "Export SDK"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
