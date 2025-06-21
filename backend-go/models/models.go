package models

import "errors"

type JournalEntry struct {
    ID      string `json:"id"`
    Content string `json:"content"`
}

type Transcript struct {
    SessionID  string `json:"session_id"`
    Transcript string `json:"transcript"`
}

var Transcripts []Transcript

var JournalEntries []JournalEntry

func StoreJournalEntry(content string) error {
	if content == "" {
		return errors.New("content cannot be empty")
	}
	JournalEntries = append(JournalEntries, JournalEntry{Content: content})
	return nil
}

func GetJournalEntries() ([]JournalEntry, error) {
	if len(JournalEntries) == 0 {
		return nil, errors.New("no journal entries available")
	}
	return JournalEntries, nil
}