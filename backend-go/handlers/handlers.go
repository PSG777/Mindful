package handlers

import (
	"encoding/json"
	"mindful/backend-go/database" // Correct import path
	"mindful/backend-go/models"
	"net/http"
)

func ClearDatabaseHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	err := database.DB.Exec("DELETE FROM transcripts; DELETE FROM journals; DELETE FROM game_plans; DELETE FROM emotions;").Error
	if err != nil {
		http.Error(w, "Failed to clear database", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Database cleared successfully"))
}

func AddEmotionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var emotion models.Emotion
	err := json.NewDecoder(r.Body).Decode(&emotion)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = database.DB.Create(&emotion).Error
	if err != nil {
		http.Error(w, "Failed to add emotion", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Emotion added successfully"))
}

func GetEmotionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var emotions []models.Emotion
	err := database.DB.Find(&emotions).Error
	if err != nil {
		http.Error(w, "Failed to retrieve emotions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(emotions)
}
