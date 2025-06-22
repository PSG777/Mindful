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
import { Book, Mic, Search, MessageCircle, FileText } from "lucide-react";

interface JournalEntry {
  id: number;
  content: string;
  created_at: string;
}

interface Transcript {
  id: number;
  session_id: string;
  transcript: string;
}

interface HistoryItem {
  id: string;
  date: string;
  content: string;
  type: 'journal' | 'transcript';
  session_id?: string;
}

const API_BASE_URL = "https://mindful-wbz7.onrender.com";

export default function JournalPage() {
  const [newEntry, setNewEntry] = useState("");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Go backend
  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      setIsLoading(true);
      
      const [transcriptsRes, journalsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/transcripts`),
        fetch(`${API_BASE_URL}/journals`),
      ]);
      
      const transcripts: Transcript[] = transcriptsRes.ok ? await transcriptsRes.json() : [];
      const journalEntries: JournalEntry[] = journalsRes.ok ? await journalsRes.json() : [];

      const combinedItems: HistoryItem[] = [];

      if (Array.isArray(transcripts)) {
        transcripts.forEach((transcript) => {
          combinedItems.push({
            id: `transcript-${transcript.id}`,
            date: new Date().toLocaleDateString(),
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
      
      setHistoryItems(combinedItems);
    } catch (error) {
      console.error('Error fetching history data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (newEntry.trim() === "") return;

    try {
      const response = await fetch(`${API_BASE_URL}/journals/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newEntry }),
      });

      if (response.ok) {
        setNewEntry("");
        fetchHistoryData(); // Refresh history
        console.log('Journal entry saved successfully');
        console.log('New Entry:', response);
      } else {
        console.error('Failed to save journal entry');
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    console.log(isRecording ? "Stopping recording..." : "Starting recording...");
  };

  const filteredItems = historyItems.filter((item) =>
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
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
    </div>
  );
} 