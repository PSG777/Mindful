package handlers

import (
	"encoding/json"
	"mindful/backend-go/database"
	"mindful/backend-go/models"
	"net/http"
)

type TranscriptRequest struct {
	SessionID  string `json:"session_id"`
	Transcript string `json:"transcript"`
}

func AddTranscriptHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req TranscriptRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	transcript := models.Transcript{
		SessionID:  req.SessionID,
		Transcript: req.Transcript,
	}

	if err := database.DB.Create(&transcript).Error; err != nil {
		http.Error(w, "Failed to add transcript", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"message": "Transcript added successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetTranscriptsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var transcripts []models.Transcript
	if err := database.DB.Find(&transcripts).Error; err != nil {
		http.Error(w, "Failed to retrieve transcripts", http.StatusInternalServerError)
		return
	}

	if len(transcripts) == 0 {
		http.Error(w, "No transcripts available", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transcripts)
}
