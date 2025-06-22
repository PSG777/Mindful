package handlers

import (
	"encoding/json"
	"log"
	"mindful/backend-go/database"
	"mindful/backend-go/models"
	"net/http"
	"strings"
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
	log.Printf("GetTranscriptsHandler received request for path: %s", r.URL.Path)

	if r.Method != http.MethodGet {
		log.Printf("Invalid method for path %s: %s", r.URL.Path, r.Method)
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Check if this is a request for a specific transcript
	path := strings.TrimPrefix(r.URL.Path, "/transcripts/")
	log.Printf("Trimmed path is: '%s'", path)

	if path != "" && path != "transcripts" {
		log.Printf("Dispatching to GetTranscriptBySessionIDHandler with sessionID: %s", path)
		GetTranscriptBySessionIDHandler(w, r, path)
		return
	}

	log.Println("Proceeding to fetch all transcripts.")
	rows, err := database.DB.Query(`SELECT id, session_id, transcript, created_at FROM transcripts ORDER BY created_at DESC`)
	if err != nil {
		http.Error(w, "Failed to retrieve transcripts", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var transcripts []models.Transcript
	for rows.Next() {
		var t models.Transcript
		if err := rows.Scan(&t.ID, &t.SessionID, &t.Transcript, &t.CreatedAt); err != nil {
			http.Error(w, "Failed to parse transcripts", http.StatusInternalServerError)
			return
		}
		transcripts = append(transcripts, t)
	}

	if len(transcripts) == 0 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]models.Transcript{})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transcripts)
}

func GetTranscriptBySessionIDHandler(w http.ResponseWriter, r *http.Request, sessionID string) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	query := `SELECT id, session_id, transcript, created_at FROM transcripts WHERE session_id = ?`
	row := database.DB.QueryRow(query, sessionID)

	var transcript models.Transcript
	if err := row.Scan(&transcript.ID, &transcript.SessionID, &transcript.Transcript, &transcript.CreatedAt); err != nil {
		http.Error(w, "Transcript not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transcript)
}