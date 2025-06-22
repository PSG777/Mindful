package models

import (
	"database/sql"
	"errors"
	"fmt"
)

type Transcript struct {
	ID         int    `json:"id"`
	SessionID  string `json:"session_id"`
	Transcript string `json:"transcript"`
}

var db *sql.DB

func InitDatabase(database *sql.DB) {
	db = database
}

func GetTranscripts() ([]Transcript, error) {
	rows, err := db.Query(`SELECT id, session_id, transcript FROM transcripts`)
	if err != nil {
		return nil, fmt.Errorf("error querying transcripts: %w", err)
	}
	defer rows.Close()

	var transcripts []Transcript
	for rows.Next() {
		var t Transcript
		if err := rows.Scan(&t.ID, &t.SessionID, &t.Transcript); err != nil {
			return nil, fmt.Errorf("error scanning transcript row: %w", err)
		}
		transcripts = append(transcripts, t)
	}

	if len(transcripts) == 0 {
		return nil, errors.New("no transcripts available")
	}

	return transcripts, nil
}