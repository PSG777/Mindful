package database

import (
    "database/sql"
    "log"

    _ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
    var err error
    DB, err = sql.Open("sqlite3", "./mindful.db")
    if err != nil {
        log.Fatal("Failed to open database:", err)
    }

    // Create tables if they don't exist
    journalTable := `
    CREATE TABLE IF NOT EXISTS journal_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        emotional_state TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`

    transcriptTable := `
    CREATE TABLE IF NOT EXISTS transcripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        transcript TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`

    gamePlanTable := `
    CREATE TABLE IF NOT EXISTS game_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tasks TEXT,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`

    _, err = DB.Exec(journalTable)
    if err != nil {
        log.Fatalf("could not create journal table: %v", err)
    }

    _, err = DB.Exec(transcriptTable)
    if err != nil {
        log.Fatalf("could not create transcript table: %v", err)
    }

    _, err = DB.Exec(gamePlanTable)
    if err != nil {
        log.Fatalf("could not create game plan table: %v", err)
    }
}

func createTables() {
    transcriptTable := `
    CREATE TABLE IF NOT EXISTS transcripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        transcript TEXT NOT NULL,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    _, err := DB.Exec(transcriptTable)
    if err != nil {
        log.Fatal(err)
    }

    _, err = DB.Exec(journalTable)
    if err != nil {
        log.Fatal(err)
    }

    _, err = DB.Exec(gamePlanTable)
    if err != nil {
        log.Fatal(err)
    }
}