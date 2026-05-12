"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const collectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  basePath: z.string().min(1, "Base path is required").regex(/^\//, "Must start with /"),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CollectionFormData) => void;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateCollectionDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      basePath: "/",
    },
  });

  const handleFormSubmit = (data: CollectionFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Collection Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Authentication"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="User authentication and authorization endpoints"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="basePath">Base Path *</Label>
            <Input
              id="basePath"
              {...register("basePath")}
              placeholder="/auth"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The base path for all APIs in this collection (e.g., /auth, /users)
            </p>
            {errors.basePath && (
              <p className="text-sm text-destructive mt-1">
                {errors.basePath.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Collection</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
