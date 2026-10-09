// src/api/api.js
import { getClientId } from "../utils/clientId.js";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;

function getHeaders(extraHeaders = {}) {
  return {
    "x-client-id": getClientId(),
    ...extraHeaders,
  };
}

/**
 * Helper to safely parse JSON responses or throw meaningful backend errors
 */
async function handleResponse(response) {
  const text = await response.text();
  let data = {};
  
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: text || "Invalid JSON returned from server." };
    }
  }

  if (!response.ok) {
    throw new Error(data.error || `Server responded with status ${response.status}`);
  }

  return data;
}

/**
 * Fetch all available uploaded documents for THIS computer
 */
export async function fetchDocuments() {
  const response = await fetch(`${API_BASE}/document`, { // Plural /documents
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);
  return data.documents || [];
}

/**
 * Upload a PDF file attached to this computer's client ID
 */
export async function uploadDocument(file) {
  const clientId = getClientId();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("clientId", clientId);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: getHeaders(), // Do NOT set Content-Type header manually for FormData!
    body: formData,
  });

  return await handleResponse(response);
}

/**
 * Delete a document and its vector chunks
 */
export async function deleteDocument(documentId) {
  const response = await fetch(`${API_BASE}/document/${documentId}`, { // Plural /documents
    method: "DELETE",
    headers: getHeaders(),
  });

  return await handleResponse(response);
}

/**
 * Send chat message
 */
export async function sendMessage(message, limit = 5, documentId = null) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      message,
      limit,
      documentId,
      clientId: getClientId(),
    }),
  });

  return await handleResponse(response);
}

/**
 * Clear full session data
 */
export async function clearSessionData() {
  const response = await fetch(`${API_BASE}/document/session`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);
  localStorage.removeItem("rag_app_chats");
  return data;
}