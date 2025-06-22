package main

import (
	"log"
	"mindful/backend-go/database" // Correct import path
	"mindful/backend-go/handlers" // Correct import path
	"mindful/backend-go/models"   // Correct import path
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

	http.HandleFunc("/transcripts/add", handlers.AddTranscriptHandler)
	http.HandleFunc("/transcripts", handlers.GetTranscriptsHandler)
	http.HandleFunc("/journals/add", handlers.AddJournalEntryHandler)
	http.HandleFunc("/journals", handlers.GetJournalEntriesHandler)
	http.HandleFunc("/gameplan/analyze", handlers.AnalyzeAndStoreGamePlanHandler)
	http.HandleFunc("/gameplans", handlers.GetGamePlansHandler) // New endpoint
	http.HandleFunc("/clear", handlers.ClearDatabaseHandler)    // New endpoint
	http.HandleFunc("/emotion/add", handlers.AddEmotionHandler) // New endpoint
	http.HandleFunc("/emotion", handlers.GetEmotionsHandler)    // New endpoint

	// Configure CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"https://your-deployed-frontend-url.com", // The existing production URL
			"http://localhost:3000",                  // Add this line
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	mux := http.NewServeMux()
	mux.HandleFunc("/transcripts/add", handlers.AddTranscriptHandler)
	mux.HandleFunc("/transcripts", handlers.GetTranscriptsHandler)
	mux.HandleFunc("/journals/add", handlers.AddJournalEntryHandler)
	mux.HandleFunc("/journals", handlers.GetJournalEntriesHandler)
	mux.HandleFunc("/gameplan/analyze", handlers.AnalyzeAndStoreGamePlanHandler)
	mux.HandleFunc("/gameplans", handlers.GetGamePlansHandler) // New endpoint
	mux.HandleFunc("/clear", handlers.ClearDatabaseHandler)    // New endpoint
	mux.HandleFunc("/emotion/add", handlers.AddEmotionHandler) // New endpoint
	mux.HandleFunc("/emotion", handlers.GetEmotionsHandler)    // New endpoint

	handler := c.Handler(mux)

	log.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
