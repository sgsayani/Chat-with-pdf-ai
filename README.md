# 📄 ChatPDF — AI-Powered PDF Chat Application

> Upload any PDF and have a real conversation with it. Get instant answers, summaries, and deep insights powered by Google Gemini and Pinecone vector search.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat-square&logo=google)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-00C4A0?style=flat-square)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1c3c3c?style=flat-square)

---

## ✨ What is ChatPDF?

ChatPDF is a full-stack AI SaaS application that lets you upload PDF documents and instantly start an intelligent conversation with them. It uses a **Retrieval-Augmented Generation (RAG)** pipeline to extract meaning from your documents and answer questions with pinpoint accuracy — not just keyword matching.

Whether it's a 100-page research paper, a legal contract, or a textbook chapter, ChatPDF understands context and gives you real answers.

---

## 🚀 Live Features

| Feature | Description |
|---|---|
| 📤 **PDF Upload & Processing** | Drag-and-drop PDF upload with real-time progress tracking |
| 🤖 **AI Chat (Streaming)** | Token-by-token streaming responses via Google Gemini |
| 📚 **RAG Pipeline** | Semantic chunking → embedding → vector search → contextual answers |
| 📄 **Real PDF Viewer** | In-browser iframe viewer with zoom controls |
| 💬 **Persistent Chat History** | Conversations saved per-document, survive page navigation |
| 🔍 **Document Search** | Live filtering of uploaded documents by name |
| 🔐 **Auth (Login/Signup)** | Full login/signup flow with route protection |
| 🌙 **Dark/Light Mode** | System-aware theme switching |
| 📋 **Share Button** | Web Share API with clipboard fallback |
| ⬇️ **PDF Download** | One-click download of any uploaded document |
| 🗑️ **Document Management** | Add, view, and delete documents from your library |

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│   Next.js 16 (App Router) + TypeScript + Tailwind CSS v4   │
│   shadcn/ui components · Dark/Light mode · Streaming UI     │
└────────────────────┬────────────────────────────────────────┘
                     │ API Routes (Next.js)
          ┌──────────┴──────────┐
          │                     │
┌─────────▼────────┐   ┌────────▼────────┐
│  /api/upload-pdf  │   │   /api/chat     │
│                   │   │                 │
│ 1. Parse PDF      │   │ 1. Embed query  │
│ 2. Chunk text     │   │ 2. Pinecone     │
│ 3. Embed chunks   │   │    similarity   │
│ 4. Store vectors  │   │    search       │
└─────────┬────────┘   │ 3. Build prompt  │
          │             │ 4. Gemini LLM   │
          │             │ 5. Stream back   │
          ▼             └────────┬────────┘
┌──────────────────┐            │
│  Pinecone Index  │◄───────────┘
│  (3072-dim       │
│   cosine, AWS)   │
└──────────────────┘

