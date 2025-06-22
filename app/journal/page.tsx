"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book, Mic, Search, MessageCircle, FileText, X } from "lucide-react";

interface JournalEntry {
  id: number;
  content: string;
  created_at: string;
}

interface Transcript {
  id: number;
  session_id: string;
  transcript: string;
  created_at: string;
}

interface HistoryItem {
  id: string;
  date: string;
  content: string;
  type: 'journal' | 'transcript';
  session_id?: string;
  emotional_state?: string;
}

interface TranscriptDetail {
  id: number;
  session_id: string;
  transcript: string;
  created_at?: string;
}

const API_BASE_URL = "https://mindful-wbz7.onrender.com";

export default function JournalPage() {
  const [newEntry, setNewEntry] = useState("");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<TranscriptDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Go backend
  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      setIsLoading(true);
      
      console.log('=== FETCHING HISTORY DATA ===');
      
      const [transcriptsRes, journalsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/transcripts`),
        fetch(`${API_BASE_URL}/journals`),
      ]);
      
      console.log('Transcripts response status:', transcriptsRes.status);
      console.log('Journals response status:', journalsRes.status);
      
      const transcripts: Transcript[] = transcriptsRes.ok ? await transcriptsRes.json() : [];
      const journalEntries: JournalEntry[] = journalsRes.ok ? await journalsRes.json() : [];

      console.log('Raw transcripts data:', transcripts);
      console.log('Raw journals data:', journalEntries);

      const combinedItems: HistoryItem[] = [];

      if (Array.isArray(transcripts)) {
        transcripts.forEach((transcript) => {
          console.log('Processing transcript:', transcript);
          combinedItems.push({
            id: `transcript-${transcript.id}`,
            date: new Date(transcript.created_at).toLocaleDateString(),
            content: transcript.transcript,
            type: 'transcript',
            session_id: transcript.session_id,
          });
        });
      }
      
      if (Array.isArray(journalEntries)) {
        journalEntries.forEach((entry) => {
          combinedItems.push({
            id: `journal-${entry.id}`,
            date: new Date(entry.created_at).toLocaleDateString(),
            content: entry.content,
            type: 'journal',
          });
        });
      }

      combinedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      console.log('Final combined items:', combinedItems);
      
      setHistoryItems(combinedItems);
    } catch (error) {
      console.error('Error fetching history data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    try {
      console.log('=== SESSION CLICK DEBUG ===');
      console.log('Clicked session ID:', sessionId);
      console.log('Session type:', typeof sessionId);
      
      setIsLoadingSession(true);
      setIsModalOpen(true);
      
      // Log the API URL being called
      const apiUrl = `${API_BASE_URL}/transcripts/${sessionId}`;
      console.log('Calling API:', apiUrl);
      
      // Fetch the specific transcript data
      const response = await fetch(apiUrl);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const transcriptData: TranscriptDetail = await response.json();
        console.log('Received transcript data:', transcriptData);
        setSelectedSession(transcriptData);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch session details. Status:', response.status, 'Response:', errorText);
        setError(`Could not load session. Server responded with status ${response.status}.`);
        // Fallback: try to find the session in our local data
        console.log('Trying fallback with local data...');
        console.log('Available history items:', historyItems);
        
        const session = historyItems.find(item => item.session_id === sessionId);
        console.log('Found session in local data:', session);
        
        if (session) {
          console.log('Using fallback session data');
          setSelectedSession({
            id: parseInt(session.id.replace('transcript-', '')),
            session_id: sessionId,
            transcript: session.content,
          });
        } else {
          console.error('Session not found in local data either');
        }
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleSubmit = async () => {
    if (newEntry.trim() === "") return;

    console.log("Attempting to submit new journal entry...");
    console.log("Sending to:", `${API_BASE_URL}/journals/add`);
    console.log("Payload:", JSON.stringify({ content: newEntry }));

    try {
      const response = await fetch(`${API_BASE_URL}/journals/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newEntry }),
      });

      console.log("Received response from server with status:", response.status);

      if (response.ok) {
        console.log("Journal entry saved successfully.");
        setNewEntry("");
        fetchHistoryData(); // Refresh history
        await triggerGamePlanAnalysis();
      } else {
        const errorText = await response.text();
        console.error('Failed to save journal entry. Server responded with:', errorText);
      }
    } catch (error) {
      console.error('Error during fetch operation for saving journal entry:', error);
    }
  };

  const triggerGamePlanAnalysis = async () => {
    console.log("Triggering new game plan analysis from journal entry...");
    try {
      // We don't need to wait for this or handle the response, just fire and forget
      fetch(`${API_BASE_URL}/gameplan/analyze`);
    } catch (error) {
      console.error('Error triggering game plan analysis:', error);
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    console.log(isRecording ? "Stopping recording..." : "Starting recording...");
  };

  const filteredItems = historyItems.filter((item) =>
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📓 Journal</h1>
        <p className="text-gray-600">Record your thoughts and feelings</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* New Entry Section */}
        <Card>
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
            <CardDescription>
              Let out your thoughts and feelings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What's on your mind?"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              className="min-h-[200px] mb-4"
            />
            <div className="flex items-center justify-between">
              <Button
                onClick={handleToggleRecording}
                variant={isRecording ? "destructive" : "outline"}
              >
                <Mic className="mr-2 h-4 w-4" />
                {isRecording ? "Stop Recording" : "Voice Journal"}
              </Button>
              <Button onClick={handleSubmit}>Submit Entry</Button>
            </div>
          </CardContent>
        </Card>

        {/* History Section */}
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>Review your past entries and therapy sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading history...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-600">No entries found</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                      item.type === 'transcript' ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => item.type === 'transcript' && item.session_id ? handleSessionClick(item.session_id) : undefined}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {item.type === 'transcript' ? (
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-600" />
                        )}
                        <p className="font-semibold text-sm">
                          {item.type === 'transcript' ? 'Voice Session' : 'Journal Entry'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-2">
                      {item.type === 'transcript' && (
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Session: {item.session_id}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transcript Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Voice Session Transcript</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {isLoadingSession ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading transcript...</p>
                </div>
              ) : selectedSession ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Session ID: {selectedSession.session_id}</span>
                    {selectedSession.created_at && (
                      <span>• {new Date(selectedSession.created_at).toLocaleString()}</span>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Full Transcript:</h3>
                    <div className="whitespace-pre-wrap text-sm text-gray-700">
                      {selectedSession.transcript}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No transcript data available.</p>
              )}
              {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 