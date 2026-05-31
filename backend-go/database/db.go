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

    migrateTranscriptsTable()
    migrateGamePlansTable()
}

func migrateTranscriptsTable() {
    rows, err := DB.Query(`PRAGMA table_info(transcripts)`)
    if err != nil {
        return
    }
    defer rows.Close()
    hasCreatedAt := false
    for rows.Next() {
        var cid, notNull, pk int
        var name, colType string
        var dflt sql.NullString
        if scanErr := rows.Scan(&cid, &name, &colType, &notNull, &dflt, &pk); scanErr == nil && name == "created_at" {
            hasCreatedAt = true
        }
    }
    if !hasCreatedAt {
        if _, err := DB.Exec(`ALTER TABLE transcripts ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`); err != nil {
            log.Printf("could not migrate transcripts table: %v", err)
        }
    }
}

func migrateGamePlansTable() {
    rows, err := DB.Query(`PRAGMA table_info(game_plans)`)
    if err != nil {
        return
    }
    defer rows.Close()
    hasEmotionalState := false
    hasCreatedAt := false
    for rows.Next() {
        var cid, notNull, pk int
        var name, colType string
        var dflt sql.NullString
        if scanErr := rows.Scan(&cid, &name, &colType, &notNull, &dflt, &pk); scanErr != nil {
            continue
        }
        if name == "emotional_state" {
            hasEmotionalState = true
        }
        if name == "created_at" {
            hasCreatedAt = true
        }
    }
    if !hasEmotionalState {
        if _, err := DB.Exec(`ALTER TABLE game_plans ADD COLUMN emotional_state TEXT`); err != nil {
            log.Printf("could not migrate game_plans emotional_state: %v", err)
        }
    }
    if !hasCreatedAt {
        if _, err := DB.Exec(`ALTER TABLE game_plans ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`); err != nil {
            log.Printf("could not migrate game_plans created_at: %v", err)
        }
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