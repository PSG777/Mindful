package main

import (
	"log"
	"mindful/backend-go/database"
	"mindful/backend-go/handlers"
	"mindful/backend-go/models"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
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
