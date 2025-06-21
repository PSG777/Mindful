package handlers

import (
	"encoding/json"
	"mindful/backend-go/models"
	"net/http"
)

type JournalRequest struct {
	Content string `json:"content"`
}

func AddJournalEntryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req JournalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	if err := models.StoreJournalEntry(req.Content); err != nil {
		http.Error(w, "Failed to store journal entry", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"message": "Journal entry created successfully"}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}