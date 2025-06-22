package database

import (
	"log"
)

func createTables() {
	transcriptTable := `
	CREATE TABLE IF NOT EXISTS transcripts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		session_id TEXT NOT NULL,
		transcript TEXT NOT NULL
	);`

	journalTable := `
	CREATE TABLE IF NOT EXISTS journals (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		content TEXT NOT NULL
	);`

	gamePlanTable := `
	CREATE TABLE IF NOT EXISTS game_plans (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		tasks TEXT NOT NULL,
		summary TEXT NOT NULL,
		emotional_state TEXT NOT NULL
	);`

	emotionTable := `
	CREATE TABLE IF NOT EXISTS emotions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		date TEXT NOT NULL,
		emotion TEXT NOT NULL
	);` // Add emotions table

	// Execute table creation queries
	err := DB.Exec(transcriptTable).Error
	if err != nil {
		log.Fatal(err)
	}

	err = DB.Exec(journalTable).Error
	if err != nil {
		log.Fatal(err)
	}

	err = DB.Exec(gamePlanTable).Error
	if err != nil {
		log.Fatal(err)
	}

	err = DB.Exec(emotionTable).Error
	if err != nil {
		log.Fatal(err)
	}
}
