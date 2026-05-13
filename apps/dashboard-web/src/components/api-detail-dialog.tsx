"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code, FileCode } from "lucide-react";
import { api } from "@/lib/api";

interface ApiDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiId: string;
  projectId: string;
  project: any;
  collection: any;
}

export function ApiDetailDialog({
  open,
  onOpenChange,
  apiId,
  projectId,
  project,
  collection,
}: ApiDetailDialogProps) {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<"sdk" | "raw">("sdk");
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  useEffect(() => {
    if (open && apiId) {
      loadApiData();
    }
  }, [open, apiId]);

  const loadApiData = async () => {
    try {
      setLoading(true);
      const data = await api.apis.get(projectId, apiId);
      setApiData(data);
    } catch (error) {
      console.error("Failed to load API:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlock(blockId);
      setTimeout(() => setCopiedBlock(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "text-green-600 bg-green-50 dark:bg-green-950",
      POST: "text-blue-600 bg-blue-50 dark:bg-blue-950",
      PUT: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
      PATCH: "text-orange-600 bg-orange-50 dark:bg-orange-950",
      DELETE: "text-red-600 bg-red-50 dark:bg-red-950",
    };
    return colors[method] || "text-gray-600 bg-gray-50";
  };

  const buildFullUrl = () => {
    if (!apiData || !project || !collection) return "";
    const baseUrl = project.localBaseUrl || "http://localhost:3000";
    const collectionPath = collection.basePath || "";
    const endpoint = apiData.endpoint || "";
    return `${baseUrl}${collectionPath}${endpoint}`;
  };

  const generateDartSdkPreview = () => {
    if (!apiData || !collection) return "";

    const collectionName = collection.name;
    const methodName = apiData.name.replace(/\s+/g, "");
    const hasBody = apiData.requestBody && apiData.requestBody.length > 0;
    const hasHeaders = apiData.headers && Object.keys(apiData.headers).length > 0;

    let code = `await ${collectionName}.${methodName}(\n`;

    if (hasBody) {
      const bodyClassName = `${methodName}Body`;
      code += `  body: ${bodyClassName}(\n`;
      apiData.requestBody.forEach((field: any, idx: number) => {
        const comma = idx < apiData.requestBody.length - 1 ? "," : "";
        code += `    ${field.key}: ""${comma}\n`;
      });
      code += `  ),\n`;
    }

    if (hasHeaders) {
      const headersClassName = `${methodName}Headers`;
      code += `  headers: ${headersClassName}(\n`;
      Object.entries(apiData.headers).forEach(([key, value], idx) => {
        const comma = idx < Object.keys(apiData.headers).length - 1 ? "," : "";
        code += `    ${key}: ""${comma}\n`;
      });
      code += `  ),\n`;
    }

    code += `)`;

    return code;
  };

  const generateDartRawPreview = () => {
    if (!apiData) return "";

    const fullUrl = buildFullUrl();
    const method = apiData.method.toLowerCase();
    const hasBody = apiData.requestBody && apiData.requestBody.length > 0;
    const hasHeaders = apiData.headers && Object.keys(apiData.headers).length > 0;

    let code = `final response = await dio.${method}(\n`;
    code += `  "${fullUrl}",\n`;

    if (hasBody) {
      code += `  data: {\n`;
      apiData.requestBody.forEach((field: any, idx: number) => {
        const comma = idx < apiData.requestBody.length - 1 ? "," : "";
        code += `    "${field.key}": ""${comma}\n`;
      });
      code += `  },\n`;
    }

    if (hasHeaders) {
      code += `  options: Options(\n`;
      code += `    headers: {\n`;
      Object.entries(apiData.headers).forEach(([key, value], idx) => {
        const comma = idx < Object.keys(apiData.headers).length - 1 ? "," : "";
        code += `      "${key}": "${value}"${comma}\n`;
      });
      code += `    },\n`;
      code += `  ),\n`;
    }

    code += `);\n\n`;
    code += `Map<String, dynamic> data = response.data;`;

    return code;
  };

  const generateTypeScriptSdkPreview = () => {
    if (!apiData || !collection) return "";

    const collectionName = collection.name;
    const methodName = apiData.name.replace(/\s+/g, "");
    const hasBody = apiData.requestBody && apiData.requestBody.length > 0;
    const hasHeaders = apiData.headers && Object.keys(apiData.headers).length > 0;

    let code = `await ${collectionName}.${methodName}({\n`;

    if (hasBody) {
      code += `  body: {\n`;
      apiData.requestBody.forEach((field: any, idx: number) => {
        const comma = idx < apiData.requestBody.length - 1 ? "," : "";
        code += `    ${field.key}: ""${comma}\n`;
      });
      code += `  },\n`;
    }

    if (hasHeaders) {
      code += `  headers: {\n`;
      Object.entries(apiData.headers).forEach(([key, value], idx) => {
        const comma = idx < Object.keys(apiData.headers).length - 1 ? "," : "";
        code += `    ${key}: ""${comma}\n`;
      });
      code += `  },\n`;
    }

    code += `})`;

    return code;
  };

  const generateTypeScriptRawPreview = () => {
    if (!apiData) return "";

    const fullUrl = buildFullUrl();
    const method = apiData.method.toLowerCase();
    const hasBody = apiData.requestBody && apiData.requestBody.length > 0;
    const hasHeaders = apiData.headers && Object.keys(apiData.headers).length > 0;

    let code = `const response = await axios.${method}(\n`;
    code += `  "${fullUrl}",\n`;

    if (hasBody) {
      code += `  {\n`;
      apiData.requestBody.forEach((field: any, idx: number) => {
        const comma = idx < apiData.requestBody.length - 1 ? "," : "";
        code += `    ${field.key}: ""${comma}\n`;
      });
      code += `  },\n`;
    }

    if (hasHeaders) {
      code += `  {\n`;
      code += `    headers: {\n`;
      Object.entries(apiData.headers).forEach(([key, value], idx) => {
        const comma = idx < Object.keys(apiData.headers).length - 1 ? "," : "";
        code += `      ${key}: "${value}"${comma}\n`;
      });
      code += `    },\n`;
      code += `  }\n`;
    }

    code += `);\n\n`;
    code += `const data: Record<string, any> = response.data;`;

    return code;
  };

  const generatePythonSdkPreview = () => {
    if (!apiData || !collection) return "";

    const collectionName = collection.name;
    const methodName = apiData.name.replace(/\s+/g, "");
    const hasBody = apiData.requestBody && apiData.requestBody.length > 0;
    const hasHeaders = apiData.headers && Object.keys(apiData.headers).length > 0;

    let code = `${collectionName}.${methodName}(\n`;

    if (hasBody) {
      const bodyClassName = `${methodName}Body`;
      code += `    body=${bodyClassName}(\n`;
      apiData.requestBody.forEach((field: any, idx: number) => {
        const comma = idx < apiData.requestBody.length - 1 ? "," : "";
        code += `        ${field.key}=""${comma}\n`;
      });
      code += `    ),\n`;
    }

    if (hasHeaders) {
      const headersClassName = `${methodName}Headers`;
      code += `    headers=${headersClassName}(\n`;
      Object.entries(apiData.headers).forEach(([key, value], idx) => {
        const comma = idx < Object.keys(apiData.headers).length - 1 ? "," : "";
        code += `        ${key}=""${comma}\n`;
      });
      code += `    ),\n`;
    }

    code += `)`;

    return code;
  };

  const generatePythonRawPreview = () => {
    if (!apiData) return "";

    const fullUrl = buildFullUrl();
    const method = apiData.method.toLowerCase();
    const hasBody = apiData.requestBody && apiData.requestBody.length > 0;
    const hasHeaders = apiData.headers && Object.keys(apiData.headers).length > 0;

    let code = `response = requests.${method}(\n`;
    code += `    "${fullUrl}",\n`;

    if (hasBody) {
      code += `    json={\n`;
      apiData.requestBody.forEach((field: any, idx: number) => {
        const comma = idx < apiData.requestBody.length - 1 ? "," : "";
        code += `        "${field.key}": ""${comma}\n`;
      });
      code += `    },\n`;
    }

    if (hasHeaders) {
      code += `    headers={\n`;
      Object.entries(apiData.headers).forEach(([key, value], idx) => {
        const comma = idx < Object.keys(apiData.headers).length - 1 ? "," : "";
        code += `        "${key}": "${value}"${comma}\n`;
      });
      code += `    }\n`;
    }

    code += `);\n\n`;
    code += `data = response.json()`;

    return code;
  };

  const generateJavaScriptSdkPreview = () => {
    if (!apiData || !collection) return "";

    const collectionName = collection.name;
    const methodName = apiData.name.replace(/\s+/g, "");
    const hasBody = apiData.requestBody && apiData.requestBody.length > 0;
    const hasHeaders = apiData.headers && Object.keys(apiData.headers).length > 0;

    let code = `await ${collectionName}.${methodName}({\n`;

    if (hasBody) {
      code += `  body: {\n`;
      apiData.requestBody.forEach((field: any, idx: number) => {
        const comma = idx < apiData.requestBody.length - 1 ? "," : "";
        code += `    ${field.key}: ""${comma}\n`;
      });
      code += `  },\n`;
    }

    if (hasHeaders) {
      code += `  headers: {\n`;
      Object.entries(apiData.headers).forEach(([key, value], idx) => {
        const comma = idx < Object.keys(apiData.headers).length - 1 ? "," : "";
        code += `    ${key}: ""${comma}\n`;
      });
      code += `  },\n`;
    }

    code += `})`;

    return code;
  };

  const generateJavaScriptRawPreview = () => {
    if (!apiData) return "";

    const fullUrl = buildFullUrl();
    const method = apiData.method.toLowerCase();
    const hasBody = apiData.requestBody && apiData.requestBody.length > 0;
    const hasHeaders = apiData.headers && Object.keys(apiData.headers).length > 0;

    let code = `const response = await axios.${method}(\n`;
    code += `  "${fullUrl}",\n`;

    if (hasBody) {
      code += `  {\n`;
      apiData.requestBody.forEach((field: any, idx: number) => {
        const comma = idx < apiData.requestBody.length - 1 ? "," : "";
        code += `    ${field.key}: ""${comma}\n`;
      });
      code += `  },\n`;
    }

    if (hasHeaders) {
      code += `  {\n`;
      code += `    headers: {\n`;
      Object.entries(apiData.headers).forEach(([key, value], idx) => {
        const comma = idx < Object.keys(apiData.headers).length - 1 ? "," : "";
        code += `      ${key}: "${value}"${comma}\n`;
      });
      code += `    },\n`;
      code += `  }\n`;
    }

    code += `);\n\n`;
    code += `const data = response.data;`;

    return code;
  };

  if (loading || !apiData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-md text-sm font-mono font-semibold ${getMethodColor(apiData.method)}`}>
              {apiData.method}
            </span>
            <span>{apiData.name}</span>
          </DialogTitle>
          {apiData.description && (
            <DialogDescription>{apiData.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* API Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">
              API Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Project:</span>
                <p className="font-medium">{project?.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Collection:</span>
                <p className="font-medium">{collection?.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Collection Base Path:</span>
                <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {collection?.basePath || "/"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Endpoint Path:</span>
                <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {apiData.endpoint}
                </p>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Full URL:</span>
              <p className="font-mono text-sm bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-2 rounded mt-1">
                {buildFullUrl()}
              </p>
            </div>
          </div>

          {/* Headers */}
          {apiData.headers && Object.keys(apiData.headers).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                Headers
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                {Object.entries(apiData.headers).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm font-mono">
                    <span className="font-semibold">{key}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body Fields */}
          {apiData.requestBody && apiData.requestBody.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                Body Fields
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                {apiData.requestBody.map((field: any) => (
                  <div key={field.key} className="flex items-center gap-2 text-sm font-mono">
                    <span className="font-semibold">{field.key}</span>
                    <span className="text-muted-foreground">:</span>
                    <span className="text-blue-600 dark:text-blue-400">{field.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query Parameters */}
          {apiData.queryParams && apiData.queryParams.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                Query Parameters
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                {apiData.queryParams.map((param: any) => (
                  <div key={param.key} className="flex items-center gap-2 text-sm font-mono">
                    <span className="font-semibold">{param.key}</span>
                    <span className="text-muted-foreground">:</span>
                    <span className="text-blue-600 dark:text-blue-400">{param.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SDK Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                Code Preview
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={previewMode === "sdk" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("sdk")}
                >
                  <Code className="h-4 w-4 mr-2" />
                  SDK Method
                </Button>
                <Button
                  variant={previewMode === "raw" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("raw")}
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  Raw Request
                </Button>
              </div>
            </div>

            <Tabs defaultValue="dart" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dart">Dart</TabsTrigger>
                <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>

              <TabsContent value="dart" className="space-y-2">
                <div className="relative">
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>
                      {previewMode === "sdk"
                        ? generateDartSdkPreview()
                        : generateDartRawPreview()}
                    </code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      copyToClipboard(
                        previewMode === "sdk"
                          ? generateDartSdkPreview()
                          : generateDartRawPreview(),
                        "dart"
                      )
                    }
                  >
                    {copiedBlock === "dart" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="typescript" className="space-y-2">
                <div className="relative">
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>
                      {previewMode === "sdk"
                        ? generateTypeScriptSdkPreview()
                        : generateTypeScriptRawPreview()}
                    </code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      copyToClipboard(
                        previewMode === "sdk"
                          ? generateTypeScriptSdkPreview()
                          : generateTypeScriptRawPreview(),
                        "typescript"
                      )
                    }
                  >
                    {copiedBlock === "typescript" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="javascript" className="space-y-2">
                <div className="relative">
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>
                      {previewMode === "sdk"
                        ? generateJavaScriptSdkPreview()
                        : generateJavaScriptRawPreview()}
                    </code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      copyToClipboard(
                        previewMode === "sdk"
                          ? generateJavaScriptSdkPreview()
                          : generateJavaScriptRawPreview(),
                        "javascript"
                      )
                    }
                  >
                    {copiedBlock === "javascript" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="python" className="space-y-2">
                <div className="relative">
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>
                      {previewMode === "sdk"
                        ? generatePythonSdkPreview()
                        : generatePythonRawPreview()}
                    </code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      copyToClipboard(
                        previewMode === "sdk"
                          ? generatePythonSdkPreview()
                          : generatePythonRawPreview(),
                        "python"
                      )
                    }
                  >
                    {copiedBlock === "python" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
