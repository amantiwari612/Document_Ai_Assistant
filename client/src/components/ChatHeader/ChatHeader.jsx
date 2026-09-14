
import "./ChatHeader.css";

function ChatHeader({ filename }) {
    return (
        <header className="chat-header">

            <div className="chat-header-left">

                <div className="header-document-icon">
                    📄
                </div>

                <div>

                    <div className="header-title">
                        {filename}
                    </div>

                    <div className="header-subtitle">
                        Document Assistant
                    </div>

                </div>

            </div>

        </header>
    );
}

export default ChatHeader;

