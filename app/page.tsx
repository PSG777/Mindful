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
  Pencil,
  BarChart,
  Brain,
  Volume2,
  X,
  Mic,
  MicOff,
  Loader2,
} from "lucide-react";
import { AudioRecorderClass, sendAudioToHume, playAudioFromBase64 } from "@/lib/audio-utils";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState("");
  
  const audioRecorderRef = useRef<AudioRecorderClass | null>(null);

  useEffect(() => {
    // Initialize audio recorder
    audioRecorderRef.current = new AudioRecorderClass();
  }, []);

  const handleStartRecording = async () => {
    try {
      setError("");
      setIsRecording(true);
      await audioRecorderRef.current?.startRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please check microphone permissions.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      const base64Audio = await audioRecorderRef.current?.stopRecording();
      
      if (!base64Audio) {
        throw new Error('No audio data recorded');
      }

      // Send audio to Hume AI
      const response = await sendAudioToHume({
        audio: base64Audio,
        voice: 'alloy',
        language: 'en',
      });

      if (response.success) {
        setTranscription(response.transcription || '');
        setAiResponse(response.message || '');
        
        // Play AI response if audio URL is available
        if (response.audioUrl) {
          setIsPlaying(true);
          try {
            await playAudioFromBase64(response.audioUrl);
          } catch (playError) {
            console.error('Error playing audio:', playError);
          } finally {
            setIsPlaying(false);
          }
        }
      } else {
        setError(response.error || 'Failed to process audio');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError('Failed to process audio recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVolumeClick = () => {
    if (aiResponse && !isPlaying) {
      setIsPlaying(true);
      // Replay the last AI response
      // This would need to store the audio data for replay
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/90 p-4 sm:p-8">
      <main className="flex-1">
        <h1 className="text-3xl font-bold mb-8">Home</h1>

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

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/journal/new">
              <Button>
                <Pencil className="mr-2 h-4 w-4" /> Write Journal
              </Button>
            </Link>
            <Link href="/mood-tracker">
              <Button>
                <BarChart className="mr-2 h-4 w-4" /> Check Mood
              </Button>
            </Link>
            <Link href="/cbt-coach">
              <Button>
                <Brain className="mr-2 h-4 w-4" /> Start CBT
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-8">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-gray-500 mb-4">
              {isRecording ? "Recording..." : isProcessing ? "Processing..." : "connecting..."}
            </p>
            
            <div className={`w-32 h-32 rounded-full mb-6 ${
              isRecording 
                ? 'bg-red-400 animate-pulse' 
                : isProcessing 
                ? 'bg-yellow-400 animate-spin' 
                : 'bg-blue-400 animate-pulse'
            }`}></div>

            {/* Transcription Display */}
            {transcription && (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg max-w-md">
                <p className="text-sm text-gray-600 mb-2">You said:</p>
                <p className="text-gray-800">{transcription}</p>
              </div>
            )}

            {/* AI Response Display */}
            {aiResponse && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg max-w-md">
                <p className="text-sm text-blue-600 mb-2">AI Response:</p>
                <p className="text-blue-800">{aiResponse}</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-lg max-w-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-4 mt-8">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-gray-100 rounded-full"
                onClick={handleVolumeClick}
                disabled={!aiResponse || isPlaying}
              >
                {isPlaying ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
              
              <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center text-blue-800 font-bold text-2xl">
                M
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full ${
                  isRecording 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100'
                }`}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isProcessing}
              >
                {isRecording ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </div>

            {/* Recording Status */}
            {isRecording && (
              <p className="text-sm text-red-600 mt-4 animate-pulse">
                Recording... Click the mic button to stop
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
