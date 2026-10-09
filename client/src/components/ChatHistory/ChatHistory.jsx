import React from "react";
import { FiMessageSquare, FiX } from "react-icons/fi";
import "./ChatHistory.css";

function ChatHistory({
    chats,
    activeChatId,
    onSelectChat,
    onDeleteChat
}) {
    const handleDelete = (event, chatId) => {
        event.stopPropagation(); // Prevents opening the chat when clicking delete
        if (onDeleteChat) {
            onDeleteChat(chatId);
        }
    };

    return (
        <div className="chat-history">
            <div className="section-title">
                CHAT HISTORY
            </div>

            <div className="chat-list">
                {chats.length === 0 ? (
                    <div className="no-chats">No active chats</div>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`chat-item ${
                                chat.id === activeChatId ? "active" : ""
                            }`}
                            onClick={() => onSelectChat(chat.id)}
                        >
                            <div className="chat-item-icon">
                                <FiMessageSquare size={16} />
                            </div>

                            <div className="chat-item-content">
                                <div className="chat-title" title={chat.title}>
                                    {chat.title}
                                </div>
                                <div className="chat-document">
                                    {chat.filename}
                                </div>
                            </div>

                            {/* Direct Close / Delete Button */}
                            <button
                                className="chat-delete-btn"
                                onClick={(e) => handleDelete(e, chat.id)}
                                title="Delete chat"
                                aria-label="Delete chat"
                            >
                                <FiX size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ChatHistory;