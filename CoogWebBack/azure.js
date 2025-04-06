// utils/azureUploader.js
import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = "mp3";

/**
 * Uploads a file buffer to Azure Blob Storage.
 * @param {Buffer} fileBuffer - The file content as a Buffer.
 * @param {string} fileName - The blob name (including extension).
 * @returns {Promise<string>} - The public URL of the uploaded file.
 */
export async function uploadToAzureBlobFromServer(fileBuffer, fileName) {
  if (!AZURE_CONNECTION_STRING) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not defined.");
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    await containerClient.createIfNotExists({ access: "blob" });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadData(fileBuffer);

    const blobUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${CONTAINER_NAME}/${fileName}`;
    return blobUrl;
  } catch (err) {
    console.error("Failed to upload to Azure Blob:", err);
    throw err;
  }
}
