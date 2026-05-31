# Mindful

Mindful is a mental health support web app built as a team project. It helps users reflect through voice conversations, journaling, and AI-generated wellness plans with actionable tasks.

This is a student/prototype project, not a clinical or HIPAA-compliant mental health product.

## What it does

Users can talk to an AI voice therapist in real time on the home page. When a session ends, the transcript is saved to the backend. Users can also write journal entries. The backend uses Google Gemini to analyze all transcripts and journal entries and generate a wellness plan with an emotional summary and three suggested tasks. The app also includes a mood tracker, a schedule page with optional Google Calendar integration, and a resources page with mental health support links.

## Architecture

The frontend is a Next.js 15 app (React 19, TypeScript, Tailwind CSS, shadcn/ui) running on port 3000. Voice sessions use the Vapi Web SDK in the browser. The backend is a Go REST API on port 8080 with SQLite for persistence. After sessions or journal entries, the backend calls the Gemini API (gemini-2.5-flash) to generate and store wellness plans. The frontend reads those plans from the Go API.

Team roles were split across frontend, voice integration, and backend. Backend work covered the Go API, SQLite database, Gemini wellness plan generation, schema migrations, CORS, and connecting the frontend voice and journal flows to persistent storage.

## Prerequisites

You need Node.js 18+, Go 1.21+, and npm. On Windows, SQLite requires CGO and GCC (install via MSYS2: pacman -S mingw-w64-ucrt-x86_64-gcc, and add the ucrt64 bin folder to PATH). You also need a Google Gemini API key from aistudio.google.com/apikey, a Vapi account and Public Key from dashboard.vapi.ai, and optionally Google OAuth credentials if you want the Schedule page.

## Setup

Clone the repo and enter the project folder. For the backend, go into backend-go and create a .env file with GEMINI_API_KEY=your_key_here. On Windows run `$env:CGO_ENABLED=1` then `go run main.go`. On macOS/Linux run `export CGO_ENABLED=1` then `go run main.go`. You should see "Server is running on port 8080". The SQLite database is created automatically at backend-go/mindful.db.

In a second terminal, from the project root run npm install. Create .env.local in the project root with NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key. For the Schedule page you can also add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, and NEXTAUTH_URL=http://localhost:3000.

For Vapi: create an account at dashboard.vapi.ai, add your Gemini API key under Integrations → Google, and paste your Public API Key into NEXT_PUBLIC_VAPI_PUBLIC_KEY in .env.local.

Start the frontend with npm run dev and open http://localhost:3000. Both servers must run for transcripts and wellness plans to save. Voice alone works through Vapi without the backend, but persistence and analysis require the Go server.

## API endpoints

Base URL locally: http://localhost:8080

POST /transcripts/add — save a voice session transcript (JSON body: session_id, transcript)
GET /transcripts/ — list all transcripts
GET /transcripts/{session_id} — get one transcript by session ID
POST /journals/add — create a journal entry (JSON body: content)
GET /journals/ — list all journal entries
POST /gameplan/analyze — analyze all transcripts and journals and generate a wellness plan
GET /gameplans — list stored wellness plans (newest first)

## User flow

The user starts a voice session on the home page. Vapi handles real-time speech and conversation. When the session ends, the frontend POSTs the transcript to the backend. The backend then triggers Gemini analysis and stores a wellness plan. The home page displays the latest summary and tasks. The Journal page shows combined history of voice transcripts and written entries.

## Project structure

app/ contains Next.js pages (home with voice therapist, journal, mood-tracker, schedule, resources, and api routes for NextAuth and Google Calendar). components/ holds shared UI. backend-go/ contains main.go, handlers/, models/, database/ (SQLite init and migrations), and utils/ (Gemini analysis). Environment files (.env and .env.local) are gitignored and must not be committed.

## Environment variables

GEMINI_API_KEY in backend-go/.env — required for wellness plan generation.
NEXT_PUBLIC_VAPI_PUBLIC_KEY in .env.local — required for voice therapist sessions.
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL in .env.local — optional, for Google sign-in and calendar on the Schedule page.

## Troubleshooting

If the backend will not start on Windows, install GCC via MSYS2 and set CGO_ENABLED=1. If voice works but nothing saves, make sure the Go backend is running on port 8080. If the therapist does not respond, check Vapi dashboard credits and that your Gemini key is added under Vapi Integrations. If wellness plans do not update, verify GEMINI_API_KEY in backend-go/.env. Restart npm run dev after changing .env.local.

## Disclaimer

Mindful is for educational and prototyping purposes only. It does not replace professional mental health care. If you or someone you know is in crisis, contact a qualified professional or a crisis hotline such as the 988 Suicide & Crisis Lifeline (US): https://988lifeline.org/

## Contributors

[Your Name] — Backend (Go API, SQLite, Gemini integration)
[Teammate names and roles]

## License

[Add license, e.g. MIT]
