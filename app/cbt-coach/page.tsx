"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  MessageCircle,
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  Send,
  User,
  Bot,
} from "lucide-react";

interface CBTExercise {
  id: string;
  name: string;
  description: string;
  type: "thought_record" | "evidence_analysis" | "behavioral_experiment" | "cognitive_restructuring";
  effectiveness: number;
  lastUsed: Date;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "coach";
  timestamp: Date;
}

export default function CBTCoach() {
  const [currentMood, setCurrentMood] = useState("");
  const [recentThoughts, setRecentThoughts] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<CBTExercise | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState<CBTExercise[]>([]);

  // Sample CBT exercises
  const cbtExercises: CBTExercise[] = [
    {
      id: "1",
      name: "Thought Record",
      description: "Identify and challenge automatic negative thoughts",
      type: "thought_record",
      effectiveness: 85,
      lastUsed: new Date(),
    },
    {
      id: "2",
      name: "Evidence Analysis",
      description: "Separate facts from assumptions and beliefs",
      type: "evidence_analysis",
      effectiveness: 78,
      lastUsed: new Date(),
    },
    {
      id: "3",
      name: "Behavioral Experiment",
      description: "Test your predictions through real-world experiments",
      type: "behavioral_experiment",
      effectiveness: 92,
      lastUsed: new Date(),
    },
    {
      id: "4",
      name: "Cognitive Restructuring",
      description: "Replace distorted thinking with balanced thoughts",
      type: "cognitive_restructuring",
      effectiveness: 88,
      lastUsed: new Date(),
    },
  ];

  useEffect(() => {
    setExerciseHistory(cbtExercises);
  }, []);

  const analyzeMoodAndThoughts = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysis = generateCBTPrompts(currentMood, recentThoughts);
      setChatMessages([
        {
          id: "1",
          content: "Hello! I'm your CBT coach. Let me analyze your current situation and help you work through these thoughts and feelings.",
          sender: "coach",
          timestamp: new Date(),
        },
        {
          id: "2",
          content: analysis.prompts.join("\n\n"),
          sender: "coach",
          timestamp: new Date(),
        },
      ]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const generateCBTPrompts = (mood: string, thoughts: string) => {
    const prompts = [];
    
    if (mood.toLowerCase().includes("anxious") || mood.toLowerCase().includes("worried")) {
      prompts.push("🔍 **What are the thoughts behind this feeling?**\nLet's identify the automatic thoughts that are contributing to your anxiety.");
      prompts.push("📊 **Is this based on evidence or assumption?**\nWhat evidence do you have for and against these thoughts?");
    }
    
    if (mood.toLowerCase().includes("sad") || mood.toLowerCase().includes("depressed")) {
      prompts.push("💭 **What's the story you're telling yourself?**\nLet's examine the narrative behind these feelings.");
      prompts.push("🎯 **What would be a more balanced perspective?**\nHow might someone else view this situation?");
    }
    
    if (thoughts.includes("always") || thoughts.includes("never")) {
      prompts.push("⚠️ **I notice some absolute thinking here.**\nAre there any exceptions to these 'always' or 'never' statements?");
    }
    
    if (thoughts.includes("should") || thoughts.includes("must")) {
      prompts.push("🤔 **Let's examine these 'should' statements.**\nWhat would happen if you didn't meet these expectations?");
    }
    
    return { prompts };
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    
    // Simulate coach response
    setTimeout(() => {
      const coachResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateCoachResponse(newMessage),
        sender: "coach",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, coachResponse]);
    }, 1000);
  };

  const generateCoachResponse = (userMessage: string) => {
    const responses = [
      "That's a great observation. Can you tell me more about what led you to this conclusion?",
      "I hear you. Let's explore this thought together. What evidence supports this belief?",
      "Interesting perspective. How might someone who cares about you view this situation?",
      "Let's challenge this thought. What would happen if the opposite were true?",
      "This sounds like a common cognitive distortion. Let's work on reframing this thought.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const startExercise = (exercise: CBTExercise) => {
    setSelectedExercise(exercise);
    setChatMessages([
      {
        id: "exercise-start",
        content: `Let's begin the "${exercise.name}" exercise. ${exercise.description}`,
        sender: "coach",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/90 p-4 sm:p-8">
      <main className="flex-1">
        <h1 className="text-3xl font-bold mb-8">CBT Coach</h1>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Analysis and Exercises */}
          <div className="space-y-6">
            {/* Mood and Thoughts Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain /> Current Analysis
                </CardTitle>
                <CardDescription>
                  Share your current mood and thoughts for personalized CBT guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Mood</label>
                  <Input
                    placeholder="e.g., anxious, sad, frustrated..."
                    value={currentMood}
                    onChange={(e) => setCurrentMood(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Recent Thoughts</label>
                  <Textarea
                    placeholder="What thoughts are you having right now?"
                    value={recentThoughts}
                    onChange={(e) => setRecentThoughts(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={analyzeMoodAndThoughts}
                  disabled={isAnalyzing || (!currentMood && !recentThoughts)}
                  className="w-full"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze & Generate Prompts"}
                </Button>
              </CardContent>
            </Card>

            {/* CBT Exercises */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target /> CBT Exercises
                </CardTitle>
                <CardDescription>
                  Interactive exercises to challenge and reframe your thoughts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {cbtExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => startExercise(exercise)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{exercise.name}</h4>
                          <p className="text-sm text-gray-600">{exercise.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            {exercise.effectiveness}% effective
                          </div>
                          <div className="text-xs text-gray-500">
                            Last used: {exercise.lastUsed.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exercise History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp /> Exercise Effectiveness
                </CardTitle>
                <CardDescription>
                  Track which CBT techniques work best for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exerciseHistory
                    .sort((a, b) => b.effectiveness - a.effectiveness)
                    .map((exercise) => (
                      <div key={exercise.id} className="flex items-center justify-between">
                        <span className="text-sm">{exercise.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${exercise.effectiveness}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{exercise.effectiveness}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle /> CBT Coach Chat
                </CardTitle>
                <CardDescription>
                  Interactive conversation with your AI CBT coach
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.sender === "user" ? "You" : "CBT Coach"}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 