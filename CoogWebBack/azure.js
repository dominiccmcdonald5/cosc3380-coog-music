import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = "mp3"; // You can change this based on your container name

/**
 * Uploads a file to Azure Blob Storage.
 * 
 * @param {Buffer} fileBuffer - The file content to be uploaded.
 * @param {string} fileName - The name to assign to the uploaded blob.
 * @returns {Promise<string>} - The URL of the uploaded blob.
 */
export async function uploadToAzureBlobFromServer(fileBuffer, fileName) {
  try {
    // Create a BlobServiceClient instance from the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);

    // Get the container client for the 'mp3' container
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    // Create the container if it doesn't already exist
    await containerClient.createIfNotExists({ access: "blob" });

    // Get a BlockBlobClient to interact with a specific blob (file)
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Upload the file (buffer) to the blob
    await blockBlobClient.uploadData(fileBuffer);

    // Construct the URL to access the uploaded blob
    const blobUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${CONTAINER_NAME}/${fileName}`;

    return blobUrl;
  } catch (error) {
    console.error("Error uploading file to Azure Blob Storage:", error);
    throw new Error("Failed to upload file to Azure Blob Storage");
  }
}
