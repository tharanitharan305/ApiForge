import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  projects: {
    list: async () => {
      const { data } = await apiClient.get("/projects");
      return data;
    },
    get: async (id: string) => {
      const { data } = await apiClient.get(`/projects/${id}`);
      return data;
    },
    create: async (project: any) => {
      const { data } = await apiClient.post("/projects", project);
      return data;
    },
    update: async (id: string, project: any) => {
      const { data } = await apiClient.patch(`/projects/${id}`, project);
      return data;
    },
    delete: async (id: string) => {
      await apiClient.delete(`/projects/${id}`);
    },
  },
  collections: {
    list: async (projectId: string) => {
      const { data } = await apiClient.get(`/projects/${projectId}/collections`);
      return data;
    },
    get: async (projectId: string, id: string) => {
      const { data } = await apiClient.get(`/projects/${projectId}/collections/${id}`);
      return data;
    },
    create: async (projectId: string, collection: any) => {
      const { data } = await apiClient.post(`/projects/${projectId}/collections`, collection);
      return data;
    },
    update: async (projectId: string, id: string, collection: any) => {
      const { data } = await apiClient.patch(
        `/projects/${projectId}/collections/${id}`,
        collection
      );
      return data;
    },
    delete: async (projectId: string, id: string) => {
      await apiClient.delete(`/projects/${projectId}/collections/${id}`);
    },
  },
  apis: {
    list: async (projectId: string) => {
      const { data } = await apiClient.get(`/projects/${projectId}/apis`);
      return data;
    },
    get: async (projectId: string, id: string) => {
      const { data } = await apiClient.get(`/projects/${projectId}/apis/${id}`);
      return data;
    },
    create: async (projectId: string, api: any) => {
      const { data } = await apiClient.post(`/projects/${projectId}/apis`, api);
      return data;
    },
    update: async (projectId: string, id: string, api: any) => {
      const { data } = await apiClient.patch(
        `/projects/${projectId}/apis/${id}`,
        api
      );
      return data;
    },
    delete: async (projectId: string, id: string) => {
      await apiClient.delete(`/projects/${projectId}/apis/${id}`);
    },
    // Collection-based API endpoints
    createInCollection: async (collectionId: string, api: any) => {
      const { data } = await apiClient.post(`/collections/${collectionId}/apis`, api);
      return data;
    },
    listInCollection: async (collectionId: string) => {
      const { data } = await apiClient.get(`/collections/${collectionId}/apis`);
      return data;
    },
  },
  export: {
    generate: async (projectId: string, languages: string[]) => {
      const { data } = await apiClient.post(
        `/projects/${projectId}/export/generate`,
        { languages },
        { responseType: "blob" }
      );
      return data;
    },
    config: async (projectId: string) => {
      const { data } = await apiClient.post(
        `/projects/${projectId}/export/config`
      );
      return data;
    },
    import: async (projectId: string, config: any) => {
      const { data } = await apiClient.post(
        `/projects/${projectId}/export/import`,
        { config }
      );
      return data;
    },
    exportPostman: async (projectId: string) => {
      const { data } = await apiClient.post(
        `/projects/${projectId}/export/postman`
      );
      return data;
    },
  },
  import: {
    postman: async (file: File) => {
      const text = await file.text();
      const collection = JSON.parse(text);
      const { data } = await apiClient.post("/import/postman", { collection });
      return data;
    },
  },
};
