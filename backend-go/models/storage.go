package models

import (
	"errors"
	"fmt"
	"mindful/backend-go/database"
)

type Transcript struct {
	ID         int    `json:"id"`
	SessionID  string `json:"session_id"`
	Transcript string `json:"transcript"`
}

func GetTranscripts() ([]Transcript, error) {
	rows, err := database.DB.Raw(`SELECT id, session_id, transcript FROM transcripts`).Rows()
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
