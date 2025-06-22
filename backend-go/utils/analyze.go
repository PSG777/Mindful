package utils

import (
	"context"
	"encoding/json"
	"errors"
	"mindful/backend-go/models"
	"strings"
	"google.golang.org/genai"
	"log"
)

func GenerateGamePlan(transcripts []string, journals []string) (tasks []string, summary string, err error) {
    log.Println("Initializing Gemini API client...")
    ctx := context.Background()
    client, err := genai.NewClient(ctx, &genai.ClientConfig{
        APIKey:  "AIzaSyD7u5x1ocINoaQeJx4HjpvMCLxI5cgHWuk", //  APIHardcoded key
        Backend: genai.BackendGeminiAPI,
    })
    if err != nil {
        log.Printf("Error initializing Gemini API client: %v", err)
        return nil, "", errors.New("failed to initialize Gemini API client")
    }

    log.Println("Combining transcripts and journals into a single prompt...")
    var combinedData string
    for _, transcript := range transcripts {
        combinedData += transcript + "\n"
    }
    for _, journal := range journals {
        combinedData += journal + "\n"
    }

    prompt := `You are a supportive AI therapist. Based on these conversations and journal entries, generate 3 specific wellness tasks and summarize the user’s current emotional state. 
    Respond in the following JSON format:
    {
      "tasks": [
        "Task 1",
        "Task 2",
        "Task 3"
      ],
      "summary": "Summary of the user's emotional state"
    }
    ` + combinedData

    log.Println("Sending request to Gemini API...")
    result, err := client.Models.GenerateContent(
        ctx,
        "gemini-2.5-flash",
        genai.Text(prompt),
        &genai.GenerateContentConfig{
            ThinkingConfig: &genai.ThinkingConfig{
                ThinkingBudget: func(i int32) *int32 { return &i }(0), // Pass a pointer to int32
            },
        },
    )
    if err != nil {
        log.Printf("Error generating content using Gemini API: %v", err)
        return nil, "", errors.New("failed to generate content using Gemini API")
    }

    // Log the raw response
    log.Printf("Raw response from Gemini API: %s", result.Text())

    // Extract the actual JSON content from the response
    rawResponse := result.Text()
    rawResponse = strings.TrimPrefix(rawResponse, "```json\n")
    rawResponse = strings.TrimSuffix(rawResponse, "\n```")

    log.Println("Parsing the response...")
    var gamePlanResp struct {
        Tasks   []string `json:"tasks"`
        Summary string   `json:"summary"`
    }
    if err := json.Unmarshal([]byte(rawResponse), &gamePlanResp); err != nil {
        log.Printf("Error parsing Gemini API response: %v", err)
        return nil, "", errors.New("failed to parse Gemini API response")
    }

    // Log parsed tasks and summary
    log.Printf("Parsed tasks: %v", gamePlanResp.Tasks)
    log.Printf("Parsed summary: %s", gamePlanResp.Summary)

    tasks = gamePlanResp.Tasks
    summary = gamePlanResp.Summary

    log.Println("Categorizing emotional state...")
    emotionalState := CategorizeEmotionalState(summary)

    log.Println("Storing the game plan in the database...")
    err = models.StoreGamePlan(tasks, summary, emotionalState)
    if err != nil {
        log.Printf("Error storing game plan in the database: %v", err)
        return nil, "", errors.New("failed to store game plan in the database")
    }

    log.Println("Game plan generated successfully.")
    return tasks, summary, nil
}

// Categorize emotional state into predefined categories
func CategorizeEmotionalState(summary string) string {
	if containsWord(summary, []string{"happy", "joyful", "content"}) {
		return "happy"
	} else if containsWord(summary, []string{"sad", "down", "depressed"}) {
		return "sad"
	} else if containsWord(summary, []string{"nervous", "anxious", "worried"}) {
		return "nervous"
	} else if containsWord(summary, []string{"angry", "frustrated", "mad"}) {
		return "angry"
	} else if containsWord(summary, []string{"fearful", "scared", "afraid"}) {
		return "fearful"
	}
	return "neutral"
}

// Helper function to check if a word exists in the summary
func containsWord(summary string, words []string) bool {
	for _, word := range words {
		if strings.Contains(strings.ToLower(summary), word) {
			return true
		}
	}
	return false
}