"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

const apiSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  overrideBaseUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  endpoint: z.string().min(1, "Endpoint is required"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  headers: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })).optional(),
  queryParams: z.array(z.object({
    key: z.string(),
    type: z.string(),
    required: z.boolean(),
  })).optional(),
  requestBody: z.array(z.object({
    key: z.string(),
    type: z.enum(["string", "number", "boolean", "object", "array"]),
    required: z.boolean(),
    defaultValue: z.string().optional(),
  })).optional(),
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
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<ApiFormData>({
    resolver: zodResolver(apiSchema),
    defaultValues: {
      method: "GET",
      headers: [],
      queryParams: [],
      requestBody: [],
      responseMapping: {
        successPath: "success",
        messagePath: "message",
        dataPath: "data",
      },
      timeout: 30000,
      authRequired: false,
    },
  });

  const { fields: headerFields, append: appendHeader, remove: removeHeader } = useFieldArray({
    control,
    name: "headers",
  });

  const { fields: queryFields, append: appendQuery, remove: removeQuery } = useFieldArray({
    control,
    name: "queryParams",
  });

  const { fields: bodyFields, append: appendBody, remove: removeBody } = useFieldArray({
    control,
    name: "requestBody",
  });

  const method = watch("method");
  const showBodyFields = ["POST", "PUT", "PATCH"].includes(method);

  const handleFormSubmit = (data: ApiFormData) => {
    // Clean up empty override URL
    if (data.overrideBaseUrl === "") {
      data.overrideBaseUrl = undefined;
    }
    
    // Transform headers array to object
    const headers: Record<string, string> = {};
    if (data.headers && data.headers.length > 0) {
      data.headers.forEach((header) => {
        if (header.key && header.value) {
          headers[header.key] = header.value;
        }
      });
    }
    
    // Filter out empty query params and body fields
    const queryParams = (data.queryParams || []).filter(param => param.key);
    const requestBody = (data.requestBody || []).filter(field => field.key);
    
    // Submit cleaned data
    onSubmit({
      ...data,
      headers,
      queryParams,
      requestBody,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New API</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">API Name *</Label>
              <Input id="name" {...register("name")} placeholder="Login" />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="method">Method *</Label>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="User login endpoint"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="endpoint">Endpoint *</Label>
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

          <div>
            <Label htmlFor="overrideBaseUrl">Override Base URL (Optional)</Label>
            <Input
              id="overrideBaseUrl"
              {...register("overrideBaseUrl")}
              placeholder="https://custom-api.example.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to use project default base URLs
            </p>
            {errors.overrideBaseUrl && (
              <p className="text-sm text-destructive mt-1">
                {errors.overrideBaseUrl.message}
              </p>
            )}
          </div>

          {/* Headers */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Headers</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendHeader({ key: "", value: "" })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Header
              </Button>
            </div>
            {headerFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <Input
                  {...register(`headers.${index}.key`)}
                  placeholder="Header name"
                />
                <Input
                  {...register(`headers.${index}.value`)}
                  placeholder="Header value"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHeader(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Query Parameters */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Query Parameters</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendQuery({ key: "", type: "string", required: false })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Query Param
              </Button>
            </div>
            {queryFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2 items-center">
                <Input
                  {...register(`queryParams.${index}.key`)}
                  placeholder="Param name"
                  className="flex-1"
                />
                <select
                  {...register(`queryParams.${index}.type`)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
                <div className="flex items-center gap-2">
                  <Controller
                    name={`queryParams.${index}.required`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label className="text-xs">Required</Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuery(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Request Body */}
          {showBodyFields && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Request Body</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendBody({ key: "", type: "string", required: false })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>
              {bodyFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2 items-center">
                  <Input
                    {...register(`requestBody.${index}.key`)}
                    placeholder="Field name"
                    className="flex-1"
                  />
                  <select
                    {...register(`requestBody.${index}.type`)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="object">Object</option>
                    <option value="array">Array</option>
                  </select>
                  <Input
                    {...register(`requestBody.${index}.defaultValue`)}
                    placeholder="Default"
                    className="w-24"
                  />
                  <div className="flex items-center gap-2">
                    <Controller
                      name={`requestBody.${index}.required`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label className="text-xs">Required</Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBody(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Response Mapping */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Response Mapping</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="successPath">Success Path *</Label>
                <Input
                  id="successPath"
                  {...register("responseMapping.successPath")}
                  placeholder="success"
                />
              </div>

              <div>
                <Label htmlFor="messagePath">Message Path *</Label>
                <Input
                  id="messagePath"
                  {...register("responseMapping.messagePath")}
                  placeholder="message"
                />
              </div>

              <div>
                <Label htmlFor="dataPath">Data Path *</Label>
                <Input
                  id="dataPath"
                  {...register("responseMapping.dataPath")}
                  placeholder="data"
                />
              </div>

              <div>
                <Label htmlFor="statusCodePath">Status Code Path</Label>
                <Input
                  id="statusCodePath"
                  {...register("responseMapping.statusCodePath")}
                  placeholder="statusCode"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
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
            <Button type="submit">Create API</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
