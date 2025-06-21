package utils

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
)

type OpenAIRequest struct {
	Model       string `json:"model"`
	Prompt      string `json:"prompt"`
	MaxTokens   int    `json:"max_tokens"`
	Temperature float64 `json:"temperature"`
}

type OpenAIResponse struct {
	Choices []struct {
		Text string `json:"text"`
	} `json:"choices"`
}

func GenerateGamePlan(transcripts []string, journals []string) (tasks []string, summary string, err error) {
	apiKey := "your-openai-api-key" // Replace with your actual API key
	url := "https://api.openai.com/v1/completions"

	// Combine transcripts and journals into a single prompt
	var combinedData string
	for _, transcript := range transcripts {
		combinedData += transcript + "\n"
	}
	for _, journal := range journals {
		combinedData += journal + "\n"
	}

	prompt := "You are a supportive AI therapist. Based on these conversations and journal entries, generate 3 specific wellness tasks and summarize the user’s current emotional state.\n" + combinedData

	// Create the OpenAI request payload
	requestPayload := OpenAIRequest{
		Model:       "gpt-4",
		Prompt:      prompt,
		MaxTokens:   200,
		Temperature: 0.7,
	}

	requestBody, err := json.Marshal(requestPayload)
	if err != nil {
		return nil, "", err
	}

	// Send the POST request to OpenAI
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, "", errors.New("failed to get response from OpenAI")
	}

	// Parse the OpenAI response
	var openAIResp OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
		return nil, "", err
	}

	if len(openAIResp.Choices) == 0 {
		return nil, "", errors.New("no choices returned from OpenAI")
	}

	responseText := openAIResp.Choices[0].Text

	// Basic string parsing to extract tasks and summary
	// Assuming GPT returns structured text like:
	// "Tasks:\n1. Task one\n2. Task two\n3. Task three\nSummary: Emotional state summary"
	parts := bytes.Split([]byte(responseText), []byte("Summary:"))
	if len(parts) < 2 {
		return nil, "", errors.New("failed to parse GPT response")
	}

	tasksText := string(parts[0])
	summary = string(parts[1])

	// Extract tasks from the tasksText
	lines := bytes.Split([]byte(tasksText), []byte("\n"))
	for _, line := range lines {
		line = bytes.TrimSpace(line)
		if len(line) > 0 && !bytes.HasPrefix(line, []byte("Tasks:")) {
			tasks = append(tasks, string(line))
		}
	}

	return tasks, summary, nil
}