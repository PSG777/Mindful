package models

import (
	"errors"
)

type Transcript struct {
	ID         int    `json:"id"`
	SessionID  string `json:"session_id"`
	Transcript string `json:"transcript"`
}

var Transcripts []Transcript

func AddTranscript(sessionID, transcript string) error {
	Transcripts = append(Transcripts, Transcript{
		SessionID:  sessionID,
		Transcript: transcript,
	})
	return nil
}

func GetTranscripts() ([]Transcript, error) {
	if len(Transcripts) == 0 {
		return nil, errors.New("no transcripts available")
	}
	return Transcripts, nil
}