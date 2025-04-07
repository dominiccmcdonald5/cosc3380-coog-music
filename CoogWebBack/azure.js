const { BlobServiceClient } = require("@azure/storage-blob");

const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = "mp3";

async function uploadToAzureBlobFromServer(fileBuffer, fileName) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    await containerClient.createIfNotExists({ access: "blob" });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadData(fileBuffer);

    return `https://musiccontainer.blob.core.windows.net/${CONTAINER_NAME}/${fileName}`;

}

module.exports = { uploadToAzureBlobFromServer };