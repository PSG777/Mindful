"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Mock data
const moodData = [
  { day: "Mon", mood: 3 },
  { day: "Tue", mood: 5 },
  { day: "Wed", mood: 4 },
  { day: "Thu", mood: 2 },
  { day: "Fri", mood: 5 },
  { day: "Sat", mood: 4 },
  { day: "Sun", mood: 1 },
]

const moodOptions = [
  { emoji: "😞", label: "Awful", value: 1 },
  { emoji: "😟", label: "Bad", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "🙂", label: "Good", value: 4 },
  { emoji: "😄", label: "Great", value: 5 },
]

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-8">
      <h1 className="text-3xl font-bold">📊 Mood Tracker</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Mood Input */}
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
            <CardDescription>Select a mood to check in.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="flex justify-center gap-4">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    selectedMood === mood.value
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:bg-gray-100"
                  }`}
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
            <Button disabled={!selectedMood}>Submit Mood</Button>
          </CardContent>
        </Card>

        {/* Mood Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Your Mood This Week</CardTitle>
            <CardDescription>
              A visualization of your recent mood entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="mood" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Agent Reflections */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Reflections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              "You seem to feel more anxious on Sundays. Perhaps scheduling a
              relaxing activity could help?"
            </p>
          </CardContent>
        </Card>

        {/* Correlations */}
        <Card>
          <CardHeader>
            <CardTitle>Correlations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                Your mood tends to be higher on days you write a journal entry.
              </li>
              <li>
                There is a slight dip in mood on days with scheduled meetings.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 