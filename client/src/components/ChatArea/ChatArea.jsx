
import ChatHeader from "../ChatHeader/ChatHeader";
import MessageList from "../MessageList/MessageList";
import NewChat from "../NewChat/NewChat";

import "./ChatArea.css";

function ChatArea({
    chat,
    documents,
    onSelectDocument,
    onUpload,
    onSendMessage,
    isLoading
}) {

    if (!chat) {
        return (
            <main className="chat-area">

                <NewChat
                    documents={documents}
                    onSelectDocument={onSelectDocument}
                    onUpload={onUpload}
                />

            </main>
        );
    }

    return (
        <main className="chat-area">

            <ChatHeader
                filename={chat.filename}
            />

            <MessageList
                messages={chat.messages}
                isLoading={isLoading}
            />

            <div className="composer-container">

                <form
                    className="composer"
                    onSubmit={(event) => {

                        event.preventDefault();

                        if (isLoading) {
                            return;
                        }

                        const input =
                            event.currentTarget.elements.message;

                        const message =
                            input.value.trim();

                        if (!message) {
                            return;
                        }

                        onSendMessage(message);

                        input.value = "";
                    }}
                >

                    <input
                        name="message"
                        type="text"
                        placeholder={
                            isLoading
                                ? "AI is thinking..."
                                : "Ask something about this document..."
                        }
                        disabled={isLoading}
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Thinking..." : "Send"}
                    </button>

                </form>

            </div>

        </main>
    );
}

export default ChatArea;

