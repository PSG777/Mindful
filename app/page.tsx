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

const API_BASE_URL = "http://localhost:8080";
const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? "";

// #region agent log
const debugSessionLog = (hypothesisId: string, location: string, message: string, data: Record<string, unknown>) => {
  fetch('http://127.0.0.1:7852/ingest/61064503-bb28-42ae-9d20-dd83a34da3a8', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f7c147' },
    body: JSON.stringify({ sessionId: 'f7c147', hypothesisId, location, message, data, timestamp: Date.now(), runId: 'transcript-save' }),
  }).catch(() => {});
};
// #endregion

const upsertTranscriptPart = (
  buffer: Array<{ speaker: string; text: string }>,
  part: { speaker: string; text: string }
) => {
  const last = buffer[buffer.length - 1];
  if (last && last.speaker === part.speaker) {
    buffer[buffer.length - 1] = part;
  } else {
    buffer.push(part);
  }
};

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

    if (!VAPI_PUBLIC_KEY) {
      setError("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY in .env.local");
      return;
    }

    const vapi = new Vapi(VAPI_PUBLIC_KEY);
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

      // #region agent log
      debugSessionLog('H-B', 'page.tsx:call-end', 'call ended', {
        persistCount: saveTranscript.current.length,
        sessionId: sessionIdRef.current,
      });
      // #endregion

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
              session_id: sessionIdRef.current,
              transcript: fullTranscript,
            }),
          });

          // #region agent log
          debugSessionLog('H-A', 'page.tsx:transcript-save', 'save response', {
            status: response.status,
            ok: response.ok,
          });
          // #endregion

          if (response.ok) {
            console.log('Transcript saved successfully.');
            sessionIdRef.current = uuidv4();
            console.log("Ready for next session. New ID:", sessionIdRef.current);

            console.log("Triggering new game plan analysis...");
            setIsGeneratingPlan(true);
            try {
              const analyzeRes = await fetch(`${API_BASE_URL}/gameplan/analyze`, { method: 'POST' });
              // #region agent log
              debugSessionLog('H-D', 'page.tsx:analyze', 'analyze response', {
                status: analyzeRes.status,
                ok: analyzeRes.ok,
              });
              // #endregion
              if (!analyzeRes.ok) {
                const errText = await analyzeRes.text();
                console.error('Failed to generate game plan:', analyzeRes.status, errText);
                setError('Session saved, but wellness plan generation failed. Is the backend running?');
              } else {
                await fetchLatestGamePlan();
              }
            } catch (analyzeError) {
              console.error('Error generating game plan:', analyzeError);
              setError('Session saved, but could not reach backend for wellness plan.');
            } finally {
              setIsGeneratingPlan(false);
            }
          } else {
            const errText = await response.text();
            console.error('Failed to save transcript:', response.status, errText);
            setError('Could not save session. Make sure the Go backend is running on port 8080.');
          }
        } catch (error) {
          console.error('Error saving transcript:', error);
          setError('Could not reach backend at localhost:8080. Start it with: go run main.go');
        }
      } else {
        console.warn('No transcript content to save.');
        setError('No conversation was captured to save. Try speaking longer before ending the session.');
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

      // #region agent log
      if (message.transcriptType === 'final') {
        debugSessionLog('H-B', 'page.tsx:message', 'final transcript', {
          role: message.role,
          speaker: currentSpeaker,
          textLen: message.transcript.length,
        });
      }
      // #endregion

      setTranscript((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.speaker === currentSpeaker) {
          return [...prev.slice(0, -1), newTranscriptPart];
        }
        return [...prev, newTranscriptPart];
      });

      // Keep latest text per speaker for backend save (not only final events)
      upsertTranscriptPart(saveTranscript.current, newTranscriptPart);
      if (message.transcriptType === 'final') {
        console.log("Saved final transcript part:", newTranscriptPart);
      }
    });

    vapi.on("error", (vapiError: any) => {
      const detail =
        typeof vapiError === "string"
          ? vapiError
          : vapiError?.message ?? JSON.stringify(vapiError);
      console.error("Vapi error:", detail);
      setError(`Voice session error: ${detail}. Check Vapi dashboard credits and provider keys.`);
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
      // #region agent log
      debugSessionLog('H-E', 'page.tsx:fetchLatestGamePlan', 'gameplans response', {
        status: response.status,
        ok: response.ok,
      });
      // #endregion
      if (response.ok) {
        const plans: any[] = await response.json();
        if (plans.length > 0) {
          const latestPlan = plans[0];
          setGamePlan({
            summary: latestPlan.summary,
            tasks: latestPlan.tasks.split('\n').filter((task: string) => task.trim()),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching game plan:', error);
    }
  };

  const startCall = async () => {
    try {
      if (!VAPI_PUBLIC_KEY) {
        setError("Add NEXT_PUBLIC_VAPI_PUBLIC_KEY to .env.local and restart the dev server.");
        return;
      }
      setError(null);
      setStatus("Connecting to your AI therapist...");
      saveTranscript.current = [];
      setTranscript([]);
      await vapiRef.current?.start({
        model: {
          provider: "google",
          model: "gemini-1.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a warm, empathetic AI therapist named Alex. Your role is to provide a safe, non-judgmental space for users to express their thoughts and feelings. \n\nKey guidelines:\n- Be genuinely caring and empathetic\n- Listen actively and reflect back what you hear\n- Ask thoughtful, open-ended questions\n- Validate emotions and experiences\n- Offer gentle insights when appropriate\n- Maintain professional boundaries\n- Encourage self-reflection and personal growth\n- Keep responses conversational and natural\n- If someone is in crisis, gently suggest professional help\n\nRemember: You're here to support, not diagnose or provide medical advice. Create a welcoming atmosphere where people feel heard and understood.`,
            },
          ],
        },
        voice: {
          provider: "vapi",
          voiceId: "Elliot",
        },
      });
    } catch (error) {
      console.error("Failed to start Vapi call:", error);
      setError("Failed to connect. Check microphone permissions and Vapi setup in .env.local.");
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
