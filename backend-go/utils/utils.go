package utils

import "errors"

type AIResponse struct {
	Tasks   []string
	Summary string
}

func AnalyzeData(data string) (AIResponse, error) {
	if data == "" {
		return AIResponse{}, errors.New("data cannot be empty")
	}

	// Mock AI analysis logic
	response := AIResponse{
		Tasks:   []string{"Task 1", "Task 2"},
		Summary: "This is a summary of the provided data",
	}

	return response, nil
}