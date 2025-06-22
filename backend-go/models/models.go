package models

import (
	"mindful/backend-go/database"

	"gorm.io/gorm"
)

type Journal struct {
	ID      int    `json:"id" gorm:"primaryKey"`
	Content string `json:"content"`
}

type GamePlan struct {
	ID             int    `json:"id" gorm:"primaryKey"`
	Tasks          string `json:"tasks"`
	Summary        string `json:"summary"`
	EmotionalState string `json:"emotional_state"`
}

type Emotion struct {
	ID      int    `json:"id" gorm:"primaryKey"`
	Date    string `json:"date" gorm:"not null"`
	Emotion string `json:"emotion" gorm:"not null"`
}

func StoreJournalEntry(content string) error {
	journal := Journal{Content: content}
	return database.DB.Create(&journal).Error
}

func GetAllJournalEntries() ([]Journal, error) {
	var journals []Journal
	err := database.DB.Find(&journals).Error
	return journals, err
}

func StoreGamePlan(tasks []string, summary string, emotionalState string) error {
	// Convert tasks slice to a single string
	tasksText := ""
	for _, task := range tasks {
		tasksText += task + "\n"
	}

	gamePlan := GamePlan{Tasks: tasksText, Summary: summary, EmotionalState: emotionalState}
	return database.DB.Create(&gamePlan).Error
}

func GetAllGamePlans() ([]GamePlan, error) {
	var gamePlans []GamePlan
	err := database.DB.Find(&gamePlans).Error
	return gamePlans, err
}

func StoreEmotion(date string, emotion string) error {
	emotionEntry := Emotion{Date: date, Emotion: emotion}
	return database.DB.Create(&emotionEntry).Error
}

func GetAllEmotions() ([]Emotion, error) {
	var emotions []Emotion
	err := database.DB.Find(&emotions).Error
	return emotions, err
}

func InitDatabase(db *gorm.DB) {
	db.AutoMigrate(&Emotion{}) // Add migration for Emotion table
}
