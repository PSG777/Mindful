package models

import (
	"mindful/backend-go/database"
)

type Journal struct {
	ID      int    `json:"id"`
	Content string `json:"content"`
}

type GamePlan struct {
	ID             int      `json:"id"`
	Tasks          string `json:"tasks"`
	Summary        string   `json:"summary"`
	EmotionalState string   `json:"emotional_state"`
}

func StoreJournalEntry(content string) error {
	query := `INSERT INTO journals (content) VALUES (?)`
	_, err := database.DB.Exec(query, content)
	return err
}

func GetAllJournalEntries() ([]Journal, error) {
	rows, err := database.DB.Query(`SELECT id, content FROM journals`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var journals []Journal
	for rows.Next() {
		var journal Journal
		if err := rows.Scan(&journal.ID, &journal.Content); err != nil {
			return nil, err
		}
		journals = append(journals, journal)
	}
	return journals, nil
}

func StoreGamePlan(tasks []string, summary string, emotionalState string) error {
	// Convert tasks slice to a single string
	tasksText := ""
	for _, task := range tasks {
		tasksText += task + "\n"
	}

	query := `INSERT INTO game_plans (tasks, summary, emotional_state) VALUES (?, ?, ?)`
	_, err := database.DB.Exec(query, tasksText, summary, emotionalState)
	return err
}

func GetAllGamePlans() ([]GamePlan, error) {
	rows, err := database.DB.Query(`SELECT id, tasks, summary, emotional_state FROM game_plans`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var gamePlans []GamePlan
	for rows.Next() {
		var gamePlan GamePlan
		if err := rows.Scan(&gamePlan.ID, &gamePlan.Tasks, &gamePlan.Summary, &gamePlan.EmotionalState); err != nil {
			return nil, err
		}
		gamePlans = append(gamePlans, gamePlan)
	}
	return gamePlans, nil
}
