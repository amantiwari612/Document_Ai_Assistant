import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import ChatArea from "./components/ChatArea/ChatArea";
import UploadModal from "./components/UploadModel/UploadModule";
import { fetchDocuments, uploadDocument, sendMessage, deleteDocument } from "./api/api";
import "./App.css";

function App() {
  const [documents, setDocuments] = useState([]);
  const [isDocsLoaded, setIsDocsLoaded] = useState(false); 

  const [activeChatId, setActiveChatId] = useState(null);
  const [activeDocumentId, setActiveDocumentId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // 1. Initialize chats from localStorage
  const [chats, setChats] = useState(() => {
    try {
      const savedChats = localStorage.getItem("rag_app_chats");
      return savedChats ? JSON.parse(savedChats) : [];
    } catch (error) {
      console.error("Failed to parse chats from localStorage:", error);
      return [];
    }
  });

  // 2. FETCH DOCUMENTS FROM BACKEND ON MOUNT
  useEffect(() => {
    async function loadInitialData() {
      try {
        const docs = await fetchDocuments();
        setDocuments(docs || []);

        if (docs && docs.length > 0 && !activeDocumentId) {
          setActiveDocumentId(docs[0].id);
        }
      } catch (error) {
        console.error("Error loading initial documents:", error);
      } finally {
        setIsDocsLoaded(true);
      }
    }
    loadInitialData();
  }, []);

  // 3. SAFE AUTO-CLEANUP (Runs ONLY AFTER documents have finished loading)
  useEffect(() => {
    if (!isDocsLoaded) return; // Prevent race condition on page refresh!

    const validDocIds = new Set(documents.map((doc) => doc.id));

    setChats((prevChats) => {
      const validChats = prevChats.filter(
        (chat) => !chat.documentId || validDocIds.has(chat.documentId)
      );

      return validChats;
    });
  }, [documents, isDocsLoaded]);

  // 4. SYNC CHATS TO LOCALSTORAGE (Only after initial document load finishes)
  useEffect(() => {
    if (!isDocsLoaded) return;
    localStorage.setItem("rag_app_chats", JSON.stringify(chats));
  }, [chats, isDocsLoaded]);

  // Reset activeChatId if the active chat was deleted/purged
  useEffect(() => {
    if (activeChatId && !chats.some((c) => c.id === activeChatId)) {
      setActiveChatId(null);
    }
  }, [chats, activeChatId]);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  // 5. HANDLE SELECTING / CREATING A CHAT
  function handleSelectDocument(doc) {
    const existingChat = chats.find((c) => c.documentId === doc.id);
    if (existingChat) {
      setActiveChatId(existingChat.id);
      setActiveDocumentId(doc.id);
      return;
    }

    const newChat = {
      id: `chat-${Date.now()}`,
      documentId: doc.id,
      filename: doc.filename,
      title: `Chat about ${doc.filename}`,
      messages: []
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setActiveDocumentId(doc.id);
  }

  // 6. DELETE INDIVIDUAL CHAT SESSION
  function handleDeleteChat(chatId) {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  }

  // 7. DELETE DOCUMENT AND ASSOCIATED CHATS
  async function handleDeleteDocument(documentId) {
    try {
      await deleteDocument(documentId);

      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      setChats((prev) => prev.filter((chat) => chat.documentId !== documentId));

      if (activeDocumentId === documentId) {
        setActiveDocumentId(null);
        setActiveChatId(null);
      }
    } catch (error) {
      console.error("Delete document error:", error);
    }
  }

  // 8. SEND MESSAGE
  async function handleSendMessage(message) {
    if (!activeChatId || isLoading || !activeChat) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: message
    };

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

  // 9. HANDLE UPLOAD
  async function handleUploadFile(file) {
    try {
      const result = await uploadDocument(file);
      const newDoc = result.document;

      setDocuments((prev) => [...prev, newDoc]);
      handleSelectDocument(newDoc);
    } catch (error) {
      console.error("Upload error in UI:", error);
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
        onDeleteChat={handleDeleteChat}
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