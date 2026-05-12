"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, FileCode } from "lucide-react";
import { api } from "@/lib/api";

interface ProjectCardProps {
  project: any;
  onDelete: () => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await api.projects.delete(project.id);
        onDelete();
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  return (
    <div
      className="border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileCode className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{project._count?.apis || 0} APIs</span>
        <span>•</span>
        <span>{project._count?.exports || 0} Exports</span>
      </div>
    </div>
  );
}
