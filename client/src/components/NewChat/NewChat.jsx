
import "./NewChat.css";

function NewChat({
    documents,
    onSelectDocument,
    onUpload
}) {
    return (
        <div className="new-chat-screen">

            <div className="new-chat-content">

                <h1>
                    Start a new chat
                </h1>

                <p className="new-chat-description">
                    Select a document to start a new
                    conversation.
                </p>


                {/* Upload new document */}

                <button
                    className="upload-document"
                    onClick={onUpload}
                >
                    <span className="upload-icon">
                        +
                    </span>

                    <span>
                        Upload new document
                    </span>
                </button>


                <div className="new-chat-divider">
                    <span>OR</span>
                </div>


                {/* Existing documents */}

                <div className="existing-documents">

                    <div className="existing-documents-title">
                        Select an existing document
                    </div>


                    <div className="document-list">

                        {documents.map((document) => (

                            <button
                                key={document.id}
                                className="document-option"
                                onClick={() =>
                                    onSelectDocument(document)
                                }
                            >

                                <span className="document-icon">
                                    📄
                                </span>

                                <span className="document-info">

                                    <span className="document-name">
                                        {document.filename}
                                    </span>

                                    <span className="document-action">
                                        Start new chat
                                    </span>

                                </span>

                            </button>

                        ))}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default NewChat;

