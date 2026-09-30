import { useState, useRef } from "react";
import "./UploadModel.css";

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  function handleFileSelect(selectedFile) {
    setError(null);
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF document.");
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setError("File size exceeds 25MB limit.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleConfirmUpload() {
    if (!file || isUploading) return;

    setIsUploading(true);
    setError(null);

    try {
      await onUploadSuccess(file);
      setFile(null);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to upload and process PDF.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Upload PDF Document</h3>
          <button className="close-btn" onClick={onClose} disabled={isUploading}>
            ✕
          </button>
        </div>

        <div
          className={`drop-zone ${file ? "has-file" : ""}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files[0])}
            accept=".pdf"
            style={{ display: "none" }}
          />

          {!file ? (
            <div className="drop-zone-prompt">
              <span className="upload-icon">📄</span>
              <p>Click to select or drag a PDF document here</p>
              <small>Maximum size: 25MB</small>
            </div>
          ) : (
            <div className="file-preview">
              <span className="file-icon">📑</span>
              <div className="file-details">
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          )}
        </div>

        {error && <div className="upload-error">{error}</div>}

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleConfirmUpload} disabled={!file || isUploading}>
            {isUploading ? "Chunking & Embedding..." : "Process Document"}
          </button>
        </div>
      </div>
    </div>
  );
}