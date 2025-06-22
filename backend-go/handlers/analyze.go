package handlers

import (
    "encoding/json"
    "mindful/backend-go/models"
    "mindful/backend-go/utils"
    "net/http"
)

func AnalyzeAndStoreGamePlanHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }

    // Fetch all transcripts and journals
    transcripts, err := models.GetTranscripts()
    if err != nil {
        http.Error(w, "Failed to fetch transcripts", http.StatusInternalServerError)
        return
    }

    journals, err := models.GetAllJournalEntries()
    if err != nil {
        http.Error(w, "Failed to fetch journals", http.StatusInternalServerError)
        return
    }

    // Extract content from transcripts and journals
    var transcriptTexts []string
    for _, t := range transcripts {
        transcriptTexts = append(transcriptTexts, t.Transcript)
    }

    var journalTexts []string
    for _, j := range journals {
        journalTexts = append(journalTexts, j.Content)
    }

    // Generate game plan using AI
    tasks, summary, err := utils.GenerateGamePlan(transcriptTexts, journalTexts)
    if err != nil {
        http.Error(w, "Failed to generate game plan", http.StatusInternalServerError)
        return
    }

    // Store the game plan in the database
    err = models.StoreGamePlan(tasks, summary)
    if err != nil {
        http.Error(w, "Failed to store game plan", http.StatusInternalServerError)
        return
    }

    response := map[string]string{"message": "Game plan generated and stored successfully"}
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}