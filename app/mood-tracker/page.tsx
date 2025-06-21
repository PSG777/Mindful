"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Mock data for line chart
const moodData = [
  { date: "2024-07-14", day: "Sun", nervous: 3, angry: 0, sad: 1, fearful: 2 },
  { date: "2024-07-15", day: "Mon", nervous: 2, angry: 1, sad: 3, fearful: 0 },
  { date: "2024-07-16", day: "Tue", nervous: 3, angry: 0, sad: 2, fearful: 1 },
  { date: "2024-07-17", day: "Wed", nervous: 1, angry: 2, sad: 1, fearful: 2 },
  { date: "2024-07-18", day: "Thu", nervous: 4, angry: 1, sad: 0, fearful: 1 },
  { date: "2024-07-19", day: "Fri", nervous: 2, angry: 3, sad: 2, fearful: 0 },
  { date: "2024-07-20", day: "Sat", nervous: 1, angry: 1, sad: 4, fearful: 1 },
]

const moodOptions = [
  { emoji: "😟", label: "Nervous" },
  { emoji: "😠", label: "Angry" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😨", label: "Fearful" },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const dateStr = payload[0].payload.date;
    const [year, month, day] = dateStr.split("-");
    const formattedDate = `${month}/${day}/${year}`;

    return (
      <div className="p-2 bg-background border rounded-lg shadow-sm">
        <p className="font-medium text-foreground">{formattedDate}</p>
        <div className="space-y-1 mt-1">
          {payload.map((pld: any) => (
            <p
              key={pld.dataKey}
              style={{ color: pld.color }}
              className="text-sm capitalize"
            >
              {pld.name}: {pld.value}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [visibleEmotions, setVisibleEmotions] = useState({
    nervous: true,
    angry: true,
    sad: true,
    fearful: true,
  })

  const handleLegendClick = (dataKey: string) => {
    if (dataKey) {
      setVisibleEmotions((prev) => ({
        ...prev,
        [dataKey]: !prev[dataKey as keyof typeof prev],
      }))
    }
  }

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
                  key={mood.label}
                  onClick={() => setSelectedMood(mood.label)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    selectedMood === mood.label
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
            <CardTitle>Your Mood Over Time</CardTitle>
            <CardDescription>
              A visualization of your recent mood entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  onClick={(e: any) => handleLegendClick(e.dataKey as string)}
                />
                <Line
                  type="monotone"
                  dataKey="nervous"
                  stroke="#8884d8"
                  hide={!visibleEmotions.nervous}
                />
                <Line
                  type="monotone"
                  dataKey="angry"
                  stroke="#82ca9d"
                  hide={!visibleEmotions.angry}
                />
                <Line
                  type="monotone"
                  dataKey="sad"
                  stroke="#ffc658"
                  hide={!visibleEmotions.sad}
                />
                <Line
                  type="monotone"
                  dataKey="fearful"
                  stroke="#ff8042"
                  hide={!visibleEmotions.fearful}
                />
              </LineChart>
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
              "You seem to feel more nervous at the beginning of the week. Perhaps some mindfulness exercises could help?"
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
                Your sadness levels seem to peak on Saturdays.
              </li>
              <li>
                There's a noticeable increase in anger on Fridays.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 