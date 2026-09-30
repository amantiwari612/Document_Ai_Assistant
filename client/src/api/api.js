const API_BASE = "http://localhost:3000/api";

/**
 * Fetch all available uploaded documents from PostgreSQL on application mount
 */
export async function fetchDocuments() {
  const response = await fetch(`${API_BASE}/documents`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch documents.");
  }

  return data.documents || [];
}

/**
 * Upload a PDF file to the backend processing pipeline
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload document.");
  }

  return data;
}

/**
 * Delete a document and its stored chunks from PostgreSQL
 */
export async function deleteDocument(documentId) {
  const response = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete document.");
  }

  return data;
}

/**
 * Send chat message scoped to a specific document ID
 */
export async function sendMessage(message, limit = 5, documentId = null) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      limit,
      documentId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to send message.");
  }

  return data;
}