Embedding Model:   gemini-embedding-001  (3072 dimensions)
LLM:               gemini-2.5-flash-lite (streaming)
Vector DB:         Pinecone (serverless, AWS us-east-1)
PDF Parsing:       LangChain WebPDFLoader + pdf-parse v1
Text Splitting:    RecursiveCharacterTextSplitter (1000/200)
```

### Core Libraries

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 App Router (Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **AI / LLM** | `@langchain/google-genai` + Google Gemini API |
| **Embeddings** | `@google/generative-ai` (gemini-embedding-001) |
| **Vector DB** | Pinecone SDK v5 (serverless) |
| **RAG Chain** | LangChain LCEL (LangChain Expression Language) |
| **PDF Parsing** | `@langchain/community` WebPDFLoader + `pdf-parse@1` |
| **State** | React hooks + localStorage (no external state lib) |

---

## 📂 Project Structure

```
chat-with-pdf/
├── app/
│   ├── api/
│   │   ├── upload-pdf/route.ts   # PDF processing + embedding pipeline
│   │   └── chat/route.ts         # RAG chat with streaming response
│   ├── chat/[id]/page.tsx        # Chat page (PDF viewer + AI chat)
│   ├── login/page.tsx            # Login page
│   ├── signup/page.tsx           # Signup page
│   └── page.tsx                  # Dashboard (document library)
│
├── components/
│   ├── upload-zone.tsx           # Drag-drop upload (inline + modal)
│   ├── document-card.tsx         # Document grid card
│   ├── sidebar.tsx               # Left sidebar with doc list + user
│   └── navbar.tsx                # Top nav with search
│
├── hooks/
│   ├── use-documents.ts          # localStorage doc state + events
│   └── use-auth.ts               # localStorage auth hook
│
├── lib/
│   ├── langchain.ts              # LCEL RAG chain builder
│   ├── vector-store.ts           # Pinecone read/write with Gemini embeddings
│   ├── pdf-loader.ts             # PDF → chunks pipeline
│   ├── llm.ts                    # Gemini model factory (lazy init)
│   ├── pinecone-client.ts        # Pinecone SDK client singleton
│   ├── prompt-template.ts        # RAG prompt templates
│   └── config.ts                 # Env var validation
└── .env                          # API keys (not committed)
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- A **Google AI Studio** API key → [aistudio.google.com](https://aistudio.google.com) (free)
- A **Pinecone** account → [pinecone.io](https://www.pinecone.io) (free tier)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/chat-with-pdf.git
cd chat-with-pdf
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root:

```env
# Google AI Studio (get from https://aistudio.google.com/apikey)
GOOGLE_API_KEY=AIzaSy...

# Pinecone (get from https://app.pinecone.io)
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=chat-with-pdf
```

### 4. Create your Pinecone index

> ⚠️ The index **must** be created with dimension=3072 (gemini-embedding-001 output size)

Run the setup script:

```bash
node --env-file=.env -e "
const { Pinecone } = require('@pinecone-database/pinecone');
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
pc.createIndex({
  name: 'chat-with-pdf',
  dimension: 3072,
  metric: 'cosine',
  spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
  waitUntilReady: true,
}).then(() => console.log('Index ready!'));
"
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting with your PDFs!

---

## 🔄 How the RAG Pipeline Works

```
User uploads PDF
       │
       ▼
WebPDFLoader parses the PDF into raw text
       │
       ▼
RecursiveCharacterTextSplitter
chunks text into 1000-char pieces with 200-char overlap
       │
       ▼
gemini-embedding-001 converts each chunk
into a 3072-dimensional vector
       │
       ▼
Vectors stored in Pinecone under a unique
per-document namespace (UUID)
       │
       ▼
User asks a question
       │
       ▼
Question → standalone query (via Gemini non-streaming)
       │
       ▼
Query embedded → Top 4 semantically similar
chunks retrieved from Pinecone
       │
       ▼
[Context + Question] → Gemini 2.5 Flash Lite
streams the answer token-by-token back to the browser
```

---

## 🌟 Key Engineering Decisions

- **Lazy model initialization** — LLM clients are created on first call, not at module load time, preventing Next.js compilation errors in the edge runtime
- **Per-document Pinecone namespaces** — Each PDF gets a UUID namespace, keeping vector spaces isolated and queries accurate
- **Custom GeminiEmbeddings class** — Direct `@google/generative-ai` SDK wrapper around the LangChain `Embeddings` base class for full control over model parameters
- **Stream piped through TransformStream** — Uses native Web Streams API, compatible with Next.js App Router streaming responses without polyfills
- **Batched embedding** — Chunks are embedded 10 at a time to respect Gemini free-tier rate limits
- **sessionStorage for PDF blobs** — Uploaded PDFs are stored as base64 blobs in sessionStorage, enabling the iframe viewer without any server-side file storage
- **Custom event bus** — `chatpdf_docs_changed` custom DOM event keeps sidebar and dashboard in sync without Redux or Zustand

---

## 📸 Screenshots

<img width="1280" height="615" alt="photo_2026-04-18_20-56-59" src="https://github.com/user-attachments/assets/3303ec4b-f014-4924-8fcf-ed596c3c96b1" />
<img width="1280" height="617" alt="photo_2026-04-18_20-56-35" src="https://github.com/user-attachments/assets/24e81c2e-b933-4a29-9af7-392322c6a943" />
<img width="1280" height="612" alt="photo_2026-04-18_20-56-20" src="https://github.com/user-attachments/assets/c2bfb9c3-e7c2-42be-a0b1-10ce45d9dfd6" />
<img width="1280" height="617" alt="photo_2026-04-18_20-55-53" src="https://github.com/user-attachments/assets/0a75c4ba-7e79-4fea-ac80-c22e9529499e" />
<img width="1280" height="614" alt="photo_2026-04-18_20-55-44" src="https://github.com/user-attachments/assets/6b771833-7a71-4c17-bc24-116329d194b7" />
<img width="1280" height="620" alt="photo_2026-04-18_20-55-04" src="https://github.com/user-attachments/assets/0507e4a4-e42c-4e7e-8083-8c5c10c35c93" />
<img width="1280" height="625" alt="photo_2026-04-18_20-54-38" src="https://github.com/user-attachments/assets/d59097e8-8dae-4ab5-b8a3-93dbc935e6ea" />
<img width="1280" height="617" alt="photo_2026-04-18_20-51-35" src="https://github.com/user-attachments/assets/fc996993-ca33-4fb7-8128-00d359b697f0" />
<img width="1280" height="616" alt="photo_2026-04-18_20-50-57" src="https://github.com/user-attachments/assets/21a8718e-dce4-4d15-9f67-859618b3deac" />
<img width="1280" height="610" alt="photo_2026-04-18_20-16-37" src="https://github.com/user-attachments/assets/62ace0a4-ac31-4739-9203-c8e16a71e04d" />
<img width="1280" height="615" alt="photo_2026-04-18_20-16-23" src="https://github.com/user-attachments/assets/9865b785-ee00-47a7-b76f-d6ed5fcccd43" />

---

## 🔮 Roadmap

- [ ] Supabase / PostgreSQL for persistent user data
- [ ] Multi-user auth with NextAuth or Clerk
- [ ] Multiple PDF support in a single chat
- [ ] Source citation highlighting in the PDF viewer
- [ ] Mobile-responsive PDF viewer
- [ ] Export chat as PDF/Markdown

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss.

---

## 📄 License

[MIT](LICENSE) — free to use, modify, and distribute.

---

<p align="center">Built with ❤️ using Next.js, Google Gemini, and Pinecone</p>
