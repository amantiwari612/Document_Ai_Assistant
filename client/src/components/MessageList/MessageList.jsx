
import "./MessageList.css";

function MessageList({
    messages,
    isLoading
}) {
    return (
        <div className="messages">

            {messages.map((message) => (

                <div
                    key={message.id}
                    className={`message ${message.role}`}
                >

                    <div className="message-role">
                        {message.role === "user"
                            ? "You"
                            : "AI"}
                    </div>

                    <div className="message-content">
                        {message.content}
                    </div>

                </div>

            ))}


            {isLoading && (

                <div className="message assistant">

                    <div className="message-role">
                        AI
                    </div>

                    <div className="message-content thinking">
                        Thinking...
                    </div>

                </div>

            )}

        </div>
    );
}

export default MessageList;

