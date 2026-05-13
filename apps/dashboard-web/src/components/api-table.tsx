"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { ApiDetailDialog } from "@/components/api-detail-dialog";

interface ApiTableProps {
  apis: any[];
  projectId: string;
  project: any;
  collection: any;
  onUpdate: () => void;
}

export function ApiTable({ apis, projectId, project, collection, onUpdate }: ApiTableProps) {
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this API?")) {
      try {
        await api.apis.delete(projectId, id);
        onUpdate();
      } catch (error) {
        console.error("Failed to delete API:", error);
      }
    }
  };

  const handleViewDetails = (apiId: string) => {
    setSelectedApiId(apiId);
    setDetailDialogOpen(true);
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "text-green-500",
      POST: "text-blue-500",
      PUT: "text-yellow-500",
      PATCH: "text-orange-500",
      DELETE: "text-red-500",
    };
    return colors[method] || "text-gray-500";
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-semibold">Name</th>
              <th className="text-left p-4 font-semibold">Method</th>
              <th className="text-left p-4 font-semibold">Endpoint</th>
              <th className="text-right p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apis.map((apiItem) => (
              <tr
                key={apiItem.id}
                className="border-t hover:bg-muted/50 cursor-pointer"
                onClick={() => handleViewDetails(apiItem.id)}
              >
                <td className="p-4">
                  <div>
                    <div className="font-medium">{apiItem.name}</div>
                    {apiItem.description && (
                      <div className="text-sm text-muted-foreground">
                        {apiItem.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`font-mono font-semibold ${getMethodColor(
                      apiItem.method
                    )}`}
                  >
                    {apiItem.method}
                  </span>
                </td>
                <td className="p-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {apiItem.endpoint}
                  </code>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(apiItem.id)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(apiItem.id)}
                      className="text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedApiId && (
        <ApiDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          apiId={selectedApiId}
          projectId={projectId}
          project={project}
          collection={collection}
        />
      )}
    </>
  );
}
