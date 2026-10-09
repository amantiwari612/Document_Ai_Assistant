// src/utils/clientId.js
export function getClientId() {
  let clientId = localStorage.getItem("rag_client_id");
  
  if (!clientId) {
    // Generate a unique ID for this browser instance
    clientId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("rag_client_id", clientId);
  }
  
  return clientId;
}