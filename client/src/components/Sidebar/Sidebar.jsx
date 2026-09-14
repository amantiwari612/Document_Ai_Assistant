
import ChatHistory from "../ChatHistory/ChatHistory";
import "./Sidebar.css";

function Sidebar({
    chats,
    activeChatId,
    onSelectChat,
    onNewChat,
    darkMode,
    onToggleTheme
}) {
    return (
        <aside className="sidebar">

            <div className="sidebar-header">

                <h2>RAG AI</h2>

            </div>


            <button
                className="new-chat"
                onClick={onNewChat}
            >
                <span className="new-chat-icon">
                    +
                </span>

                <span>
                    New Chat
                </span>
            </button>


            <ChatHistory
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={onSelectChat}
            />


            <div className="sidebar-footer">

                <button
                    className="theme-toggle"
                    onClick={onToggleTheme}
                >

                    <span className="theme-icon">
                        {darkMode ? "☀️" : "🌙"}
                    </span>

                    <span>
                        {darkMode
                            ? "Light Mode"
                            : "Dark Mode"}
                    </span>

                </button>

            </div>

        </aside>
    );
}

export default Sidebar;

