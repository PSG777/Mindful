package main

import (
	"log"
	"mindful/backend-go/database"
	"mindful/backend-go/handlers"
	"mindful/backend-go/models"
	"net/http"
    "os"
	"github.com/joho/godotenv"
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

	http.HandleFunc("/transcripts/add", handlers.AddTranscriptHandler)
	http.HandleFunc("/transcripts", handlers.GetTranscriptsHandler)
	http.HandleFunc("/journals/add", handlers.AddJournalEntryHandler)
	http.HandleFunc("/journals", handlers.GetJournalEntriesHandler)
	http.HandleFunc("/gameplan/analyze", handlers.AnalyzeAndStoreGamePlanHandler)
	http.HandleFunc("/gameplans", handlers.GetGamePlansHandler) // New endpoint

	log.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
