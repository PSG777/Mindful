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

	var req models.Transcript
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO transcripts (session_id, transcript) VALUES (?, ?)`
	_, err := database.DB.Exec(query, req.SessionID, req.Transcript)
	if err != nil {
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

	rows, err := database.DB.Query(`SELECT id, session_id, transcript FROM transcripts`)
	if err != nil {
		http.Error(w, "Failed to retrieve transcripts", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var transcripts []models.Transcript
	for rows.Next() {
		var t models.Transcript
		if err := rows.Scan(&t.ID, &t.SessionID, &t.Transcript); err != nil {
			http.Error(w, "Failed to parse transcripts", http.StatusInternalServerError)
			return
		}
		transcripts = append(transcripts, t)
	}

	if len(transcripts) == 0 {
		http.Error(w, "No transcripts available", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transcripts)
}