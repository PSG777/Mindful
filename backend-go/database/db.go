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
        log.Fatal(err)
    }

    createTables()
}

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