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
import { Select } from "@/components/ui/select";

const apiSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  environments: z.object({
    local: z.string().url("Must be a valid URL"),
    production: z.string().url("Must be a valid URL"),
  }),
  endpoint: z.string().min(1, "Endpoint is required"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  responseMapping: z.object({
    successPath: z.string().min(1, "Success path is required"),
    messagePath: z.string().min(1, "Message path is required"),
    dataPath: z.string().min(1, "Data path is required"),
    statusCodePath: z.string().optional(),
  }),
  timeout: z.number().optional(),
  authRequired: z.boolean().optional(),
});

type ApiFormData = z.infer<typeof apiSchema>;

interface CreateApiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApiFormData) => void;
}

export function CreateApiDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateApiDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApiFormData>({
    resolver: zodResolver(apiSchema),
    defaultValues: {
      method: "GET",
      responseMapping: {
        successPath: "success",
        messagePath: "message",
        dataPath: "data",
      },
      timeout: 30000,
      authRequired: false,
    },
  });

  const handleFormSubmit = (data: ApiFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New API</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">API Name</Label>
              <Input id="name" {...register("name")} placeholder="Login" />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="method">Method</Label>
              <select
                id="method"
                {...register("method")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="User login endpoint"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="endpoint">Endpoint</Label>
            <Input
              id="endpoint"
              {...register("endpoint")}
              placeholder="/api/auth/login"
            />
            {errors.endpoint && (
              <p className="text-sm text-destructive mt-1">
                {errors.endpoint.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="localUrl">Local Base URL</Label>
              <Input
                id="localUrl"
                {...register("environments.local")}
                placeholder="http://localhost:3000"
              />
              {errors.environments?.local && (
                <p className="text-sm text-destructive mt-1">
                  {errors.environments.local.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="productionUrl">Production Base URL</Label>
              <Input
                id="productionUrl"
                {...register("environments.production")}
                placeholder="https://api.example.com"
              />
              {errors.environments?.production && (
                <p className="text-sm text-destructive mt-1">
                  {errors.environments.production.message}
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Response Mapping</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="successPath">Success Path</Label>
                <Input
                  id="successPath"
                  {...register("responseMapping.successPath")}
                  placeholder="success"
                />
              </div>

              <div>
                <Label htmlFor="messagePath">Message Path</Label>
                <Input
                  id="messagePath"
                  {...register("responseMapping.messagePath")}
                  placeholder="message"
                />
              </div>

              <div>
                <Label htmlFor="dataPath">Data Path</Label>
                <Input
                  id="dataPath"
                  {...register("responseMapping.dataPath")}
                  placeholder="data"
                />
              </div>

              <div>
                <Label htmlFor="statusCodePath">
                  Status Code Path (Optional)
                </Label>
                <Input
                  id="statusCodePath"
                  {...register("responseMapping.statusCodePath")}
                  placeholder="statusCode"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create API</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
