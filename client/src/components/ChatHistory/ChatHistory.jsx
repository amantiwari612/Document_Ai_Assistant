
import "./ChatHistory.css";

function ChatHistory({
    chats,
    activeChatId,
    onSelectChat
}) {
    return (
        <div className="chat-history">

            <div className="section-title">
                CHAT HISTORY
            </div>

            <div className="chat-list">

                {chats.map((chat) => (

                    <div
                        key={chat.id}
                        className={`chat-item ${
                            chat.id === activeChatId
                                ? "active"
                                : ""
                        }`}
                        onClick={() => onSelectChat(chat.id)}
                    >

                        <div className="chat-item-icon">
                            📄
                        </div>

                        <div className="chat-item-content">

                            <div className="chat-title">
                                {chat.title}
                            </div>

                            <div className="chat-document">
                                {chat.filename}
                            </div>

                        </div>

                        <button
                            className="chat-menu"
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                        >
                            ⋮
                        </button>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default ChatHistory;

