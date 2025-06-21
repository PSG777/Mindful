package models

import "errors"

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