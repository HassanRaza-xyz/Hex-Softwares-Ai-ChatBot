# 🤖 ChaatBot — AI-Powered MERN Chatbot

A modern, full-stack AI chatbot built with the MERN stack (MongoDB, Express, React, Node.js) and powered by **Google Gemini API**.

##  Features

- **Dark glassmorphism UI** with animated background orbs
- **Real-time AI responses** with shimmer loading effects
- **Multi-turn conversations** with full context memory
- **Chat history** saved to MongoDB, shown in sidebar
- **Markdown rendering** with syntax-highlighted code blocks
- **Copy-to-clipboard** for code responses
- **Model switching** between Gemini Flash and Pro
- **Mobile responsive** with slide-out sidebar overlay
- **Rate limiting**, helmet, and CORS security

## 🏗️ Folder Structure

```
CHAATBOT/
├── frontend/                  # React + Vite + Tailwind v4
│   └── src/
│       ├── components/
│       │   ├── ChatWindow.jsx  ← Main chat UI (hero component)
│       │   ├── ChatInput.jsx   ← Auto-resize textarea
│       │   ├── MessageBubble.jsx ← Markdown-rendered messages
│       │   ├── Sidebar.jsx     ← History + model selector
│       │   └── TypingIndicator.jsx ← Shimmer loading
│       ├── services/
│       │   └── api.js          ← Axios API client
│       ├── store/
│       │   └── useChatStore.jsx ← Context + useReducer state
│       └── index.css           ← Design system + animations
└── backend/                   # Node.js + Express
    ├── server.js               ← Entry point with all middleware
    └── src/
        ├── config/db.js        ← MongoDB connection
        ├── models/Conversation.js ← Mongoose schema
        ├── routes/chatRoutes.js   ← REST API endpoints
        └── services/geminiService.js ← Gemini API wrapper
```

## 🚀 Quick Start

### 1. Get a Gemini API Key
Visit [Google AI Studio](https://aistudio.google.com/app/apikey) → Create API Key → Copy it.

### 2. Configure Backend
```bash
cd backend
# Edit .env and paste your API key:
# GEMINI_API_KEY=AIza...your_key_here
```

### 3. Start Backend
```bash
cd backend
npm run dev
# → Server running on http://localhost:5000
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
# → App running on http://localhost:5173
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/message` | Send message → get AI reply |
| `GET`  | `/api/chat/conversations` | List all conversations |
| `GET`  | `/api/chat/:sessionId` | Get conversation history |
| `DELETE` | `/api/chat/:sessionId` | Delete a conversation |
| `GET`  | `/api/health` | Server health check |

## 🌍 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/chaatbot
GEMINI_API_KEY=your_key_here
CLIENT_URL=http://localhost:5173
```

> **MongoDB is optional for demo** — if not installed, chat works but history won't persist.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Google Gemini 1.5 Flash / 2.0 Flash |
| HTTP | Axios with interceptors |
| State | React Context + useReducer |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |
