"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { api } from "@/lib/api";

interface ApiTableProps {
  apis: any[];
  projectId: string;
  onUpdate: () => void;
}

export function ApiTable({ apis, projectId, onUpdate }: ApiTableProps) {
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
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-4 font-semibold">Name</th>
            <th className="text-left p-4 font-semibold">Method</th>
            <th className="text-left p-4 font-semibold">Endpoint</th>
            <th className="text-left p-4 font-semibold">Environment</th>
            <th className="text-right p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {apis.map((apiItem) => (
            <tr key={apiItem.id} className="border-t hover:bg-muted/50">
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
                <div className="text-sm">
                  <div className="text-muted-foreground">Local:</div>
                  <div className="font-mono text-xs">{apiItem.localUrl}</div>
                  <div className="text-muted-foreground mt-1">Prod:</div>
                  <div className="font-mono text-xs">
                    {apiItem.productionUrl}
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(apiItem.id)}
                    className="text-destructive hover:text-destructive"
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
  );
}
