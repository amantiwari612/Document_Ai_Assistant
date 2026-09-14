
import { useState } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import ChatArea from "./components/ChatArea/ChatArea";

import "./App.css";
import { sendMessage } from "./api/api";

function App() {

    /*
     * =========================================
     * DOCUMENTS
     * =========================================
     */

    const [documents] = useState([
        {
            id: "doc-1",
            filename: "sample-tables.pdf"
        },
        {
            id: "doc-2",
            filename: "index.pdf"
        }
    ]);


    /*
     * =========================================
     * CHATS
     * =========================================
     */

    const [chats, setChats] = useState([
        {
            id: "chat-1",
            documentId: "doc-1",
            filename: "sample-tables.pdf",
            title: "What is Table 2?",

            messages: [
                {
                    id: "msg-1",
                    role: "user",
                    content: "What is Table 2?"
                },
                {
                    id: "msg-2",
                    role: "assistant",
                    content:
                        "Table 2 contains information about expenditure by function for 2009/10 and 2010/11."
                }
            ]
        },

        {
            id: "chat-2",
            documentId: "doc-1",
            filename: "sample-tables.pdf",
            title: "How many tables are there?",

            messages: [
                {
                    id: "msg-3",
                    role: "user",
                    content:
                        "How many tables are there?"
                },
                {
                    id: "msg-4",
                    role: "assistant",
                    content:
                        "There are 29 tables in the document."
                }
            ]
        },

        {
            id: "chat-3",
            documentId: "doc-2",
            filename: "index.pdf",
            title: "Give me a summary",

            messages: [
                {
                    id: "msg-5",
                    role: "user",
                    content:
                        "Give me a summary"
                },
                {
                    id: "msg-6",
                    role: "assistant",
                    content:
                        "Here is the document summary..."
                }
            ]
        }
    ]);


    /*
     * =========================================
     * ACTIVE CHAT
     * =========================================
     */

    const [activeChatId, setActiveChatId] =
        useState("chat-1");

    const [isLoading,setIsLoading]=useState(false);
    const [darkMode, setDarkMode] = useState(false);

    function handleToggleTheme() {
        setDarkMode((previous) => !previous);
    }
    /*
     * =========================================
     * ACTIVE CHAT OBJECT
     * =========================================
     */

    const activeChat = chats.find(
        (chat) => chat.id === activeChatId
    );


    /*
     * =========================================
     * SELECT CHAT
     * =========================================
     */

    function handleSelectChat(chatId) {

        setActiveChatId(chatId);

    }


    /*
     * =========================================
     * NEW CHAT
     * =========================================
     */

    function handleNewChat() {

        setActiveChatId(null);

    }


    /*
     * =========================================
     * SELECT DOCUMENT
     * =========================================
     */

    function handleSelectDocument(document) {

        const newChat = {
            id: `chat-${Date.now()}`,

            documentId: document.id,

            filename: document.filename,

            title: "New conversation",

            messages: []
        };


        setChats((previousChats) => [
            newChat,
            ...previousChats
        ]);


        setActiveChatId(newChat.id);

    }


    /*
     * =========================================
     * SEND MESSAGE
     * =========================================
     */

   async function handleSendMessage(message) {

    if (!activeChatId || isLoading) {
        return;
    }

    const userMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: message
    };

    // Add user's message immediately
    setChats((previousChats) => {

        return previousChats.map((chat) => {

            if (chat.id !== activeChatId) {
                return chat;
            }

            return {
                ...chat,

                title:
                    chat.messages.length === 0
                        ? message
                        : chat.title,

                messages: [
                    ...chat.messages,
                    userMessage
                ]
            };

        });

    });


    // Start loading
    setIsLoading(true);


    try {

        const response = await sendMessage(message);



        if (!response) {
            throw new Error(
                `Request failed: `
            );
        }


        // const data = await response.json();


        const assistantMessage = {
            id: `msg-${Date.now()}-assistant`,
            role: "assistant",
            content:
                response.answer ??
                "No answer was returned."
        };


        setChats((previousChats) => {

            return previousChats.map((chat) => {

                if (chat.id !== activeChatId) {
                    return chat;
                }

                return {
                    ...chat,

                    messages: [
                        ...chat.messages,
                        assistantMessage
                    ]
                };

            });

        });

    } catch (error) {

        console.error(
            "Failed to send message:",
            error
        );


        const errorMessage = {
            id: `msg-${Date.now()}-error`,
            role: "assistant",
            content:
                "Sorry, something went wrong while getting the answer."
        };


        setChats((previousChats) => {

            return previousChats.map((chat) => {

                if (chat.id !== activeChatId) {
                    return chat;
                }

                return {
                    ...chat,

                    messages: [
                        ...chat.messages,
                        errorMessage
                    ]
                };

            });

        });

    } finally {

        // Stop loading whether request
        // succeeded or failed.
        setIsLoading(false);

    }
}


    /*
     * =========================================
     * UPLOAD
     * =========================================
     */

    function handleUpload() {

        console.log("Upload document");

    }


    return (
        <div className={`app ${darkMode ? "dark" : ""}`}>

            <Sidebar
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                darkMode={darkMode}
                onToggleTheme={handleToggleTheme}
            />


            <ChatArea
                chat={activeChat}
                documents={documents}
                onSelectDocument={handleSelectDocument}
                onUpload={handleUpload}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
            />

        </div>
    );
}

export default App;

