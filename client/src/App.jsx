import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import ChatArea from "./components/ChatArea/ChatArea";
// import UploadModal from "./components/UploadModal/UploadModal";

import { fetchDocuments, uploadDocument, deleteDocument, sendMessage } from "./api/api";
import "./App.css";
import UploadModal from "./components/UploadModel/UploadModule";

function App() {
  const [documents, setDocuments] = useState([]);

  const [activeChatId, setActiveChatId] = useState(null);
  const [activeDocumentId, setActiveDocumentId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // 1. FETCH DOCUMENTS FROM POSTGRESQL ON INITIAL RENDER
  const [chats, setChats] = useState(() => {
    try {
      const savedChats = localStorage.getItem("rag_app_chats");
      return savedChats ? JSON.parse(savedChats) : [];
    } catch (error) {
      console.error("Failed to parse chats from localStorage:", error);
      return [];
    }
  });

  // 2. Persist chats to localStorage whenever they update
  useEffect(() => {
    localStorage.setItem("rag_app_chats", JSON.stringify(chats));
  }, [chats]);
  useEffect(() => {
    async function loadInitialData() {
      try {
        const docs = await fetchDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Error loading initial documents:", error);
      }
    }
    loadInitialData();
  }, []);

  const activeChat = chats.find((chat) => chat.id === activeChatId);
useEffect(() => {
    async function loadDocuments() {
      try {
        const response = await fetch("http://localhost:3000/api/document");
        const data = await response.json();

        if (response.ok && data.documents) {
          setDocuments(data.documents);
          
          // Default to the first document if available
          if (data.documents.length > 0 && !activeDocumentId) {
            setActiveDocumentId(data.documents[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load document history on mount:", error);
      }
    }

    loadDocuments();
  }, []);
  // 2. HANDLE SELECTING/CREATING A CHAT FOR A DOCUMENT
  function handleSelectDocument(doc) {
    const newChat = {
      id: `chat-${Date.now()}`,
      documentId: doc.id,
      filename: doc.filename,
      title: `Chat about ${doc.filename}`,
      messages: []
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }

  // 3. HANDLE PDF UPLOAD
  async function handleUploadFile(file) {
    const result = await uploadDocument(file);
    const newDoc = result.document;

    // Add to sidebar document state
    setDocuments((prev) => [...prev, newDoc]);

    // Create a new scoped chat for this document
    handleSelectDocument(newDoc);
  }

  // 4. HANDLE DOCUMENT DELETION
 async function handleDeleteDocument(documentId) {
    try {
      const response = await fetch(`http://localhost:3000/api/documents/${documentId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
        if (activeDocumentId === documentId) {
          setActiveDocumentId(null);
        }
      }
    } catch (error) {
      console.error("Delete document error:", error);
    }
  }

  // 5. HANDLE SENDING MESSAGE (SCOPED TO ACTIVE DOCUMENT ID)
  async function handleSendMessage(message) {
    if (!activeChatId || isLoading || !activeChat) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: message
    };

    // Update UI immediately with user prompt
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChatId) return chat;
        return {
          ...chat,
          title: chat.messages.length === 0 ? message : chat.title,
          messages: [...chat.messages, userMessage]
        };
      })
    );

    setIsLoading(true);

    try {
      // Pass activeChat.documentId into backend RAG query
      const response = await sendMessage(message, 5, activeChat.documentId);

      const assistantMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: response.answer || "No response returned.",
        sources: response.sources || []
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== activeChatId) return chat;
          return {
            ...chat,
            messages: [...chat.messages, assistantMessage]
          };
        })
      );
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "An error occurred while generating the answer."
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== activeChatId) return chat;
          return {
            ...chat,
            messages: [...chat.messages, errorMessage]
          };
        })
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadFile}
      />

      <Sidebar
        chats={chats}
        documents={documents}
        activeChatId={activeChatId}
        onSelectChat={(id) => setActiveChatId(id)}
        onNewChat={() => setActiveChatId(null)}
        onSelectDocument={handleSelectDocument}
        onDeleteDocument={handleDeleteDocument}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
      />

      <ChatArea
        chat={activeChat}
        documents={documents}
        onSelectDocument={handleSelectDocument}
        onUpload={() => setIsModalOpen(true)}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;