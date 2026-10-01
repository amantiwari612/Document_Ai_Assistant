Document AI Assistant

An AI-powered document assistant that allows users to upload documents and interact with them using natural language. The system processes document content and uses AI to answer questions, summarize information, and help users quickly understand their documents.

🚀 Features

📄 Upload and process documents

🤖 Ask questions about uploaded documents

🔍 Search and retrieve relevant document information

📝 Generate document summaries

💬 Natural-language interaction with documents

⚡ Fast and user-friendly interface

🔐 Designed with secure document processing in mind

📁 Project Structure

Update the structure below according to your actual project folders.
```
Document_Ai_Assistant/
│
├── client/                     # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
|----                    # Node.js + Express backend
│   ├── src/
│   │   ├── api/
│   │   ├── jobs/
│   │   └── ...
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```
⚙️ Installation
1. Clone the repository
```
git clone git@github.com:amantiwari612/Document_Ai_Assistant.git
cd Document_Ai_Assistant
```

3. Install dependencies

Install the dependencies for both the frontend and backend.

Backend
```
npm install
```
Frontend

Open another terminal:
```
cd client
npm install
```

🔐 3. Configure Environment Variables
Backend

Create a .env file inside the server directory:
```
DB_HOST=your_database_host
DB_PORT=5432
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_API_KEY=your_ollama_api_key
OLLAMA_MODEL=your_ollama_model
```
Frontend

Create a .env file inside the client directory:

```
VITE_API_URL=http://localhost:3000
```

Note: Never commit .env files or API keys to GitHub.

Make sure .env is included in your .gitignore:
```
.env
.env.*
!.env.example
```
▶️ 4. Run the Application

Start the Backend

From the server directory:
```
npm run dev
```

Or:
```
npm start
```

The backend will run on:

http://localhost:3000

Start the Frontend

From the client directory:
```
npm run dev
```

Vite will provide the local frontend URL in the terminal, usually:

http://localhost:5173

🧠 Backend Services

Before starting the backend, make sure the required services are running:

PostgreSQL database

Ollama

Required Ollama model

The backend performs startup checks for PostgreSQL and Ollama before starting the Express server.

🖥️ UI
Document Upload
<img width="803" height="498" alt="Document Upload" src="https://github.com/user-attachments/assets/d32336f4-7a0a-416f-8ab3-e94d416494ff" />
Document Assistant
<img width="1912" height="922" alt="Document Assistant" src="https://github.com/user-attachments/assets/f2a57fd4-27be-4071-aa41-10dbbadcf9bd" />
Document Search
<img width="1912" height="920" alt="Document Search" src="https://github.com/user-attachments/assets/bf6e2661-8974-48e1-8a80-e378b1a3d67d" />
👨‍💻 Author

Aman Tiwari
