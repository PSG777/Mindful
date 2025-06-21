package main

import (
	"log"
	"net/http"
	"mindful/backend-go/handlers"
)

func main() {
	http.HandleFunc("/add-transcript", handlers.AddTranscriptHandler)
	http.HandleFunc("/add-journal-entry", handlers.AddJournalEntryHandler)
	http.HandleFunc("/generate-gameplan", handlers.GenerateGameplanHandler)

	log.Println("Starting server on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start: ", err)
	}
}