package handlers

import (
	"encoding/json"
	"mindful/backend-go/models"
	"mindful/backend-go/utils"
	"net/http"
)

type GameplanResponse struct {
	Tasks   []string `json:"tasks"`
	Summary string   `json:"summary"`
}

func GenerateGameplanHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var combinedData string
	transcripts, err := models.GetTranscripts()
	if err != nil {
		http.Error(w, "Error fetching transcripts", http.StatusInternalServerError)
		return
	}
	for _, transcript := range transcripts {
		combinedData += transcript.Transcript + "\n"
	}

	journalEntries, err := models.GetAllJournalEntries()
	if err != nil {
		http.Error(w, "Error fetching journal entries", http.StatusInternalServerError)
		return
	}
	for _, journal := range journalEntries {
		combinedData += journal.Content + "\n"
	}

	aiResponse, err := utils.AnalyzeData(combinedData)
	if err != nil {
		http.Error(w, "Error analyzing data", http.StatusInternalServerError)
		return
	}

	response := GameplanResponse{
		Tasks:   aiResponse.Tasks,
		Summary: aiResponse.Summary,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetGamePlansHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	gamePlans, err := models.GetAllGamePlans()
	if err != nil {
		http.Error(w, "Failed to retrieve game plans", http.StatusInternalServerError)
		return
	}

	if len(gamePlans) == 0 {
		http.Error(w, "No game plans available", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(gamePlans)
}
