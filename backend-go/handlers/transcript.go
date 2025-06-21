package handlers

import (
	"encoding/json"
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

	models.Transcripts = append(models.Transcripts, models.Transcript{
		SessionID:  req.SessionID,
		Transcript: req.Transcript,
	})

	response := map[string]string{"message": "Transcript added successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}