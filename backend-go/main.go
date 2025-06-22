package main

import (
    "log"
    "net/http"
    "mindful/backend-go/database"
    "mindful/backend-go/handlers"
    "mindful/backend-go/models"
)

func main() {
    database.InitDB()
    models.InitDatabase(database.DB)

    http.HandleFunc("/transcripts/add", handlers.AddTranscriptHandler)
    http.HandleFunc("/transcripts", handlers.GetTranscriptsHandler)
    http.HandleFunc("/journals/add", handlers.AddJournalEntryHandler)
    http.HandleFunc("/journals", handlers.GetJournalEntriesHandler)
    http.HandleFunc("/gameplan/analyze", handlers.AnalyzeAndStoreGamePlanHandler)

    log.Println("Server is running on port 8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}