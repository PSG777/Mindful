"use client";

import { useState } from "react";
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
import { Book, Mic, Search } from "lucide-react";

// Mock data for journal entries
const initialEntries = [
  {
    id: 1,
    date: "2024-07-28",
    content: "Felt a bit overwhelmed today, but managed to get through my tasks. Taking a walk helped clear my head.",
    mood: "Neutral",
  },
  {
    id: 2,
    date: "2024-07-27",
    content: "Had a really productive day! Finished the big project at work and felt a great sense of accomplishment.",
    mood: "Happy",
  },
];

export default function JournalPage() {
  const [newEntry, setNewEntry] = useState("");
  const [entries, setEntries] = useState(initialEntries);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = () => {
    if (newEntry.trim() === "") return;

    // This is where the MCP agent would analyze and store the entry.
    // For now, we'll just add it to our local state.
    const newEntryObject = {
      id: entries.length + 1,
      date: new Date().toISOString().split("T")[0],
      content: newEntry,
      mood: "Unanalyzed", // Placeholder mood
    };
    setEntries([newEntryObject, ...entries]);
    setNewEntry("");
    console.log("Submitted new entry:", newEntryObject);
    // Here you could trigger a recommendation.
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    // Placeholder for Hume AI integration
    console.log(isRecording ? "Stopping recording..." : "Starting recording...");
  };

  const filteredEntries = entries.filter((entry) =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/90 p-4 sm:p-8">
      <main className="flex-1">
        <h1 className="text-3xl font-bold mb-8">📓 Journal</h1>

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
              <CardDescription>Review your past entries.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg">
                    <p className="font-semibold">{entry.date}</p>
                    <p className="text-sm text-gray-700">{entry.content}</p>
                    <div className="mt-2">
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Mood: {entry.mood}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 