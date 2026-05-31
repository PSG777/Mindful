package models

import (
	"mindful/backend-go/database"
	"strings"
)

type Journal struct {
	ID        int    `json:"id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
}

type GamePlan struct {
	ID             int    `json:"id"`
	Tasks          string `json:"tasks"`
	Summary        string `json:"summary"`
	EmotionalState string `json:"emotional_state"`
	CreatedAt      string `json:"created_at"`
}

type JournalEntry struct {
	ID             int    `json:"id"`
	Content        string `json:"content"`
	EmotionalState string `json:"emotional_state"`
	CreatedAt      string `json:"created_at"`
}

type Transcript struct {
	ID         int    `json:"id"`
	SessionID  string `json:"session_id"`
	Transcript string `json:"transcript"`
	CreatedAt  string `json:"created_at"`
}

func StoreJournalEntry(content string) error {
	query := `INSERT INTO journal_entries (content) VALUES (?)`
	_, err := database.DB.Exec(query, content)
	return err
}

func GetAllJournalEntries() ([]Journal, error) {
	rows, err := database.DB.Query(`SELECT id, content, created_at FROM journal_entries ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var journals []Journal
	for rows.Next() {
		var journal Journal
		if err := rows.Scan(&journal.ID, &journal.Content, &journal.CreatedAt); err != nil {
			return nil, err
		}
		journals = append(journals, journal)
	}
	return journals, nil
}

func StoreGamePlan(tasks []string, summary string, emotionalState string) error {
	tasksText := strings.Join(tasks, "\n")

	query := `INSERT INTO game_plans (tasks, summary, emotional_state) VALUES (?, ?, ?)`
	_, err := database.DB.Exec(query, tasksText, summary, emotionalState)
	return err
}

func GetAllGamePlans() ([]GamePlan, error) {
	rows, err := database.DB.Query(`SELECT id, tasks, summary, emotional_state, created_at FROM game_plans ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var gamePlans []GamePlan
	for rows.Next() {
		var gamePlan GamePlan
		if err := rows.Scan(&gamePlan.ID, &gamePlan.Tasks, &gamePlan.Summary, &gamePlan.EmotionalState, &gamePlan.CreatedAt); err != nil {
			return nil, err
		}
		gamePlans = append(gamePlans, gamePlan)
	}
	return gamePlans, nil
}
