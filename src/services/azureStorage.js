/**
 * Azure Blob Storage service
 *
 * Provides helper functions for uploading and managing user media files.
 * Uses a pre-generated SAS token (supplied via environment variables) so
 * that the storage account key is never exposed to the browser.
 *
 * Usage:
 *   import { uploadFile, deleteFile, getFileUrl } from "@/services/azureStorage";
 */

import azureConfig from "@/config/azure.config";

const { blobServiceUrl, containerName, sasToken } = azureConfig.storage;

/**
 * Encode a blob name while preserving virtual-directory slashes.
 * Each path segment is percent-encoded individually so that paths like
 * "userId/photo.jpg" remain valid blob URLs.
 *
 * @param {string} blobName
 * @returns {string}
 */
function encodeBlobName(blobName) {
  return blobName.split("/").map(encodeURIComponent).join("/");
}

/**
 * Build the full URL for a blob, appending the SAS token when present.
 *
 * @param {string} blobName - Relative path within the container, e.g. "userId/photo.jpg"
 * @returns {string}
 */
export function getFileUrl(blobName) {
  const base = `${blobServiceUrl}/${containerName}/${encodeBlobName(blobName)}`;
  return sasToken ? `${base}?${sasToken}` : base;
}

/**
 * Upload a File or Blob to Azure Blob Storage.
 *
 * @param {File|Blob} file         - The file to upload.
 * @param {string}    blobName     - Destination path within the container.
 * @param {Function}  [onProgress] - Optional callback(percentComplete: number).
 * @returns {Promise<string>}      - Resolves to the public URL of the uploaded file.
 */
export async function uploadFile(file, blobName, onProgress) {
  if (!blobServiceUrl || !sasToken) {
    throw new Error(
      "Azure Storage is not configured. Set VITE_AZURE_STORAGE_ACCOUNT_NAME and VITE_AZURE_STORAGE_SAS_TOKEN in your environment."
    );
  }

  const url = `${blobServiceUrl}/${containerName}/${encodeBlobName(blobName)}?${sasToken}`;

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("PUT", url);
    xhr.setRequestHeader("x-ms-blob-type", "BlockBlob");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.send(file);
  });

  return getFileUrl(blobName);
}

/**
 * Delete a blob from Azure Blob Storage.
 *
 * @param {string} blobName - Path within the container, e.g. "userId/photo.jpg"
 * @returns {Promise<void>}
 */
export async function deleteFile(blobName) {
  if (!blobServiceUrl || !sasToken) {
    throw new Error("Azure Storage is not configured.");
  }

  const url = `${blobServiceUrl}/${containerName}/${encodeBlobName(blobName)}?${sasToken}`;
  const response = await fetch(url, { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
  }
}

/**
 * List blobs under a given prefix (e.g. a user's folder).
 *
 * @param {string} prefix - Blob name prefix, e.g. "userId/"
 * @returns {Promise<Array<{name: string, url: string, size: number, lastModified: Date}>>}
 */
export async function listFiles(prefix) {
  if (!blobServiceUrl || !sasToken) {
    throw new Error("Azure Storage is not configured.");
  }

  const url =
    `${blobServiceUrl}/${containerName}?restype=container&comp=list` +
    `&prefix=${encodeURIComponent(prefix)}&${sasToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`List failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");

  return Array.from(xml.querySelectorAll("Blob")).map((blob) => {
    const name = blob.querySelector("Name")?.textContent ?? "";
    return {
      name,
      url: getFileUrl(name),
      size: parseInt(blob.querySelector("Content-Length")?.textContent ?? "0", 10),
      lastModified: new Date(blob.querySelector("Last-Modified")?.textContent ?? ""),
    };
  });
}
