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

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [status, setStatus] = useState("Ready to start your therapy session");
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    // Initialize Vapi with your public key
    const vapi = new Vapi("aae6435f-d8cc-4072-a2f2-24123cbc14ae");
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setIsConnected(true);
      setStatus("Connected - You can start speaking");
      setError(null);
    });

    vapi.on("call-end", () => {
      setIsConnected(false);
      setIsListening(false);
      setIsResponding(false);
      setStatus("Session ended - Thank you for sharing");
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
      if (message.type === "transcript" && message.transcript) {
        setTranscript((prev) => {
          const currentSpeaker = message.role === "user" ? "You" : "Therapist";
          // If last message is same speaker, always replace it with the new transcript
          if (
            prev.length > 0 &&
            prev[prev.length - 1].speaker === currentSpeaker
          ) {
            // Only update if the transcript changed
            if (prev[prev.length - 1].text !== message.transcript) {
              return [
                ...prev.slice(0, -1),
                {
                  speaker: currentSpeaker,
                  text: message.transcript,
                },
              ];
            } else {
              return prev;
            }
          }
          // If last message is different speaker, add a new one
          return [
            ...prev,
            {
              speaker: currentSpeaker,
              text: message.transcript,
            },
          ];
        });
      }
      if (message.type === "function-call") {
        setIsResponding(true);
        setStatus("Therapist is responding...");
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
            <p className="text-gray-600">Nothing scheduled for today.</p>
          </CardContent>
        </Card>
      </div>

      {/* Vapi AI Assistant Section */}
      <div className="rounded-xl border bg-white p-8 mb-8">
        <div className="flex flex-col items-center text-center">
          <p className={`text-sm mb-4 ${getStatusColor()}`}>{status}</p>
          <div className={`w-32 h-32 rounded-full mb-6 flex items-center justify-center ${
            isListening
              ? "bg-blue-400 animate-pulse"
              : isResponding
              ? "bg-green-400 animate-pulse"
              : isConnected
              ? "bg-green-200"
              : error
              ? "bg-red-200"
              : "bg-gray-200"
          }`}>
            {isListening ? (
              <Mic className="h-16 w-16 text-white" />
            ) : isResponding ? (
              <MessageCircle className="h-16 w-16 text-white" />
            ) : isConnected ? (
              <Mic className="h-16 w-16 text-green-700" />
            ) : error ? (
              <X className="h-16 w-16 text-red-600" />
            ) : (
              <MicOff className="h-16 w-16 text-gray-400" />
            )}
          </div>

          {/* Transcript Display */}
          <div className="mb-4 max-w-md w-full">
            {transcript.map((msg, idx) => (
              <div key={idx} className={`mb-2 text-left ${msg.speaker === "You" ? "text-blue-700" : "text-green-700"}`}>
                <span className="font-semibold mr-2">{msg.speaker}:</span>
                <span>{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg max-w-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-8">
            {!isConnected ? (
              <Button
                variant="default"
                size="lg"
                onClick={startCall}
                disabled={isConnected}
                className="rounded-full"
              >
                <Mic className="h-6 w-6 mr-2" /> Start Conversation
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="lg"
                onClick={endCall}
                className="rounded-full"
              >
                <MicOff className="h-6 w-6 mr-2" /> End Conversation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
