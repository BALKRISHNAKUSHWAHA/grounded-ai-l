# ResearchHub AI

> AI-Powered Research & Knowledge Discovery Platform

ResearchHub AI is a full-stack web application that accelerates research workflows by 10x. Researchers, students, and professionals can ingest sources, query documents using RAG & Gemini AI, synthesize literature reviews, extract key findings, generate citation-ready bibliographies, and export structured reports.

---

## ✨ Features

- **🔐 Secure Authentication** — JWT-based auth with bcrypt password hashing
- **📄 Multi-Source Ingestion** — Upload PDFs, paste text, or add web URLs
- **🧠 Smart Document Processing** — Automatic text extraction, semantic chunking
- **💬 AI Research Chat (RAG)** — Context-aware chat over your documents with source citations
- **📊 Literature Synthesis** — AI-generated comparison matrices across multiple papers
- **📝 Citation Generator** — APA, MLA, Chicago, and BibTeX citation formats
- **📦 Export Hub** — Export reports as Markdown, JSON, or BibTeX

## 🏗 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18 (Vite), React Router v6, Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express.js, JWT, bcrypt, Zod, Multer |
| **Database** | PostgreSQL with UUID primary keys |
| **AI Engine** | Google Gemini API (`gemini-2.5-flash`) via `@google/genai` SDK |

## 📁 Project Structure

```
researchhub-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & environment configuration
│   │   ├── controllers/     # Route handlers (auth, projects, sources, chat, synthesis, export)
│   │   ├── middleware/       # JWT auth & Zod validation middleware
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Business logic (Gemini AI, chunking, citations)
│   │   ├── validators/       # Zod validation schemas
│   │   └── server.js         # Express server entry point
│   ├── uploads/              # Uploaded PDF storage
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route page components
│   │   ├── services/         # API client (Axios)
│   │   ├── context/          # React context (Auth)
│   │   ├── App.jsx           # Router setup
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── schema.sql            # PostgreSQL schema
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+
- **Google Gemini API Key** — Get one at [Google AI Studio](https://aistudio.google.com/)

### 1. Database Setup

```bash
# Create the database
createdb researchhub

# Run the schema
psql -d researchhub -f database/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env with your actual values:
#   DATABASE_URL=postgresql://user:password@localhost:5432/researchhub
#   JWT_SECRET=your_secure_random_secret
#   GEMINI_API_KEY=your_gemini_api_key

# Start the server
npm run dev
```

The backend runs on **http://localhost:5000**.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend runs on **http://localhost:5173** with API proxy to the backend.

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port (default: 5000) | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `CORS_ORIGIN` | Allowed CORS origin (default: http://localhost:5173) | No |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login and get JWT |
| `GET` | `/api/auth/profile` | Get current user profile |
| `GET` | `/api/projects` | List user's projects |
| `POST` | `/api/projects` | Create a project |
| `GET` | `/api/projects/:id` | Get project details |
| `DELETE` | `/api/projects/:id` | Delete a project |
| `POST` | `/api/projects/:id/sources` | Add source (PDF/text/URL) |
| `GET` | `/api/projects/:id/sources` | List project sources |
| `POST` | `/api/projects/:id/chat` | Send RAG chat message |
| `GET` | `/api/projects/:id/chat` | Get chat history |
| `POST` | `/api/projects/:id/synthesize` | Generate literature synthesis |
| `GET` | `/api/projects/:id/synthesis` | List synthesis reports |
| `POST` | `/api/projects/:id/export` | Export project data |

## 🎯 Research Domains

- Computer Science & AI
- Biomedical & Life Sciences
- Social Sciences & Economics
- Physical Sciences & Engineering
- General & Interdisciplinary

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

