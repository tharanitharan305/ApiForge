"use client";

import { Folder, MoreVertical, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface CollectionCardProps {
  collection: any;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CollectionCard({
  collection,
  onSelect,
  onEdit,
  onDelete,
}: CollectionCardProps) {
  const apiCount = collection._count?.apis || collection.apis?.length || 0;

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">
            {collection.name}
          </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {collection.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {collection.description}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {apiCount} {apiCount === 1 ? "API" : "APIs"}
            </Badge>
            <Badge variant="outline">{collection.basePath}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
