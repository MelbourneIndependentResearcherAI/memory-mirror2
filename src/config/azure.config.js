/**
 * Azure service configuration
 *
 * All values are read from Vite environment variables so that
 * different values can be supplied per environment without code changes.
 */

const azureConfig = {
  storage: {
    accountName: import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME ?? "",
    containerName: import.meta.env.VITE_AZURE_STORAGE_CONTAINER_NAME ?? "user-media",
    /** SAS token for authenticated uploads/downloads (kept in .env.local, never hard-coded) */
    sasToken: import.meta.env.VITE_AZURE_STORAGE_SAS_TOKEN ?? "",
    get blobServiceUrl() {
      return `https://${this.accountName}.blob.core.windows.net`;
    },
    get containerUrl() {
      return `${this.blobServiceUrl}/${this.containerName}`;
    },
  },

  communication: {
    endpoint: import.meta.env.VITE_AZURE_COMMUNICATION_ENDPOINT ?? "",
  },

  appInsights: {
    connectionString: import.meta.env.VITE_AZURE_APP_INSIGHTS_CONNECTION_STRING ?? "",
  },

  app: {
    domain: import.meta.env.VITE_APP_DOMAIN ?? "https://memory-mirror.app",
  },
};

export default azureConfig;
