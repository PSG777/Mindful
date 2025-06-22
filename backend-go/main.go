package main

import (
	"log"
	"mindful/backend-go/database"
	"mindful/backend-go/handlers"
	"mindful/backend-go/models"
	"net/http"
    "os"
	"github.com/joho/godotenv"
    "github.com/rs/cors"
)

func init() {
	// Load .env only if running locally
	if os.Getenv("RENDER") == "" {
		_ = godotenv.Load(".env")
	}
}

func main() {

	if os.Getenv("GEMINI_API_KEY") == "" {
		log.Fatal("GEMINI_API_KEY is not set")
	}

	database.InitDB()
	models.InitDatabase(database.DB)
    mux := http.NewServeMux()

	http.HandleFunc("/transcripts/add", handlers.AddTranscriptHandler)
	http.HandleFunc("/transcripts", handlers.GetTranscriptsHandler)
	http.HandleFunc("/journals/add", handlers.AddJournalEntryHandler)
	http.HandleFunc("/journals", handlers.GetJournalEntriesHandler)
	http.HandleFunc("/gameplan/analyze", handlers.AnalyzeAndStoreGamePlanHandler)
	http.HandleFunc("/gameplans", handlers.GetGamePlansHandler) // New endpoint

    // Configure CORS
    corsHandler := cors.New(cors.Options{
        AllowedOrigins: []string{"http://localhost:3000", "http://127.0.0.1:3000"}, // Add localhost origins
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders: []string{"Content-Type", "Authorization"},
    })

	log.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", corsHandler.Handler(mux)))
}
