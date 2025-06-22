"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Smile,
  Book,
  Heart,
  Volume2,
  Mic,
  MicOff,
  Loader2,
  MessageCircle,
  X,
} from "lucide-react";
import Vapi from "@vapi-ai/web";
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = "https://mindful-wbz7.onrender.com";

interface GamePlan {
  summary: string;
  tasks: string[];
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [status, setStatus] = useState("Ready to start your therapy session");
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [gamePlan, setGamePlan] = useState<GamePlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const vapiRef = useRef<Vapi | null>(null);
  const saveTranscript = useRef<Array<{ speaker: string; text: string }>>([]);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    // Generate a unique session ID once when the component mounts
    sessionIdRef.current = uuidv4();
    console.log("New Session ID:", sessionIdRef.current);
    fetchLatestGamePlan();

    const vapi = new Vapi("aae6435f-d8cc-4072-a2f2-24123cbc14ae");
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setIsConnected(true);
      setStatus("Connected - You can start speaking");
      setError(null);
    });

    vapi.on("call-end", async () => {
      setIsConnected(false);
      setIsListening(false);
      setIsResponding(false);
      setStatus("Session ended - Thank you for sharing");

      if (saveTranscript.current.length > 0) {
        console.log("Saving transcript to backend for session:", sessionIdRef.current);
        try {
          const fullTranscript = saveTranscript.current.map(msg => `${msg.speaker}: ${msg.text}`).join('\n');
          const response = await fetch(`${API_BASE_URL}/transcripts/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              session_id: sessionIdRef.current, // Use ref to ensure correct value
              transcript: fullTranscript,
            }),
          });

          if (response.ok) {
            console.log('Transcript saved successfully.');
            // Generate a new session ID for the next call
            sessionIdRef.current = uuidv4();
            console.log("Ready for next session. New ID:", sessionIdRef.current);
            
            // Automatically generate a new game plan
            console.log("Triggering new game plan analysis...");
            await generateNewGamePlan();

          } else {
            console.error('Failed to save transcript');
          }
        } catch (error) {
          console.error('Error saving transcript:', error);
        }
      }
    });

    vapi.on("speech-start", () => {
      setIsListening(true);
      setIsResponding(false);
      setStatus("Listening to you...");
    });

    vapi.on("speech-end", () => {
      setIsListening(false);
      setStatus("Processing your message...");
    });

    vapi.on("message", (message: any) => {
      // Use a guard clause to handle non-transcript messages
      if (message.type !== "transcript" || !message.transcript) {
        if (message.type === "function-call") {
          setIsResponding(true);
          setStatus("Therapist is responding...");
        }
        return;
      }

      const currentSpeaker = message.role === "user" ? "You" : "Therapist";
      const newTranscriptPart = { speaker: currentSpeaker, text: message.transcript };

      // Update the live display with both partial and final transcripts for a real-time effect.
      setTranscript((prev) => {
        const lastMessage = prev[prev.length - 1];
        // If the last message is from the same speaker, replace it.
        if (lastMessage && lastMessage.speaker === currentSpeaker) {
          return [...prev.slice(0, -1), newTranscriptPart];
        }
        // Otherwise, add it as a new message.
        return [...prev, newTranscriptPart];
      });

      // Only save the final transcript to the array that gets sent to the backend.
      if (message.transcriptType === 'final') {
        saveTranscript.current.push(newTranscriptPart);
        console.log("Saved final transcript part:", newTranscriptPart);
      }
    });

    vapi.on("error", (error: any) => {
      setError("Connection error. Please try again.");
      setStatus("Error occurred - Please try reconnecting");
    });

    return () => {
      if (vapi) {
        vapi.stop();
      }
    };
  }, []);

  const fetchLatestGamePlan = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/gameplans`);
      if (response.ok) {
        const plans: any[] = await response.json();
        if (plans.length > 0) {
          // Assuming the API returns plans sorted by date, get the latest one
          const latestPlan = plans[0];
          setGamePlan({
            summary: latestPlan.summary,
            tasks: latestPlan.tasks.split('\n'), // Assuming tasks are newline-separated
          });
        }
      }
    } catch (error) {
      console.error('Error fetching game plan:', error);
    }
  };

  const generateNewGamePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      // This endpoint triggers the analysis and storage, it requires a POST request.
      await fetch(`${API_BASE_URL}/gameplan/analyze`, {
        method: 'POST',
      });
      // After triggering, fetch the new result
      await fetchLatestGamePlan();
    } catch (error) {
      console.error('Error generating new game plan:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const startCall = async () => {
    try {
      setError(null);
      setStatus("Connecting to your AI therapist...");
      // Start the call, but also immediately set a timeout fallback in case event doesn't fire
      let didConnect = false;
      const connectTimeout = setTimeout(() => {
        if (!didConnect) {
          setStatus("Connected - You can start speaking");
          setIsConnected(true);
        }
      }, 3000); // fallback after 3 seconds
      await vapiRef.current?.start({
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a warm, empathetic AI therapist named Alex. Your role is to provide a safe, non-judgmental space for users to express their thoughts and feelings. \n\nKey guidelines:\n- Be genuinely caring and empathetic\n- Listen actively and reflect back what you hear\n- Ask thoughtful, open-ended questions\n- Validate emotions and experiences\n- Offer gentle insights when appropriate\n- Maintain professional boundaries\n- Encourage self-reflection and personal growth\n- Keep responses conversational and natural\n- If someone is in crisis, gently suggest professional help\n\nRemember: You're here to support, not diagnose or provide medical advice. Create a welcoming atmosphere where people feel heard and understood.`,
            },
          ],
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer",
          speed: 0.9,
        },
      });
      // If the event fires, clear the fallback
      vapiRef.current?.on("call-start", () => {
        didConnect = true;
        clearTimeout(connectTimeout);
        setIsConnected(true);
        setStatus("Connected - You can start speaking");
        setError(null);
      });
    } catch (error) {
      setError("Failed to connect. Please check your microphone permissions and try again.");
      setStatus("Connection failed");
    }
  };

  const endCall = () => {
    vapiRef.current?.stop();
  };

  const getStatusColor = () => {
    if (error) return "text-red-600";
    if (isListening) return "text-blue-600";
    if (isResponding) return "text-green-600";
    if (isConnected) return "text-green-600";
    return "text-gray-600";
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Home</h1>
        <p className="text-gray-600">Your mental health dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart /> Latest Wellness Plan
              </CardTitle>
              <CardDescription>
                Your AI-generated summary and suggested tasks, automatically updated after each session or journal entry.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGeneratingPlan && !gamePlan ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating your first wellness plan...</span>
                  </div>
              ) : gamePlan ? (
                <div>
                  <p className="text-gray-800 font-semibold mb-3">{gamePlan.summary}</p>
                  <ul className="space-y-2">
                    {gamePlan.tasks.map((task, index) => (
                      <li key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <input type="checkbox" id={`task-${index}`} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                        <label htmlFor={`task-${index}`} className="text-sm text-gray-700">{task}</label>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-600">No wellness plan generated yet. Record a session or write a journal entry to get started.</p>
              )}
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile /> Today's Mood
            </CardTitle>
            <CardDescription>Awaiting your check-in</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">You haven't checked in yet.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book /> Recent Journal Entries
            </CardTitle>
            <CardDescription>Your latest thoughts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No recent entries.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart /> Upcoming Self-Care
            </CardTitle>
            <CardDescription>Your scheduled activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No scheduled activities.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 /> Voice Therapy Session
          </CardTitle>
          <CardDescription className={getStatusColor()}>
            {status}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center h-64 gap-6 text-center">
              <h2 className="text-2xl font-medium text-gray-700">Want to talk for a bit?</h2>
              <Button
                onClick={startCall}
                className="w-24 h-24 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
                aria-label="Start voice session"
              >
                <Mic className="h-12 w-12" />
              </Button>
            </div>
          ) : (
            <div>
              <div
                className="h-64 overflow-y-auto p-4 border rounded-md bg-gray-50 mb-4"
                id="transcript-container"
              >
                {transcript.length > 0 ? (
                  transcript.map((msg, index) => (
                    <p key={index} className="mb-2">
                      <span
                        className={
                          msg.speaker === "You"
                            ? "font-semibold text-blue-600"
                            : "font-semibold text-gray-800"
                        }
                      >
                        {msg.speaker}:
                      </span>{" "}
                      {msg.text}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500">
                    Your conversation will appear here...
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={endCall}
                  disabled={!isConnected}
                  variant="destructive"
                >
                  <MicOff className="mr-2 h-4 w-4" /> End Session
                </Button>
              </div>
            </div>
          )}
          {error && <p className="text-red-600 text-center mt-4">{error}</p>}
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Explore Mindful</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/journal">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book /> Journal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Reflect on your thoughts and track your journey.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/mood-tracker">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile /> Mood Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Log your mood to understand your emotional patterns.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/resources">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle /> Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Access articles and tools to support your mental health.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
